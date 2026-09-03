import { IdeaIntakeForm } from "../../../features/intake/idea-intake-form";

export default function NewProjectPage() {
  return (
    <main className="intake-page">
      <header className="intake-hero">
        <p className="eyebrow">Start with your idea</p>
        <h1>What do you want your coding agent to build?</h1>
        <p>
          Explain it naturally. LoopZ will identify the task, preserve your intent,
          and expose the important decisions that still need an answer.
        </p>
      </header>

      <IdeaIntakeForm />
    </main>
  );
}
