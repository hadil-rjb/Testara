import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Circle skeleton (e.g. for avatars). Provide `className` with width/height. */
  circle?: boolean;
}

export function Skeleton({ className, circle, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      aria-live="polite"
      className={cn(
        'relative overflow-hidden surface-tertiary',
        circle ? 'rounded-full' : 'rounded-md',
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--bg-primary) 40%, transparent) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
