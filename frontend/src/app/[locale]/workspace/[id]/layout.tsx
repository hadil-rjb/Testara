'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from '@/i18n/routing';
import { Sidebar } from '@/components/layout';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && !user.onboardingCompleted) {
      router.push('/auth/account-type');
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-secondary">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.onboardingCompleted) {
    return null;
  }

  return (
    <div className="h-screen flex surface-secondary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex min-w-0">{children}</div>
    </div>
  );
}
