import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reactively subscribe to a CSS media query.
 * SSR-safe — returns `false` on the server.
 *
 * Built on `useSyncExternalStore` so React stays in sync with the media
 * query list without ever calling `setState` inside an effect.
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
