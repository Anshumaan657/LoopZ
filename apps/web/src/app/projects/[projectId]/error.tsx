"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProjectError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Project route error:", error);
  }, [error]);

  return (
    <main className="error-page">
      <h1>Project not found</h1>
      <p>{error.message}</p>
      <div className="actions">
        <button className="button" onClick={reset}>Try again</button>
        <Link className="button secondary" href="/projects/new">Start a new project</Link>
      </div>
    </main>
  );
}