import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Optional leading dot indicator. */
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'surface-tertiary text-body',
  primary:
    'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-primary',
  success:
    'bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] text-[var(--alert-success-text)]',
  warning:
    'bg-[color-mix(in_srgb,var(--color-warning)_18%,transparent)] text-[color-mix(in_srgb,var(--color-warning)_75%,var(--text-primary))]',
  error:
    'bg-[color-mix(in_srgb,var(--color-error)_15%,transparent)] text-[var(--alert-error-text)]',
  outline: 'border border-theme text-body surface-card',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'text-[10px] leading-none px-2 py-1',
  md: 'text-xs leading-none px-2.5 py-1.5',
};

const dotColors: Record<BadgeVariant, string> = {
  neutral: 'bg-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  outline: 'bg-muted',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'sm', dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  ),
);
Badge.displayName = 'Badge';
