import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Tailwind classes for the spinner color (default: `border-primary`). */
  className?: string;
  /** Accessible label (hidden visually). */
  label?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-6 h-6 border-[2.5px]',
};

export function Spinner({ size = 'sm', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-full animate-spin border-primary border-t-transparent align-[-2px]',
        sizeMap[size],
        className,
      )}
    />
  );
}
