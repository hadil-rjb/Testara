'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useNotificationsStore } from '@/stores/notifications-store';
import NotificationItem from './NotificationItem';
import { Bell, CheckCheck, Settings2 } from 'lucide-react';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Floating popover anchored under the topbar bell. Shows the most
 * recent notifications, with bulk-action buttons in the header and a
 * link to the full /dashboard/notifications page in the footer.
 */
export default function NotificationsPanel({
  open,
  onClose,
}: NotificationsPanelProps) {
  const t = useTranslations('notifications');
  const items = useNotificationsStore((s) => s.items);
  const loading = useNotificationsStore((s) => s.loading);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const fetch = useNotificationsStore((s) => s.fetch);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  const panelRef = useRef<HTMLDivElement>(null);

  // Refetch every time the panel opens — cheap and gives the user the
  // freshest list at the moment they actually look.
  useEffect(() => {
    if (!open) return;
    void fetch();
  }, [open, fetch]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // The bell button itself is outside the panel, so we let it own
        // its own toggle; only react to clicks elsewhere.
        const target = e.target as HTMLElement;
        if (!target.closest('[data-notif-bell]')) onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t('title')}
      className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-theme surface-card shadow-card-hover z-40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-heading">{t('title')}</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            title={t('markAllRead')}
          >
            <CheckCheck size={13} />
            {t('markAllRead')}
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[440px] overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="px-4 py-10 text-center text-xs text-muted">
            {t('loading')}
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-theme">
            {items.slice(0, 12).map((item) => (
              <li key={item._id}>
                <NotificationItem item={item} onAction={onClose} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-theme px-3 py-2 flex items-center justify-between">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="text-xs font-medium text-primary hover:underline px-2 py-1"
        >
          {t('viewAll')}
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = useTranslations('notifications');
  return (
    <div className="px-4 py-10 text-center">
      <div className="w-12 h-12 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-3">
        <Bell size={18} className="text-muted" />
      </div>
      <p className="text-sm font-medium text-heading mb-0.5">{t('empty')}</p>
      <p className="text-xs text-muted">{t('emptyHint')}</p>
    </div>
  );
}
