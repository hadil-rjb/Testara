import { api } from './client';

/**
 * Mirrors `NotificationType` on the backend.
 * Keep in sync with backend/src/notifications/schemas/notification.schema.ts.
 */
export type NotificationType =
  | 'invitation_received'
  | 'invitation_accepted'
  | 'invitation_declined'
  | 'project_access_granted'
  | 'project_access_revoked'
  | 'team_membership_removed'
  | 'team_role_changed'
  | 'team_deleted';

export interface NotificationItem {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  read: boolean;
  actionable: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = {
  list: (unreadOnly = false) =>
    api.get<NotificationItem[]>('/notifications', {
      params: unreadOnly ? { unreadOnly: 1 } : undefined,
    }),
  unreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  dismiss: (id: string) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications'),

  // Invitation actions driven by notification id (in-app flow).
  accept: (id: string) =>
    api.post<{ teamId: string; name: string }>(`/notifications/${id}/accept`),
  decline: (id: string) =>
    api.post<{ success: true }>(`/notifications/${id}/decline`),
};
