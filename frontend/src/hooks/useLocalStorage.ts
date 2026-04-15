import { useCallback, useSyncExternalStore } from 'react';

/**
 * Persist React state in `localStorage`.
 * SSR-safe: returns `initialValue` on the server and during the first
 * render, then syncs to the stored value on hydration.
 *
 * Cross-tab updates are picked up through the native `storage` event,
 * and in-tab updates fan out via an internal listener set.
 *
 * @example
 * const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
 *   'sidebar-collapsed',
 *   false,
 * );
 */

// Shared module-level cache keeps `getSnapshot` referentially stable so
// `useSyncExternalStore` doesn't tear.
const snapshotCache = new Map<string, unknown>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  if (snapshotCache.has(key)) return snapshotCache.get(key) as T;
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw !== null ? (JSON.parse(raw) as T) : fallback;
    snapshotCache.set(key, parsed);
    return parsed;
  } catch {
    snapshotCache.set(key, fallback);
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          snapshotCache.delete(key);
          cb();
        }
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
      }
      return () => {
        listeners.delete(cb);
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', onStorage);
        }
      };
    },
    [key],
  );

  const getSnapshot = useCallback(
    () => read<T>(key, initialValue),
    [key, initialValue],
  );
  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = read<T>(key, initialValue);
      const resolved =
        typeof next === 'function' ? (next as (p: T) => T)(current) : next;
      snapshotCache.set(key, resolved);
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
      } catch {
        /* storage may be unavailable (Safari private mode, quota) */
      }
      notify();
    },
    [key, initialValue],
  );

  return [value, set];
}
