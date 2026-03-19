"use client";

import { useEffect, useState } from "react";
import { useNotification } from "@/app/context/NotificationContext";
import type { Notification, NotificationType } from "@/app/types/notification";

function NotificationToast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-950",
          border: "border-green-700",
          icon: "✓",
          iconColor: "text-green-400",
          accent: "border-l-4 border-l-green-400",
        };
      case "error":
        return {
          bg: "bg-red-950",
          border: "border-red-700",
          icon: "✕",
          iconColor: "text-red-400",
          accent: "border-l-4 border-l-red-400",
        };
      case "warning":
        return {
          bg: "bg-yellow-950",
          border: "border-yellow-700",
          icon: "⚠",
          iconColor: "text-yellow-400",
          accent: "border-l-4 border-l-yellow-400",
        };
      case "info":
      default:
        return {
          bg: "bg-cyan-950",
          border: "border-cyan-700",
          icon: "ℹ",
          iconColor: "text-cyan-400",
          accent: "border-l-4 border-l-cyan-400",
        };
    }
  };

  const styles = getTypeStyles(notification.type);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, onDismiss]);

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-96 opacity-0"}
      `}
    >
      <div
        className={`
          ${styles.bg} ${styles.border} ${styles.accent}
          border rounded font-mono text-sm p-4 shadow-lg
          flex items-start gap-3 min-w-[320px] max-w-[420px]
        `}
      >
        {/* Icon */}
        <span className={`${styles.iconColor} font-bold text-lg flex-shrink-0 mt-0.5`}>
          {styles.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`${styles.iconColor} font-bold text-sm mb-1`}>{notification.title}</h3>
          <p className="text-gray-300 text-xs leading-relaxed break-words">{notification.message}</p>

          {/* Action Button */}
          {notification.action && (
            <button
              onClick={() => {
                notification.action?.onClick();
                onDismiss();
              }}
              className={`
                mt-2 px-2 py-1 text-xs font-mono border rounded
                ${styles.border} ${styles.iconColor}
                hover:bg-gray-900 transition-colors
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast notification={notification} onDismiss={() => removeNotification(notification.id)} />
        </div>
      ))}
    </div>
  );
}
