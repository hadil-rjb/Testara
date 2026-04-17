'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="p-6 pt-7">
        <div className="flex gap-4">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
              destructive ? 'bg-error/10' : 'bg-primary/10'
            }`}
          >
            <AlertTriangle
              size={20}
              className={destructive ? 'text-error' : 'text-primary'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold font-heading text-heading">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-body mt-1.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'danger' : 'primary'}
            loading={busy}
            disabled={busy}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
