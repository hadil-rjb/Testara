'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Accessible label — required for screen readers when no `<label>` wraps the switch. */
  'aria-label'?: string;
  size?: 'sm' | 'md';
}

const sizes = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
} as const;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, size = 'md', checked, disabled, ...props }, ref) => {
    const { track, thumb, translate } = sizes[size];
    return (
      <label
        className={cn(
          'relative inline-flex items-center cursor-pointer select-none',
          disabled && 'opacity-60 cursor-not-allowed',
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            'rounded-full transition-colors duration-200',
            track,
            'bg-[var(--bg-tertiary)] peer-checked:bg-primary peer-focus-visible:shadow-focus-ring',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200',
            thumb,
            checked ? translate : 'translate-x-0',
          )}
        />
      </label>
    );
  },
);
Switch.displayName = 'Switch';
