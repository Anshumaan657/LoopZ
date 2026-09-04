import { IdeaIntakeForm } from "../../../features/intake/idea-intake-form";
import { WorkflowProgress } from "../../../components/workflow-progress";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedMode = Array.isArray(query.mode) ? query.mode[0] : query.mode;
  const initialMode = requestedMode === "geek" ? "geek" : "guided";
  return (
    <main className="intake-page">
      <header className="intake-hero">
        <p className="eyebrow">Start with your idea</p>
        <WorkflowProgress stage="Idea" next="Clarify the decisions that change the build" />
        <h1>What do you want your coding agent to build?</h1>
        <p>
          Explain it naturally. LoopZ will identify the task, preserve your intent,
          and expose the important decisions that still need an answer.
        </p>
      </header>

      <IdeaIntakeForm initialMode={initialMode} />
    </main>
  );
}
