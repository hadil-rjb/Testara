import { create } from 'zustand';
import { notificationApi, type NotificationItem } from '@/lib/api';

/**
 * Centralised notifications state.
 *
 * Multiple components observe this slice — the bell badge in the topbar,
 * the notifications popover, the full-list page — so we keep all reads
 * and mutations in one place to avoid stale-cache bugs across views.
 */
interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // ──────────────── Read ────────────────
  fetch: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;

  // ──────────────── Local mutations (optimistic) ────────────────
  upsertLocal: (item: NotificationItem) => void;
  removeLocal: (id: string) => void;

  // ──────────────── Server mutations ────────────────
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  accept: (id: string) => Promise<{ teamId: string; name: string }>;
  decline: (id: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await notificationApi.list();
      const items = Array.isArray(data) ? data : [];
      set({
        items,
        unreadCount: items.filter((n) => !n.read).length,
        loading: false,
      });
    } catch {
      set({ loading: false, error: 'fetch_failed' });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationApi.unreadCount();
      set({ unreadCount: data?.count ?? 0 });
    } catch {
      // Silent — the badge will catch up on the next tick.
    }
  },

  upsertLocal: (item) => {
    const { items } = get();
    const idx = items.findIndex((n) => n._id === item._id);
    const next = idx === -1 ? [item, ...items] : items.map((n) => (n._id === item._id ? item : n));
    set({ items: next, unreadCount: next.filter((n) => !n.read).length });
  },

  removeLocal: (id) => {
    const next = get().items.filter((n) => n._id !== id);
    set({ items: next, unreadCount: next.filter((n) => !n.read).length });
  },

  markAllRead: async () => {
    // Optimistic
    const previous = get().items;
    set({
      items: previous.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
    try {
      await notificationApi.markAllRead();
    } catch {
      set({ items: previous, unreadCount: previous.filter((n) => !n.read).length });
    }
  },

  markRead: async (id) => {
    const previous = get().items;
    const next = previous.map((n) => (n._id === id ? { ...n, read: true } : n));
    set({ items: next, unreadCount: next.filter((n) => !n.read).length });
    try {
      await notificationApi.markRead(id);
    } catch {
      set({ items: previous, unreadCount: previous.filter((n) => !n.read).length });
    }
  },

  dismiss: async (id) => {
    const previous = get().items;
    const next = previous.filter((n) => n._id !== id);
    set({ items: next, unreadCount: next.filter((n) => !n.read).length });
    try {
      await notificationApi.dismiss(id);
    } catch {
      set({ items: previous, unreadCount: previous.filter((n) => !n.read).length });
    }
  },

  clearAll: async () => {
    const previous = get().items;
    set({ items: [], unreadCount: 0 });
    try {
      await notificationApi.clearAll();
    } catch {
      set({ items: previous, unreadCount: previous.filter((n) => !n.read).length });
    }
  },

  accept: async (id) => {
    const { data } = await notificationApi.accept(id);
    // The notification is now resolved — flip read + drop the action chip.
    const next = get().items.map((n) =>
      n._id === id ? { ...n, read: true, actionable: false } : n,
    );
    set({ items: next, unreadCount: next.filter((n) => !n.read).length });
    return data;
  },

  decline: async (id) => {
    await notificationApi.decline(id);
    const next = get().items.map((n) =>
      n._id === id ? { ...n, read: true, actionable: false } : n,
    );
    set({ items: next, unreadCount: next.filter((n) => !n.read).length });
  },
}));
