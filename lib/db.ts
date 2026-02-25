// ═══════════════════════════════════════════════════════════════
// DB — Capa de datos Firestore
// Todos los métodos son seguros: si Firebase no está configurado
// simplemente no hacen nada (la app usa localStorage como fallback).
// ═══════════════════════════════════════════════════════════════

import { db, isFirebaseConfigured } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

// Un único documento para todo el sistema (app mono-usuario)
const DOC_ID = "jefazo-master";
const getRef = () => doc(db!, "jefazo-data", DOC_ID);

// ─── Tipos mínimos para la capa de datos ────────────────────
export interface CloudData {
  clones?:        unknown[];
  renovaciones?:  unknown[];
  globalState?:   unknown;
  adminSettings?: unknown;
  updatedAt?:     string;
}

// ─── Guardar parcialmente (merge) ───────────────────────────
async function save(patch: Partial<CloudData>): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(getRef(), { ...patch, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("[DB] Error guardando en Firestore:", e);
  }
}

// ─── API pública ────────────────────────────────────────────
export const DB = {
  isConnected: isFirebaseConfigured,

  /** Carga todos los datos del maestro desde Firestore */
  async loadAll(): Promise<CloudData | null> {
    if (!isFirebaseConfigured || !db) return null;
    try {
      const snap = await getDoc(getRef());
      return snap.exists() ? (snap.data() as CloudData) : null;
    } catch (e) {
      console.warn("[DB] Error cargando datos:", e);
      return null;
    }
  },

  /** Escucha cambios en tiempo real (multi-dispositivo) */
  subscribe(callback: (data: CloudData) => void): Unsubscribe | null {
    if (!isFirebaseConfigured || !db) return null;
    return onSnapshot(getRef(), (snap) => {
      if (snap.exists()) callback(snap.data() as CloudData);
    }, (e) => {
      console.warn("[DB] Error en listener:", e);
    });
  },

  saveClones:        (v: unknown[]) => save({ clones: v }),
  saveRenovaciones:  (v: unknown[]) => save({ renovaciones: v }),
  saveGlobalState:   (v: unknown)   => save({ globalState: v }),
  saveAdminSettings: (v: unknown)   => save({ adminSettings: v }),

  /** Guarda todos los datos de una vez (útil en import/restore) */
  saveAll(data: CloudData): Promise<void> {
    return save(data);
  },
};
