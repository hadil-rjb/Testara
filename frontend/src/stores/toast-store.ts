import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

let _counter = 0;
function uid() {
  return `toast-${++_counter}-${Date.now()}`;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: uid() }],
    })),

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  dismissAll: () => set({ toasts: [] }),
}));
