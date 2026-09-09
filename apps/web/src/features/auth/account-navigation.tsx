"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "./auth-provider";

export function AccountNavigation() {
  const { user, status, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  if (status === "loading" || status === "syncing") {
    return <span className="account-status" aria-label="Loading account">Account…</span>;
  }
  if (!user) return <Link href="/auth">Sign in</Link>;

  async function leave() {
    setBusy(true);
    try {
      await signOut();
    } catch {
      // AuthProvider keeps the user-facing error available to protected pages.
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/history">History</Link>
      <button className="account-button" disabled={busy} onClick={() => void leave()} type="button">
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </>
  );
}
