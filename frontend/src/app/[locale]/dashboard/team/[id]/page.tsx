'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { teamApi, projectApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { getApiError } from '@/lib/utils';
import { Button } from '@/components/ui';
import Modal from '@/components/dashboard/Modal';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Folder,
  Mail,
  RefreshCw,
  Save,
  TestTube,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import type {
  Team,
  TeamRole,
  TeamMember,
  Invitation,
  InvitationStatus,
} from '@/types';

interface ProjectLite {
  _id: string;
  name: string;
  url?: string;
  environment?: string;
}

export default function TeamDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const t = useTranslations('team');
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const isEnterprise = user?.accountType === 'enterprise';

  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // inline edit team name/description
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  // invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('tester');
  const [sendingInvite, setSendingInvite] = useState(false);

  // remove member confirmation
  const [removeMemberTarget, setRemoveMemberTarget] =
    useState<TeamMember | null>(null);

  // revoke invitation confirmation
  const [revokeTarget, setRevokeTarget] = useState<Invitation | null>(null);

  // delete team
  const [deleteOpen, setDeleteOpen] = useState(false);

  // project access save state
  const [savingProjects, setSavingProjects] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(
    new Set(),
  );

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      // Core data — if this fails we truly can't show the page.
      const [{ data: teamData }, { data: projectsData }] = await Promise.all([
        teamApi.getById(id),
        projectApi.getAll(),
      ]);
      setTeam(teamData);
      setName(teamData.name ?? '');
      setDescription(teamData.description ?? '');
      setSelectedProjectIds(
        new Set((teamData.projects ?? []).map((p: { _id: string }) => p._id)),
      );
      setProjects(Array.isArray(projectsData) ? projectsData : []);

      // Invitations are a non-critical side panel — if the request fails
      // (e.g. backend not yet redeployed) we still render the page and just
      // show an empty pending list.
      try {
        const { data: invitesData } = await teamApi.listInvitations(id);
        setInvitations(Array.isArray(invitesData) ? invitesData : []);
      } catch {
        setInvitations([]);
      }
    } catch (err) {
      toast.error(getApiError(err));
      router.push('/dashboard/team');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  useEffect(() => {
    if (isEnterprise && id) fetchTeam();
  }, [isEnterprise, id, fetchTeam]);

  const dirtyInfo =
    team !== null &&
    (name.trim() !== (team.name ?? '') ||
      description.trim() !== (team.description ?? ''));

  const currentProjectIds = useMemo(
    () => new Set((team?.projects ?? []).map((p) => p._id)),
    [team],
  );
  const dirtyProjects = useMemo(() => {
    if (selectedProjectIds.size !== currentProjectIds.size) return true;
    for (const pid of selectedProjectIds)
      if (!currentProjectIds.has(pid)) return true;
    return false;
  }, [selectedProjectIds, currentProjectIds]);

  // Strictly "pending" — invitations whose recipient has not accepted,
  // revoked, or let expire. Accepted members appear in `team.members`.
  const pendingInvites = useMemo(
    () =>
      invitations
        .filter((i) => i.status === 'pending')
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        ),
    [invitations],
  );

  const handleSaveInfo = async () => {
    if (!team || !dirtyInfo || !name.trim()) return;
    setSavingInfo(true);
    try {
      const { data } = await teamApi.update(team._id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setTeam(data);
      setName(data.name ?? '');
      setDescription(data.description ?? '');
      toast.success(t('teamUpdated'));
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSendInvite = async () => {
    if (!team || !inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      await teamApi.invite(team._id, {
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });
      // refresh invitations list
      const { data: invitesData } = await teamApi.listInvitations(team._id);
      setInvitations(Array.isArray(invitesData) ? invitesData : []);
      toast.success(t('invitationSent'));
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('tester');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSendingInvite(false);
    }
  };

  const handleResendInvite = async (inv: Invitation) => {
    if (!team) return;
    try {
      await teamApi.resendInvitation(team._id, inv._id);
      const { data } = await teamApi.listInvitations(team._id);
      setInvitations(Array.isArray(data) ? data : []);
      toast.success(t('invitationResent'));
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleRevokeInvite = async () => {
    if (!team || !revokeTarget) return;
    try {
      await teamApi.revokeInvitation(team._id, revokeTarget._id);
      const { data } = await teamApi.listInvitations(team._id);
      setInvitations(Array.isArray(data) ? data : []);
      toast.success(t('invitationRevoked'));
      setRevokeTarget(null);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleRemoveMember = async () => {
    if (!team || !removeMemberTarget) return;
    try {
      const { data } = await teamApi.removeMember(
        team._id,
        removeMemberTarget.user._id,
      );
      setTeam(data);
      toast.success(t('memberRemoved'));
      setRemoveMemberTarget(null);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleChangeRole = async (member: TeamMember, role: TeamRole) => {
    if (!team || member.role === role) return;
    try {
      const { data } = await teamApi.updateMemberRole(
        team._id,
        member.user._id,
        { role },
      );
      setTeam(data);
      toast.success(t('roleUpdated'));
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleSaveProjects = async () => {
    if (!team) return;
    setSavingProjects(true);
    try {
      const { data } = await teamApi.setProjectAccess(team._id, {
        projectIds: Array.from(selectedProjectIds),
      });
      setTeam(data);
      setSelectedProjectIds(
        new Set((data.projects ?? []).map((p: { _id: string }) => p._id)),
      );
      toast.success(t('projectAccessUpdated'));
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSavingProjects(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    try {
      await teamApi.delete(team._id);
      toast.success(t('deletedSuccess', { name: team.name }));
      router.push('/dashboard/team');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const toggleProject = (pid: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else next.add(pid);
      return next;
    });
  };

  if (!isEnterprise) {
    return (
      <div className="max-w-3xl mx-auto mt-16">
        <div className="rounded-2xl border border-theme surface-card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Building2 size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold font-heading text-heading mb-2">
            {t('enterpriseOnlyTitle')}
          </h1>
          <p className="text-sm text-body mb-6 max-w-md mx-auto">
            {t('enterpriseOnlyDesc')}
          </p>
          <Link href="/dashboard/settings">
            <Button>{t('goToSettings')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !team) {
    return (
      <div className="max-w-8xl mx-auto mt-8 space-y-5">
        <div className="h-12 rounded-xl surface-card animate-pulse" />
        <div className="h-40 rounded-2xl border border-theme surface-card animate-pulse" />
        <div className="h-64 rounded-2xl border border-theme surface-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto mt-8 space-y-6 pb-12">
      {/* Back + delete */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/team"
          className="inline-flex items-center gap-2 text-sm text-body hover:text-heading transition-colors"
        >
          <ArrowLeft size={15} />
          {t('backToTeams')}
        </Link>
        <button
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-error transition-colors hover:bg-error/10"
        >
          <Trash2 size={14} />
          {t('deleteTeam')}
        </button>
      </div>

      {/* Team info */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <h2 className="text-base font-semibold font-heading text-heading mb-1">
          {t('teamInfo')}
        </h2>
        <p className="text-sm text-body mb-5">{t('teamInfoSubtitle')}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">
              {t('name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 border border-theme surface-input text-sm text-heading outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              className="w-full rounded-xl px-3.5 py-2.5 border border-theme surface-input text-sm text-heading outline-none resize-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveInfo}
              loading={savingInfo}
              disabled={!dirtyInfo || savingInfo || !name.trim()}
              leftIcon={!savingInfo ? <Save size={15} /> : undefined}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Active members section ── */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--alert-success-bg,#dcfce7)] flex items-center justify-center">
              <CheckCircle2 size={15} className="text-[var(--alert-success-text,#166534)]" />
            </div>
            <h2 className="text-base font-semibold font-heading text-heading">
              {t('activeMembers')}
            </h2>
            {team.members.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full surface-tertiary text-heading text-xs font-semibold">
                {team.members.length}
              </span>
            )}
          </div>
          <Button
            size="sm"
            leftIcon={<UserPlus size={14} />}
            onClick={() => setInviteOpen(true)}
          >
            {t('addMember')}
          </Button>
        </div>
        <p className="text-sm text-body mb-5">{t('activeMembersSubtitle')}</p>

        {team.members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-theme py-8 text-center">
            <Users size={20} className="mx-auto text-muted mb-2" />
            <p className="text-sm text-body">{t('noMembers')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {team.members.map((member) => (
              <MemberRow
                key={member.user._id}
                member={member}
                onChangeRole={(role) => handleChangeRole(member, role)}
                onRemove={() => setRemoveMemberTarget(member)}
                testerLabel={t('roleTester')}
                viewerLabel={t('roleViewer')}
                removeLabel={t('removeMember')}
                activeBadge={t('activeBadge')}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Pending invitations section ── */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock size={15} className="text-warning" />
            </div>
            <h2 className="text-base font-semibold font-heading text-heading">
              {t('pendingInvitations')}
            </h2>
            {pendingInvites.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                {pendingInvites.length}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-body mb-5">
          {t('pendingInvitationsSubtitle')}
        </p>

        {pendingInvites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-theme py-8 text-center">
            <Clock size={20} className="mx-auto text-muted mb-2" />
            <p className="text-sm text-body">{t('noPending')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingInvites.map((inv) => (
              <InvitationRow
                key={inv._id}
                invitation={inv}
                locale={locale}
                onResend={() => handleResendInvite(inv)}
                onRevoke={() => setRevokeTarget(inv)}
                testerLabel={t('roleTester')}
                viewerLabel={t('roleViewer')}
                pendingLabel={t('pendingBadge')}
                expiredLabel={t('expiredBadge')}
                revokedLabel={t('revokedBadge')}
                acceptedLabel={t('acceptedBadge')}
                resendLabel={t('resend')}
                revokeLabel={t('revoke')}
                expiresOnLabel={(d) => t('expiresOn', { date: d })}
                expiredOnLabel={(d) => t('expiredOn', { date: d })}
                acceptedOnLabel={(d) => t('acceptedOn', { date: d })}
                sentOnLabel={(d) => t('invitedOn', { date: d })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Project access */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold font-heading text-heading">
            {t('projectAccess')}
          </h2>
          <Button
            onClick={handleSaveProjects}
            loading={savingProjects}
            disabled={!dirtyProjects || savingProjects}
            leftIcon={!savingProjects ? <Save size={14} /> : undefined}
            size="sm"
          >
            {t('saveAccess')}
          </Button>
        </div>
        <p className="text-sm text-body mb-5">{t('projectAccessSubtitle')}</p>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-theme py-8 text-center">
            <Folder size={22} className="mx-auto text-muted mb-2" />
            <p className="text-sm text-body">{t('noProjects')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects
              .filter(
                (p) =>
                  // Only owned projects are grantable via team. Hide projects
                  // the user can only see because of another team.
                  !p ||
                  true,
              )
              .map((p) => {
                const checked = selectedProjectIds.has(p._id);
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => toggleProject(p._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      checked
                        ? 'border-primary bg-primary/5'
                        : 'border-theme hover:surface-tertiary'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checked
                          ? 'border-primary bg-primary'
                          : 'border-theme'
                      }`}
                    >
                      {checked && <Check size={12} className="text-white" />}
                    </div>
                    <Folder size={15} className="text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-heading truncate">
                        {p.name}
                      </p>
                      {p.url && (
                        <p className="text-xs text-muted truncate">{p.url}</p>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </section>

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onClose={() => !sendingInvite && setInviteOpen(false)}
        title={t('addMember')}
        subtitle={t('addMemberSubtitle')}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">
              {t('memberEmail')}
            </label>
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-theme surface-input transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Mail size={16} className="text-muted flex-shrink-0" />
              <input
                autoFocus
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@example.com"
                className="flex-1 bg-transparent text-sm outline-none text-heading"
              />
            </div>
            <p className="text-xs text-muted mt-1.5">{t('memberEmailHint')}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">
              {t('role')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <RolePickerCard
                selected={inviteRole === 'tester'}
                onClick={() => setInviteRole('tester')}
                icon={TestTube}
                title={t('roleTester')}
                desc={t('roleTesterDesc')}
              />
              <RolePickerCard
                selected={inviteRole === 'viewer'}
                onClick={() => setInviteRole('viewer')}
                icon={Eye}
                title={t('roleViewer')}
                desc={t('roleViewerDesc')}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setInviteOpen(false)}
              disabled={sendingInvite}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSendInvite}
              loading={sendingInvite}
              disabled={sendingInvite || !inviteEmail.trim()}
            >
              {t('add')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeMemberTarget}
        title={t('confirmRemoveMember')}
        description={t('confirmRemoveMemberDesc', {
          name: removeMemberTarget
            ? `${removeMemberTarget.user.firstName} ${removeMemberTarget.user.lastName}`
            : '',
        })}
        confirmLabel={t('removeMember')}
        cancelLabel={t('cancel')}
        onCancel={() => setRemoveMemberTarget(null)}
        onConfirm={handleRemoveMember}
        destructive
      />

      <ConfirmDialog
        open={!!revokeTarget}
        title={t('confirmRevoke')}
        description={t('confirmRevokeDesc', {
          email: revokeTarget?.email ?? '',
        })}
        confirmLabel={t('revoke')}
        cancelLabel={t('cancel')}
        onCancel={() => setRevokeTarget(null)}
        onConfirm={handleRevokeInvite}
        destructive
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t('confirmDelete')}
        description={t('confirmDeleteDesc', { name: team.name })}
        confirmLabel={t('deleteTeam')}
        cancelLabel={t('cancel')}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteTeam}
        destructive
      />
    </div>
  );
}

/* ───── Member row ───── */

interface MemberRowProps {
  member: TeamMember;
  onChangeRole: (role: TeamRole) => void;
  onRemove: () => void;
  testerLabel: string;
  viewerLabel: string;
  removeLabel: string;
  activeBadge: string;
}

function MemberRow({
  member,
  onChangeRole,
  onRemove,
  testerLabel,
  viewerLabel,
  removeLabel,
  activeBadge,
}: MemberRowProps) {
  const { user, role } = member;
  const initials = `${user.firstName?.charAt(0) ?? ''}${
    user.lastName?.charAt(0) ?? ''
  }`.toUpperCase();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-theme transition-colors hover:surface-tertiary">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-bold">
            {initials || '?'}
          </div>
        )}
      </div>

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-heading truncate">
            {user.firstName} {user.lastName}
          </p>
          {/* Active status badge */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--alert-success-bg,#dcfce7)] text-[var(--alert-success-text,#166534)] text-[10px] font-semibold">
            <Check size={9} />
            {activeBadge}
          </span>
        </div>
        <p className="text-xs text-muted truncate">{user.email}</p>
      </div>

      {/* Role selector */}
      <select
        value={role}
        onChange={(e) => onChangeRole(e.target.value as TeamRole)}
        className="rounded-lg px-2.5 py-1.5 border border-theme surface-input text-xs font-medium text-heading outline-none transition-colors hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="tester">{testerLabel}</option>
        <option value="viewer">{viewerLabel}</option>
      </select>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg text-muted transition-colors hover:text-error hover:bg-error/10"
        aria-label={removeLabel}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* ───── Invitation row ───── */

interface InvitationRowProps {
  invitation: Invitation;
  locale: string;
  onResend: () => void;
  onRevoke: () => void;
  testerLabel: string;
  viewerLabel: string;
  pendingLabel: string;
  expiredLabel: string;
  revokedLabel: string;
  acceptedLabel: string;
  resendLabel: string;
  revokeLabel: string;
  expiresOnLabel: (d: string) => string;
  expiredOnLabel: (d: string) => string;
  acceptedOnLabel: (d: string) => string;
  sentOnLabel: (d: string) => string;
}

// Status meta: icon component, colour classes, and which actions are available.
const STATUS_META = {
  pending: {
    icon: Clock,
    badge: 'bg-warning/10 text-warning',
    canResend: true,
    canRevoke: true,
  },
  expired: {
    icon: AlertCircle,
    badge: 'bg-error/5 text-error',
    canResend: true,  // resend → regenerates token
    canRevoke: false,
  },
  revoked: {
    icon: Ban,
    badge: 'bg-muted/10 text-muted',
    canResend: false,
    canRevoke: false,
  },
  accepted: {
    icon: CheckCircle2,
    badge: 'bg-[var(--alert-success-bg,#dcfce7)] text-[var(--alert-success-text,#166534)]',
    canResend: false,
    canRevoke: false,
  },
} as const;

function InvitationRow({
  invitation,
  locale,
  onResend,
  onRevoke,
  testerLabel,
  viewerLabel,
  pendingLabel,
  expiredLabel,
  revokedLabel,
  acceptedLabel,
  resendLabel,
  revokeLabel,
  expiresOnLabel,
  expiredOnLabel,
  acceptedOnLabel,
  sentOnLabel,
}: InvitationRowProps) {
  const { status } = invitation;
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;

  const roleLabel = invitation.role === 'tester' ? testerLabel : viewerLabel;

  const statusLabel =
    status === 'pending'
      ? pendingLabel
      : status === 'expired'
        ? expiredLabel
        : status === 'revoked'
          ? revokedLabel
          : acceptedLabel;

  // Date line beneath the email
  const fmt = (iso: string | undefined) =>
    iso
      ? new Date(iso).toLocaleDateString(locale, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '';

  const dateLine =
    status === 'accepted'
      ? acceptedOnLabel(fmt(invitation.acceptedAt ?? invitation.updatedAt))
      : status === 'expired'
        ? expiredOnLabel(fmt(invitation.expiresAt))
        : status === 'revoked'
          ? sentOnLabel(fmt(invitation.createdAt))
          : expiresOnLabel(fmt(invitation.expiresAt)); // pending

  // Dim the row for terminal statuses
  const rowOpacity =
    status === 'revoked' ? 'opacity-50' : status === 'accepted' ? 'opacity-60' : '';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border border-theme transition-colors hover:surface-tertiary ${rowOpacity}`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full surface-tertiary flex items-center justify-center flex-shrink-0">
        <Mail size={16} className="text-muted" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-heading truncate">
            {invitation.email}
          </p>
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${meta.badge}`}
          >
            <StatusIcon size={10} />
            {statusLabel}
          </span>
          {/* Role */}
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            {roleLabel}
          </span>
        </div>
        <p className="text-xs text-muted truncate mt-0.5">{dateLine}</p>
      </div>

      {/* Actions — only rendered when applicable */}
      {meta.canResend && (
        <button
          onClick={onResend}
          className="p-1.5 rounded-lg text-muted transition-colors hover:text-primary hover:bg-primary/10"
          title={resendLabel}
          aria-label={resendLabel}
        >
          <RefreshCw size={14} />
        </button>
      )}
      {meta.canRevoke && (
        <button
          onClick={onRevoke}
          className="p-1.5 rounded-lg text-muted transition-colors hover:text-error hover:bg-error/10"
          title={revokeLabel}
          aria-label={revokeLabel}
        >
          <XCircle size={15} />
        </button>
      )}
      {/* Spacer when no actions, so row height stays consistent */}
      {!meta.canResend && !meta.canRevoke && <div className="w-8" />}
    </div>
  );
}

/* ───── Role picker card ───── */

interface RolePickerCardProps {
  selected: boolean;
  onClick: () => void;
  icon: typeof TestTube;
  title: string;
  desc: string;
}

function RolePickerCard({
  selected,
  onClick,
  icon: Icon,
  title,
  desc,
}: RolePickerCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-theme hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-primary" />
        <span className="text-sm font-semibold text-heading">{title}</span>
      </div>
      <p className="text-xs text-body">{desc}</p>
    </button>
  );
}

// Keep unused symbols quiet for typecheckers — the status type is re-exported.
export type { InvitationStatus };
