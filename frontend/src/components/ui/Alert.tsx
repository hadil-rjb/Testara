import { HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: ReactNode;
  /** Makes the alert dismissable — calls back when the close icon is clicked. */
  onDismiss?: () => void;
}

const variants: Record<
  AlertVariant,
  { Icon: typeof AlertCircle; surface: string }
> = {
  info: {
    Icon: Info,
    surface:
      'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-primary',
  },
  success: {
    Icon: CheckCircle2,
    surface: 'alert-success',
  },
  warning: {
    Icon: AlertTriangle,
    surface:
      'bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-[color-mix(in_srgb,var(--color-warning)_70%,var(--text-primary))]',
  },
  error: {
    Icon: AlertCircle,
    surface: 'alert-error',
  },
};

export function Alert({
  className,
  variant = 'info',
  title,
  children,
  onDismiss,
  ...props
}: AlertProps) {
  const { Icon, surface } = variants[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3 border border-transparent text-sm',
        surface,
        className,
      )}
      {...props}
    >
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        {children && <div className="opacity-90 leading-relaxed">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
