"use client";

import { useMemo, useState, type FormEvent } from "react";

import {
  evidenceReturnDraftSchema,
  type EvidenceClaim,
  type EvidenceReturnDraft,
} from "@loopz/contracts/evidence";

import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { detectPotentialSecrets } from "./detect-potential-secrets";
import styles from "./evidence-return.module.css";

const STEPS = ["Source", "Agent output", "Your checks", "Criterion claims"] as const;

export type EvidenceCriterionInput = {
  id: string;
  requirement: string;
  requiredEvidence: readonly string[];
};

export function EvidenceReturnForm({
  criteria,
  onSubmit,
}: {
  criteria: readonly EvidenceCriterionInput[];
  onSubmit(draft: EvidenceReturnDraft): Promise<void>;
}) {
  const [codingAgent, setCodingAgent] = useState("");
  const [finalReport, setFinalReport] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
  const [diffSummary, setDiffSummary] = useState("");
  const [userObservedProblems, setUserObservedProblems] = useState("");
  const [manualChecks, setManualChecks] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [claims, setClaims] = useState<Record<string, EvidenceClaim>>(
    Object.fromEntries(criteria.map((criterion) => [criterion.id, "unverified"])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ codingAgent?: string; finalReport?: string }>({});
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);

  const secretWarnings = useMemo(() => ({
    finalReport: detectPotentialSecrets(finalReport),
    commandOutput: detectPotentialSecrets(commandOutput),
    diffSummary: detectPotentialSecrets(diffSummary),
    userObservedProblems: detectPotentialSecrets(userObservedProblems),
    manualChecks: detectPotentialSecrets(manualChecks),
    userNotes: detectPotentialSecrets(userNotes),
  }), [commandOutput, diffSummary, finalReport, manualChecks, userNotes, userObservedProblems]);
  const hasSecretWarnings = Object.values(secretWarnings).some((warnings) => warnings.length > 0);
  const currentStepHasSecrets = step === 1
    ? secretWarnings.finalReport.length + secretWarnings.commandOutput.length + secretWarnings.diffSummary.length > 0
    : step === 2
      ? secretWarnings.userObservedProblems.length + secretWarnings.manualChecks.length > 0
      : step === 3 && secretWarnings.userNotes.length > 0;

  function secretWarning(field: keyof typeof secretWarnings, id: string) {
    const warnings = secretWarnings[field];
    return warnings.length > 0 ? (
      <small className={styles.fieldError} id={id} role="alert">
        {warnings.map((warning) => warning.message).join(" ")}
      </small>
    ) : null;
  }

  function focusField(id: string) {
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  }

  function moveTo(nextStep: number) {
    if (nextStep > step) {
      if (step === 0 && !codingAgent.trim()) {
        setFieldErrors((current) => ({ ...current, codingAgent: "Name the coding agent you used before continuing." }));
        focusField("coding-agent");
        return;
      }
      if (step === 1 && !finalReport.trim()) {
        setFieldErrors((current) => ({ ...current, finalReport: "Paste the agent's final report before continuing." }));
        focusField("final-report");
        return;
      }
      if (currentStepHasSecrets) {
        setError("Remove or redact the possible secret before continuing. LoopZ will not save evidence containing a detected credential.");
        return;
      }
    }
    setError(null);
    const boundedStep = Math.max(0, Math.min(STEPS.length - 1, nextStep));
    setStep(boundedStep);
    setFurthestStep((current) => Math.max(current, boundedStep));
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codingAgent.trim()) {
      setStep(0);
      setFieldErrors((current) => ({ ...current, codingAgent: "Name the coding agent you used before submitting." }));
      focusField("coding-agent");
      return;
    }
    if (!finalReport.trim()) {
      setStep(1);
      setFieldErrors((current) => ({ ...current, finalReport: "Paste the agent's final report before submitting." }));
      focusField("final-report");
      return;
    }
    if (hasSecretWarnings) {
      const firstStep = secretWarnings.finalReport.length || secretWarnings.commandOutput.length || secretWarnings.diffSummary.length
        ? 1
        : secretWarnings.userObservedProblems.length || secretWarnings.manualChecks.length
          ? 2
          : 3;
      setStep(firstStep);
      setError("Remove or redact every possible secret before submitting. Detected credentials are never intentionally stored.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const draft = evidenceReturnDraftSchema.parse({
        codingAgent,
        finalReport,
        commandOutput,
        diffSummary,
        userObservedProblems,
        manualChecks,
        userNotes,
        criterionClaims: criteria.map((criterion) => ({
          criterionId: criterion.id,
          claim: claims[criterion.id] ?? "unverified",
        })),
      });
      await onSubmit(draft);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The evidence could not be prepared.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
      <WorkflowGrid aside={<nav className={styles.progress} aria-label="Evidence return steps">
        <p>Step {step + 1} of {STEPS.length} · <strong>{STEPS[step]}</strong></p>
        <ol>
          {STEPS.map((item, index) => (
            <li key={item}>
              <button
                aria-label={`${item}${index < furthestStep && index !== step ? ", complete" : ""}`}
                aria-current={index === step ? "step" : undefined}
                disabled={index > furthestStep}
                onClick={() => moveTo(index)}
                type="button"
              >
                <span>{index < furthestStep && index !== step ? "✓" : index + 1}</span>
                <span>{item}{index < furthestStep && index !== step ? <small>Complete</small> : null}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>}>
      {(error || fieldErrors.codingAgent || fieldErrors.finalReport) ? (
        <div className={styles.errorSummary} role="alert" tabIndex={-1}>
          <strong>Check the highlighted field.</strong>
          <span>{error ?? fieldErrors.codingAgent ?? fieldErrors.finalReport}</span>
        </div>
      ) : null}

      {step === 0 ? <section className={styles.card}>
        <p className={styles.step}>1 · Execution source</p>
        <h2>Which coding agent did you use?</h2>
        <p>Start with the source of the return. Your answer stays in this browser while you continue.</p>
        <label className={styles.field}>
          <span>Agent and model, if known</span>
          <input
            aria-describedby={fieldErrors.codingAgent ? "coding-agent-error" : undefined}
            aria-invalid={Boolean(fieldErrors.codingAgent)}
            id="coding-agent"
            onChange={(event) => {
              setCodingAgent(event.target.value);
              if (event.target.value.trim()) setFieldErrors((current) => ({ ...current, codingAgent: undefined }));
            }}
            placeholder="For example: Codex, Claude Code, Cursor"
            required
            value={codingAgent}
          />
          {fieldErrors.codingAgent ? <small className={styles.fieldError} id="coding-agent-error">{fieldErrors.codingAgent}</small> : null}
        </label>
      </section> : null}

      {step === 1 ? <section className={styles.card}>
        <p className={styles.step}>2 · Agent output</p>
        <h2>Paste what the agent returned.</h2>
        <label className={styles.field}>
          <span>Final report</span>
          <small>Paste the full report, including criterion IDs and reported test results.</small>
          <textarea
            aria-describedby={[
              fieldErrors.finalReport ? "final-report-error" : "",
              secretWarnings.finalReport.length ? "final-report-secret-warning" : "",
            ].filter(Boolean).join(" ") || undefined}
            aria-invalid={Boolean(fieldErrors.finalReport || secretWarnings.finalReport.length)}
            id="final-report"
            required
            rows={12}
            value={finalReport}
            onChange={(event) => {
              setFinalReport(event.target.value);
              if (event.target.value.trim()) setFieldErrors((current) => ({ ...current, finalReport: undefined }));
            }}
          />
          {fieldErrors.finalReport ? <small className={styles.fieldError} id="final-report-error">{fieldErrors.finalReport}</small> : null}
          {secretWarning("finalReport", "final-report-secret-warning")}
        </label>
        <label className={styles.field}>
          <span>Test or build command output</span>
          <small>Use exact terminal output when available. Do not rewrite it.</small>
          <textarea aria-describedby={secretWarnings.commandOutput.length ? "command-output-secret-warning" : undefined} aria-invalid={Boolean(secretWarnings.commandOutput.length)} rows={8} value={commandOutput} onChange={(event) => setCommandOutput(event.target.value)} />
          {secretWarning("commandOutput", "command-output-secret-warning")}
        </label>
        <label className={styles.field}>
          <span>Diff or file-change summary</span>
          <textarea aria-describedby={secretWarnings.diffSummary.length ? "diff-summary-secret-warning" : undefined} aria-invalid={Boolean(secretWarnings.diffSummary.length)} rows={5} value={diffSummary} onChange={(event) => setDiffSummary(event.target.value)} />
          {secretWarning("diffSummary", "diff-summary-secret-warning")}
        </label>
      </section> : null}

      {step === 2 ? <section className={styles.card}>
        <p className={styles.step}>3 · Your observations</p>
        <h2>Add what you personally checked.</h2>
        <label className={styles.field}>
          <span>Problems you observed</span>
          <textarea aria-describedby={secretWarnings.userObservedProblems.length ? "observed-problems-secret-warning" : undefined} aria-invalid={Boolean(secretWarnings.userObservedProblems.length)} rows={4} value={userObservedProblems} onChange={(event) => setUserObservedProblems(event.target.value)} />
          {secretWarning("userObservedProblems", "observed-problems-secret-warning")}
        </label>
        <label className={styles.field}>
          <span>Manual checks performed</span>
          <textarea aria-describedby={secretWarnings.manualChecks.length ? "manual-checks-secret-warning" : undefined} aria-invalid={Boolean(secretWarnings.manualChecks.length)} rows={4} value={manualChecks} onChange={(event) => setManualChecks(event.target.value)} />
          {secretWarning("manualChecks", "manual-checks-secret-warning")}
        </label>
      </section> : null}

      {step === 3 ? <section className={styles.card}>
        <p className={styles.step}>4 · Criterion claims</p>
        <h2>What did the agent claim for each requirement?</h2>
        <p>This is a claim, not verification. LoopZ will assess the evidence after submission.</p>
        <div className={styles.criteria}>
          {criteria.map((criterion) => (
            <article key={criterion.id}>
              <div><strong>{criterion.id}</strong><p>{criterion.requirement}</p></div>
              <p className={styles.required}>Expected evidence: {criterion.requiredEvidence.join(" · ")}</p>
              <label className={styles.field}>
                <span>Reported status</span>
                <select
                  value={claims[criterion.id] ?? "unverified"}
                  onChange={(event) => setClaims((current) => ({
                    ...current,
                    [criterion.id]: event.target.value as EvidenceClaim,
                  }))}
                >
                  <option value="unverified">Not reported / unsure</option>
                  <option value="passed">Agent says passed</option>
                  <option value="failed">Agent says failed</option>
                  <option value="blocked">Agent says blocked</option>
                </select>
              </label>
            </article>
          ))}
        </div>
        <label className={styles.field}>
          <span>Additional notes</span>
          <textarea aria-describedby={secretWarnings.userNotes.length ? "user-notes-secret-warning" : undefined} aria-invalid={Boolean(secretWarnings.userNotes.length)} rows={4} value={userNotes} onChange={(event) => setUserNotes(event.target.value)} />
          {secretWarning("userNotes", "user-notes-secret-warning")}
        </label>
      </section> : null}

      <ActionRow
        back={step > 0 ? <button className="button secondary" onClick={() => moveTo(step - 1)} type="button">Back</button> : undefined}
        disabledReason={currentStepHasSecrets ? "Remove or redact the detected credential before continuing." : busy ? "LoopZ is validating the evidence against the confirmed contract." : null}
        primary={step < STEPS.length - 1 ? <button className="button" disabled={currentStepHasSecrets} onClick={() => moveTo(step + 1)} type="button">Continue</button> : <button className="button" disabled={busy || currentStepHasSecrets} type="submit">{busy ? "Validating evidence…" : "Submit execution evidence"}</button>}
        stickyOnMobile
      />
      </WorkflowGrid>
    </form>
  );
}
