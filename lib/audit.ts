// Audit & Logging System
import { AuditLog, AuditAction, PermissionResource } from "./types";

const auditLogs: AuditLog[] = [];

export class AuditService {
  static log(
    userId: string,
    action: AuditAction,
    resource: PermissionResource,
    resourceId?: string,
    changes?: { before: any; after: any },
    metadata?: Record<string, any>
  ): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      resource,
      resourceId,
      changes,
      metadata,
      timestamp: new Date(),
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    };
    auditLogs.push(log);
    return log;
  }

  static getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    resource?: PermissionResource;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let filtered = [...auditLogs];

    if (filters?.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }
    if (filters?.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters?.resource) {
      filtered = filtered.filter(log => log.resource === filters.resource);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  static getLogsSummary(): {
    totalLogs: number;
    logsByAction: Record<string, number>;
    logsByResource: Record<string, number>;
    lastLog?: AuditLog;
  } {
    const summary = {
      totalLogs: auditLogs.length,
      logsByAction: {} as Record<string, number>,
      logsByResource: {} as Record<string, number>,
    };

    auditLogs.forEach(log => {
      summary.logsByAction[log.action] = (summary.logsByAction[log.action] || 0) + 1;
      summary.logsByResource[log.resource] = (summary.logsByResource[log.resource] || 0) + 1;
    });

    if (auditLogs.length > 0) {
      summary.lastLog = auditLogs[auditLogs.length - 1];
    }

    return summary;
  }

  static clearOldLogs(daysToKeep: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const initialLength = auditLogs.length;
    const filtered = auditLogs.filter(log => log.timestamp > cutoffDate);
    auditLogs.length = 0;
    auditLogs.push(...filtered);
    return initialLength - auditLogs.length;
  }
}
