'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { Button, FormField, Input, Alert } from '@/components/ui';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { getApiError } from '@/lib/utils';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = 'firstName' | 'lastName' | 'email' | 'password';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const prefillEmail = searchParams.get('email');
  const { register } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<Fields, string>>({
    firstName: '', lastName: '', email: '', password: '',
  });
  const [touched, setTouched] = useState<Record<Fields, boolean>>({
    firstName: false, lastName: false, email: false, password: false,
  });

  const validateField = (field: Fields, value: string): string => {
    switch (field) {
      case 'firstName': return value.trim() ? '' : t('validation.firstNameRequired');
      case 'lastName': return value.trim() ? '' : t('validation.lastNameRequired');
      case 'email':
        if (!value) return t('validation.emailRequired');
        if (!EMAIL_RE.test(value)) return t('validation.emailInvalid');
        return '';
      case 'password':
        if (!value) return t('validation.passwordRequired');
        if (value.length < PASSWORD_MIN_LENGTH)
          return t('validation.passwordTooShort', { min: PASSWORD_MIN_LENGTH });
        return '';
    }
  };

  const handleBlur = (field: Fields, value: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldErrors((e) => ({ ...e, [field]: validateField(field, value) }));
  };

  const liveValidate = (field: Fields, value: string) => {
    if (touched[field]) {
      setFieldErrors((e) => ({ ...e, [field]: validateField(field, value) }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const values: Record<Fields, string> = { firstName, lastName, email, password };
    const errs = (Object.keys(values) as Fields[]).reduce(
      (acc, f) => ({ ...acc, [f]: validateField(f, values[f]) }),
      {} as Record<Fields, string>,
    );
    setFieldErrors(errs);
    setTouched({ firstName: true, lastName: true, email: true, password: true });
    if (Object.values(errs).some(Boolean)) return;

    setError('');
    setSubmitting(true);
    try {
      await register({ firstName, lastName, email, password });
      if (inviteToken) {
        router.push(
          `/auth/account-type?inviteToken=${encodeURIComponent(inviteToken)}`,
        );
      } else {
        router.push('/auth/account-type');
      }
    } catch (err) {
      setError(getApiError(err, t('errors.registrationFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Simple password strength indicator
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < PASSWORD_MIN_LENGTH ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const strengthLabel = ['', t('password.weak'), t('password.fair'), t('password.good'), t('password.strong')][strength];
  const strengthColor = ['', 'bg-error', 'bg-[var(--color-warning)]', 'bg-primary', 'bg-[var(--alert-success-text)]'][strength];

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 surface-card overflow-y-auto">
        <div className="max-w-lg mx-auto w-full">
          <span className="text-primary font-semibold text-sm tracking-wide uppercase">
            {t('joinUs')}
          </span>
          <h1 className="text-3xl font-bold font-heading mt-3 mb-2 text-heading">
            {t('createAccount')}
          </h1>
          <p className="text-sm mb-8 text-body">{t('createAccountSubtitle')}</p>

          {error && (
            <Alert variant="error" className="mb-5" onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('firstName')}
                error={touched.firstName ? fieldErrors.firstName : undefined}
              >
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); liveValidate('firstName', e.target.value); }}
                    onBlur={() => handleBlur('firstName', firstName)}
                    invalid={invalid}
                    leftIcon={<User size={15} />}
                    autoComplete="given-name"
                    placeholder="Jane"
                  />
                )}
              </FormField>
              <FormField
                label={t('lastName')}
                error={touched.lastName ? fieldErrors.lastName : undefined}
              >
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    type="text"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); liveValidate('lastName', e.target.value); }}
                    onBlur={() => handleBlur('lastName', lastName)}
                    invalid={invalid}
                    leftIcon={<User size={15} />}
                    autoComplete="family-name"
                    placeholder="Doe"
                  />
                )}
              </FormField>
            </div>

            {/* Email */}
            <FormField
              label={t('email')}
              error={touched.email ? fieldErrors.email : undefined}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); liveValidate('email', e.target.value); }}
                  onBlur={() => handleBlur('email', email)}
                  invalid={invalid}
                  leftIcon={<Mail size={16} />}
                  autoComplete="email"
                />
              )}
            </FormField>

            {/* Password */}
            <FormField
              label={t('passwordd')}
              error={touched.password ? fieldErrors.password : undefined}
            >
              {({ id, invalid }) => (
                <>
                  <Input
                    id={id}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); liveValidate('password', e.target.value); }}
                    onBlur={() => handleBlur('password', password)}
                    invalid={invalid}
                    leftIcon={<Lock size={16} />}
                    autoComplete="new-password"
                    rightSlot={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted hover:text-heading transition-colors p-0.5"
                        aria-label={showPassword ? t('aria.hidePassword') : t('aria.showPassword')}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${level <= strength ? strengthColor : 'bg-[var(--bg-tertiary)]'}`}
                          />
                        ))}
                      </div>
                      {strengthLabel && (
                        <p className="text-xs text-muted">
                          {t('password.strength')}:{' '}
                          <span className={`font-medium ${strength <= 1 ? 'text-error' : strength === 2 ? 'text-[var(--color-warning)]' : strength === 3 ? 'text-primary' : 'text-[var(--alert-success-text)]'}`}>
                            {strengthLabel}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </FormField>

            <Button type="submit" block size="lg" loading={submitting} disabled={submitting} className="rounded-2xl !mt-6">
              {t('createAccount')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
            <span className="text-sm text-body">{tc('or')}</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-3 rounded-2xl border border-theme font-medium text-sm flex items-center justify-center gap-3 text-heading transition-colors"
            style={{ backgroundColor: 'var(--input-bg)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--google-btn-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--input-bg)')}
          >
            <GoogleIcon />
            {t('signUpWithGoogle')}
          </button>

          <p className="text-center text-sm mt-6 text-body">
            {t('haveAccount')}{' '}
            <Link
              href={
                inviteToken
                  ? `/auth/login?inviteToken=${encodeURIComponent(inviteToken)}${prefillEmail ? `&email=${encodeURIComponent(prefillEmail)}` : ''}`
                  : '/auth/login'
              }
              className="text-primary font-semibold hover:underline"
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right — brand panel */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center">
        <div className="text-center px-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Image src="/Logo.png" alt="Logo" width={60} height={60} className="object-contain brightness-0 invert" />
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
