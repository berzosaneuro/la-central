// Database Integration Layer (Ready for Supabase, Firebase, or other services)
// This file contains the interface and structure for database operations
// Replace in-memory stores with actual database calls when integrating

import { User, AuditLog, SystemConfig, BackupData, ApiKey, Webhook, Notification } from './types';

// Database Provider Interface
export interface DatabaseProvider {
  // Users
  users: {
    create: (user: User) => Promise<User>;
    get: (id: string) => Promise<User | null>;
    getAll: () => Promise<User[]>;
    update: (id: string, data: Partial<User>) => Promise<User>;
    delete: (id: string) => Promise<void>;
  };

  // Audit Logs
  audit: {
    create: (log: AuditLog) => Promise<AuditLog>;
    get: (id: string) => Promise<AuditLog | null>;
    getFiltered: (filters: any) => Promise<AuditLog[]>;
    delete: (id: string) => Promise<void>;
  };

  // Config
  config: {
    get: (key: string) => Promise<SystemConfig | null>;
    set: (key: string, config: SystemConfig) => Promise<SystemConfig>;
    getAll: () => Promise<SystemConfig[]>;
    delete: (key: string) => Promise<void>;
  };

  // Backups
  backups: {
    create: (backup: BackupData) => Promise<BackupData>;
    get: (id: string) => Promise<BackupData | null>;
    getAll: () => Promise<BackupData[]>;
    delete: (id: string) => Promise<void>;
  };

  // API Keys
  apiKeys: {
    create: (key: ApiKey) => Promise<ApiKey>;
    get: (id: string) => Promise<ApiKey | null>;
    getByUser: (userId: string) => Promise<ApiKey[]>;
    update: (id: string, data: Partial<ApiKey>) => Promise<ApiKey>;
    delete: (id: string) => Promise<void>;
  };

  // Webhooks
  webhooks: {
    create: (webhook: Webhook) => Promise<Webhook>;
    get: (id: string) => Promise<Webhook | null>;
    getByUser: (userId: string) => Promise<Webhook[]>;
    getByEvent: (event: string) => Promise<Webhook[]>;
    update: (id: string, data: Partial<Webhook>) => Promise<Webhook>;
    delete: (id: string) => Promise<void>;
  };

  // Notifications
  notifications: {
    create: (notification: Notification) => Promise<Notification>;
    get: (id: string) => Promise<Notification | null>;
    getByUser: (userId: string, unreadOnly?: boolean) => Promise<Notification[]>;
    update: (id: string, data: Partial<Notification>) => Promise<Notification>;
    delete: (id: string) => Promise<void>;
  };
}

// Example: Supabase Integration (when ready to connect)
/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export const SupabaseProvider: DatabaseProvider = {
  users: {
    create: async (user: User) => {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // ... other methods
  },
  // ... other entities
};
*/

// Example: Firebase Integration (when ready to connect)
/*
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseApp = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ... other config
});

const db = getFirestore(firebaseApp);

export const FirebaseProvider: DatabaseProvider = {
  users: {
    create: async (user: User) => {
      const docRef = await addDoc(collection(db, 'users'), user);
      return { ...user, id: docRef.id };
    },
    // ... other methods
  },
  // ... other entities
};
*/

// Type-safe database hook factory
export function createDatabaseHook(provider: DatabaseProvider) {
  return {
    users: {
      create: provider.users.create,
      get: provider.users.get,
      getAll: provider.users.getAll,
      update: provider.users.update,
      delete: provider.users.delete,
    },
    audit: {
      create: provider.audit.create,
      getFiltered: provider.audit.getFiltered,
    },
    config: {
      get: provider.config.get,
      set: provider.config.set,
      getAll: provider.config.getAll,
    },
    backups: {
      create: provider.backups.create,
      getAll: provider.backups.getAll,
    },
    // ... other entities
  };
}
