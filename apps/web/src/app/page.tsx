import Link from "next/link";

const stages = [
  {
    number: "01",
    title: "Clarify",
    body: "Answer only the questions that materially change the build.",
  },
  {
    number: "02",
    title: "Define",
    body: "Confirm deliverables, scope, acceptance criteria, and proof.",
  },
  {
    number: "03",
    title: "Verify",
    body: "Return execution evidence and repair only what remains unresolved.",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
      <span className="eyebrow">Build with clearer instructions</span>
      <h1>From rough idea to verified build.</h1>
      <p className="lead">
        LoopZ turns a software idea into an execution-ready task for an AI coding agent,
        then checks the returned evidence against what you approved.
      </p>
      <div className="actions">
        <Link className="button" href="/projects/new">
          Describe your project
        </Link>
      </div>
      </section>
      <section className="grid" aria-label="MVP stages">
        {stages.map((stage) => (
          <article className="card" key={stage.number}>
            <strong>{stage.number}</strong>
            <h2>{stage.title}</h2>
            <p>{stage.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
