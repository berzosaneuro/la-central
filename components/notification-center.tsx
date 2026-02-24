'use client';

import { useState, useEffect } from 'react';
import { AuthService, User } from '@/lib/auth';
import { NotificationService, Notification, NotificationType } from '@/lib/notifications';

export function NotificationCenter() {
  const [currentUser] = useState<User | null>(AuthService.getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Load initial notifications
    setNotifications(NotificationService.getNotifications(currentUser.id));
    setUnreadCount(NotificationService.getUnreadCount(currentUser.id));

    // Subscribe to new notifications (real-time)
    const unsubscribe = NotificationService.subscribe(currentUser.id, (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleMarkAsRead = (notificationId: string) => {
    if (!currentUser) return;
    NotificationService.markAsRead(currentUser.id, notificationId);
    setNotifications(
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    if (!currentUser) return;
    NotificationService.markAllAsRead(currentUser.id);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = (notificationId: string) => {
    if (!currentUser) return;
    NotificationService.deleteNotification(currentUser.id, notificationId);
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Notificaciones"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <h3 className="text-white font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/30 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-slate-700/50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <NotificationIcon type={notification.type} />
                      <p className="text-white font-medium text-sm">{notification.title}</p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-slate-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm ml-6">{notification.message}</p>
                  <p className="text-slate-500 text-xs ml-6 mt-1">
                    {new Date(notification.createdAt).toLocaleTimeString('es-ES')}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p>No hay notificaciones</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const iconClass = 'w-5 h-5';
  const colorClass = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  }[type];

  return (
    <div className={`${colorClass}`}>
      {type === 'info' && <span>ℹ️</span>}
      {type === 'success' && <span>✓</span>}
      {type === 'warning' && <span>⚠</span>}
      {type === 'error' && <span>✗</span>}
    </div>
  );
}
