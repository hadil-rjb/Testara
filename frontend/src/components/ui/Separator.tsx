import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  /** Use the lighter divider color. */
  subtle?: boolean;
}

export function Separator({
  orientation = 'horizontal',
  subtle = true,
  className,
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        subtle ? 'bg-[var(--border-light)]' : 'bg-[var(--border-color)]',
        orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}
