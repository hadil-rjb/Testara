import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Icon shown inside the input on the left. */
  leftIcon?: ReactNode;
  /** Icon or element rendered on the right (e.g. show/hide password). */
  rightSlot?: ReactNode;
  /** Forces the error visual state (red border + ring). */
  invalid?: boolean;
  /** Forces the success visual state (green border + ring). */
  valid?: boolean;
  inputSize?: InputSize;
}

const sizes: Record<InputSize, string> = {
  sm: 'h-9 text-xs px-3',
  md: 'h-10 text-sm px-3.5',
  lg: 'h-11 text-sm px-4',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightSlot,
      invalid,
      valid,
      inputSize = 'md',
      type = 'text',
      disabled,
      ...props
    },
    ref,
  ) => {
    const borderCls = invalid
      ? 'border-error focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-error)_25%,transparent)]'
      : valid
      ? 'border-[var(--alert-success-text)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--alert-success-text)_20%,transparent)]'
      : 'border-theme focus-within:border-primary focus-within:shadow-focus-ring';

    return (
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl border surface-input transition-[border-color,box-shadow] duration-150',
          sizes[inputSize],
          borderCls,
          disabled && 'opacity-60 cursor-not-allowed',
          className,
        )}
      >
        {leftIcon && (
          <span className="text-muted flex-shrink-0 inline-flex">{leftIcon}</span>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className="flex-1 min-w-0 bg-transparent outline-none text-heading placeholder:text-muted disabled:cursor-not-allowed"
          {...props}
        />
        {rightSlot && (
          <span className="flex-shrink-0 inline-flex items-center">{rightSlot}</span>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
