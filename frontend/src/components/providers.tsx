'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useAuthStore } from '@/stores/auth-store';

/* ─────────────────────────────────────────────────────────
   THEME CONTEXT — single source of truth for theme state.
   Every component consuming useTheme() re-renders together
   when the theme changes, preventing stale state.
   ───────────────────────────────────────────────────────── */
type Theme = 'light' | 'dark';

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  /* Read persisted preference on mount */
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const preferred = stored || 'light';
    setThemeState(preferred);
    document.documentElement.setAttribute('data-theme', preferred);
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  /* Prevent flash of wrong theme on first render */
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/* ─────────────────────────────────────────────────────────
   ROOT PROVIDERS
   ───────────────────────────────────────────────────────── */
export function Providers({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <ThemeProvider>{children}</ThemeProvider>;
}
