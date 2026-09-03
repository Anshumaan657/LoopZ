"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";

import { renderCodexArtifacts, type CodexArtifactBundle } from "@loopz/codex-adapter";
import type { ProviderNeutralTask } from "@loopz/contracts/task";
import type { Run } from "@loopz/contracts/run";
import type { ConfirmedContractVersion } from "@loopz/contracts/versioning";
import { compileProviderNeutralTask } from "@loopz/core/task";
import {
  renderUniversalArtifacts,
  type UniversalArtifactBundle,
} from "@loopz/universal-adapter";

import { ActionRow, WorkflowGrid } from "../../components/workflow-layout";
import { WorkflowProgress } from "../../components/workflow-progress";
import { loadContractVersions } from "../versioning/version-storage";
import { copyExactTask, downloadExactTask } from "./task-actions";
import {
  beginEvidenceReturn,
  markTaskCopied,
  prepareTaskRun,
  saveTaskRun,
  selectTaskOutput,
} from "./task-storage";
import styles from "./task-delivery.module.css";

type Delivery = {
  version: ConfirmedContractVersion;
  run: Run;
  task: ProviderNeutralTask;
  codex: CodexArtifactBundle;
  universal: UniversalArtifactBundle;
};

type OutputFormat = Run["selectedOutputFormat"];

export function TaskDelivery({ projectId, requestedVersionId }: {
  projectId: string;
  requestedVersionId?: string;
}) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const versions = loadContractVersions(projectId);
        const selected = requestedVersionId
          ? versions.find((version) => version.versionId === requestedVersionId)
          : versions.at(-1);
        if (!selected) throw new Error("The selected confirmed contract version was not found.");
        if (selected.schemaVersion === "0.1") {
          throw new Error("This legacy contract must be reviewed and reconfirmed before task generation.");
        }
        const task = await compileProviderNeutralTask(selected);
        const prepared = prepareTaskRun(selected, {
          runId: crypto.randomUUID(),
          generatedAt: new Date().toISOString(),
        });
        const renderOptions = {
          runId: prepared.run.runId,
          generatedAt: prepared.run.generatedAt,
        };
        const codex = renderCodexArtifacts(task, renderOptions);
        const universal = renderUniversalArtifacts(task, renderOptions);
        const run = prepared.isNew ? saveTaskRun(prepared.run) : prepared.run;
        if (active) setDelivery({
          version: selected,
          run,
          task,
          codex,
          universal,
        });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "The task could not be generated.");
      }
    }
    void load();
    return () => { active = false; };
  }, [projectId, requestedVersionId]);

  function chooseFormat(format: OutputFormat) {
    if (!delivery) return;
    try {
      const run = selectTaskOutput(delivery.run, format, new Date().toISOString());
      setDelivery({ ...delivery, run });
      setNotice(null);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The output choice could not be saved.");
    }
  }

  function moveFormatFocus(event: KeyboardEvent<HTMLButtonElement>, current: OutputFormat) {
    let next: OutputFormat | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      next = current === "codex" ? "universal" : "codex";
    } else if (event.key === "Home") {
      next = "codex";
    } else if (event.key === "End") {
      next = "universal";
    }
    if (!next) return;
    event.preventDefault();
    chooseFormat(next);
    document.getElementById(`${next}-tab`)?.focus();
  }

  const selectedArtifact = !delivery
    ? null
    : delivery.run.selectedOutputFormat === "codex"
      ? delivery.codex.starterPrompt
      : delivery.universal.starterPrompt;

  async function copyTask() {
    if (!delivery || !selectedArtifact) return;
    setError(null);
    try {
      await copyExactTask(selectedArtifact.content);
      const run = markTaskCopied(delivery.run, new Date().toISOString());
      setDelivery({ ...delivery, run });
      setNotice("Exact task copied. Paste it into your coding agent without editing it.");
    } catch (cause) {
      setNotice(null);
      setError(cause instanceof Error ? cause.message : "The task could not be copied.");
    }
  }

  function downloadTask() {
    if (!delivery || !selectedArtifact) return;
    setError(null);
    try {
      downloadExactTask(selectedArtifact.filename, selectedArtifact.content);
      const run = markTaskCopied(delivery.run, new Date().toISOString());
      setDelivery({ ...delivery, run });
      setNotice("Exact task downloaded as Markdown.");
    } catch (cause) {
      setNotice(null);
      setError(cause instanceof Error ? cause.message : "The task could not be downloaded.");
    }
  }

  async function copyRunId() {
    if (!delivery) return;
    try {
      await copyExactTask(delivery.run.runId);
      setNotice("Run ID copied.");
      setError(null);
    } catch (cause) {
      setNotice(null);
      setError(cause instanceof Error ? cause.message : "The run ID could not be copied.");
    }
  }

  function returnEvidence() {
    if (!delivery) return;
    setError(null);
    try {
      if (delivery.run.state === "evidence_submitted") {
        router.push(`/runs/${delivery.run.runId}/evidence`);
        return;
      }
      const run = beginEvidenceReturn(delivery.run, new Date().toISOString());
      setDelivery({ ...delivery, run });
      router.push(`/runs/${run.runId}/evidence`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Evidence return could not be started.");
    }
  }

  if (error && !delivery) return <DeliveryState projectId={projectId} message={error} />;
  if (!delivery || !selectedArtifact) return <DeliveryState projectId={projectId} message="Generating the confirmed task…" />;

  const format = delivery.run.selectedOutputFormat;
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Task delivery navigation">
        <Link href="/">LoopZ</Link>
        <Link href={`/projects/${projectId}/contract/confirm`}>Back to confirmation</Link>
      </nav>

      <header className={styles.header}>
        <p className="eyebrow">Agent task</p>
        <WorkflowProgress stage="Task" next="Run the task, then return execution evidence" />
        <h1>Your confirmed build task is ready.</h1>
        <p>Choose a format, preview the complete instruction, then copy or download that exact text.</p>
      </header>

      <section className={styles.meta} aria-label="Run details">
        <div><span>Run</span><code>{delivery.run.runId}</code><button onClick={() => void copyRunId()} type="button">Copy ID</button></div>
        <div><span>Contract</span><strong>v{delivery.version.version}</strong></div>
        <div><span>State</span><strong>{delivery.run.state.replaceAll("_", " ")}</strong></div>
        <div><span>Hash</span><code>{delivery.version.contractHash.slice(0, 23)}…</code></div>
      </section>

      <WorkflowGrid className={styles.layout} aside={<div className={styles.sidebar}>
          <h2>Output format</h2>
          <div className={styles.tabs} role="tablist" aria-label="Coding agent output format">
            <button
              aria-controls="task-preview"
              aria-selected={format === "codex"}
              className={format === "codex" ? styles.activeTab : undefined}
              id="codex-tab"
              onClick={() => chooseFormat("codex")}
              onKeyDown={(event) => moveFormatFocus(event, "codex")}
              role="tab"
              tabIndex={format === "codex" ? 0 : -1}
              type="button"
            >
              <strong>Codex</strong><span>Optimized and benchmarkable</span>
            </button>
            <button
              aria-controls="task-preview"
              aria-selected={format === "universal"}
              className={format === "universal" ? styles.activeTab : undefined}
              id="universal-tab"
              onClick={() => chooseFormat("universal")}
              onKeyDown={(event) => moveFormatFocus(event, "universal")}
              role="tab"
              tabIndex={format === "universal" ? 0 : -1}
              type="button"
            >
              <strong>Universal</strong><span>Compatibility mode</span>
            </button>
          </div>
          {format === "universal" ? (
            <p className={styles.compatibility}>
              Results vary by agent tools, permissions, context capacity, and behavior. This is not dedicated provider support.
            </p>
          ) : null}
          <dl className={styles.counts}>
            <div><dt>Requirements</dt><dd>{delivery.task.contract.objective.deliverables.length}</dd></div>
            <div><dt>Criteria</dt><dd>{delivery.task.contract.acceptance.criteria.length}</dd></div>
            <div><dt>Commands</dt><dd>{delivery.task.contract.acceptance.verificationCommands.length}</dd></div>
          </dl>
        </div>}>
        <section className={styles.overview} aria-labelledby="task-overview-title">
          <div className={styles.overviewHeading}>
            <p className="eyebrow">Approved build</p>
            <h2 id="task-overview-title">Execution summary</h2>
          </div>
          <div className={styles.overviewActions}>
            <ActionRow
              back={<button className="button secondary" onClick={downloadTask} type="button">Download Markdown</button>}
              primary={<button className="button" onClick={() => void copyTask()} type="button">Copy exact task</button>}
              stickyOnMobile
            />
          </div>
          <article>
            <h3>Objective</h3>
            <p>{delivery.task.contract.objective.goal.value}</p>
          </article>
          <article><h3>Deliverables</h3><ul>
            {delivery.task.contract.objective.deliverables.map((item) => (
              <li key={item.id}>
                <span>{item.priority}</span>
                {item.description}
              </li>
            ))}
          </ul></article>
          <article><h3>Verification</h3><ul>{delivery.task.contract.acceptance.verificationCommands.map((command) => <li key={command}><code>{command}</code></li>)}</ul></article>
          <article><h3>Restrictions</h3><ul>{delivery.task.contract.safety.restrictedActions.map((restriction) => <li key={restriction}>{restriction}</li>)}</ul></article>
        </section>
        <section className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <div><span>Copy-ready Markdown</span><strong>{selectedArtifact.filename}</strong></div>
            <span>{selectedArtifact.content.length.toLocaleString()} characters</span>
          </div>
          <details className={styles.raw}>
            <summary>Inspect the full execution-ready instruction</summary>
            <pre
              aria-labelledby={format === "codex" ? "codex-tab" : "universal-tab"}
              className={styles.preview}
              id="task-preview"
              role="tabpanel"
              tabIndex={0}
            ><code>{selectedArtifact.content}</code></pre>
          </details>
          <div className={styles.feedback} aria-live="polite">
            {notice ? <p className={styles.success}>{notice}</p> : null}
            {error ? <p className={styles.error} role="alert">{error}</p> : null}
          </div>
        </section>
      </WorkflowGrid>

      <section className={styles.next}>
        <p className="eyebrow">What happens next</p>
        <h2>Run it outside LoopZ.</h2>
        <p>
          Paste the exact task into your coding agent. When it finishes, return its final report,
          command output, and file-change summary here.
        </p>
        <ActionRow
          back={<Link className="button secondary" href={`/projects/${projectId}/contract/confirm`}>Back to confirmation</Link>}
          disabledReason={delivery.run.state === "task_generated" ? "Copy or download the exact task before returning evidence." : null}
          primary={<button className="button" disabled={delivery.run.state === "task_generated"} onClick={returnEvidence} type="button">{delivery.run.state === "evidence_submitted" ? "View submitted evidence" : "Return execution evidence"}</button>}
        />
      </section>
    </main>
  );
}

function DeliveryState({ projectId, message }: { projectId: string; message: string }) {
  return (
    <main className={styles.page}>
      <section className={styles.state}>
        <p className="eyebrow">Agent task</p>
        <WorkflowProgress stage="Task" next="Run the task, then return execution evidence" />
        <h1>Task delivery unavailable</h1>
        <p role="status">{message}</p>
        <Link className="button" href={`/projects/${projectId}/contract/confirm`}>Return to confirmation</Link>
      </section>
    </main>
  );
}
