import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type IconButtonVariant = 'ghost' | 'solid' | 'outline';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Required for accessibility — screen-reader label. */
  'aria-label': string;
  children: ReactNode;
}

const sizes: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-9 h-9 rounded-[10px]',
  lg: 'w-10 h-10 rounded-xl',
};

const variants: Record<IconButtonVariant, string> = {
  ghost:
    'text-body hover:surface-tertiary hover:text-heading',
  solid:
    'bg-primary text-white hover:bg-primary-dark shadow-sm',
  outline:
    'border border-theme surface-card text-body hover:surface-tertiary hover:text-heading',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', type = 'button', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center transition-[background-color,color,transform,box-shadow] duration-150 ease-out',
          'focus-visible:outline-none focus-visible:shadow-focus-ring',
          'active:scale-[0.94] disabled:opacity-50 disabled:pointer-events-none',
          sizes[size],
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
