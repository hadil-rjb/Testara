'use client';

import { useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ProjectFilters {
  environments: string[];
  statuses: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
}

interface FilterPopoverProps {
  open: boolean;
  onClose: () => void;
  filters: ProjectFilters;
  onChange: (next: ProjectFilters) => void;
  availableEnvironments: string[];
  availableStatuses: string[];
}

export default function FilterPopover({
  open,
  onClose,
  filters,
  onChange,
  availableEnvironments,
  availableStatuses,
}: FilterPopoverProps) {
  const t = useTranslations('projects.filters');
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

  const toggle = (key: 'environments' | 'statuses', value: string) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const setDateRange = (range: ProjectFilters['dateRange']) => {
    onChange({ ...filters, dateRange: range });
  };

  const reset = () => {
    onChange({ environments: [], statuses: [], dateRange: 'all' });
  };

  const activeCount =
    filters.environments.length +
    filters.statuses.length +
    (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 w-80 rounded-2xl border border-theme surface-card shadow-lg z-30"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-primary" />
          <span className="text-sm font-semibold text-heading">
            {t('title')}
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted hover:surface-tertiary hover:text-heading transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto">
        {/* Environment */}
        <FilterGroup title={t('environment')}>
          {availableEnvironments.map((env) => (
            <Chip
              key={env}
              label={env}
              active={filters.environments.includes(env)}
              onClick={() => toggle('environments', env)}
            />
          ))}
        </FilterGroup>

        {/* Status */}
        <FilterGroup title={t('status')}>
          {availableStatuses.map((s) => (
            <Chip
              key={s}
              label={s}
              active={filters.statuses.includes(s)}
              onClick={() => toggle('statuses', s)}
            />
          ))}
        </FilterGroup>

        {/* Date range */}
        <FilterGroup title={t('createdWithin')}>
          {(['all', 'today', 'week', 'month'] as const).map((range) => (
            <Chip
              key={range}
              label={t(`range_${range}`)}
              active={filters.dateRange === range}
              onClick={() => setDateRange(range)}
            />
          ))}
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
