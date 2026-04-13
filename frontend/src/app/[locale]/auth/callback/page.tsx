'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTokens, fetchUser } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      fetchUser().then(() => {
        const user = useAuthStore.getState().user;
        router.push(user?.onboardingCompleted ? '/dashboard' : '/auth/account-type');
      });
    } else {
      router.push('/auth/login');
    }
  }, [searchParams, setTokens, fetchUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-gradient">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-body">Redirecting...</p>
      </div>
    </div>
  );
}
