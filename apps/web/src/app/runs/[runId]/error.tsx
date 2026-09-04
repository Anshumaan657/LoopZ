"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RunError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Run route error:", error);
  }, [error]);

  return (
    <main className="error-page">
      <h1>Run not found</h1>
      <p>{error.message}</p>
      <div className="actions">
        <button className="button" onClick={reset}>Try again</button>
        <Link className="button secondary" href="/">Back to home</Link>
      </div>
    </main>
  );
}