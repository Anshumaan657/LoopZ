import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="error-page">
      <h1>Project link unavailable</h1>
      <p>This project address is invalid or does not identify a LoopZ project.</p>
      <Link className="button" href="/projects/new">Start a new project</Link>
    </main>
  );
}
