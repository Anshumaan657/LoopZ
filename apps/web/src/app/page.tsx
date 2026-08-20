import Link from "next/link";

const stages = [
  {
    number: "01",
    title: "Clarify the request",
    body: "Ask only the high-impact questions that change scope, risk, or verification.",
  },
  {
    number: "02",
    title: "Create the contract",
    body: "Map every required outcome to an acceptance criterion and required evidence.",
  },
  {
    number: "03",
    title: "Assess and repair",
    body: "Review returned evidence honestly and generate a focused repair task when needed.",
  },
];

export default function HomePage() {
  return (
    <main>
      <span className="eyebrow">LoopZ · MVP foundation</span>
      <h1>From rough idea to verified outcome.</h1>
      <p className="lead">
        LoopZ turns a messy web-project request into a confirmed contract for Codex,
        then checks the returned evidence against what the project was meant to deliver.
      </p>
      <div className="actions">
        <Link className="button" href="/projects/new">
          Start a project
        </Link>
        <a className="button secondary" href="https://github.com/Anshumaan657/LoopZ">
          View repository
        </a>
      </div>
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
