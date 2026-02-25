import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const getConfig = () => ({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

export const isFirebaseConfigured = () =>
  typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) {
    const config = getConfig();
    const app: FirebaseApp = getApps().length
      ? getApps()[0]
      : initializeApp(config);
    _db = getFirestore(app);
  }
  return _db;
}
