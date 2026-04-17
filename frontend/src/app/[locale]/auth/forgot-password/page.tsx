'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { authApi } from '@/lib/api';
import { Button, FormField, Input, Alert } from '@/components/ui';
import { Mail, ArrowLeft } from 'lucide-react';
import { getApiError } from '@/lib/utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (v: string) => {
    if (!v) return t('validation.emailRequired');
    if (!EMAIL_RE.test(v)) return t('validation.emailInvalid');
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email);
    setEmailError(err);
    setEmailTouched(true);
    if (err) return;

    setError('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(getApiError(err, t('errors.forgotFailed')));
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
            <Mail size={26} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold font-heading text-center mb-2 text-heading">
          {t('forgotPasswordTitle')}
        </h1>
        <p className="text-sm text-center mb-8 text-body">{t('forgotPasswordDesc')}</p>

        {error && (
          <Alert variant="error" className="mb-5" onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {success ? (
          <Alert variant="success" title={t('forgot.checkInboxTitle')}>
            {t('forgot.checkInboxDesc', { email })}
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormField
              label={t('email')}
              error={emailTouched ? emailError : undefined}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTouched) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={() => {
                    setEmailTouched(true);
                    setEmailError(validateEmail(email));
                  }}
                  invalid={invalid}
                  leftIcon={<Mail size={16} />}
                  autoComplete="email"
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
              {t('sendResetLink')}
            </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={14} />
            {tc('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
