'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { authApi } from '@/lib/api';
import AuthInput from '@/components/auth/AuthInput';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-auth-gradient">
      <div className="w-full max-w-md rounded-3xl p-8 shadow-lg surface-card">
        {/* Key Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold font-heading text-center mb-2 text-heading">
          {t('forgotPasswordTitle')}
        </h1>
        <p className="text-sm text-center mb-8 text-body">
          {t('forgotPasswordDesc')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl alert-error text-sm text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl alert-success text-sm text-center">
            A reset link has been sent to your email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthInput
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {isSubmitting ? '...' : t('sendResetLink')}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
