"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { EvidenceReturnDraft, EvidenceSubmission } from "@loopz/contracts/evidence";
import type { Run } from "@loopz/contracts/run";
import type { ConfirmedContractVersion } from "@loopz/contracts/versioning";
import { compileEvidenceSubmission } from "@loopz/core/evidence";

import { loadTaskRunById } from "../artifacts/task-storage";
import { loadContractVersions } from "../versioning/version-storage";
import { EvidenceReturnForm } from "./evidence-return-form";
import { validateEvidenceReturnSize } from "./evidence-limits";
import {
  deleteLocalRunAndEvidence,
  loadEvidenceSubmissions,
  persistEvidenceSubmission,
  validateEvidenceHistoryForRun,
} from "./evidence-storage";
import styles from "./evidence-return-page.module.css";

type LoadedReturn = {
  run: Run;
  version: ConfirmedContractVersion;
  submission: EvidenceSubmission | null;
};

export function EvidenceReturn({ runId }: { runId: string }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState<LoadedReturn | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const run = loadTaskRunById(runId);
      const selected = loadContractVersions(run.projectId).find(
        (version) => version.versionId === run.contractVersionId,
      );
      if (!selected || selected.schemaVersion === "0.1") {
        throw new Error("The confirmed contract version for this run was not found.");
      }
      if (selected.contractHash !== run.contractHash || selected.version !== run.contractVersion) {
        throw new Error("The run no longer matches its confirmed contract version.");
      }
      const submissions = loadEvidenceSubmissions(run.runId);
      validateEvidenceHistoryForRun(
        run,
        selected.loopSpec.acceptance.criteria.map((criterion) => criterion.id),
        submissions,
      );
      if (run.state === "evidence_submitted" && submissions.length > 0) {
        setLoaded({ run, version: selected, submission: submissions.at(-1)! });
        return;
      }
      if (run.state !== "awaiting_evidence") {
        throw new Error(`This run cannot accept evidence while its state is ${run.state}.`);
      }
      if (submissions.length > 0) {
        throw new Error("Evidence history exists but the run state is inconsistent.");
      }
      setLoaded({ run, version: selected, submission: null });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Evidence return could not be loaded.");
    }
  }, [runId]);

  async function submit(draft: EvidenceReturnDraft) {
    if (!loaded || loaded.submission) return;
    setError(null);
    try {
      validateEvidenceReturnSize(draft);
      const submittedAt = new Date().toISOString();
      const submission = await compileEvidenceSubmission({
        run: loaded.run,
        version: loaded.version,
        draft,
        submissionId: crypto.randomUUID(),
        submittedAt,
      });
      const saved = persistEvidenceSubmission(loaded.run, submission, submittedAt);
      setLoaded({ ...loaded, run: saved.run, submission });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The evidence could not be submitted.";
      setError(message);
      throw cause;
    }
  }

  function deleteLocalData() {
    if (!loaded) return;
    const confirmed = window.confirm(
      "Delete this local run and all of its submitted evidence? This cannot be undone.",
    );
    if (!confirmed) return;
    deleteLocalRunAndEvidence(loaded.run);
    router.push(`/projects/${loaded.run.projectId}/task?version=${loaded.run.contractVersionId}`);
  }

  if (error && !loaded) return <EvidenceState message={error} />;
  if (!loaded) return <EvidenceState message="Loading the execution run…" />;

  if (loaded.submission) {
    return (
      <main className={styles.page}>
        <nav className={styles.nav}><Link href="/">LoopZ</Link></nav>
        <section className={styles.complete} aria-live="polite">
          <span className="status-pill">Evidence submitted</span>
          <h1>The execution return is safely linked.</h1>
          <p>
            LoopZ preserved {loaded.submission.evidenceItems.length} evidence items across {loaded.submission.criteria.length} acceptance criteria. Claims have not yet been verified.
          </p>
          <dl>
            <div><dt>Run ID</dt><dd><code>{loaded.run.runId}</code></dd></div>
            <div><dt>Submission ID</dt><dd><code>{loaded.submission.submissionId}</code></dd></div>
            <div><dt>Contract</dt><dd>v{loaded.run.contractVersion}</dd></div>
            <div><dt>State</dt><dd>{loaded.run.state.replaceAll("_", " ")}</dd></div>
          </dl>
          <div className={styles.actions}>
            <Link className="button" href={`/runs/${loaded.run.runId}/assessment`}>Continue to evidence assessment</Link>
            <button className={styles.deleteButton} onClick={deleteLocalData} type="button">Delete local run and evidence</button>
          </div>
        </section>
      </main>
    );
  }

  const criteria = loaded.version.loopSpec.acceptance.criteria.map((criterion) => ({
    id: criterion.id,
    requirement: criterion.requirement,
    requiredEvidence: criterion.requiredEvidence,
  }));
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Evidence return navigation">
        <Link href="/">LoopZ</Link>
        <Link href={`/projects/${loaded.run.projectId}/task?version=${loaded.run.contractVersionId}`}>Back to task</Link>
      </nav>
      <header className={styles.header}>
        <p className="eyebrow">Phase 7 · Evidence return</p>
        <h1>Show what the agent actually produced.</h1>
        <p>
          Paste original outputs. LoopZ will preserve claims separately from evidence and assess them against the confirmed contract next.
        </p>
      </header>
      <section className={styles.runMeta} aria-label="Evidence source">
        <div><span>Run</span><code>{loaded.run.runId}</code></div>
        <div><span>Contract</span><strong>v{loaded.run.contractVersion}</strong></div>
        <div><span>Criteria</span><strong>{criteria.length}</strong></div>
      </section>
      <aside className={styles.warning} role="note">
        Remove passwords, API keys, personal data, and other secrets before submitting. LoopZ stores this evidence only in this browser for the MVP.
      </aside>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <EvidenceReturnForm criteria={criteria} onSubmit={submit} />
    </main>
  );
}

function EvidenceState({ message }: { message: string }) {
  return (
    <main className={styles.page}>
      <section className={styles.state}>
        <p className="eyebrow">Phase 7 · Evidence return</p>
        <h1>Evidence return unavailable</h1>
        <p role="status">{message}</p>
        <Link className="button" href="/">Return home</Link>
      </section>
    </main>
  );
}
