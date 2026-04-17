'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastItem, ToastVariant } from '@/stores/toast-store';

/* ─── design per variant ─── */
const config: Record<
  ToastVariant,
  { icon: typeof Info; surface: string; bar: string }
> = {
  success: {
    icon: CheckCircle2,
    surface: 'alert-success border-[var(--alert-success-text)]/20',
    bar: 'bg-[var(--alert-success-text)]/40',
  },
  error: {
    icon: XCircle,
    surface: 'alert-error border-[var(--alert-error-text)]/20',
    bar: 'bg-[var(--alert-error-text)]/40',
  },
  warning: {
    icon: AlertTriangle,
    surface:
      'bg-[color-mix(in_srgb,var(--color-warning)_12%,var(--bg-card))] text-[color-mix(in_srgb,var(--color-warning)_80%,var(--text-primary))] border-[var(--color-warning)]/30',
    bar: 'bg-[var(--color-warning)]/40',
  },
  info: {
    icon: Info,
    surface:
      'bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--bg-card))] text-primary border-primary/20',
    bar: 'bg-primary/40',
  },
};

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, variant, title, message, duration } = toast;
  const { icon: Icon, surface, bar } = config[variant];

  // animate progress bar and auto-dismiss
  const [progress, setProgress] = useState(100);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(id), 280);
  };

  useEffect(() => {
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        dismiss();
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // dismiss intentionally excluded — stable ref via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, id]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg w-full max-w-sm overflow-hidden',
        'transition-all duration-280',
        leaving
          ? 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          : 'opacity-100 translate-x-0 scale-100',
        surface,
      )}
    >
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold leading-snug">{title}</p>}
        <p className={cn('text-sm leading-snug', title && 'opacity-80')}>{message}</p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 -mr-1 -mt-0.5 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>

      {/* progress bar */}
      <span
        aria-hidden
        className={cn('absolute bottom-0 left-0 h-[2px] rounded-full transition-none', bar)}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
