'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { teamApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { getApiError } from '@/lib/utils';
import { Button } from '@/components/ui';
import Modal from '@/components/dashboard/Modal';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import TeamFilterPopover, {
  DEFAULT_TEAM_FILTERS,
  countActiveTeamFilters,
  type TeamFilters,
} from '@/components/dashboard/TeamFilterPopover';
import {
  Plus,
  Users,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Folder,
  Building2,
  AlertCircle,
  Clock,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from 'lucide-react';
import type { Team } from '@/types';

type SortKey = 'newest' | 'oldest' | 'name';

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];
const DEFAULT_PAGE_SIZE = 6;

export default function TeamIndexPage() {
  const t = useTranslations('team');
  const tCommon = useTranslations('projects');
  const { user } = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  // Toolbar state — search / sort / filter / pagination.
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TeamFilters>(DEFAULT_TEAM_FILTERS);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [perPageOpen, setPerPageOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filterWrapRef = useRef<HTMLDivElement>(null);

  const isEnterprise = user?.accountType === 'enterprise';

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const { data } = await teamApi.getAll();
      setTeams(Array.isArray(data) ? data : []);
    } catch {
      setFetchError(true);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEnterprise) fetchTeams();
    else setLoading(false);
  }, [isEnterprise, fetchTeams]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { data } = await teamApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(t('createdSuccess'));
      setCreateOpen(false);
      setName('');
      setDescription('');
      router.push(`/dashboard/team/${data._id}`);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await teamApi.delete(deleteTarget._id);
      toast.success(t('deletedSuccess', { name: deleteTarget.name }));
      setDeleteTarget(null);
      fetchTeams();
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  /* ───── filter + sort pipeline ───── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = teams.filter((team) => {
      if (q) {
        const hay = `${team.name} ${team.description ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Activity = pending invitations.
      const hasPending = (team.pendingInvitationCount ?? 0) > 0;
      if (filters.activity === 'yes' && !hasPending) return false;
      if (filters.activity === 'no' && hasPending) return false;

      // Projects shared.
      const hasProjects = (team.projects?.length ?? 0) > 0;
      if (filters.projects === 'yes' && !hasProjects) return false;
      if (filters.projects === 'no' && hasProjects) return false;

      // Members.
      const hasMembers = (team.members?.length ?? 0) > 0;
      if (filters.members === 'yes' && !hasMembers) return false;
      if (filters.members === 'no' && hasMembers) return false;

      return true;
    });

    list = [...list];
    if (sort === 'newest') {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );
    } else if (sort === 'oldest') {
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime(),
      );
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [teams, search, sort, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );

  // Reset to page 1 when search/filter/perPage/sort change.
  useEffect(() => {
    setPage(1);
  }, [search, filters, perPage, sort]);
  // Clamp current page if filtered shrank.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const activeFilterCount = countActiveTeamFilters(filters);
  const hasActiveControls = activeFilterCount > 0 || search.trim() !== '';

  const sortLabel = {
    newest: tCommon('sortNewest'),
    oldest: tCommon('sortOldest'),
    name: tCommon('sortName'),
  }[sort];

  /* ───── Individual account: show upgrade prompt ───── */
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

  return (
    <div className="max-w-8xl mx-auto mt-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-heading">
            {t('title')}
          </h1>
          <p className="text-sm text-body mt-1">{t('subtitle')}</p>
        </div>
        <Button leftIcon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          {t('createTeam')}
        </Button>
      </div>

      {!loading && fetchError && (
        <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 mb-5 text-sm text-error">
          <AlertCircle size={17} />
          <span className="flex-1">{t('fetchFailed')}</span>
          <button
            onClick={fetchTeams}
            className="text-xs font-semibold hover:underline"
          >
            {tCommon('feedback.retry')}
          </button>
        </div>
      )}

      {/* Toolbar — only shown once we know there's data to operate on. */}
      {(!loading && (teams.length > 0 || hasActiveControls)) && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            {/* Search */}
            <div className="flex-1 sm:max-w-xs">
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-theme surface-input transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search size={16} className="text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="p-0.5 rounded-md text-muted hover:text-heading transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter */}
            <div className="relative" ref={filterWrapRef}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  activeFilterCount > 0
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-theme text-body hover:surface-tertiary'
                }`}
              >
                <SlidersHorizontal size={15} />
                {tCommon('filter')}
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <TeamFilterPopover
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onChange={setFilters}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary"
              >
                <ArrowUpDown size={15} />
                {tCommon('sortBy')}: <span className="text-heading">{sortLabel}</span>
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-theme surface-card shadow-lg z-20 overflow-hidden">
                    {(['newest', 'oldest', 'name'] as SortKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSort(key);
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center px-3.5 py-2.5 text-sm transition-colors hover:surface-tertiary ${
                          sort === key ? 'text-primary font-semibold' : 'text-body'
                        }`}
                      >
                        {key === 'newest' && tCommon('sortNewest')}
                        {key === 'oldest' && tCommon('sortOldest')}
                        {key === 'name' && tCommon('sortName')}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active filter chips + result count */}
          {hasActiveControls && (
            <div className="flex items-center flex-wrap gap-2 mb-5 text-xs text-body">
              <span className="text-muted">
                {tCommon('totalResults', { count: filtered.length })}
              </span>
              {search && (
                <ChipTag label={`"${search}"`} onRemove={() => setSearch('')} />
              )}
              {filters.activity !== 'any' && (
                <ChipTag
                  label={
                    filters.activity === 'yes'
                      ? t('filters.hasPending')
                      : t('filters.noPending')
                  }
                  onRemove={() => setFilters({ ...filters, activity: 'any' })}
                />
              )}
              {filters.projects !== 'any' && (
                <ChipTag
                  label={
                    filters.projects === 'yes'
                      ? t('filters.withProjects')
                      : t('filters.withoutProjects')
                  }
                  onRemove={() => setFilters({ ...filters, projects: 'any' })}
                />
              )}
              {filters.members !== 'any' && (
                <ChipTag
                  label={
                    filters.members === 'yes'
                      ? t('filters.withMembers')
                      : t('filters.withoutMembers')
                  }
                  onRemove={() => setFilters({ ...filters, members: 'any' })}
                />
              )}
              <button
                onClick={() => {
                  setFilters(DEFAULT_TEAM_FILTERS);
                  setSearch('');
                }}
                className="text-primary font-semibold hover:underline ml-1"
              >
                {tCommon('clearAll')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-theme surface-card h-40 animate-pulse"
            />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-theme surface-card p-16 text-center">
          <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
            <Users size={22} className="text-muted" />
          </div>
          <p className="text-sm font-medium text-heading mb-1">{t('empty')}</p>
          <p className="text-xs text-body mb-5">{t('emptyDesc')}</p>
          <Button
            leftIcon={<Plus size={15} />}
            onClick={() => setCreateOpen(true)}
          >
            {t('createTeam')}
          </Button>
        </div>
      ) : pageItems.length === 0 ? (
        // We have teams but the current filters/search hide everything.
        <div className="rounded-2xl border border-theme surface-card p-16 text-center">
          <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
            <Search size={22} className="text-muted" />
          </div>
          <p className="text-sm font-medium text-heading mb-1">{t('noMatch')}</p>
          <p className="text-xs text-body mb-5">{t('noMatchDesc')}</p>
          <button
            onClick={() => {
              setSearch('');
              setFilters(DEFAULT_TEAM_FILTERS);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-theme text-sm font-medium text-body hover:surface-tertiary transition-colors"
          >
            <X size={13} />
            {tCommon('clearAll')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onDelete={() => setDeleteTarget(team)}
              memberLabel={t('memberCount', {
                count: team.members?.length ?? 0,
              })}
              projectLabel={t('projectCount', {
                count: team.projects?.length ?? 0,
              })}
              pendingLabel={
                team.pendingInvitationCount
                  ? t('inviteCount', { count: team.pendingInvitationCount })
                  : null
              }
              openLabel={t('open')}
              deleteLabel={t('delete')}
              noDescLabel={t('noDescription')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && pageItems.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
          perPage={perPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPerPageOpen(false);
          }}
          perPageOpen={perPageOpen}
          togglePerPage={() => setPerPageOpen((v) => !v)}
          perPageLabel={tCommon('perPage')}
          pageOfLabel={tCommon('pageOf', { current: safePage, total: totalPages })}
        />
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        title={t('createTeam')}
        subtitle={t('createSubtitle')}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">
              {t('name')}
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
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
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className="w-full rounded-xl px-3.5 py-2.5 border border-theme surface-input text-sm text-heading outline-none resize-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={creating || !name.trim()}
            >
              {t('create')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('confirmDelete')}
        description={t('confirmDeleteDesc', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}

interface TeamCardProps {
  team: Team;
  onDelete: () => void;
  memberLabel: string;
  projectLabel: string;
  pendingLabel: string | null;
  openLabel: string;
  deleteLabel: string;
  noDescLabel: string;
}

function TeamCard({
  team,
  onDelete,
  memberLabel,
  projectLabel,
  pendingLabel,
  openLabel,
  deleteLabel,
  noDescLabel,
}: TeamCardProps) {
  return (
    <div className="group relative rounded-2xl border border-theme surface-card overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Clickable overlay */}
      <Link
        href={`/dashboard/team/${team._id}`}
        className="absolute inset-0 z-10"
        aria-label={openLabel}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users size={19} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold font-heading text-heading truncate leading-tight">
              {team.name}
            </h3>
            {team.description ? (
              <p className="text-xs text-body mt-0.5 line-clamp-2 leading-relaxed">
                {team.description}
              </p>
            ) : (
              <p className="text-xs text-muted mt-0.5 italic">{noDescLabel}</p>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="relative z-20 p-1.5 rounded-lg text-muted opacity-0 group-hover:opacity-100 transition-all hover:surface-tertiary hover:text-error"
            aria-label={deleteLabel}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-4 pt-3.5 border-t border-theme flex items-center gap-2 flex-wrap">
          <StatChip icon={Users} label={memberLabel} />
          <StatChip icon={Folder} label={projectLabel} />

          {pendingLabel && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/10 text-warning text-xs font-medium">
              <Clock size={11} />
              {pendingLabel}
            </div>
          )}

          {/* Open cue */}
          <div className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {openLabel}
            <ChevronRight size={13} />
          </div>
          {/* Static arrow when not hovering */}
          <ChevronRight
            size={14}
            className="ml-auto text-muted group-hover:opacity-0 transition-opacity absolute right-5"
          />
        </div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg surface-tertiary text-xs text-body">
      <Icon size={12} className="text-muted flex-shrink-0" />
      <span>{label}</span>
    </div>
  );
}

function ChipTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 -mr-1 transition-colors"
        aria-label="Remove filter"
      >
        <X size={11} />
      </button>
    </span>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  perPage: number;
  onPerPageChange: (n: number) => void;
  perPageOpen: boolean;
  togglePerPage: () => void;
  perPageLabel: string;
  pageOfLabel: string;
}

function Pagination({
  page,
  totalPages,
  onChange,
  perPage,
  onPerPageChange,
  perPageOpen,
  togglePerPage,
  perPageLabel,
  pageOfLabel,
}: PaginationProps) {
  const go = (p: number) => onChange(Math.min(Math.max(1, p), totalPages));

  const pages: (number | 'dots')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('dots');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('dots');
    pages.push(totalPages);
  }

  const btn =
    'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
      <div className="text-sm text-muted">{pageOfLabel}</div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => go(1)}
          disabled={page === 1}
          className={`${btn} text-body hover:surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </button>
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className={`${btn} text-body hover:surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, idx) =>
          p === 'dots' ? (
            <span
              key={`dots-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-sm text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              className={`${btn} font-medium ${
                p === page
                  ? 'bg-primary text-white'
                  : 'text-body hover:surface-tertiary'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          className={`${btn} text-body hover:surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
        <button
          onClick={() => go(totalPages)}
          disabled={page === totalPages}
          className={`${btn} text-body hover:surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>

      {/* Per-page */}
      <div className="relative">
        <button
          onClick={togglePerPage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme text-sm text-body transition-colors hover:surface-tertiary"
        >
          <span className="text-heading font-medium">{perPage}</span>
          <span className="text-muted">{perPageLabel}</span>
          <ChevronDown size={13} className={`text-muted transition-transform ${perPageOpen ? 'rotate-180' : ''}`} />
        </button>
        {perPageOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={togglePerPage}
            />
            <div className="absolute right-0 bottom-full mb-1 w-28 rounded-xl border border-theme surface-card shadow-lg z-20 overflow-hidden">
              {PAGE_SIZE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => onPerPageChange(n)}
                  className={`flex w-full items-center px-3.5 py-2 text-sm transition-colors hover:surface-tertiary ${
                    n === perPage ? 'text-primary font-semibold' : 'text-body'
                  }`}
                >
                  {n} {perPageLabel}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
