import styles from "./workflow-progress.module.css";

export const WORKFLOW_STAGES = ["Idea", "Clarify", "Contract", "Confirm", "Task", "Evidence", "Assess", "Repair"] as const;
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export function WorkflowProgress({ stage, next }: { stage: WorkflowStage; next: string }) {
  const current = WORKFLOW_STAGES.indexOf(stage);

  return (
    <nav className={styles.progress} aria-label="Build workflow progress">
      <div className={styles.summary} role="status" aria-live="polite">
        <strong aria-current="step">{stage} · {current + 1} of {WORKFLOW_STAGES.length}</strong>
        <span>Next: {next}</span>
      </div>
      <ol aria-hidden="true">
        {WORKFLOW_STAGES.map((item, index) => (
          <li key={item} data-state={index < current ? "complete" : index === current ? "current" : "pending"}>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
