// Core Types for Jefazo OS Admin System

// ============ AUTHENTICATION & USERS ============
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  OPERATOR = "operator",
  VIEWER = "viewer",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  EXECUTE = "execute",
  MANAGE = "manage",
}

export enum PermissionResource {
  CLONES = "clones",
  RENOVATIONS = "renovations",
  SOUNDS = "sounds",
  USERS = "users",
  SETTINGS = "settings",
  BACKUPS = "backups",
  LOGS = "logs",
  API_KEYS = "api_keys",
  WEBHOOKS = "webhooks",
}

export interface Permission {
  resource: PermissionResource;
  actions: PermissionAction[];
}

// ============ AUDIT & LOGS ============
export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  READ = "READ",
  EXECUTE = "EXECUTE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  BACKUP_EXPORT = "BACKUP_EXPORT",
  BACKUP_IMPORT = "BACKUP_IMPORT",
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: PermissionResource;
  resourceId?: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// ============ SYSTEM CONFIGURATION ============
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface SoundConfig {
  id: string;
  name: string;
  category: string;
  volume: number;
  enabled: boolean;
  url?: string;
  createdAt: Date;
}

// ============ BACKUP & RECOVERY ============
export interface BackupData {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  size: number;
  createdBy: string;
  data: {
    clones: any[];
    renovaciones: any[];
    sounds: SoundConfig[];
    settings: SystemConfig[];
    version: string;
  };
  tags?: string[];
  isAutomatic: boolean;
}

// ============ API & WEBHOOKS ============
export interface ApiKey {
  id: string;
  name: string;
  key: string; // hashed
  userId: string;
  permissions: Permission[];
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  userId: string;
  createdAt: Date;
  isActive: boolean;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };
}

export enum WebhookEvent {
  CLONE_CREATED = "clone.created",
  CLONE_UPDATED = "clone.updated",
  CLONE_DELETED = "clone.deleted",
  RENOVATION_CREATED = "renovation.created",
  RENOVATION_COMPLETED = "renovation.completed",
  SOUND_PLAYED = "sound.played",
  BACKUP_COMPLETED = "backup.completed",
  SYSTEM_ERROR = "system.error",
}

// ============ NOTIFICATIONS ============
export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

// ============ ANALYTICS ============
export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalClones: number;
  totalRenovations: number;
  systemUptime: number;
  errorRate: number;
  lastBackup: Date;
  storageUsed: number;
}
