'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useAuthStore } from '@/stores/auth-store';
import NotificationsPanel from './NotificationsPanel';

const POLL_INTERVAL_MS = 30_000;

/**
 * The bell icon in the topbar. Owns:
 *   - polling the unread count every 30s while the user is signed in
 *   - rendering the unread badge
 *   - toggling the popover
 *
 * The popover refetches the full list on open, so this only needs the
 * lightweight count endpoint to keep the badge fresh between visits.
 */
export default function NotificationsBell() {
  const { isAuthenticated } = useAuthStore();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchUnreadCount();
    const id = window.setInterval(() => {
      void fetchUnreadCount();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated, fetchUnreadCount]);

  // Refresh when the tab regains focus — common UX expectation.
  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => {
      void fetchUnreadCount();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, fetchUnreadCount]);

  const badge = unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : '';

  return (
    <div className="relative">
      <button
        data-notif-bell
        onClick={() => setOpen((v) => !v)}
        className="icon-btn relative"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white ring-2"
            style={{
              backgroundColor: 'var(--color-error)',
              // @ts-expect-error -- CSS var for ringColor
              '--tw-ring-color': 'var(--bg-primary)',
            }}
          >
            {badge}
          </span>
        )}
      </button>

      <NotificationsPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
