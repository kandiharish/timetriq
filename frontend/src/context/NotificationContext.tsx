import React, { createContext, useContext, useState, useEffect } from 'react';
import { appNotificationService, type AppNotification as BackendNotification } from '../services/notificationService';
import { useAuth } from '../components/AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  addNotification: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const backendNotifs = await appNotificationService.getNotifications();
      const mapped: AppNotification[] = backendNotifs.map((n: BackendNotification) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        read: n.isRead,
        timestamp: new Date(n.createdAt)
      }));
      setNotifications(mapped);
    } catch (e) {
      // Fallback or ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    await appNotificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const n of unread) {
      await appNotificationService.markAsRead(n.id);
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
