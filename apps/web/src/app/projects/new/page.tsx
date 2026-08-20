import { StagePage } from "../../../components/stage-page";

export default function NewProjectPage() {
  return (
    <StagePage
      eyebrow="Stage 1 · Intake"
      title="Describe what you want to build."
      description="This route will capture the rough request, explain the supported task boundary, and begin suitability and risk classification."
      nextHref="/projects/example/interview"
      nextLabel="Preview interview route"
    />
  );
}
