import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  /** Used for the alt text and as a fallback (initials rendered from name). */
  name?: string;
  size?: AvatarSize;
  /** Show a purple ring around the avatar. */
  ring?: boolean;
}

const sizes: Record<AvatarSize, { box: string; text: string }> = {
  xs: { box: 'w-6 h-6', text: 'text-[10px]' },
  sm: { box: 'w-8 h-8', text: 'text-[11px]' },
  md: { box: 'w-10 h-10', text: 'text-sm' },
  lg: { box: 'w-14 h-14', text: 'text-lg' },
  xl: { box: 'w-20 h-20', text: 'text-xl' },
};

function computeInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = 'md',
  ring,
  className,
  ...props
}: AvatarProps) {
  const { box, text } = sizes[size];
  const initials = computeInitials(name);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        ring && 'ring-2 ring-primary/20',
        box,
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || ''}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
          <span className={cn('font-semibold text-white', text)}>{initials}</span>
        </div>
      )}
    </div>
  );
}
