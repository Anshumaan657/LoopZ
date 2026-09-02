"use client";

import { useState, type FormEvent } from "react";

import {
  evidenceReturnDraftSchema,
  type EvidenceClaim,
  type EvidenceReturnDraft,
} from "@loopz/contracts/evidence";

import styles from "./evidence-return.module.css";

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    <form className={styles.form} onSubmit={(event) => void submit(event)}>
      <section className={styles.card}>
        <p className={styles.step}>1 · Execution source</p>
        <h2>Which coding agent did you use?</h2>
        <label className={styles.field}>
          <span>Agent and model, if known</span>
          <input
            onChange={(event) => setCodingAgent(event.target.value)}
            placeholder="For example: Codex, Claude Code, Cursor"
            required
            value={codingAgent}
          />
        </label>
      </section>

      <section className={styles.card}>
        <p className={styles.step}>2 · Agent output</p>
        <h2>Paste what the agent returned.</h2>
        <label className={styles.field}>
          <span>Final report</span>
          <small>Paste the full report, including criterion IDs and reported test results.</small>
          <textarea required rows={12} value={finalReport} onChange={(event) => setFinalReport(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Test or build command output</span>
          <small>Use exact terminal output when available. Do not rewrite it.</small>
          <textarea rows={8} value={commandOutput} onChange={(event) => setCommandOutput(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Diff or file-change summary</span>
          <textarea rows={5} value={diffSummary} onChange={(event) => setDiffSummary(event.target.value)} />
        </label>
      </section>

      <section className={styles.card}>
        <p className={styles.step}>3 · Your observations</p>
        <h2>Add what you personally checked.</h2>
        <label className={styles.field}>
          <span>Problems you observed</span>
          <textarea rows={4} value={userObservedProblems} onChange={(event) => setUserObservedProblems(event.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Manual checks performed</span>
          <textarea rows={4} value={manualChecks} onChange={(event) => setManualChecks(event.target.value)} />
        </label>
      </section>

      <section className={styles.card}>
        <p className={styles.step}>4 · Criterion claims</p>
        <h2>What did the agent claim for each requirement?</h2>
        <p>This is a claim, not verification. LoopZ will assess the submitted evidence in Phase 8.</p>
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
          <textarea rows={4} value={userNotes} onChange={(event) => setUserNotes(event.target.value)} />
        </label>
      </section>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button className="button" disabled={busy} type="submit">
        {busy ? "Validating evidence…" : "Submit execution evidence"}
      </button>
    </form>
  );
}
