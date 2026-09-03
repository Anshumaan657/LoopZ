import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <header>
        <p className="eyebrow">About LoopZ</p>
        <h1>Clear instructions. Verifiable outcomes.</h1>
        <p className="lead">
          LoopZ turns a rough software idea into a confirmed task for an AI coding agent,
          then helps assess the evidence and close anything left unfinished.
        </p>
      </header>

      <section className="boundary-section" aria-labelledby="mvp-boundary-title">
        <p className="eyebrow">MVP boundary</p>
        <h2 id="mvp-boundary-title">Best for a focused web task.</h2>
        <ul>
          <li>New web applications</li>
          <li>Landing pages</li>
          <li>Existing-app features</li>
          <li>Clearly bounded bug fixes</li>
        </ul>
        <p>
          Native mobile apps, games, regulated decision systems, and unsafe requests are not
          accepted in the MVP.
        </p>
      </section>

      <Link className="button" href="/projects/new">Start with your idea</Link>
    </main>
  );
}
