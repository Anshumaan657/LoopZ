"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  AnyConfirmedContractVersion,
  ConfirmedContractVersion,
} from "@loopz/contracts/versioning";
import type { SafetyContractDraft } from "@loopz/contracts/loopspec";
import { confirmContractVersion } from "@loopz/core/confirmation";
import { validateSafetyContractDraft } from "@loopz/core/generation";

import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { WorkflowProgress } from "../../components/workflow-progress";
import { loadOrGenerateContract } from "../contract/contract-storage";
import { appendContractVersion, loadContractVersions } from "./version-storage";
import styles from "./contract-confirmation.module.css";

type LoadedConfirmation = {
  draft: SafetyContractDraft;
  versions: AnyConfirmedContractVersion[];
};

export function ContractConfirmation({ projectId }: { projectId: string }) {
  const [loaded, setLoaded] = useState<LoadedConfirmation | null>(null);
  const [approvedActions, setApprovedActions] = useState<string[]>([]);
  const [certified, setCertified] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedContractVersion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    try {
      const { draft, savedReview } = loadOrGenerateContract(projectId);
      if (!savedReview) {
        setError("Save the Phase 5.4 contract review before confirmation.");
        return;
      }
      const validation = validateSafetyContractDraft(draft);
      if (!validation.valid) {
        setError("This contract contains blocking validation issues. Return to review.");
        return;
      }
      setLoaded({ draft, versions: loadContractVersions(projectId) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The confirmation could not be loaded.");
    }
  }, [projectId]);

  function toggleApproval(action: string, checked: boolean) {
    setApprovedActions((current) =>
      checked ? [...current, action] : current.filter((item) => item !== action),
    );
  }

  function toggleAllApprovals(checked: boolean) {
    if (!loaded) return;
    setApprovedActions(
      checked
        ? loaded.draft.safety.plannedActions
            .filter((action) => action.requiresApproval)
            .map((action) => action.action)
        : [],
    );
  }

  async function confirm() {
    if (!loaded || !certified) return;
    setWorking(true);
    setError(null);
    try {
      const version = await confirmContractVersion({
        draft: loaded.draft,
        versionId: crypto.randomUUID(),
        version: (loaded.versions.at(-1)?.version ?? 0) + 1,
        confirmedAt: new Date().toISOString(),
        approvedActions,
      });
      const versions = appendContractVersion(projectId, version);
      setLoaded({ ...loaded, versions });
      setConfirmed(version);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The contract could not be confirmed.");
    } finally {
      setWorking(false);
    }
  }

  if (error && !loaded) return <ConfirmationState projectId={projectId} message={error} />;
  if (!loaded) return <ConfirmationState projectId={projectId} message="Loading reviewed contract…" />;

  const requiredActions = loaded.draft.safety.plannedActions.filter(
    (action) => action.requiresApproval,
  );
  const ready = certified && requiredActions.every((action) => approvedActions.includes(action.action));
  const remainingApprovals = requiredActions.filter(
    (action) => !approvedActions.includes(action.action),
  ).length;

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href={`/projects/${projectId}/contract`}>Back to contract review</Link>
      </nav>

      <header className={styles.header}>
        <p className="eyebrow">Final confirmation</p>
        <WorkflowProgress stage="Confirm" next="Generate the copy-ready agent task" />
        <h1>One final check before your agent gets to work.</h1>
        <p>
          Review the important boundaries, approve sensitive actions, and lock a version you can
          confidently send to your coding agent.
        </p>
      </header>

      {confirmed ? (
        <WorkflowGrid><section className={styles.confirmed} aria-live="polite">
          <span className="status-pill">Version confirmed</span>
          <h2>Contract v{confirmed.version} is ready.</h2>
          <dl>
            <div><dt>Version ID</dt><dd>{confirmed.versionId}</dd></div>
            <div><dt>Confirmed</dt><dd>{new Date(confirmed.confirmedAt).toLocaleString()}</dd></div>
            <div><dt>Content hash</dt><dd><code>{confirmed.contractHash}</code></dd></div>
          </dl>
          <ActionRow
            back={<Link className="button secondary" href={`/projects/${projectId}/contract`}>Create a revised version</Link>}
            primary={<Link className="button" href={`/projects/${projectId}/task?version=${confirmed.versionId}`}>Generate the agent task</Link>}
          />
        </section></WorkflowGrid>
      ) : (
        <WorkflowGrid className={styles.layout} aside={<section className={styles.card}>
            <h2>Final contract summary</h2>
            <dl className={styles.summary}>
              <div><dt>Goal</dt><dd>{loaded.draft.objective.goal.value}</dd></div>
              <div>
                <dt>Required deliverables</dt>
                <dd>
                  {loaded.draft.objective.deliverables.filter(
                    (item) => item.priority === "required",
                  ).length}
                </dd>
              </div>
              <div><dt>Acceptance criteria</dt><dd>{loaded.draft.acceptance.criteria.length}</dd></div>
              <div><dt>Repair attempts</dt><dd>Maximum 2</dd></div>
            </dl>
            <h3>Stop conditions added at confirmation</h3>
            <ul>
              <li>An approval gate is reached.</li>
              <li>Required access or evidence is unavailable.</li>
              <li>The same failure repeats after two repair attempts.</li>
              <li>Continuing would expand scope or violate a restriction.</li>
            </ul>
          </section>}>
          <section className={styles.card}>
            <h2>Human approvals</h2>
            {requiredActions.length === 0 ? (
              <p>No action-specific approval gates were generated.</p>
            ) : requiredActions.map((action) => (
              <label className={styles.check} key={action.action}>
                <input
                  checked={approvedActions.includes(action.action)}
                  onChange={(event) => toggleApproval(action.action, event.target.checked)}
                  type="checkbox"
                />
                <span><strong>{action.category.replaceAll("_", " ")}</strong>{action.action}</span>
              </label>
            ))}
            <label className={`${styles.check} ${styles.approveAll}`}>
              <input
                checked={requiredActions.length === 0 || requiredActions.every((action) => approvedActions.includes(action.action))}
                disabled={requiredActions.length === 0}
                onChange={(event) => toggleAllApprovals(event.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Mark all approved</strong>
                {requiredActions.length === 0
                  ? "No human-gated actions need approval for this contract."
                  : "Approve every human-gated action listed above."}
              </span>
            </label>
            <label className={`${styles.check} ${styles.certify}`}>
              <input
                checked={certified}
                onChange={(event) => setCertified(event.target.checked)}
                type="checkbox"
              />
              <span>
                <strong>Final confirmation</strong>
                I reviewed the goal, scope, criteria, evidence, restrictions, and approval gates. I
                understand that future edits create a new version.
              </span>
            </label>
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
            <ActionRow
              back={<Link className="button secondary" href={`/projects/${projectId}/contract`}>Back</Link>}
              disabledReason={ready ? null : remainingApprovals > 0 ? `${remainingApprovals} approval ${remainingApprovals === 1 ? "is" : "are"} still required, plus final confirmation.` : "Complete the final confirmation to lock this version."}
              primary={<button className="button" disabled={!ready || working} onClick={confirm} type="button">{working ? "Creating immutable version…" : `Confirm version ${(loaded.versions.at(-1)?.version ?? 0) + 1}`}</button>}
              stickyOnMobile
            />
          </section>
        </WorkflowGrid>
      )}

      {loaded.versions.length > 0 ? (
        <section className={styles.history}>
          <h2>Version history</h2>
          {loaded.versions.map((version) => (
            <article key={version.versionId}>
              <strong>v{version.version}</strong>
              <span>{new Date(version.confirmedAt).toLocaleString()}</span>
              {version.schemaVersion === "0.1" ? (
                <span>Legacy contract — review and reconfirm before task generation</span>
              ) : null}
              <code>{version.contractHash.slice(0, 23)}…</code>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function ConfirmationState({ projectId, message }: { projectId: string; message: string }) {
  return (
    <main className={styles.page}>
      <section className={styles.state}>
        <p className="eyebrow">Contract confirmation</p>
        <WorkflowProgress stage="Confirm" next="Generate the copy-ready agent task" />
        <h1>Confirmation unavailable</h1>
        <p>{message}</p>
        <Link className="button" href={`/projects/${projectId}/contract`}>
          Return to contract review
        </Link>
      </section>
    </main>
  );
}
