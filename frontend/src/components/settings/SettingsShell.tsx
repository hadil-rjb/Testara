'use client';

import { useTranslations } from 'next-intl';
import { User, Shield, Sparkles, Building2, LucideIcon } from 'lucide-react';

export type SettingsTab = 'profile' | 'security' | 'preferences' | 'account';

interface SettingsShellProps {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
  children: React.ReactNode;
}

export default function SettingsShell({
  active,
  onChange,
  children,
}: SettingsShellProps) {
  const t = useTranslations('settings');

  const tabs: { key: SettingsTab; label: string; icon: LucideIcon }[] = [
    { key: 'profile', label: t('tabs.profile'), icon: User },
    { key: 'account', label: t('tabs.account'), icon: Building2 },
    { key: 'security', label: t('tabs.security'), icon: Shield },
    { key: 'preferences', label: t('tabs.preferences'), icon: Sparkles },
  ];

  return (
    <div className="max-w-8xl mx-auto mt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-heading">
          {t('title')}
        </h1>
        <p className="text-sm text-body mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
        <nav className="flex lg:flex-col lg:w-56 flex-shrink-0 gap-1 overflow-x-auto lg:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
                  isActive
                    ? 'surface-tertiary text-primary'
                    : 'text-body hover:surface-tertiary'
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}
