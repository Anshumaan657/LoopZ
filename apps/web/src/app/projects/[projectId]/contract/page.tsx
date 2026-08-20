import { StagePage } from "../../../../components/stage-page";

export default function ContractPage() {
  return (
    <StagePage
      eyebrow="Stage 3 · Contract"
      title="Confirm scope before code is written."
      description="This route will present the goal, deliverables, included and excluded scope, assumptions, and evidence-backed acceptance criteria in plain language."
      nextHref="/projects/example/task"
      nextLabel="Preview generated task"
    />
  );
}
