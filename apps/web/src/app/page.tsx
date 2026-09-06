import Link from "next/link";

const stages = [
  {
    number: "01",
    title: "Describe",
    body: "Write the request in your own words. Guided mode keeps it simple; Geek mode gives you control.",
  },
  {
    number: "02",
    title: "Lock",
    body: "Confirm the scope, evidence requirements, safety boundaries, and what completion must prove.",
  },
  {
    number: "03",
    title: "Run",
    body: "Copy one execution-ready task into Codex or another compatible coding agent.",
  },
  {
    number: "04",
    title: "Verify",
    body: "Return the evidence. LoopZ assesses each criterion and repairs only what remains unresolved.",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <span className="eyebrow">A clearer way to direct coding agents</span>
          <h1 id="home-title">From rough idea to verified build.</h1>
          <p>Shape the intent once. Give your coding agent a bounded task it can execute and prove.</p>
          <Link className="button" href="/projects/new">Describe your project</Link>
        </div>
        <div className="loop-trace" role="img" aria-label="LoopZ turns intent into a contract, an agent task, evidence, and a focused repair when needed">
          <div className="loop-trace__rail" aria-hidden="true" />
          <ol>
            <li><span>Intent</span><strong>Your words</strong></li>
            <li><span>Contract</span><strong>Agreed outcome</strong></li>
            <li><span>Task</span><strong>Agent-ready</strong></li>
            <li><span>Evidence</span><strong>Checked proof</strong></li>
          </ol>
          <p><span aria-hidden="true">↻</span> Repair only what failed</p>
        </div>
      </section>

      <section className="home-intro" aria-labelledby="home-intro-title">
        <div>
          <p className="eyebrow">One instruction. One evidence chain.</p>
          <h2 id="home-intro-title">Spend agent tokens on building—not discovering what you meant.</h2>
        </div>
        <div>
          <p>
            LoopZ turns your intent into a confirmed task with measurable acceptance criteria,
            safe stop conditions, and explicit proof. After the agent runs, LoopZ assesses the
            evidence you return without pretending it inspected the repository itself.
          </p>
        </div>
      </section>

      <section className="workflow-sequence" aria-labelledby="workflow-title">
        <header>
          <h2 id="workflow-title">The whole loop, before the first line of code.</h2>
          <p>Each stage removes a different kind of ambiguity.</p>
        </header>
        <ol>
        {stages.map((stage) => (
          <li key={stage.number}>
            <span>{stage.number}</span>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </li>
        ))}
        </ol>
      </section>

      <section className="home-boundary" aria-label="LoopZ verification boundary">
        <p>LoopZ assesses submitted evidence. It does not run the agent, inspect your repository, or claim independent verification.</p>
        <Link href="/about">Read the MVP boundary <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
