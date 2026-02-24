// Notifications System
import { Notification, NotificationType } from "./types";

const notifications = new Map<string, Notification[]>();
const notificationSubscribers: Map<string, Function[]> = new Map();

export class NotificationService {
  static createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
    };

    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    notifications.get(userId)!.push(notification);

    // Trigger subscribers (for real-time updates)
    this.notifySubscribers(userId, notification);

    return notification;
  }

  static getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = notifications.get(userId) || [];
    if (unreadOnly) {
      return userNotifications.filter(n => !n.read);
    }
    return userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static markAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = notifications.get(userId);
    if (!userNotifications) return false;
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  static markAllAsRead(userId: string): void {
    const userNotifications = notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach(n => (n.read = true));
    }
  }

  static deleteNotification(userId: string, notificationId: string): boolean {
    const userNotifications = notifications.get(userId);
    if (!userNotifications) return false;
    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    return false;
  }

  static getUnreadCount(userId: string): number {
    const userNotifications = notifications.get(userId) || [];
    return userNotifications.filter(n => !n.read).length;
  }

  // Real-time subscriptions
  static subscribe(userId: string, callback: Function): Function {
    if (!notificationSubscribers.has(userId)) {
      notificationSubscribers.set(userId, []);
    }
    notificationSubscribers.get(userId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = notificationSubscribers.get(userId);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  private static notifySubscribers(userId: string, notification: Notification): void {
    const subscribers = notificationSubscribers.get(userId) || [];
    subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error("[v0] Error in notification subscriber:", error);
      }
    });
  }

  static clearOldNotifications(userId: string, daysToKeep: number = 30): number {
    const userNotifications = notifications.get(userId);
    if (!userNotifications) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const initialLength = userNotifications.length;
    const filtered = userNotifications.filter(n => n.createdAt > cutoffDate);
    notifications.set(userId, filtered);

    return initialLength - filtered.length;
  }
}
