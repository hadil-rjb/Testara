'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastKind = 'success' | 'error';

interface ToastProps {
  kind: ToastKind;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  kind,
  message,
  onDismiss,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  const isSuccess = kind === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${
          isSuccess
            ? 'alert-success border-[var(--alert-success-text)]/20'
            : 'alert-error border-[var(--alert-error-text)]/20'
        }`}
      >
        {isSuccess ? (
          <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle size={18} className="flex-shrink-0 mt-0.5" />
        )}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
