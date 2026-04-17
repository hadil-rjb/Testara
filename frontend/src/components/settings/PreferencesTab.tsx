'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from '@/components/providers';
import { useToast } from '@/hooks/useToast';
import { Sun, Moon, Check, Languages } from 'lucide-react';

type Lang = 'fr' | 'en';

export default function PreferencesTab() {
  const t = useTranslations('settings.preferences');
  const tc = useTranslations('common');
  const locale = useLocale() as Lang;
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { updateProfile } = useAuthStore();
  const toast = useToast();

  const [savingLang, setSavingLang] = useState<Lang | null>(null);
  const [savingTheme, setSavingTheme] = useState<'light' | 'dark' | null>(null);

  const handleLanguageChange = async (lang: Lang) => {
    if (lang === locale) return;
    setSavingLang(lang);
    try {
      await updateProfile({ languagePreference: lang });
      router.replace(pathname, { locale: lang });
      toast.success(t('saved'));
    } catch {
      toast.error(tc('langUpdateFailed'));
    } finally {
      setSavingLang(null);
    }
  };

  const handleThemeChange = async (mode: 'light' | 'dark') => {
    if (mode === theme) return;
    setSavingTheme(mode);
    try {
      setTheme(mode);
      await updateProfile({ themePreference: mode });
      toast.success(t('saved'));
    } catch {
      /* theme already applied locally — silent sync failure is acceptable */
    } finally {
      setSavingTheme(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Language */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Languages size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold font-heading text-heading">{t('language')}</h2>
            <p className="text-sm text-body mt-0.5">{t('languageSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LangOption flag="🇫🇷" label="Français" sub="French" active={locale === 'fr'} loading={savingLang === 'fr'} onClick={() => handleLanguageChange('fr')} />
          <LangOption flag="🇬🇧" label="English" sub="English" active={locale === 'en'} loading={savingLang === 'en'} onClick={() => handleLanguageChange('en')} />
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {theme === 'light' ? <Sun size={18} className="text-primary" /> : <Moon size={18} className="text-primary" />}
          </div>
          <div>
            <h2 className="text-base font-semibold font-heading text-heading">{t('theme')}</h2>
            <p className="text-sm text-body mt-0.5">{t('themeSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ThemeCard mode="light" label={t('themeLight')} active={theme === 'light'} loading={savingTheme === 'light'} onClick={() => handleThemeChange('light')} />
          <ThemeCard mode="dark" label={t('themeDark')} active={theme === 'dark'} loading={savingTheme === 'dark'} onClick={() => handleThemeChange('dark')} />
        </div>
      </section>
    </div>
  );
}

interface LangOptionProps {
  flag: string; label: string; sub: string; active: boolean; loading: boolean; onClick: () => void;
}

function LangOption({ flag, label, sub, active, loading, onClick }: LangOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
        active ? 'border-primary bg-primary/5' : 'border-theme hover:border-primary/30'
      } ${loading ? 'opacity-60' : ''}`}
    >
      <span className="text-2xl leading-none flex-shrink-0">{flag}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-heading">{label}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
      {loading ? (
        <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : active ? (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
          <Check size={12} strokeWidth={3} />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-theme" />
      )}
    </button>
  );
}

interface ThemeCardProps {
  mode: 'light' | 'dark'; label: string; active: boolean; loading: boolean; onClick: () => void;
}

function ThemeCard({ mode, label, active, loading, onClick }: ThemeCardProps) {
  const isLight = mode === 'light';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`relative overflow-hidden p-4 rounded-xl border-2 text-left transition-all ${
        active ? 'border-primary' : 'border-theme hover:border-primary/30'
      } ${loading ? 'opacity-60' : ''}`}
    >
      {/* Preview swatch */}
      <div
        className="h-20 rounded-lg mb-3 relative overflow-hidden border border-theme"
        style={{ background: isLight ? 'linear-gradient(135deg, #FFFFFF 0%, #F0EDFF 100%)' : 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 100%)' }}
      >
        <div className="absolute top-3 left-3 w-10 h-1.5 rounded-full" style={{ backgroundColor: isLight ? '#1A1A2E' : '#F1F1F6' }} />
        <div className="absolute top-6 left-3 w-16 h-1 rounded-full opacity-60" style={{ backgroundColor: isLight ? '#6B7280' : '#9CA3AF' }} />
        <div className="absolute bottom-3 left-3 w-5 h-5 rounded-full" style={{ backgroundColor: '#654CDE' }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: isLight ? '#F1F3F9' : '#242440' }}>
          {isLight ? <Sun size={10} className="text-[#1A1A2E]" /> : <Moon size={10} className="text-[#F1F1F6]" />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLight ? <Sun size={14} className="text-primary" /> : <Moon size={14} className="text-primary" />}
          <span className="text-sm font-semibold text-heading">{label}</span>
        </div>
        {loading ? (
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : active ? (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
            <Check size={12} strokeWidth={3} />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-theme" />
        )}
      </div>
    </button>
  );
}
