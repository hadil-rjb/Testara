'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNotificationsStore } from '@/stores/notifications-store';
import NotificationItem from '@/components/notifications/NotificationItem';
import { useToast } from '@/hooks/useToast';
import { getApiError } from '@/lib/utils';
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
} from 'lucide-react';

type FilterKey = 'all' | 'unread' | 'invitations' | 'projects' | 'teams';

const FILTERS: { key: FilterKey; tKey: string }[] = [
  { key: 'all', tKey: 'filterAll' },
  { key: 'unread', tKey: 'filterUnread' },
  { key: 'invitations', tKey: 'filterInvitations' },
  { key: 'projects', tKey: 'filterProjects' },
  { key: 'teams', tKey: 'filterTeams' },
];

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const items = useNotificationsStore((s) => s.items);
  const loading = useNotificationsStore((s) => s.loading);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const fetch = useNotificationsStore((s) => s.fetch);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const clearAll = useNotificationsStore((s) => s.clearAll);
  const toast = useToast();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      switch (filter) {
        case 'unread':
          return !n.read;
        case 'invitations':
          return (
            n.type === 'invitation_received' ||
            n.type === 'invitation_accepted' ||
            n.type === 'invitation_declined'
          );
        case 'projects':
          return (
            n.type === 'project_access_granted' ||
            n.type === 'project_access_revoked'
          );
        case 'teams':
          return (
            n.type === 'team_membership_removed' ||
            n.type === 'team_role_changed' ||
            n.type === 'team_deleted'
          );
        default:
          return true;
      }
    });
  }, [items, filter]);

  const handleClearAll = async () => {
    try {
      await clearAll();
      toast.success(t('toast.cleared'));
      setConfirmingClear(false);
    } catch (err) {
      toast.error(getApiError(err, t('toast.clearFailed')));
    }
  };

  return (
    <div className="max-w-8xl mx-auto mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-heading flex items-center gap-2.5">
            {t('title')}
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-body mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetch()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary disabled:opacity-60"
            title={t('refresh')}
            aria-label={t('refresh')}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck size={14} />
            {t('markAllRead')}
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setConfirmingClear(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-error/30 text-sm font-medium text-error transition-colors hover:bg-error/5"
            >
              <Trash2 size={14} />
              {t('clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1 p-1 mb-5 rounded-xl surface-tertiary border border-theme w-fit overflow-x-auto">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-body hover:text-heading'
              }`}
            >
              {t(f.tKey)}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading && items.length === 0 ? (
        <div className="rounded-2xl border border-theme surface-card p-10 text-center text-sm text-muted">
          {t('loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-theme surface-card p-16 text-center">
          <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
            <Bell size={22} className="text-muted" />
          </div>
          <p className="text-sm font-medium text-heading mb-1">
            {filter === 'all' ? t('empty') : t('emptyForFilter')}
          </p>
          <p className="text-xs text-body">
            {filter === 'all' ? t('emptyHint') : t('emptyForFilterHint')}
          </p>
        </div>
      ) : (
        <ul className="rounded-2xl border border-theme surface-card overflow-hidden divide-y divide-theme">
          {filtered.map((item) => (
            <li key={item._id}>
              <NotificationItem item={item} />
            </li>
          ))}
        </ul>
      )}

      {/* Clear-all confirm */}
      {confirmingClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmingClear(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-theme surface-card p-6 m-4 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-heading mb-1">
              {t('confirmClearTitle')}
            </h3>
            <p className="text-sm text-body mb-5">{t('confirmClearDesc')}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmingClear(false)}
                className="px-4 py-2 rounded-xl border border-theme text-sm font-medium text-body hover:surface-tertiary transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-error text-white text-sm font-semibold transition-colors hover:opacity-90"
              >
                {t('clearAll')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
