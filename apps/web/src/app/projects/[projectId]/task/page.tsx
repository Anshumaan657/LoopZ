import { StagePage } from "../../../../components/stage-page";

export default function TaskPage() {
  return (
    <StagePage
      eyebrow="Stage 4 · Agent task"
      title="Give Codex a contract it can prove."
      description="This route will provide the copy-ready task, repository artifacts, immutable run metadata, and clear instructions for returning evidence."
      nextHref="/runs/example/evidence"
      nextLabel="Preview evidence return"
    />
  );
}
