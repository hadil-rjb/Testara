import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type DivProps = HTMLAttributes<HTMLDivElement>;

export interface CardProps extends DivProps {
  /** Add hover elevation. */
  interactive?: boolean;
  /** Vertical padding preset. */
  padded?: boolean | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

function resolvePadding(p: CardProps['padded']): string {
  if (p === false) return '';
  if (p === undefined || p === true || p === 'md') return paddingMap.md;
  return paddingMap[p];
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, padded = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-theme surface-card shadow-card',
        interactive &&
          'transition-[box-shadow,transform] duration-200 ease-out hover:shadow-card-hover hover:-translate-y-0.5',
        resolvePadding(padded),
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1 mb-4', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base font-semibold text-heading', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-body', className)}
      {...props}
    />
  ),
);
CardDescription.displayName = 'CardDescription';

export const CardBody = forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  ),
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-end gap-2 mt-5 pt-5 border-t border-theme-light',
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';
