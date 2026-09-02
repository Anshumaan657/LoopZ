"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ContractReviewInput } from "@loopz/contracts/review";
import type { SafetyContractDraft } from "@loopz/contracts/loopspec";
import {
  contractReviewInput,
  reviseSafetyContractDraft,
} from "@loopz/core/review";
import { validateSafetyContractDraft } from "@loopz/core/generation";

import {
  generateSafetyDraft,
  loadOrGenerateContract,
  saveContractReview,
  type StoredProjectRecord,
} from "./contract-storage";
import styles from "./contract-review.module.css";

type LoadedReview = {
  record: StoredProjectRecord;
  draft: SafetyContractDraft;
  input: ContractReviewInput;
};

function lines(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function ContractReview({ projectId }: { projectId: string }) {
  const [loaded, setLoaded] = useState<LoadedReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const result = loadOrGenerateContract(projectId);
      setLoaded({ ...result, input: contractReviewInput(result.draft) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The contract could not be generated.");
    }
  }, [projectId]);

  if (error && !loaded) {
    return <ReviewState title="Contract unavailable" message={error} projectId={projectId} />;
  }
  if (!loaded) return <ReviewState title="Compiling your contract…" projectId={projectId} />;

  const validation = validateSafetyContractDraft(loaded.draft);
  const blockingCount = validation.valid ? 0 : validation.issues.length;

  function updateInput(updater: (current: ContractReviewInput) => ContractReviewInput) {
    setLoaded((current) => current ? { ...current, input: updater(current.input) } : current);
    setSaved(false);
  }

  function saveReview() {
    if (!loaded) return;
    try {
      const revised = reviseSafetyContractDraft(loaded.draft, loaded.input);
      const record = saveContractReview(loaded.record, revised.draft);
      setLoaded({ record, draft: revised.draft, input: contractReviewInput(revised.draft) });
      setSaved(true);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The edits could not be saved.");
    }
  }

  function resetReview() {
    if (!loaded) return;
    try {
      const draft = generateSafetyDraft(loaded.record);
      const record = saveContractReview(loaded.record, draft);
      setLoaded({ record, draft, input: contractReviewInput(draft) });
      setSaved(false);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The contract could not be regenerated.");
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Contract navigation">
        <Link href="/">LoopZ</Link>
        <Link href={`/projects/${projectId}/interview`}>Back to answers</Link>
      </nav>

      <header className={styles.header}>
        <div>
          <p className="eyebrow">Phase 5.4 · Contract review</p>
          <h1>Make the contract match your intent.</h1>
          <p>Correct the draft before it becomes an immutable version. Stable IDs stay locked.</p>
        </div>
        <div className={styles.summary}>
          <strong>{loaded.draft.objective.deliverables.length}</strong>
          <span>deliverables</span>
          <strong>{blockingCount}</strong>
          <span>blocking issues</span>
        </div>
      </header>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {saved ? <p className={styles.success} role="status">Review saved in this browser.</p> : null}

      <div className={styles.layout}>
        <div className={styles.editor}>
          <ReviewSection title="Goal" description="The one outcome this task must achieve.">
            <label>
              <span>Confirmed goal</span>
              <textarea
                value={loaded.input.goal}
                onChange={(event) => updateInput((input) => ({ ...input, goal: event.target.value }))}
                rows={3}
              />
            </label>
          </ReviewSection>

          <ReviewSection title="Deliverables" description="What the agent must produce.">
            {loaded.input.deliverables.map((item, index) => (
              <div className={styles.row} key={item.id}>
                <code>{item.id}</code>
                <input
                  aria-label={`${item.id} description`}
                  value={item.description}
                  onChange={(event) => updateInput((input) => ({
                    ...input,
                    deliverables: input.deliverables.map((candidate, candidateIndex) =>
                      candidateIndex === index
                        ? { ...candidate, description: event.target.value }
                        : candidate,
                    ),
                  }))}
                />
                <select
                  aria-label={`${item.id} priority`}
                  value={item.priority}
                  onChange={(event) => updateInput((input) => ({
                    ...input,
                    deliverables: input.deliverables.map((candidate, candidateIndex) =>
                      candidateIndex === index
                        ? { ...candidate, priority: event.target.value as "required" | "optional" }
                        : candidate,
                    ),
                  }))}
                >
                  <option value="required">Required</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
            ))}
          </ReviewSection>

          <ReviewSection title="Scope" description="Edit descriptions without changing traceable IDs.">
            <ScopeEditor
              label="Included"
              items={loaded.input.includedScope}
              onChange={(index, value) => updateInput((input) => ({
                ...input,
                includedScope: input.includedScope.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, description: value } : item,
                ),
              }))}
            />
            <ScopeEditor
              label="Excluded"
              items={loaded.input.excludedScope}
              onChange={(index, value) => updateInput((input) => ({
                ...input,
                excludedScope: input.excludedScope.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, description: value } : item,
                ),
              }))}
            />
            {loaded.input.assumptions.map((assumption, index) => (
              <label key={`assumption-${index}`}>
                <span>Assumption {index + 1}</span>
                <input
                  value={assumption}
                  onChange={(event) => updateInput((input) => ({
                    ...input,
                    assumptions: input.assumptions.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item,
                    ),
                  }))}
                />
              </label>
            ))}
          </ReviewSection>

          <ReviewSection
            title="Acceptance and proof"
            description="Say exactly what passes and what evidence must return."
          >
            {loaded.input.criteria.map((criterion, index) => (
              <article className={styles.criterion} key={criterion.id}>
                <code>{criterion.id}</code>
                <label>
                  <span>Passing behavior</span>
                  <textarea
                    rows={3}
                    value={criterion.requirement}
                    onChange={(event) => updateInput((input) => ({
                      ...input,
                      criteria: input.criteria.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, requirement: event.target.value } : item,
                      ),
                    }))}
                  />
                </label>
                <label>
                  <span>Verification method</span>
                  <textarea
                    rows={3}
                    value={criterion.verificationMethod}
                    onChange={(event) => updateInput((input) => ({
                      ...input,
                      criteria: input.criteria.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, verificationMethod: event.target.value } : item,
                      ),
                    }))}
                  />
                </label>
                <label>
                  <span>Required evidence · one item per line</span>
                  <textarea
                    rows={3}
                    value={criterion.requiredEvidence.join("\n")}
                    onChange={(event) => updateInput((input) => ({
                      ...input,
                      criteria: input.criteria.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, requiredEvidence: lines(event.target.value) } : item,
                      ),
                    }))}
                  />
                </label>
              </article>
            ))}
            <label>
              <span>Verification commands · one command per line</span>
              <textarea
                rows={4}
                value={loaded.input.verificationCommands.join("\n")}
                onChange={(event) => updateInput((input) => ({
                  ...input,
                  verificationCommands: lines(event.target.value),
                }))}
              />
            </label>
          </ReviewSection>
        </div>

        <aside className={styles.aside}>
          <section>
            <h2>Findings</h2>
            {loaded.draft.contractChecks.findings.length === 0 ? <p>No safety findings.</p> :
              loaded.draft.contractChecks.findings.map((finding) => (
                <article
                  className={finding.severity === "blocking" ? styles.blocking : styles.warning}
                  key={finding.id}
                >
                  <strong>{finding.id} · {finding.kind.replaceAll("_", " ")}</strong>
                  <p>{finding.message}</p>
                  <small>{finding.sourceReferences.join(", ")}</small>
                </article>
              ))}
          </section>
          <section>
            <h2>Restricted actions</h2>
            <ul>{loaded.draft.safety.restrictedActions.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </aside>
      </div>

      <footer className={styles.actions}>
        <button className="button" onClick={saveReview} type="button">Save review</button>
        <button className="button secondary" onClick={resetReview} type="button">
          Reset generated draft
        </button>
        {validation.valid && saved ? (
          <Link className="button" href={`/projects/${projectId}/contract/confirm`}>
            Continue to confirmation
          </Link>
        ) : (
          <span>
            {validation.valid
              ? "Save this review to continue."
              : "Resolve blocking issues before confirmation."}
          </span>
        )}
      </footer>
    </main>
  );
}

function ScopeEditor({ label, items, onChange }: {
  label: string;
  items: ContractReviewInput["includedScope"];
  onChange: (index: number, value: string) => void;
}) {
  return (
    <div className={styles.scopeGroup}>
      <strong>{label}</strong>
      {items.length === 0 ? <p>None.</p> : items.map((item, index) => (
        <label key={item.id}>
          <span>{item.id}</span>
          <input value={item.description} onChange={(event) => onChange(index, event.target.value)} />
        </label>
      ))}
    </div>
  );
}

function ReviewSection({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header><h2>{title}</h2><p>{description}</p></header>
      {children}
    </section>
  );
}

function ReviewState({ title, message, projectId }: { title: string; message?: string; projectId: string }) {
  return (
    <main className={styles.page}>
      <section className={styles.state}>
        <p className="eyebrow">Phase 5.4</p>
        <h1>{title}</h1>
        {message ? <p>{message}</p> : null}
        <Link className="button" href={message ? "/projects/new" : `/projects/${projectId}/interview`}>
          {message ? "Start a new project" : "Back to interview"}
        </Link>
      </section>
    </main>
  );
}
