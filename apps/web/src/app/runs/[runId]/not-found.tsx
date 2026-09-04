import Link from "next/link";

export default function RunNotFound() {
  return (
    <main className="error-page">
      <h1>Run link unavailable</h1>
      <p>This run address is invalid or does not identify a LoopZ run.</p>
      <Link className="button" href="/">Back to home</Link>
    </main>
  );
}
