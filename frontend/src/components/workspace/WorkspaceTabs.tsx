'use client';

import { Compass, FileCode, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type WorkspaceTab = 'exploration' | 'scenarios' | 'report';

interface WorkspaceTabsProps {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
}

export default function WorkspaceTabs({ active, onChange }: WorkspaceTabsProps) {
  const t = useTranslations('workspace.tabs');

  const tabs: { key: WorkspaceTab; label: string; icon: typeof Compass }[] = [
    { key: 'exploration', label: t('exploration'), icon: Compass },
    { key: 'scenarios', label: t('scenarios'), icon: FileCode },
    { key: 'report', label: t('report'), icon: BarChart3 },
  ];

  return (
    <div className="flex items-center gap-1 px-6 pt-4 border-b border-theme flex-shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? 'text-primary border-primary'
                : 'text-body border-transparent hover:text-heading'
            }`}
          >
            <Icon size={15} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
