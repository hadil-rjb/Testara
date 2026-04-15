'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Fetches the current user on mount so any page can rely on
 * `useAuthStore().user` being populated (or `isAuthenticated === false`) by
 * the time it renders protected UI.
 *
 * This is a tiny, dedicated component (not a Context) because the store is
 * already global — we only need to trigger its hydration once.
 */
export function AuthHydrator({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
