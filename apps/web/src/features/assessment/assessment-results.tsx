"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  criterionStatusSchema,
  type Assessment,
  type CriterionStatus,
} from "@loopz/contracts/assessment";
import type { EvidenceSubmission } from "@loopz/contracts/evidence";
import type { AcceptanceCriterion } from "@loopz/contracts/loopspec";
import type { Run } from "@loopz/contracts/run";
import type { RunResolution } from "@loopz/contracts/run";
import type { ConfirmedContractVersion } from "@loopz/contracts/versioning";
import { applyAssessmentCorrection, compileAssessment } from "@loopz/core/assessment";
import { determineRunNextStep, resolveRun } from "@loopz/core";

import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { WorkflowProgress } from "../../components/workflow-progress";
import { loadTaskRunById } from "../artifacts/task-storage";
import { loadEvidenceSubmissions, validateEvidenceHistoryForRun } from "../evidence/evidence-storage";
import { loadContractVersions } from "../versioning/version-storage";
import {
  beginAdditionalEvidenceReturn,
  loadRunResolution,
  persistRunResolution,
} from "../repair/run-resolution-storage";
import {
  loadAssessments,
  persistAssessment,
  validateAssessmentHistoryForRun,
} from "./assessment-storage";
import { canReadExistingAssessment } from "./assessment-access";
import styles from "./assessment-results.module.css";

type LoadedAssessment = {
  run: Run;
  version: ConfirmedContractVersion;
  submission: EvidenceSubmission;
  history: Assessment[];
  resolution: RunResolution | null;
};

const LABELS: Record<CriterionStatus, string> = {
  verified_by_submitted_evidence: "Supported by evidence",
  partially_supported: "Partially supported",
  unsupported_claim: "Unsupported claim",
  failed: "Failed",
  blocked: "Blocked",
  not_attempted: "Not attempted",
  unverifiable: "Unverifiable",
  not_applicable: "Not applicable",
};

export function AssessmentResults({ runId }: { runId: string }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState<LoadedAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const run = loadTaskRunById(runId);
        const version = loadContractVersions(run.projectId).find(
          (item) => item.versionId === run.contractVersionId,
        );
        if (!version || version.schemaVersion === "0.1") {
          throw new Error("The confirmed contract for this assessment was not found.");
        }
        const evidenceHistory = loadEvidenceSubmissions(run.runId);
        validateEvidenceHistoryForRun(
          run,
          version.loopSpec.acceptance.criteria.map((item) => item.id),
          evidenceHistory,
        );
        const submission = evidenceHistory.at(-1);
        if (!submission) throw new Error("Submit execution evidence before opening assessment.");
        let history = loadAssessments(run.runId);
        validateAssessmentHistoryForRun(
          run,
          evidenceHistory.map((item) => item.submissionId),
          version.loopSpec.acceptance.criteria.map((item) => item.id),
          history,
        );
        let currentRun = run;
        const needsAutomatedAssessment = history.at(-1)?.evidenceSubmissionId !== submission.submissionId;
        if (needsAutomatedAssessment) {
          const assessment = await compileAssessment({
            run,
            version,
            submission,
            assessmentId: crypto.randomUUID(),
            assessedAt: new Date().toISOString(),
            assessmentVersion: history.length + 1,
            previousAssessmentId: history.at(-1)?.assessmentId ?? null,
          });
          const concurrentHistory = loadAssessments(run.runId);
          if (concurrentHistory.at(-1)?.evidenceSubmissionId === submission.submissionId) {
            validateAssessmentHistoryForRun(
              run,
              evidenceHistory.map((item) => item.submissionId),
              version.loopSpec.acceptance.criteria.map((item) => item.id),
              concurrentHistory,
            );
            currentRun = loadTaskRunById(runId);
            history = concurrentHistory;
          } else {
            const saved = persistAssessment(run, assessment);
            currentRun = saved.run;
            history = saved.assessments;
          }
        } else if (!canReadExistingAssessment(run.state)) {
          throw new Error("Assessment history exists but the run state is inconsistent.");
        }
        const resolution = loadRunResolution(run.runId);
        if (resolution && (resolution.assessmentId !== history.at(-1)?.assessmentId || resolution.contractHash !== run.contractHash)) {
          throw new Error("The terminal resolution does not match the latest assessment.");
        }
        if (active) setLoaded({ run: currentRun, version, submission, history, resolution });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Assessment could not be loaded.");
      }
    }
    void initialize();
    return () => { active = false; };
  }, [runId]);

  const assessment = loaded?.history.at(-1) ?? null;
  const criteria = useMemo(() => new Map(
    loaded?.version.loopSpec.acceptance.criteria.map((item) => [item.id, item]) ?? [],
  ), [loaded]);
  const evidence = useMemo(() => new Map(
    loaded?.submission.evidenceItems.map((item) => [item.id, item]) ?? [],
  ), [loaded]);

  function correct(criterionId: string, correctedStatus: CriterionStatus, reason: string) {
    if (!loaded || !assessment) return;
    setError(null);
    try {
      const corrected = applyAssessmentCorrection({
        assessment,
        correctionId: crypto.randomUUID(),
        criterionId,
        correctedStatus,
        reason,
        correctedAt: new Date().toISOString(),
        nextAssessmentId: crypto.randomUUID(),
      });
      const saved = persistAssessment(loaded.run, corrected);
      setLoaded({ ...loaded, run: saved.run, history: saved.assessments });
      setCorrecting(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The correction could not be saved.");
    }
  }

  if (error && !loaded) return <AssessmentState message={error} />;
  if (!loaded || !assessment) return <AssessmentState message="Assessing the submitted evidence…" />;

  const counts = Object.fromEntries(criterionStatusSchema.options.map((status) => [
    status,
    assessment.criteria.filter((item) => item.status === status).length,
  ])) as Record<CriterionStatus, number>;
  const nextStep = loaded.run.state === "assessed"
    ? determineRunNextStep(loaded.run, loaded.version, assessment)
    : null;
  const attentionResults = assessment.criteria.filter(
    (result) => result.status !== "verified_by_submitted_evidence" && result.status !== "not_applicable",
  );

  function finishRun() {
    if (!loaded || !assessment) return;
    setError(null);
    try {
      const resolved = resolveRun({
        run: loaded.run, version: loaded.version, assessment,
        resolutionId: crypto.randomUUID(), resolvedAt: new Date().toISOString(),
      });
      persistRunResolution(loaded.run, resolved.run, resolved.resolution);
      setLoaded({ ...loaded, run: resolved.run, resolution: resolved.resolution });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The run could not be resolved."); }
  }

  function requestMoreEvidence() {
    if (!loaded || !assessment) return;
    setError(null);
    try {
      const run = beginAdditionalEvidenceReturn(loaded.run, assessment, new Date().toISOString());
      setLoaded({ ...loaded, run });
      router.push(`/runs/${run.runId}/evidence`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Additional evidence could not be requested."); }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Assessment navigation">
        <Link href="/">LoopZ</Link>
        <Link href={`/runs/${runId}/evidence`}>Review returned evidence</Link>
      </nav>
      <header className={styles.header}>
        <p className="eyebrow">Evidence assessment</p>
        <WorkflowProgress stage="Assess" next="Complete the run or generate a focused repair" />
        <h1>{outcomeTitle(assessment.outcome)}</h1>
        <p>
          LoopZ assessed what was submitted against the confirmed contract. It did not access the repository or rerun these commands.
        </p>
      </header>

      <WorkflowGrid aside={<div className={styles.asideStack}>
        <section className={styles.summary} aria-label="Assessment summary">
          <div><span>Supported</span><strong>{counts.verified_by_submitted_evidence}</strong></div>
          <div><span>Needs attention</span><strong>{attentionResults.length}</strong></div>
          <div><span>Revision</span><strong>v{assessment.assessmentVersion}</strong></div>
        </section>
        <aside className={styles.boundary} role="note">
          <strong>Evidence assessment, not independent verification.</strong> Agent claims alone are never marked as supported by evidence.
        </aside>
      </div>}>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}

        {(attentionResults.length > 0 || assessment.contradictions.length > 0 || assessment.risks.length > 0) ? (
          <section className={styles.findings} aria-labelledby="findings-title">
            <h2 id="findings-title">Attention summary</h2>
            <ul>
              {attentionResults.map((result) => <li key={result.criterionId}><code>{result.criterionId}</code><span><strong>{LABELS[result.status]}.</strong> {result.explanation}</span></li>)}
            </ul>
            {(assessment.contradictions.length > 0 || assessment.risks.length > 0) ? <details><summary>Inspect assessment-wide flags</summary><ul>{assessment.contradictions.map((item) => <li key={item}>{item}</li>)}{assessment.risks.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
          </section>
        ) : null}

        <section className={styles.criteria} aria-labelledby="criteria-title">
        <div className={styles.sectionHeading}>
          <div><p className="eyebrow">Traceability</p><h2 id="criteria-title">Criterion results</h2></div>
          <p>{assessment.criteria.length} criteria assessed</p>
        </div>
        {assessment.criteria.map((result) => {
          const criterion = criteria.get(result.criterionId);
          return (
            <article className={styles.criterion} key={result.criterionId}>
              <div className={styles.criterionTop}>
                <code>{result.criterionId}</code>
                <span className={`${styles.status} ${styles[statusTone(result.status)]}`}>{LABELS[result.status]}</span>
              </div>
              <h3>{criterion?.requirement ?? "Acceptance criterion"}</h3>
              <p>{result.explanation}</p>
              <dl className={styles.meta}>
                <div><dt>Agent claim</dt><dd>{result.claim}</dd></div>
                <div><dt>Strongest evidence</dt><dd>{result.evidenceStrength.replaceAll("_", " ")}</dd></div>
                <div><dt>Assessment confidence</dt><dd>{Math.round(result.confidence * 100)}%</dd></div>
              </dl>
              {result.missingRequiredEvidence.length > 0 ? (
                <div className={styles.missing}><strong>Missing evidence</strong><ul>{result.missingRequiredEvidence.map((item) => <li key={item}>{item}</li>)}</ul></div>
              ) : null}
              <EvidenceTrace ids={result.evidenceReferences} evidence={evidence} />
              {!loaded.resolution && correcting === result.criterionId ? (
                <CorrectionForm result={result} onCancel={() => setCorrecting(null)} onSave={correct} />
              ) : !loaded.resolution ? (
                <button className={styles.textButton} type="button" onClick={() => setCorrecting(result.criterionId)}>
                  Correct this assessment
                </button>
              ) : null}
            </article>
          );
        })}
        </section>

        <section className={styles.next}>
          <p className="eyebrow">Recommended next action</p>
          <h2>{assessment.recommendedNextAction}</h2>
          {loaded.resolution ? <p className={styles.ready}>Run {loaded.resolution.state}: {loaded.resolution.explanation}</p> : null}
          <ActionRow
            back={<Link className="button secondary" href={`/runs/${runId}/evidence`}>Review source evidence</Link>}
            primary={
              loaded.run.state === "repair_generated"
                ? <Link className="button" href={`/runs/${runId}/repair`}>Return to focused repair</Link>
                : loaded.resolution
                  ? <Link className="button" href="/">Return to LoopZ</Link>
                  : nextStep === "complete"
                    ? <button className="button" onClick={finishRun} type="button">Mark run complete</button>
                    : nextStep === "repair"
                      ? <Link className="button" href={`/runs/${runId}/repair`}>Generate focused repair</Link>
                      : nextStep === "more_evidence"
                        ? <button className="button" onClick={requestMoreEvidence} type="button">Submit missing evidence</button>
                        : <button className="button" onClick={finishRun} type="button">Stop and record outcome</button>
            }
          />
        </section>

        {assessment.corrections.length > 0 ? (
          <section className={styles.audit} aria-labelledby="audit-title">
            <h2 id="audit-title">Correction audit trail</h2>
            <ol>{assessment.corrections.map((item) => (
              <li key={item.correctionId}>
                <strong>{item.criterionId}</strong>: {LABELS[item.previousStatus]} → {LABELS[item.correctedStatus]} — {item.reason}
              </li>
            ))}</ol>
          </section>
        ) : null}
      </WorkflowGrid>
    </main>
  );
}

function EvidenceTrace({ ids, evidence }: { ids: string[]; evidence: Map<string, EvidenceSubmission["evidenceItems"][number]> }) {
  if (ids.length === 0) return <p className={styles.noEvidence}>No evidence was linked to this criterion.</p>;
  return <details className={styles.trace}><summary>Inspect {ids.length} linked evidence item(s)</summary><ul>{ids.map((id) => {
    const item = evidence.get(id);
    return <li key={id}><code>{id}</code><strong>{item?.description ?? "Missing evidence reference"}</strong>{item?.content ? <pre>{item.content}</pre> : item?.uri ? <p>{item.uri}</p> : null}</li>;
  })}</ul></details>;
}

function CorrectionForm({ result, onCancel, onSave }: {
  result: Assessment["criteria"][number];
  onCancel: () => void;
  onSave: (criterionId: string, status: CriterionStatus, reason: string) => void;
}) {
  const [status, setStatus] = useState<CriterionStatus>(result.status);
  const [reason, setReason] = useState("");
  return <form className={styles.correction} onSubmit={(event) => { event.preventDefault(); onSave(result.criterionId, status, reason); }}>
    <label>Corrected status<select value={status} onChange={(event) => setStatus(criterionStatusSchema.parse(event.target.value))}>{criterionStatusSchema.options.map((item) => <option key={item} value={item}>{LABELS[item]}</option>)}</select></label>
    <label>Why is the automated assessment incorrect?<textarea required minLength={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
    <div><button className="button" type="submit">Save correction</button><button className={styles.textButton} type="button" onClick={onCancel}>Cancel</button></div>
  </form>;
}

function outcomeTitle(outcome: Assessment["outcome"]): string {
  const titles: Record<Assessment["outcome"], string> = {
    completed_with_evidence: "The submitted evidence supports completion.",
    partially_completed: "Some requirements still need stronger proof.",
    repair_recommended: "A focused repair is recommended.",
    blocked_human_input_required: "Human input is required to continue.",
    unverifiable_more_evidence_required: "More evidence is required.",
    unsafe_or_out_of_scope: "Execution crossed the safe contract boundary.",
  };
  return titles[outcome];
}

function statusTone(status: CriterionStatus): "positive" | "warning" | "negative" | "neutral" {
  if (status === "verified_by_submitted_evidence" || status === "not_applicable") return "positive";
  if (status === "failed") return "negative";
  if (status === "blocked" || status === "partially_supported") return "warning";
  return "neutral";
}

function AssessmentState({ message }: { message: string }) {
  return <main className={styles.page}><WorkflowGrid><section className={styles.state}><p className="eyebrow">Evidence assessment</p><WorkflowProgress stage="Assess" next="Complete the run or generate a focused repair" /><h1>Assessment unavailable</h1><p className={message.startsWith("Assessing") ? styles.processing : undefined} role="status">{message}</p><Link className="button" href="/">Return home</Link></section></WorkflowGrid></main>;
}
