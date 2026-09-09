import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every((value) => typeof value === "string" && value.length > 0);
}

export function getFirebaseServices(): FirebaseServices {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Add the required NEXT_PUBLIC_FIREBASE_* variables before starting LoopZ.");
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), db: getFirestore(app) };
}
