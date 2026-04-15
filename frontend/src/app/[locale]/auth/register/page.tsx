'use client';

import { useState, FormEvent } from 'react';
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import AuthInput from '@/components/auth/AuthInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ firstName, lastName, email, password });
      router.push('/auth/account-type');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Registration failed';
      setError(message);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 surface-card">
        <div className="max-w-lg mx-auto w-full">
          <span className="text-primary font-semibold text-sm tracking-wide uppercase">
            {t('joinUs')}
          </span>
          <h1 className="text-3xl font-bold font-heading mt-3 mb-2 text-heading">
            {t('createAccount')}
          </h1>
          <p className="text-sm mb-8 text-body">
            {t('createAccountSubtitle')}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl alert-error text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <AuthInput
                label={t('firstName')}
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <AuthInput
                label={t('lastName')}
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <AuthInput
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <AuthInput
              label={t('password')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {isLoading ? '...' : t('createAccount')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
            <span className="text-sm text-body">{tc('or')}</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-3 rounded-2xl border border-theme font-medium text-sm flex items-center justify-center gap-3 text-heading transition-colors"
            style={{ backgroundColor: 'var(--input-bg)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--google-btn-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('signUpWithGoogle')}
          </button>

          <p className="text-center text-sm mt-6 text-body">
            {t('haveAccount')}{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Purple */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center">
        <div className="text-center px-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="object-contain brightness-0 invert"
            />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white mb-3">Testara</h2>
          <p className="text-white/70 text-sm max-w-xs mx-auto">
            AI-Powered QA Automation Platform
          </p>
        </div>
      </div>
    </div>
  );
}
