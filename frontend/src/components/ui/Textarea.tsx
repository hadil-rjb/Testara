import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Forces the error visual state (red border + ring). */
  invalid?: boolean;
  /** Forces the success visual state (green border + ring). */
  valid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, valid, disabled, rows = 4, ...props }, ref) => {
    const borderCls = invalid
      ? 'border-error focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-error)_25%,transparent)]'
      : valid
      ? 'border-[var(--alert-success-text)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--alert-success-text)_20%,transparent)]'
      : 'border-theme focus:border-primary focus:shadow-focus-ring';

    return (
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          'w-full rounded-xl border surface-input px-3.5 py-2.5 text-sm text-heading placeholder:text-muted',
          'outline-none resize-y transition-[border-color,box-shadow] duration-150',
          borderCls,
          disabled && 'opacity-60 cursor-not-allowed',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
