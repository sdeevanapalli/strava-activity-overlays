"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

const TOAST_STYLE: Record<string, { border: string; bg: string; text: string }> = {
  success: { border: "#2FBF71", bg: "#ECFDF3", text: "#0F5132" },
  info: { border: "#FC4C02", bg: "#FFF4EF", text: "#6A2D00" },
  error: { border: "#E5484D", bg: "#FFF0F0", text: "#7D1D20" },
};

export default function ToastHost() {
  const { toasts, dismissToast } = useUIStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.durationMs)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[120] w-[min(92vw,460px)] -translate-x-1/2 space-y-2">
      {toasts.map((toast) => {
        const palette = TOAST_STYLE[toast.tone] ?? TOAST_STYLE.info;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between rounded-md border px-3 py-2 shadow-sm"
            style={{
              borderColor: palette.border,
              background: palette.bg,
              color: palette.text,
            }}
            role="status"
            aria-live="polite"
          >
            <p className="pr-3 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-xs font-semibold"
              style={{ color: palette.text }}
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
}
