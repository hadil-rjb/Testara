'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import type { ThemePreference } from '@/types';

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

// In-tab subscribers — `storage` events only fire across tabs.
const themeListeners = new Set<() => void>();
function notifyTheme() {
  themeListeners.forEach((l) => l());
}

function readTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
  return stored === 'dark' ? 'dark' : 'light';
}

/**
 * Single source of truth for the active theme.
 * Persists the preference in `localStorage` and mirrors it on
 * `<html data-theme="…">` so CSS custom properties swap instantly.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const subscribe = useCallback((cb: () => void) => {
    themeListeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.theme) cb();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      themeListeners.delete(cb);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  const theme = useSyncExternalStore<ThemePreference>(
    subscribe,
    readTheme,
    () => 'light',
  );

  // Mirror the theme onto <html> so CSS variables swap. This effect only
  // touches an external system (the DOM) — it never calls setState.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.theme, next);
    }
    notifyTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
