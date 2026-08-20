import { StagePage } from "../../../../components/stage-page";

export default function InterviewPage() {
  return (
    <StagePage
      eyebrow="Stage 2 · Clarification"
      title="Resolve only what changes the outcome."
      description="This route will ask one risk-based question at a time, preserve provenance, surface contradictions, and stop after the configured question budget."
      nextHref="/projects/example/contract"
      nextLabel="Preview contract route"
    />
  );
}
