'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Lock, Eye, EyeOff, Save, ShieldAlert } from 'lucide-react';

interface SecurityTabProps {
  onToast: (kind: 'success' | 'error', message: string) => void;
}

export default function SecurityTab({ onToast }: SecurityTabProps) {
  const t = useTranslations('settings.security');
  const { user, logout } = useAuthStore();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isGoogleOnly =
    (user as unknown as { isGoogleUser?: boolean })?.isGoogleUser === true;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (next.length < 8) {
      onToast('error', t('tooShort'));
      return;
    }
    if (next !== confirm) {
      onToast('error', t('mismatch'));
      return;
    }

    setSaving(true);
    try {
      await userApi.changePassword({
        currentPassword: current,
        newPassword: next,
      });
      setCurrent('');
      setNext('');
      setConfirm('');
      onToast('success', t('updated'));
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e.response?.status === 401) {
        onToast('error', t('currentIncorrect'));
      } else {
        onToast('error', e.response?.data?.message || 'Error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (isGoogleOnly) {
    return (
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex gap-4">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold font-heading text-heading mb-1">
              {t('title')}
            </h2>
            <p className="text-sm text-body">{t('googleUser')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-theme surface-card p-6">
        <h2 className="text-base font-semibold font-heading text-heading mb-1">
          {t('title')}
        </h2>
        <p className="text-sm text-body mb-5">{t('subtitle')}</p>

        <div className="space-y-4">
          <PasswordField
            label={t('currentPassword')}
            value={current}
            onChange={setCurrent}
            show={showCurrent}
            onToggleShow={() => setShowCurrent((v) => !v)}
            autoComplete="current-password"
          />
          <PasswordField
            label={t('newPassword')}
            value={next}
            onChange={setNext}
            show={showNext}
            onToggleShow={() => setShowNext((v) => !v)}
            autoComplete="new-password"
            strengthMeter
          />
          <PasswordField
            label={t('confirmPassword')}
            value={confirm}
            onChange={setConfirm}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            autoComplete="new-password"
            error={confirm && next !== confirm ? t('mismatch') : undefined}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !current || !next || !confirm}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {t('save')}
        </button>
      </div>

      <DangerZoneCard onLogout={logout} />
    </form>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  strengthMeter?: boolean;
  error?: string;
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  strengthMeter,
  error,
}: PasswordFieldProps) {
  const strength = strengthMeter ? computeStrength(value) : null;

  return (
    <div>
      <label className="block text-xs font-semibold text-heading mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border surface-input transition-all ${
          error
            ? 'border-error'
            : 'border-theme focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
        }`}
      >
        <Lock size={16} className="text-muted flex-shrink-0" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm outline-none text-heading"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="text-muted hover:text-heading transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {strengthMeter && value && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden surface-tertiary">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(strength?.score ?? 0) * 25}%`,
                backgroundColor: strength?.color,
              }}
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: strength?.color }}>
            {strength?.label}
          </span>
        </div>
      )}

      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

function DangerZoneCard({ onLogout }: { onLogout: () => void }) {
  const t = useTranslations('settings.dangerZone');

  return (
    <section className="rounded-2xl border border-error/30 surface-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold font-heading text-heading">
            {t('logout')}
          </h3>
          <p className="text-xs text-body mt-0.5">{t('logoutSubtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="px-4 py-2 rounded-xl border border-error/40 text-error text-sm font-semibold transition-colors hover:bg-error/10"
        >
          {t('logout')}
        </button>
      </div>
    </section>
  );
}

function computeStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#EF4444', '#F59E0B', '#EAB308', '#22C55E'];
  const idx = Math.max(0, Math.min(3, score - 1));
  return { score, label: labels[idx], color: colors[idx] };
}
