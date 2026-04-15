import { useEffect } from 'react';

/**
 * Fire `handler` when the user presses `Escape` and `enabled` is true.
 * Pairs naturally with `useClickOutside` for dismissable overlays.
 */
export function useEscapeKey(
  handler: () => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler, enabled]);
}
