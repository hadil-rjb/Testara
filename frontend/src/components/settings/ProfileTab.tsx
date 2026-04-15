'use client';

import { useRef, useState, ChangeEvent, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { Camera, Trash2, Save, Mail, User } from 'lucide-react';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface ProfileTabProps {
  onToast: (kind: 'success' | 'error', message: string) => void;
}

export default function ProfileTab({ onToast }: ProfileTabProps) {
  const t = useTranslations('settings.profile');
  const { user, updateProfile } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onToast('error', t('invalidImage'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      onToast('error', t('avatarTooLarge'));
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setAvatar(dataUrl);
  };

  const removeAvatar = () => setAvatar(undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        avatar: avatar ?? '',
      });
      onToast('success', t('saved'));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Error';
      onToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    firstName !== (user?.firstName ?? '') ||
    lastName !== (user?.lastName ?? '') ||
    email !== (user?.email ?? '') ||
    avatar !== (user?.avatar ?? undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar card */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <h2 className="text-base font-semibold font-heading text-heading mb-1">
          {t('avatarTitle')}
        </h2>
        <p className="text-sm text-body mb-5">{t('avatarSubtitle')}</p>

        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/15">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{initials}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary"
            >
              <Camera size={15} />
              {t('upload')}
            </button>
            {avatar && (
              <button
                type="button"
                onClick={removeAvatar}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-error transition-colors hover:surface-tertiary"
              >
                <Trash2 size={15} />
                {t('remove')}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </section>

      {/* Fields card */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <h2 className="text-base font-semibold font-heading text-heading mb-1">
          {t('title')}
        </h2>
        <p className="text-sm text-body mb-5">{t('subtitle')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            icon={User}
            label={t('firstName')}
            value={firstName}
            onChange={setFirstName}
            required
          />
          <Field
            icon={User}
            label={t('lastName')}
            value={lastName}
            onChange={setLastName}
            required
          />
          <div className="sm:col-span-2">
            <Field
              icon={Mail}
              label={t('email')}
              type="email"
              value={email}
              onChange={setEmail}
              required
              hint={t('emailHint')}
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !dirty}
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
    </form>
  );
}

interface FieldProps {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  required,
  hint,
}: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-heading mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-theme surface-input transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Icon size={16} className="text-muted flex-shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="flex-1 bg-transparent text-sm outline-none text-heading"
        />
      </div>
      {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}
