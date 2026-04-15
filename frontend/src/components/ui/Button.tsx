import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Render full-width button. */
  block?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-[background-color,color,box-shadow,transform] duration-200 ease-out select-none whitespace-nowrap ' +
  'focus-visible:outline-none focus-visible:shadow-focus-ring ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ' +
  'active:scale-[0.98]';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm hover:bg-primary-dark hover:shadow-md',
  secondary:
    'surface-tertiary text-heading hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--bg-tertiary))]',
  outline:
    'border border-theme surface-card text-heading hover:surface-tertiary hover:border-primary/40',
  ghost:
    'text-body hover:surface-tertiary hover:text-heading',
  danger:
    'bg-error text-white shadow-sm hover:opacity-90 hover:shadow-md',
  link:
    'text-primary underline-offset-4 hover:underline rounded-md p-0 active:scale-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  icon: 'w-10 h-10 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      block = false,
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isLink = variant === 'link';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          base,
          variants[variant],
          !isLink && sizes[size],
          block && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner
            size="sm"
            className={cn(
              variant === 'primary' || variant === 'danger'
                ? 'border-white border-t-transparent'
                : 'border-primary border-t-transparent',
            )}
          />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && <span className="inline-flex items-center">{children}</span>}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';
