import Link from "next/link";

type StagePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextHref?: string;
  nextLabel?: string;
};

export function StagePage({
  eyebrow,
  title,
  description,
  nextHref = "/",
  nextLabel = "Return home",
}: StagePageProps) {
  return (
    <main>
      <section className="stage">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        <div className="actions">
          <Link className="button" href={nextHref}>
            {nextLabel}
          </Link>
          <Link className="button secondary" href="/">
            View MVP overview
          </Link>
        </div>
      </section>
    </main>
  );
}
