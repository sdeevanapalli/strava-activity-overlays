import { create } from "zustand";

export type ToastTone = "success" | "info" | "error";

export type ToastMessage = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
};

interface UIState {
  toasts: ToastMessage[];
  pushToast: (message: string, tone?: ToastTone, durationMs?: number) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],

  pushToast: (message, tone = "info", durationMs = 2400) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, tone, durationMs }],
    }));
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
