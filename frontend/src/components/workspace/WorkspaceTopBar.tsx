'use client';

import { ChevronDown, Share2, Globe, PanelRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WorkspaceTopBarProps {
  projectName: string;
  onToggleAgent: () => void;
  agentOpen: boolean;
}

export default function WorkspaceTopBar({
  projectName,
  onToggleAgent,
  agentOpen,
}: WorkspaceTopBarProps) {
  const t = useTranslations('workspace');

  return (
    <header
      className="flex items-center justify-between px-6 py-3 h-16 border-b border-theme flex-shrink-0"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Project name dropdown */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:surface-tertiary">
        <span className="font-semibold font-heading text-base text-heading truncate max-w-xs">
          {projectName}
        </span>
        <ChevronDown size={16} className="text-muted" />
      </button>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary"
          aria-label={t('share')}
        >
          <Share2 size={15} />
          <span className="hidden sm:inline">{t('share')}</span>
        </button>

        <button
          className="p-2.5 rounded-xl border border-theme text-body transition-colors hover:surface-tertiary"
          aria-label="Language"
        >
          <Globe size={16} />
        </button>

        <button
          onClick={onToggleAgent}
          className={`p-2.5 rounded-xl border transition-colors ${
            agentOpen
              ? 'border-primary text-primary surface-tertiary'
              : 'border-theme text-body hover:surface-tertiary'
          }`}
          aria-label="Toggle agent panel"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
}
