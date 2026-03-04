import { useState, useCallback, useRef } from "react";

export type NotificationType = "success" | "error" | "info";

export interface NotificationState {
  title: string;
  message: string;
  type: NotificationType;
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const close = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => setNotification(null), 200);
  }, []);
  const show = useCallback((title: string, message: string, type: NotificationType = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ title, message, type });
    setIsVisible(true);
    timerRef.current = setTimeout(() => {
      close();
    }, 8000);
  }, [close]);
  return {
    notification,
    isVisible,
    show,
    close,
  };
}