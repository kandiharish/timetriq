import React, { createContext, useContext, useState, useEffect } from 'react';
import { setupMessageListener } from '../services/notificationService';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // We pass a callback to setupMessageListener so it can push to this state
    setupMessageListener((payload) => {
      if (payload.notification) {
        const newNotif: AppNotification = {
          id: payload.messageId || Math.random().toString(36).substring(7),
          title: payload.notification.title || 'Notification',
          body: payload.notification.body || '',
          timestamp: new Date(),
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
