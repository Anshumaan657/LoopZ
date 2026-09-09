"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseServices, isFirebaseConfigured } from "../../lib/firebase-client";
import {
  clearSignedOutLocalState,
  hydrateCloudState,
  markLocalStateOwner,
  prepareLocalStateForUser,
  subscribeToCloudState,
  type CloudSyncSubscription,
} from "../history/cloud-state";

type AuthStatus = "loading" | "signed_out" | "syncing" | "ready" | "configuration_error" | "error";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyAuthError(cause: unknown): Error {
  const code = typeof cause === "object" && cause && "code" in cause ? String(cause.code) : "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists for this email. Sign in instead.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow pop-ups and try again.",
    "auth/too-many-requests": "Too many attempts were made. Wait a moment and try again.",
    "auth/weak-password": "Use a stronger password with at least eight characters.",
  };
  return new Error(messages[code] ?? (cause instanceof Error ? cause.message : "Authentication could not be completed."));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const cloudSync = useRef<CloudSyncSubscription | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStatus("configuration_error");
      setError("Firebase configuration is missing. Add the public Firebase environment variables and rebuild LoopZ.");
      return;
    }

    const { auth, db } = getFirebaseServices();
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      cloudSync.current?.stop();
      cloudSync.current = null;
      if (!active) return;
      setUser(nextUser);
      setError(null);
      if (!nextUser) {
        clearSignedOutLocalState();
        setStatus("signed_out");
        return;
      }

      setStatus("syncing");
      try {
        prepareLocalStateForUser(nextUser.uid);
        await setDoc(doc(db, "users", nextUser.uid), {
          displayName: nextUser.displayName ?? null,
          email: nextUser.email ?? null,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        await hydrateCloudState(nextUser.uid);
        if (!active) return;
        markLocalStateOwner(nextUser.uid);
        cloudSync.current = subscribeToCloudState(nextUser.uid, (syncError) => {
          if (active) setError(syncError.message);
        });
        setStatus("ready");
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Your cloud history could not be loaded.");
        setStatus("error");
      }
    });

    return () => {
      active = false;
      cloudSync.current?.stop();
      unsubscribe();
    };
  }, []);

  const runAuth = useCallback(async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (cause) {
      const authError = friendlyAuthError(cause);
      setError(authError.message);
      throw authError;
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    error,
    clearError: () => setError(null),
    signInWithGoogle: () => runAuth(async () => {
      const { auth } = getFirebaseServices();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    }),
    signInWithEmail: (email, password) => runAuth(async () => {
      await signInWithEmailAndPassword(getFirebaseServices().auth, email.trim(), password);
    }),
    signUpWithEmail: (name, email, password) => runAuth(async () => {
      const credential = await createUserWithEmailAndPassword(getFirebaseServices().auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      setUser(credential.user);
    }),
    resetPassword: (email) => runAuth(async () => {
      await sendPasswordResetEmail(getFirebaseServices().auth, email.trim());
    }),
    signOut: () => runAuth(async () => {
      await cloudSync.current?.flush();
      await firebaseSignOut(getFirebaseServices().auth);
    }),
  }), [error, runAuth, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
