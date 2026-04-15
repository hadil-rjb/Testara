import { clsx, type ClassValue } from 'clsx';

/**
 * Compose className strings conditionally.
 *
 * @example
 * cn('px-4', isActive && 'bg-primary', variant === 'ghost' && 'opacity-60')
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
