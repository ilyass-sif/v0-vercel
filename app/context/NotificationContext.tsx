"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Notification, NotificationContext as NotificationContextType } from "@/app/types/notification";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 4000,
      };

      setNotifications((prev) => [...prev, newNotification]);

      if (newNotification.duration && newNotification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);

        return () => clearTimeout(timer);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
