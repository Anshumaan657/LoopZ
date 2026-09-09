"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed_out") {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "ready") return children;
  if (status === "configuration_error" || status === "error") {
    return (
      <main className="auth-state-page">
        <section className="auth-state-card" role="alert">
          <p className="eyebrow">Account unavailable</p>
          <h1>LoopZ could not open your workspace.</h1>
          <p>Check the Firebase configuration or connection, then reload this page.</p>
          <Link className="button secondary" href="/">Return home</Link>
        </section>
      </main>
    );
  }
  return (
    <main className="auth-state-page">
      <section className="auth-state-card" aria-live="polite">
        <p className="eyebrow">{status === "syncing" ? "Restoring your work" : "Opening LoopZ"}</p>
        <h1>{status === "syncing" ? "Syncing your project history…" : "Checking your account…"}</h1>
        <p>Your workflow will continue as soon as your private workspace is ready.</p>
      </section>
    </main>
  );
}
