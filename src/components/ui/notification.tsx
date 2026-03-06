import React from "react";
import type { NotificationState } from "@/hooks/common/use-notification";

interface NotificationBannerProps {
  data: NotificationState | null;
  isVisible: boolean;
  onClose: () => void;
}

const variantStyles: Record<string, { container: string; title: string; message: string; close: string; icon: React.ReactNode }> = {
  success: {
    container: "bg-white border-gray-200",
    title: "text-gray-900",
    message: "text-gray-500",
    close: "text-gray-400 hover:text-gray-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-emerald-500 shrink-0 mt-0.5">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    container: "bg-white border-gray-200",
    title: "text-gray-900",
    message: "text-gray-500",
    close: "text-gray-400 hover:text-gray-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-red-500 shrink-0 mt-0.5">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    container: "bg-white border-gray-200",
    title: "text-gray-900",
    message: "text-gray-500",
    close: "text-gray-400 hover:text-gray-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-blue-500 shrink-0 mt-0.5">
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export function NotificationBanner({ data, isVisible, onClose }: NotificationBannerProps) {
  if (!data) return null;

  const styles = variantStyles[data.type] ?? variantStyles.info;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] w-full max-w-sm px-4 transition-all duration-500 ease-out transform
        ${isVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"}`}
    >
      <div className={`rounded-xl border shadow-lg px-4 py-3 text-sm ${styles.container}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {styles.icon}
            <div>
              <p className={`font-semibold text-sm leading-snug ${styles.title}`}>
                {data.title}
              </p>
              <p className={`mt-0.5 text-xs leading-relaxed ${styles.message}`}>
                {data.message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors shrink-0 mt-0.5 text-xs ${styles.close}`}
            aria-label="Cerrar notificacion"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}