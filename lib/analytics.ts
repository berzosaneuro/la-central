// Analytics & Metrics System
import { AnalyticsEvent, SystemMetrics } from "./types";

const analyticsEvents: AnalyticsEvent[] = [];

export class AnalyticsService {
  static trackEvent(eventType: string, userId?: string, data?: Record<string, any>): AnalyticsEvent {
    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      userId,
      data: data || {},
      timestamp: new Date(),
    };
    analyticsEvents.push(event);
    return event;
  }

  static getEvents(
    filters?: {
      eventType?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): AnalyticsEvent[] {
    let filtered = [...analyticsEvents];

    if (filters?.eventType) {
      filtered = filtered.filter(e => e.eventType === filters.eventType);
    }
    if (filters?.userId) {
      filtered = filtered.filter(e => e.userId === filters.userId);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  static getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    analyticsEvents.forEach(event => {
      stats[event.eventType] = (stats[event.eventType] || 0) + 1;
    });
    return stats;
  }

  static getUserStats(userId: string): {
    totalEvents: number;
    eventTypes: Record<string, number>;
    firstSeen: Date | null;
    lastSeen: Date | null;
  } {
    const userEvents = analyticsEvents.filter(e => e.userId === userId);
    const eventTypes: Record<string, number> = {};

    userEvents.forEach(event => {
      eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
    });

    return {
      totalEvents: userEvents.length,
      eventTypes,
      firstSeen: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : null,
      lastSeen: userEvents.length > 0 ? userEvents[0].timestamp : null,
    };
  }

  static getSystemMetrics(): SystemMetrics {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvents = analyticsEvents.filter(e => e.timestamp > oneDayAgo);
    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean));

    return {
      totalUsers: 0, // Will be updated from AuthService
      activeUsers: uniqueUsers.size,
      totalClones: 0, // Will be updated from main app
      totalRenovations: 0, // Will be updated from main app
      systemUptime: Math.floor(now.getTime() / 1000),
      errorRate: this.calculateErrorRate(),
      lastBackup: new Date(),
      storageUsed: 0,
    };
  }

  private static calculateErrorRate(): number {
    const errorEvents = analyticsEvents.filter(e => e.eventType.includes("error"));
    return analyticsEvents.length > 0 ? (errorEvents.length / analyticsEvents.length) * 100 : 0;
  }

  static clearOldEvents(daysToKeep: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const initialLength = analyticsEvents.length;
    const filtered = analyticsEvents.filter(e => e.timestamp > cutoffDate);
    analyticsEvents.length = 0;
    analyticsEvents.push(...filtered);
    return initialLength - analyticsEvents.length;
  }
}
