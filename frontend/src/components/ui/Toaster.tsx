'use client';

import { useToastStore } from '@/stores/toast-store';
import { Toast } from './Toast';

/**
 * Renders the global toast queue. Mount once in your root layout (inside
 * Providers). No props needed — it reads directly from the toast store.
 *
 * @example
 * // In providers/index.tsx:
 * <ThemeProvider>
 *   <AuthHydrator>{children}</AuthHydrator>
 *   <Toaster />
 * </ThemeProvider>
 */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse gap-2.5 items-end"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
