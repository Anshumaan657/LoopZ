import Link from "next/link";

import { IdeaIntakeForm } from "../../../features/intake/idea-intake-form";

export default function NewProjectPage() {
  return (
    <main className="intake-page">
      <nav className="intake-nav" aria-label="Project creation navigation">
        <Link href="/">LoopZ</Link>
        <span>Phase 3 · Idea intake</span>
      </nav>

      <header className="intake-hero">
        <p className="eyebrow">Turn a rough idea into an executable brief</p>
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
