import styles from "./workflow-progress.module.css";

export const WORKFLOW_STAGES = ["Idea", "Clarify", "Contract", "Confirm", "Task", "Evidence", "Assess", "Repair"] as const;
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export function WorkflowProgress({ stage, next }: { stage: WorkflowStage; next: string }) {
  const current = WORKFLOW_STAGES.indexOf(stage);

  return (
    <div className={styles.progress} aria-label="Build workflow progress" role="status">
      <strong aria-current="step">{stage} · {current + 1} of {WORKFLOW_STAGES.length}</strong>
      <span>Next: {next}</span>
    </div>
  );
}
