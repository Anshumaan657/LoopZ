"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Assessment } from "@loopz/contracts/assessment";
import type { EvidenceSubmission } from "@loopz/contracts/evidence";
import type { RepairTask } from "@loopz/contracts/repair";
import type { Run } from "@loopz/contracts/run";
import type { ConfirmedContractVersion } from "@loopz/contracts/versioning";
import { resolveRun } from "@loopz/core";
import { compileRepairTask } from "@loopz/core/repair";

import { copyExactTask, downloadExactTask } from "../artifacts/task-actions";
import { loadTaskRunById } from "../artifacts/task-storage";
import { loadAssessments } from "../assessment/assessment-storage";
import { loadEvidenceSubmissions } from "../evidence/evidence-storage";
import { loadContractVersions } from "../versioning/version-storage";
import {
  beginRepairEvidenceReturn,
  loadRepairTasks,
  markRepairDelivered,
  persistRepairTask,
  validateRepairHistoryForRun,
  wasRepairDelivered,
} from "./repair-storage";
import { persistRunResolution } from "./run-resolution-storage";
import styles from "./repair-delivery.module.css";

type Delivery = {
  run: Run;
  version: ConfirmedContractVersion;
  assessment: Assessment;
  submission: EvidenceSubmission;
  repairs: RepairTask[];
  repair: RepairTask;
  delivered: boolean;
};

export function RepairDelivery({ runId }: { runId: string }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        let run = loadTaskRunById(runId);
        const version = loadContractVersions(run.projectId).find((item) => item.versionId === run.contractVersionId);
        if (!version || version.schemaVersion === "0.1") throw new Error("The confirmed contract for this repair was not found.");
        const submissions = loadEvidenceSubmissions(run.runId);
        const assessments = loadAssessments(run.runId);
        const assessment = assessments.at(-1);
        if (!assessment) throw new Error("Assess returned evidence before generating a repair.");
        const submission = submissions.find((item) => item.submissionId === assessment.evidenceSubmissionId);
        if (!submission) throw new Error("The evidence behind this assessment was not found.");
        let repairs = loadRepairTasks(run.runId);
        validateRepairHistoryForRun(run, repairs);
        let repair = repairs.find((item) => item.parentAssessmentId === assessment.assessmentId);
        if (!repair) {
          let compiled: RepairTask;
          try {
            compiled = await compileRepairTask({
              run,
              version,
              assessment,
              submission,
              previousRepairs: repairs,
              repairId: crypto.randomUUID(),
              generatedAt: new Date().toISOString(),
            });
          } catch (cause) {
            if (cause instanceof Error && cause.message.includes("No progress was detected")) {
              const terminal = resolveRun({
                run,
                version,
                assessment,
                resolutionId: crypto.randomUUID(),
                resolvedAt: new Date().toISOString(),
                forcedBlockReason: "no_progress",
              });
              persistRunResolution(run, terminal.run, terminal.resolution);
            }
            throw cause;
          }
          const concurrent = loadRepairTasks(run.runId);
          const existing = concurrent.find((item) => item.parentAssessmentId === assessment.assessmentId);
          if (existing) {
            run = loadTaskRunById(runId);
            repairs = concurrent;
            repair = existing;
          } else {
            const saved = persistRepairTask(run, compiled);
            run = saved.run;
            repairs = saved.repairs;
            repair = compiled;
          }
        }
        if (!repair) throw new Error("The repair task could not be prepared.");
        if (active) setDelivery({
          run, version, assessment, submission, repairs, repair,
          delivered: wasRepairDelivered(repair),
        });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Repair delivery could not be loaded.");
      }
    }
    void initialize();
    return () => { active = false; };
  }, [runId]);

  async function copyRepair() {
    if (!delivery) return;
    setError(null);
    try {
      await copyExactTask(delivery.repair.instructions);
      markRepairDelivered(delivery.repair, new Date().toISOString());
      setDelivery({ ...delivery, delivered: true });
      setNotice("Focused repair copied. Paste it into the same coding-agent project.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The repair task could not be copied.");
    }
  }

  function downloadRepair() {
    if (!delivery) return;
    setError(null);
    try {
      downloadExactTask(`LOOPZ_REPAIR_${delivery.repair.attempt}.md`, delivery.repair.instructions);
      markRepairDelivered(delivery.repair, new Date().toISOString());
      setDelivery({ ...delivery, delivered: true });
      setNotice("Focused repair downloaded as Markdown.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The repair task could not be downloaded.");
    }
  }

  function returnEvidence() {
    if (!delivery) return;
    setError(null);
    try {
      const run = beginRepairEvidenceReturn(delivery.run, delivery.repair, new Date().toISOString());
      setDelivery({ ...delivery, run });
      router.push(`/runs/${run.runId}/evidence`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Repair evidence return could not be started.");
    }
  }

  if (error && !delivery) return <RepairState runId={runId} message={error} />;
  if (!delivery) return <RepairState runId={runId} message="Preparing the focused repair…" />;

  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Repair delivery navigation"><Link href="/">LoopZ</Link><Link href={`/runs/${runId}/assessment`}>Back to assessment</Link></nav>
    <header className={styles.header}><p className="eyebrow">Focused repair</p><h1>Fix only what remains unresolved.</h1><p>This repair preserves supported behavior and carries the exact evidence that triggered another attempt.</p></header>
    <section className={styles.meta} aria-label="Repair details">
      <div><span>Attempt</span><strong>{delivery.repair.attempt} of {delivery.version.loopSpec.limits.maximumRepairAttempts}</strong></div>
      <div><span>Unresolved</span><strong>{delivery.repair.unresolvedCriteria.length}</strong></div>
      <div><span>Preserved</span><strong>{delivery.repair.preservedCriterionIds.length}</strong></div>
      <div><span>Run</span><code>{delivery.run.runId}</code></div>
    </section>
    <aside className={styles.warning} role="note"><strong>Use the same repository and coding-agent session.</strong> The prompt is intentionally bounded; expanding scope invalidates its assessment chain.</aside>
    <section className={styles.preview}>
      <div><span>Copy-ready Markdown</span><strong>LOOPZ_REPAIR_{delivery.repair.attempt}.md</strong></div>
      <pre tabIndex={0}><code>{delivery.repair.instructions}</code></pre>
      <div className={styles.actions}><button className="button" onClick={() => void copyRepair()} type="button">Copy focused repair</button><button className="button secondary" onClick={downloadRepair} type="button">Download Markdown</button></div>
      <div aria-live="polite">{notice ? <p className={styles.success}>{notice}</p> : null}{error ? <p className={styles.error} role="alert">{error}</p> : null}</div>
    </section>
    <section className={styles.next}><p className="eyebrow">After the agent finishes</p><h2>Return fresh evidence for reassessment.</h2><p>The previous evidence remains immutable. This attempt creates a new evidence submission and a new assessment revision.</p><button className="button" disabled={!delivery.delivered} onClick={returnEvidence} type="button">{delivery.delivered ? "Return repair evidence" : "Copy or download the repair first"}</button></section>
  </main>;
}

function RepairState({ runId, message }: { runId: string; message: string }) {
  return <main className={styles.page}><section className={styles.state}><p className="eyebrow">Focused repair</p><h1>Repair unavailable</h1><p role="status">{message}</p><Link className="button" href={`/runs/${runId}/assessment`}>Return to assessment</Link></section></main>;
}
