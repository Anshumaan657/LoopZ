import { StagePage } from "../../../../components/stage-page";

export default function EvidencePage() {
  return (
    <StagePage
      eyebrow="Stage 5 · Evidence"
      title="Return what the agent actually produced."
      description="This route will accept the final report, tests, diff summary, and user observations without treating unsupported agent claims as verification."
      nextHref="/runs/example/assessment"
      nextLabel="Preview assessment route"
    />
  );
}
