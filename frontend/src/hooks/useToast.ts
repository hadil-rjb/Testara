import { useCallback } from 'react';
import { useToastStore, type ToastVariant } from '@/stores/toast-store';
import { TOAST_DURATION } from '@/lib/constants';

/**
 * Imperative toast API — call from anywhere (event handlers, async flows).
 *
 * @example
 * const toast = useToast();
 * toast.success('Profile saved');
 * toast.error('Something went wrong');
 * toast.warning('Session expiring soon');
 * toast.info('Changes take effect on next login');
 */
export function useToast() {
  const add = useToastStore((s) => s.add);

  const show = useCallback(
    (
      variant: ToastVariant,
      message: string,
      options?: { title?: string; duration?: number },
    ) => {
      add({
        variant,
        message,
        title: options?.title,
        duration: options?.duration ?? TOAST_DURATION,
      });
    },
    [add],
  );

  return {
    success: (message: string, options?: { title?: string; duration?: number }) =>
      show('success', message, options),
    error: (message: string, options?: { title?: string; duration?: number }) =>
      show('error', message, options),
    warning: (message: string, options?: { title?: string; duration?: number }) =>
      show('warning', message, options),
    info: (message: string, options?: { title?: string; duration?: number }) =>
      show('info', message, options),
  };
}
