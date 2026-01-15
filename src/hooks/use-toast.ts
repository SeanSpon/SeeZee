import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastCounter = 0;

const listeners = new Set<(toasts: Toast[]) => void>();
let toastsState: Toast[] = [];

function notify() {
  listeners.forEach((listener) => listener([...toastsState]));
}

export function toast(message: string, type: ToastType = "info") {
  const id = `toast-${++toastCounter}`;
  const newToast: Toast = { id, message, type };
  toastsState = [...toastsState, newToast];
  notify();

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  }, 5000);

  return id;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(toastsState);

  const subscribe = useCallback(() => {
    listeners.add(setToasts);
    return () => listeners.delete(setToasts);
  }, []);

  // Subscribe on mount
  if (typeof window !== "undefined") {
    subscribe();
  }

  const dismiss = useCallback((id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notify();
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
}
