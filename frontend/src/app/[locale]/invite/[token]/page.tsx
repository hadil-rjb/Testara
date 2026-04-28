'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { invitationApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/useToast';
import { getApiError } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  Users,
  Clock,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  LogIn,
} from 'lucide-react';
import type { InvitationPreview } from '@/types';

export default function InvitePage() {
  const params = useParams();
  const token = Array.isArray(params.token)
    ? params.token[0]
    : (params.token as string);

  const t = useTranslations('invite');
  const tTeam = useTranslations('team');
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<'notfound' | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await invitationApi.preview(token);
      setPreview(data);
    } catch {
      setLoadError('notfound');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const emailMatches =
    !!user &&
    !!preview &&
    user.email.toLowerCase() === preview.email.toLowerCase();

  const handleAccept = useCallback(async () => {
    if (!preview) return;
    setAccepting(true);
    try {
      await invitationApi.accept(token);
      setAccepted(true);
      toast.success(t('acceptedTitle'));
    } catch (err) {
      toast.error(getApiError(err));
      // refresh preview — status may have changed
      loadPreview();
    } finally {
      setAccepting(false);
    }
  }, [preview, token, toast, t, loadPreview]);

  // Auto-accept if user lands here already signed in with matching email
  // and the invitation is still pending. Useful after login redirect.
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      preview &&
      preview.status === 'pending' &&
      emailMatches &&
      !accepting &&
      !accepted
    ) {
      // sessionStorage flag so we only auto-accept once per session/token
      const key = `invite:autoaccept:${token}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        handleAccept();
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    preview,
    emailMatches,
    accepting,
    accepted,
    handleAccept,
    token,
  ]);

  /* ───── Loading ───── */
  if (loading || isLoading) {
    return (
      <InviteShell>
        <div className="animate-pulse space-y-4">
          <div className="h-14 w-14 rounded-full surface-tertiary mx-auto" />
          <div className="h-6 w-2/3 rounded surface-tertiary mx-auto" />
          <div className="h-4 w-5/6 rounded surface-tertiary mx-auto" />
        </div>
      </InviteShell>
    );
  }

  /* ───── Not found ───── */
  if (loadError === 'notfound' || !preview) {
    return (
      <InviteShell>
        <IconBubble color="error">
          <XCircle size={26} />
        </IconBubble>
        <Title>{t('notFoundTitle')}</Title>
        <Desc>{t('notFoundDesc')}</Desc>
        <Link href="/auth/login">
          <Button variant="ghost">{t('signInCta')}</Button>
        </Link>
      </InviteShell>
    );
  }

  /* ───── Accepted (just now or previously) ───── */
  if (accepted || preview.status === 'accepted') {
    return (
      <InviteShell>
        <IconBubble color="success">
          <CheckCircle2 size={26} />
        </IconBubble>
        <Title>
          {accepted ? t('acceptedTitle') : t('alreadyAcceptedTitle')}
        </Title>
        <Desc>
          {accepted
            ? t('acceptedDesc', { teamName: preview.teamName })
            : t('alreadyAcceptedDesc')}
        </Desc>
        <Button onClick={() => router.push('/dashboard')}>
          {t('goToDashboard')}
        </Button>
      </InviteShell>
    );
  }

  /* ───── Expired ───── */
  if (preview.status === 'expired') {
    return (
      <InviteShell>
        <IconBubble color="warning">
          <Clock size={26} />
        </IconBubble>
        <Title>{t('expiredTitle')}</Title>
        <Desc>{t('expiredDesc')}</Desc>
      </InviteShell>
    );
  }

  /* ───── Revoked ───── */
  if (preview.status === 'revoked') {
    return (
      <InviteShell>
        <IconBubble color="error">
          <XCircle size={26} />
        </IconBubble>
        <Title>{t('revokedTitle')}</Title>
        <Desc>{t('revokedDesc')}</Desc>
      </InviteShell>
    );
  }

  /* ───── Pending + signed in with wrong email ───── */
  if (isAuthenticated && user && !emailMatches) {
    return (
      <InviteShell>
        <IconBubble color="warning">
          <AlertTriangle size={26} />
        </IconBubble>
        <Title>{t('mismatchTitle')}</Title>
        <Desc>
          {t('mismatchDesc', {
            inviteEmail: preview.email,
            currentEmail: user.email,
          })}
        </Desc>
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            router.push(
              `/auth/login?inviteToken=${encodeURIComponent(token)}&email=${encodeURIComponent(preview.email)}`,
            );
          }}
        >
          {t('signOut')}
        </Button>
      </InviteShell>
    );
  }

  const roleLabel =
    preview.role === 'tester' ? tTeam('roleTester') : tTeam('roleViewer');

  /* ───── Pending + signed in with matching email ───── */
  if (isAuthenticated && emailMatches) {
    return (
      <InviteShell>
        <IconBubble color="primary">
          <Users size={26} />
        </IconBubble>
        <Title>{t('validTitleAuthed', { teamName: preview.teamName })}</Title>
        <Desc>
          {t('descAuthed', {
            inviter: preview.inviterName,
            role: roleLabel,
            teamName: preview.teamName,
          })}
        </Desc>
        <Button onClick={handleAccept} loading={accepting} disabled={accepting}>
          {accepting ? t('accepting') : t('acceptCta')}
        </Button>
      </InviteShell>
    );
  }

  /* ───── Pending + anonymous ───── */
  const qs = `?inviteToken=${encodeURIComponent(token)}&email=${encodeURIComponent(preview.email)}`;
  return (
    <InviteShell>
      <IconBubble color="primary">
        <Users size={26} />
      </IconBubble>
      <Title>{t('validTitleAnon', { teamName: preview.teamName })}</Title>
      <Desc>
        {t('descAnon', {
          inviter: preview.inviterName,
          email: preview.email,
          role: roleLabel,
        })}
      </Desc>
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-center">
        {preview.hasAccount ? (
          <Link href={`/auth/login${qs}`}>
            <Button leftIcon={<LogIn size={15} />}>{t('signInCta')}</Button>
          </Link>
        ) : (
          <>
            <Link href={`/auth/register${qs}`}>
              <Button leftIcon={<UserPlus size={15} />}>{t('signUpCta')}</Button>
            </Link>
            <Link href={`/auth/login${qs}`}>
              <Button variant="ghost" leftIcon={<LogIn size={15} />}>
                {t('signInCta')}
              </Button>
            </Link>
          </>
        )}
      </div>
    </InviteShell>
  );
}

/* ───── Layout helpers ───── */

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-auth-gradient">
      <div className="w-full max-w-min rounded-3xl px-8 py-16 shadow-lg surface-card text-center space-y-4">
        {children}
      </div>
    </div>
  );
}

function IconBubble({
  color,
  children,
}: {
  color: 'primary' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}) {
  const cls =
    color === 'success'
      ? 'bg-success/10 text-success'
      : color === 'warning'
        ? 'bg-warning/10 text-warning'
        : color === 'error'
          ? 'bg-error/10 text-error'
          : 'bg-primary/10 text-primary';
  return (
    <div
      className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${cls}`}
    >
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-xl font-bold font-heading text-heading">{children}</h1>
  );
}

function Desc({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-body">{children}</p>;
}
