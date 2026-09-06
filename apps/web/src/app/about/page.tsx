import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <header>
        <p className="eyebrow">About LoopZ</p>
        <h1>A build should begin with an agreement.</h1>
        <p className="lead">
          LoopZ turns a rough software idea into a confirmed task for an AI coding agent,
          then assesses the returned evidence and closes only what remains unfinished.
        </p>
      </header>

      <article className="about-prose">
        <section>
          <h2>Why it exists</h2>
          <p>
            Coding agents are capable, but vague work still creates expensive clarification,
            replanning, and repair. LoopZ moves those decisions into a short workflow where the
            user can see and approve them before execution begins.
          </p>
        </section>
        <section>
          <h2>What “verified” means here</h2>
          <p>
            LoopZ checks the material you submit against the acceptance contract you confirmed.
            It keeps claims separate from evidence and makes missing proof visible. The MVP does
            not access your repository or rerun commands, so it never presents submitted evidence
            as independent verification.
          </p>
        </section>
      </article>

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

      <div className="about-cta">
        <p>Have a real task ready?</p>
        <Link className="button" href="/projects/new">Start with your idea</Link>
      </div>
    </main>
  );
}
