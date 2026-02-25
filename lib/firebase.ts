// ═══════════════════════════════════════════════════════════════
// FIREBASE — Inicialización central
// Si las variables de entorno están vacías, la app sigue
// funcionando con localStorage (modo offline).
// ═══════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const cfg = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase solo se inicializa si TODAS las variables están presentes
export const isFirebaseConfigured: boolean = !!(
  cfg.apiKey && cfg.projectId && cfg.appId
);

let _app: FirebaseApp | null = null;
let _db:  Firestore    | null = null;

if (isFirebaseConfigured) {
  _app = getApps().length ? getApp() : initializeApp(cfg);
  _db  = getFirestore(_app);
}

export const firebaseApp = _app;
export const db          = _db;
