'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useNotificationsStore } from '@/stores/notifications-store';
import { useToast } from '@/hooks/useToast';
import { formatRelativeTime, getApiError } from '@/lib/utils';
import type { NotificationItem as NotificationItemModel } from '@/lib/api';
import {
  UserPlus,
  CheckCircle2,
  XCircle,
  FolderOpen,
  FolderMinus,
  UserMinus,
  Shield,
  Trash2,
  X,
  Bell,
  Check,
  type LucideIcon,
} from 'lucide-react';

interface NotificationItemProps {
  item: NotificationItemModel;
  onAction?: () => void;
  compact?: boolean;
}

interface IconStyle {
  icon: LucideIcon;
  /** Tailwind classes for the icon's circular background tint. */
  surface: string;
  /** Tailwind classes for the icon colour. */
  color: string;
}

const ICON_BY_TYPE: Record<NotificationItemModel['type'], IconStyle> = {
  invitation_received: {
    icon: UserPlus,
    surface: 'bg-primary/10',
    color: 'text-primary',
  },
  invitation_accepted: {
    icon: CheckCircle2,
    surface: 'bg-success/10',
    color: 'text-success',
  },
  invitation_declined: {
    icon: XCircle,
    surface: 'bg-error/10',
    color: 'text-error',
  },
  project_access_granted: {
    icon: FolderOpen,
    surface: 'bg-success/10',
    color: 'text-success',
  },
  project_access_revoked: {
    icon: FolderMinus,
    surface: 'bg-error/10',
    color: 'text-error',
  },
  team_membership_removed: {
    icon: UserMinus,
    surface: 'bg-error/10',
    color: 'text-error',
  },
  team_role_changed: {
    icon: Shield,
    surface: 'bg-primary/10',
    color: 'text-primary',
  },
  team_deleted: {
    icon: Trash2,
    surface: 'bg-error/10',
    color: 'text-error',
  },
};

/**
 * For navigational notifications, where clicking the body should jump
 * the user to the relevant resource.
 */
function getDeepLink(item: NotificationItemModel): string | null {
  const data = item.data ?? {};
  const projectId = typeof data.projectId === 'string' ? data.projectId : null;
  const teamId = typeof data.teamId === 'string' ? data.teamId : null;
  switch (item.type) {
    case 'project_access_granted':
      return projectId ? `/workspace/${projectId}` : null;
    case 'invitation_accepted':
    case 'invitation_declined':
    case 'team_role_changed':
      return teamId ? `/dashboard/team/${teamId}` : null;
    default:
      return null;
  }
}

export default function NotificationItem({
  item,
  onAction,
  compact = false,
}: NotificationItemProps) {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const toast = useToast();
  const router = useRouter();
  const accept = useNotificationsStore((s) => s.accept);
  const decline = useNotificationsStore((s) => s.decline);
  const markRead = useNotificationsStore((s) => s.markRead);
  const dismiss = useNotificationsStore((s) => s.dismiss);

  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);

  const style = ICON_BY_TYPE[item.type] ?? {
    icon: Bell,
    surface: 'bg-primary/10',
    color: 'text-primary',
  };
  const Icon = style.icon;
  const deepLink = getDeepLink(item);
  const time = formatRelativeTime(item.createdAt, locale);

  const handleAccept = async () => {
    setBusy('accept');
    try {
      const res = await accept(item._id);
      toast.success(t('toast.accepted', { team: res.name }));
      onAction?.();
      router.push(`/dashboard/team/${res.teamId}`);
    } catch (err) {
      toast.error(getApiError(err, t('toast.acceptFailed')));
    } finally {
      setBusy(null);
    }
  };

  const handleDecline = async () => {
    setBusy('decline');
    try {
      await decline(item._id);
      toast.success(t('toast.declined'));
      onAction?.();
    } catch (err) {
      toast.error(getApiError(err, t('toast.declineFailed')));
    } finally {
      setBusy(null);
    }
  };

  const handleClick = () => {
    if (!item.read) void markRead(item._id);
    onAction?.();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void dismiss(item._id);
  };

  const inner = (
    <div
      className={`relative flex gap-3 px-4 py-3 transition-colors ${
        item.read ? '' : 'bg-primary/[0.04]'
      } ${deepLink || !item.actionable ? 'hover:surface-tertiary cursor-pointer' : ''}`}
    >
      {/* Unread dot */}
      {!item.read && (
        <span
          className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${style.surface}`}
      >
        <Icon size={16} className={style.color} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            item.read ? 'text-body' : 'text-heading font-medium'
          }`}
        >
          {item.title}
        </p>
        {item.message && (
          <p className="text-xs text-muted mt-0.5 leading-snug">{item.message}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[11px] text-muted">{time}</span>
        </div>

        {/* Action buttons for actionable invitations */}
        {item.actionable && item.type === 'invitation_received' && (
          <div className="flex items-center gap-2 mt-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAccept}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-wait"
            >
              <Check size={13} strokeWidth={2.5} />
              {busy === 'accept' ? t('actions.accepting') : t('actions.accept')}
            </button>
            <button
              onClick={handleDecline}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme text-body text-xs font-semibold transition-colors hover:surface-tertiary disabled:opacity-60 disabled:cursor-wait"
            >
              <X size={13} strokeWidth={2.5} />
              {busy === 'decline' ? t('actions.declining') : t('actions.decline')}
            </button>
          </div>
        )}
      </div>

      {/* Dismiss */}
      {!compact && (
        <button
          onClick={handleDismiss}
          className="self-start w-6 h-6 flex items-center justify-center rounded-md text-muted opacity-0 group-hover:opacity-100 hover:text-heading hover:surface-tertiary transition-all flex-shrink-0"
          aria-label={t('dismiss')}
          title={t('dismiss')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );

  if (deepLink && !item.actionable) {
    return (
      <Link href={deepLink} onClick={handleClick} className="group block">
        {inner}
      </Link>
    );
  }

  return (
    <div role="button" tabIndex={0} onClick={handleClick} className="group block">
      {inner}
    </div>
  );
}
