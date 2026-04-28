'use client';

import { useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type TernaryFilter = 'any' | 'yes' | 'no';

export interface TeamFilters {
  activity: TernaryFilter;
  projects: TernaryFilter;
  members: TernaryFilter;
}

export const DEFAULT_TEAM_FILTERS: TeamFilters = {
  activity: 'any',
  projects: 'any',
  members: 'any',
};

interface TeamFilterPopoverProps {
  open: boolean;
  onClose: () => void;
  filters: TeamFilters;
  onChange: (next: TeamFilters) => void;
}

/**
 * Three-axis filter popover for the Teams index page.
 *
 * Each axis is a tri-state (`any` / `yes` / `no`) so the user can
 * positively scope to "teams that share projects" *or* "teams that
 * don't share any project", without juggling two separate toggles.
 */
export default function TeamFilterPopover({
  open,
  onClose,
  filters,
  onChange,
}: TeamFilterPopoverProps) {
  const t = useTranslations('team.filters');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => onChange(DEFAULT_TEAM_FILTERS);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-80 rounded-2xl border border-theme surface-card shadow-lg z-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-primary" />
          <span className="text-sm font-semibold text-heading">{t('title')}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted hover:surface-tertiary hover:text-heading transition-colors"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
        <FilterGroup title={t('activity')}>
          <Chip
            label={t('anyActivity')}
            active={filters.activity === 'any'}
            onClick={() => onChange({ ...filters, activity: 'any' })}
          />
          <Chip
            label={t('hasPending')}
            active={filters.activity === 'yes'}
            onClick={() => onChange({ ...filters, activity: 'yes' })}
          />
          <Chip
            label={t('noPending')}
            active={filters.activity === 'no'}
            onClick={() => onChange({ ...filters, activity: 'no' })}
          />
        </FilterGroup>

        <FilterGroup title={t('projects')}>
          <Chip
            label={t('anyProjects')}
            active={filters.projects === 'any'}
            onClick={() => onChange({ ...filters, projects: 'any' })}
          />
          <Chip
            label={t('withProjects')}
            active={filters.projects === 'yes'}
            onClick={() => onChange({ ...filters, projects: 'yes' })}
          />
          <Chip
            label={t('withoutProjects')}
            active={filters.projects === 'no'}
            onClick={() => onChange({ ...filters, projects: 'no' })}
          />
        </FilterGroup>

        <FilterGroup title={t('members')}>
          <Chip
            label={t('anyMembers')}
            active={filters.members === 'any'}
            onClick={() => onChange({ ...filters, members: 'any' })}
          />
          <Chip
            label={t('withMembers')}
            active={filters.members === 'yes'}
            onClick={() => onChange({ ...filters, members: 'yes' })}
          />
          <Chip
            label={t('withoutMembers')}
            active={filters.members === 'no'}
            onClick={() => onChange({ ...filters, members: 'no' })}
          />
        </FilterGroup>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-theme">
        <button
          onClick={reset}
          className="text-xs text-body hover:text-heading transition-colors"
        >
          {t('reset')}
        </button>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
        >
          {t('apply')}
        </button>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
        active
          ? 'bg-primary text-white border-primary'
          : 'text-body border-theme hover:surface-tertiary'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Count of active filters (i.e. not in 'any' state). Used by the
 * trigger button to render its badge.
 */
export function countActiveTeamFilters(filters: TeamFilters): number {
  return (
    (filters.activity !== 'any' ? 1 : 0) +
    (filters.projects !== 'any' ? 1 : 0) +
    (filters.members !== 'any' ? 1 : 0)
  );
}
