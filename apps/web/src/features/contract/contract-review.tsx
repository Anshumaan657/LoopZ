"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { SafetyContractDraft } from "@loopz/contracts/loopspec";
import type { ContractReviewInput } from "@loopz/contracts/review";
import { validateSafetyContractDraft } from "@loopz/core/generation";
import { contractReviewInput, reviseSafetyContractDraft } from "@loopz/core/review";

import { LineSidebar } from "../../components/line-sidebar";
import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { WorkflowProgress } from "../../components/workflow-progress";
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

const STEPS = ["Deliverables", "Scope", "Acceptance & Proof", "Review"] as const;

function lines(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function ContractReview({ projectId }: { projectId: string }) {
  const [loaded, setLoaded] = useState<LoadedReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);

  useEffect(() => {
    try {
      const result = loadOrGenerateContract(projectId);
      setLoaded({ ...result, input: contractReviewInput(result.draft) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The contract could not be generated.");
    }
  }, [projectId]);

  if (error && !loaded) return <ReviewState title="Contract unavailable" message={error} projectId={projectId} />;
  if (!loaded) return <ReviewState title="Compiling your contract…" projectId={projectId} />;

  const validation = validateSafetyContractDraft(loaded.draft);

  function updateInput(updater: (current: ContractReviewInput) => ContractReviewInput) {
    setLoaded((current) => current ? { ...current, input: updater(current.input) } : current);
    setSaved(false);
  }

  function moveTo(nextStep: number) {
    setStep(nextStep);
    setFurthestStep((current) => Math.max(current, nextStep));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
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
      setError(cause instanceof Error ? cause.message : "We couldn’t save your contract. Your edits are still here — try again.");
    }
  }

  function resetReview() {
    if (!loaded) return;
    const confirmed = window.confirm("Reset this contract to the generated draft? Your edits will be discarded.");
    if (!confirmed) return;
    try {
      const draft = generateSafetyDraft(loaded.record);
      const record = saveContractReview(loaded.record, draft);
      setLoaded({ record, draft, input: contractReviewInput(draft) });
      setSaved(false);
      setStep(0);
      setFurthestStep(0);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The generated contract could not be restored.");
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Contract navigation">
        <Link href={`/projects/${projectId}/interview`}>Back to clarification</Link>
        <span>Contract setup</span>
      </nav>

      <header className={styles.header}>
        <p className="eyebrow">Confirm the execution contract</p>
        <WorkflowProgress stage="Contract" next="Lock an immutable contract version" />
        <h1>Make the contract match your intent.</h1>
        <p>Review one decision at a time. Stable IDs stay locked for traceability.</p>
      </header>

      <WorkflowGrid
        className={styles.contractBody}
        aside={<LineSidebar items={STEPS} currentStep={step} furthestStep={furthestStep} onItemClick={moveTo} />}
      >
        <div className={styles.contentColumn}>
          <p className={styles.mobileStep}>Contract step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

          <div aria-live="polite">
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            {saved ? <p className={styles.success} role="status">Contract saved. It is ready for final confirmation.</p> : null}
          </div>

          <div className={styles.workspace} key={step}>
        {step === 0 ? (
          <ReviewSection title="Deliverables" description="Define the outcome and what the agent must produce.">
            <label>
              <span>Goal</span>
              <textarea rows={3} value={loaded.input.goal} onChange={(event) => updateInput((input) => ({ ...input, goal: event.target.value }))} />
            </label>
            <div className={styles.list}>
              {loaded.input.deliverables.map((item, index) => (
                <div className={styles.row} key={item.id}>
                  <label className={styles.rowMain}>
                    <span>Deliverable {index + 1} <code>{item.id}</code></span>
                    <input aria-label={`${item.id} description`} value={item.description} onChange={(event) => updateInput((input) => ({ ...input, deliverables: input.deliverables.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, description: event.target.value } : candidate) }))} />
                  </label>
                  <label>
                    <span>Importance</span>
                    <select aria-label={`${item.id} priority`} value={item.priority} onChange={(event) => updateInput((input) => ({ ...input, deliverables: input.deliverables.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, priority: event.target.value as "required" | "optional" } : candidate) }))}>
                      <option value="required">Required</option>
                      <option value="optional">Optional</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </ReviewSection>
        ) : null}

        {step === 1 ? (
          <ReviewSection title="Scope" description="Make the boundary explicit before implementation begins.">
            <ScopeEditor label="Included" items={loaded.input.includedScope} onChange={(index, value) => updateInput((input) => ({ ...input, includedScope: input.includedScope.map((item, itemIndex) => itemIndex === index ? { ...item, description: value } : item) }))} />
            <ScopeEditor label="Excluded" items={loaded.input.excludedScope} onChange={(index, value) => updateInput((input) => ({ ...input, excludedScope: input.excludedScope.map((item, itemIndex) => itemIndex === index ? { ...item, description: value } : item) }))} />
            {loaded.input.assumptions.length > 0 ? <div className={styles.scopeGroup}><strong>Assumptions</strong>{loaded.input.assumptions.map((assumption, index) => <label key={`assumption-${index}`}><span>{index + 1}</span><input value={assumption} onChange={(event) => updateInput((input) => ({ ...input, assumptions: input.assumptions.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} /></label>)}</div> : null}
          </ReviewSection>
        ) : null}

        {step === 2 ? (
          <ReviewSection title="Acceptance & proof" description="Define what passes and the evidence the agent must return.">
            <div className={styles.criteria}>
              {loaded.input.criteria.map((criterion, index) => (
                <details className={styles.criterion} key={criterion.id}>
                  <summary>
                    <span><strong>Criterion {index + 1}</strong><code>{criterion.id}</code></span>
                    <span>{criterion.requirement}</span>
                  </summary>
                  <div className={styles.criterionBody}>
                    <label><span>Passing behavior</span><textarea rows={3} value={criterion.requirement} onChange={(event) => updateInput((input) => ({ ...input, criteria: input.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, requirement: event.target.value } : item) }))} /></label>
                    <label><span>Verification method</span><textarea rows={3} value={criterion.verificationMethod} onChange={(event) => updateInput((input) => ({ ...input, criteria: input.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, verificationMethod: event.target.value } : item) }))} /></label>
                    <label><span>Required evidence · one item per line</span><textarea rows={3} value={criterion.requiredEvidence.join("\n")} onChange={(event) => updateInput((input) => ({ ...input, criteria: input.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, requiredEvidence: lines(event.target.value) } : item) }))} /></label>
                  </div>
                </details>
              ))}
            </div>
            <label><span>Verification commands · one command per line</span><textarea rows={4} value={loaded.input.verificationCommands.join("\n")} onChange={(event) => updateInput((input) => ({ ...input, verificationCommands: lines(event.target.value) }))} /></label>
          </ReviewSection>
        ) : null}

        {step === 3 ? <ReviewSummary input={loaded.input} restrictions={loaded.draft.safety.restrictedActions} onEdit={moveTo} /> : null}
          </div>

          <ActionRow
            back={step > 0 ? <button className="button secondary" onClick={() => moveTo(step - 1)} type="button">Back</button> : <Link className="button secondary" href={`/projects/${projectId}/interview`}>Back</Link>}
            destructive={<button className={styles.textButton} onClick={resetReview} type="button">Reset draft</button>}
            disabledReason={step === 3 && saved && !validation.valid ? "Resolve the validation issue above before confirmation." : null}
            primary={
              step < 3
                ? <button className="button" onClick={() => moveTo(step + 1)} type="button">Continue</button>
                : !saved
                  ? <button className="button" onClick={saveReview} type="button">Save contract</button>
                  : validation.valid
                    ? <Link className="button" href={`/projects/${projectId}/contract/confirm`}>Continue to confirmation</Link>
                    : <button className="button" disabled type="button">Continue to confirmation</button>
            }
            stickyOnMobile
          />
        </div>
      </WorkflowGrid>
    </main>
  );
}

function ReviewSummary({ input, restrictions, onEdit }: { input: ContractReviewInput; restrictions: string[]; onEdit: (step: number) => void }) {
  return <section className={styles.review}>
    <header><h2>Review your contract</h2><p>Check the full execution boundary before saving it.</p></header>
    <SummaryBlock title="Deliverables" onEdit={() => onEdit(0)}><strong>{input.goal}</strong><ul>{input.deliverables.map((item) => <li key={item.id}><code>{item.id}</code>{item.description}<span>{item.priority}</span></li>)}</ul></SummaryBlock>
    <SummaryBlock title="Scope" onEdit={() => onEdit(1)}><p>{input.includedScope.length} included · {input.excludedScope.length} excluded · {input.assumptions.length} assumptions</p></SummaryBlock>
    <SummaryBlock title="Acceptance & Proof" onEdit={() => onEdit(2)}><p>{input.criteria.length} acceptance criteria · {input.verificationCommands.length} verification commands</p></SummaryBlock>
    <details className={styles.restrictions}><summary>Restricted actions</summary><ul>{restrictions.map((item) => <li key={item}>{item}</li>)}</ul></details>
  </section>;
}

function SummaryBlock({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return <section className={styles.summaryBlock}><div><h3>{title}</h3><button onClick={onEdit} type="button">Edit</button></div>{children}</section>;
}

function ScopeEditor({ label, items, onChange }: { label: string; items: ContractReviewInput["includedScope"]; onChange: (index: number, value: string) => void }) {
  return <div className={styles.scopeGroup}><strong>{label}</strong>{items.length === 0 ? <p>None.</p> : items.map((item, index) => <label key={item.id}><span>{label} item {index + 1} <code>{item.id}</code></span><input value={item.description} onChange={(event) => onChange(index, event.target.value)} /></label>)}</div>;
}

function ReviewSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className={styles.section}><header><h2>{title}</h2><p>{description}</p></header>{children}</section>;
}

function ReviewState({ title, message, projectId }: { title: string; message?: string; projectId: string }) {
  return <main className={styles.page}><WorkflowGrid><section className={styles.state}><p className="eyebrow">Contract setup</p><WorkflowProgress stage="Contract" next="Lock an immutable contract version" /><h1>{title}</h1>{message ? <p>{message}</p> : <p className={styles.processing} role="status">Turning your confirmed decisions into a reviewable contract…</p>}<Link className="button" href={message ? "/projects/new" : `/projects/${projectId}/interview`}>{message ? "Start a new project" : "Back to clarification"}</Link></section></WorkflowGrid></main>;
}
