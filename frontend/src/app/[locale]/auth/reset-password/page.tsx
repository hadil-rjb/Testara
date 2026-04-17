'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { authApi } from '@/lib/api';
import { Button, FormField, Input, Alert } from '@/components/ui';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { getApiError } from '@/lib/utils';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [fieldErrors, setFieldErrors] = useState({ password: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });

  const validatePassword = (v: string) => {
    if (!v) return t('validation.passwordRequired');
    if (v.length < PASSWORD_MIN_LENGTH) return t('validation.passwordTooShort', { min: PASSWORD_MIN_LENGTH });
    return '';
  };
  const validateConfirm = (v: string, pw: string) => {
    if (!v) return t('validation.confirmPasswordRequired');
    if (v !== pw) return t('validation.passwordMismatch');
    return '';
  };

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === 'password') setFieldErrors((e) => ({ ...e, password: validatePassword(password) }));
    else setFieldErrors((e) => ({ ...e, confirmPassword: validateConfirm(confirmPassword, password) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const pwErr = validatePassword(password);
    const cfErr = validateConfirm(confirmPassword, password);
    setFieldErrors({ password: pwErr, confirmPassword: cfErr });
    setTouched({ password: true, confirmPassword: true });
    if (pwErr || cfErr) return;

    if (!token) {
      setError(t('validation.invalidResetLink'));
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      router.push('/auth/login');
    } catch (err) {
      setError(getApiError(err, t('errors.resetFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-auth-gradient">
      <div className="w-full max-w-md rounded-3xl p-8 shadow-lg surface-card">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Lock size={26} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold font-heading text-center mb-2 text-heading">
          {t('resetPasswordTitle')}
        </h1>
        <p className="text-sm text-center mb-8 text-body">{t('resetPasswordDesc')}</p>

        {error && (
          <Alert variant="error" className="mb-5" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField
            label={t('newPassword')}
            error={touched.password ? fieldErrors.password : undefined}
          >
            {({ id, invalid }) => (
              <Input
                id={id}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) setFieldErrors((fe) => ({ ...fe, password: validatePassword(e.target.value) }));
                  if (touched.confirmPassword) setFieldErrors((fe) => ({ ...fe, confirmPassword: validateConfirm(confirmPassword, e.target.value) }));
                }}
                onBlur={() => handleBlur('password')}
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
            )}
          </FormField>

          <FormField
            label={t('confirmPassword')}
            error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
            success={
              touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword
                ? t('validation.passwordsMatch')
                : undefined
            }
          >
            {({ id, invalid, valid }) => (
              <Input
                id={id}
                type={showConfirm ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) setFieldErrors((fe) => ({ ...fe, confirmPassword: validateConfirm(e.target.value, password) }));
                }}
                onBlur={() => handleBlur('confirmPassword')}
                invalid={invalid}
                valid={valid}
                leftIcon={<Lock size={16} />}
                autoComplete="new-password"
                rightSlot={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-muted hover:text-heading transition-colors p-0.5"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            )}
          </FormField>

          <Button
            type="submit"
            block
            size="lg"
            loading={submitting}
            disabled={submitting}
            className="rounded-2xl"
          >
            {t('resetPassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}
