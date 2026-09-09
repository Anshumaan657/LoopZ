"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "./auth-provider";
import styles from "./auth.module.css";

type AuthMode = "sign_in" | "sign_up";

export function AuthForm({ redirectTo = "/history" }: { redirectTo?: string }) {
  const router = useRouter();
  const auth = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "ready") router.replace(redirectTo);
  }, [auth.status, redirectTo, router]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setLocalError(null);
    setNotice(null);
    auth.clearError();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    setNotice(null);
    if (mode === "sign_up" && name.trim().length < 2) {
      setLocalError("Enter the name you want associated with this workspace.");
      return;
    }
    if (!email.includes("@")) {
      setLocalError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setLocalError("Your password must contain at least eight characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "sign_up") await auth.signUpWithEmail(name, email, password);
      else await auth.signInWithEmail(email, password);
    } catch {
      // The provider exposes a safe, user-facing error below the form.
    } finally {
      setBusy(false);
    }
  }

  async function useGoogle() {
    setBusy(true);
    setLocalError(null);
    setNotice(null);
    try {
      await auth.signInWithGoogle();
    } catch {
      // The provider exposes a safe, user-facing error below the form.
    } finally {
      setBusy(false);
    }
  }

  async function recoverPassword() {
    setLocalError(null);
    setNotice(null);
    if (!email.includes("@")) {
      setLocalError("Enter your email first, then choose Reset password.");
      return;
    }
    setBusy(true);
    try {
      await auth.resetPassword(email);
      setNotice("Password reset email sent. Check your inbox and spam folder.");
    } catch {
      // The provider exposes a safe, user-facing error below the form.
    } finally {
      setBusy(false);
    }
  }

  const error = localError ?? auth.error;
  const disabled = busy || auth.status === "syncing" || auth.status === "configuration_error";
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <p className="eyebrow">Your LoopZ workspace</p>
        <h1>Keep every idea, contract, and verified run within reach.</h1>
        <p>Sign in to continue projects across devices. Existing work saved in this browser will be added to your private history.</p>
        <ul aria-label="Account benefits">
          <li><span>01</span> Resume from the last completed stage</li>
          <li><span>02</span> Keep confirmed tasks tied to their evidence</li>
          <li><span>03</span> Access your history from another device</li>
        </ul>
      </section>

      <section className={styles.panel} aria-labelledby="auth-title">
        <div className={styles.mode} aria-label="Account action">
          <button aria-pressed={mode === "sign_in"} onClick={() => changeMode("sign_in")} type="button">Sign in</button>
          <button aria-pressed={mode === "sign_up"} onClick={() => changeMode("sign_up")} type="button">Create account</button>
        </div>
        <div className={styles.heading}>
          <h2 id="auth-title">{mode === "sign_in" ? "Welcome back." : "Create your workspace."}</h2>
          <p>{mode === "sign_in" ? "Continue the work you already started." : "Your projects stay private to your Firebase account."}</p>
        </div>

        <button className={styles.google} disabled={disabled} onClick={() => void useGoogle()} type="button">
          Continue with Google
        </button>
        <div className={styles.divider}><span>or use email</span></div>

        <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
          {mode === "sign_up" ? (
            <div className="field-group">
              <label htmlFor="auth-name">Name</label>
              <input autoComplete="name" id="auth-name" onChange={(event) => setName(event.target.value)} required value={name} />
            </div>
          ) : null}
          <div className="field-group">
            <label htmlFor="auth-email">Email</label>
            <input autoComplete="email" id="auth-email" inputMode="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </div>
          <div className="field-group">
            <div className={styles.passwordLabel}>
              <label htmlFor="auth-password">Password</label>
              {mode === "sign_in" ? <button disabled={disabled} onClick={() => void recoverPassword()} type="button">Reset password</button> : null}
            </div>
            <input autoComplete={mode === "sign_in" ? "current-password" : "new-password"} id="auth-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            {mode === "sign_up" ? <p className="field-help">Use at least eight characters. Password managers and paste are supported.</p> : null}
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
          <button className="button" disabled={disabled} type="submit">
            {busy ? "Checking your account…" : mode === "sign_in" ? "Sign in with email" : "Create account"}
          </button>
        </form>
        <p className={styles.privacy}>LoopZ stores workflow history in your private Firestore path. Never paste credentials into a project prompt or evidence report.</p>
        <Link className={styles.back} href="/">Back to LoopZ</Link>
      </section>
    </main>
  );
}
