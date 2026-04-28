'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { projectApi } from '@/lib/api';
import {
  exportProjectsPDF,
  exportProjectsXLSX,
  exportProjectsCSV,
  ExportableProject,
} from '@/lib/export';
import ProjectCard from '@/components/dashboard/ProjectCard';
import NewProjectModal from '@/components/dashboard/NewProjectModal';
import RenameProjectModal from '@/components/dashboard/RenameProjectModal';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import FilterPopover, { ProjectFilters } from '@/components/dashboard/FilterPopover';
import {
  Search,
  Plus,
  Upload,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  FolderPlus,
  FileText,
  FileSpreadsheet,
  FileDown,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { getApiError } from '@/lib/utils';

interface Project extends ExportableProject {
  _id: string;
  name: string;
  url: string;
  accessSource?: 'owner' | 'team' | 'member';
  sharedViaTeam?: string;
}

type SortKey = 'newest' | 'oldest' | 'name';
type ScopeKey = 'all' | 'owned' | 'shared';

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];
const DEFAULT_PAGE_SIZE = 6;

export default function ProjectsIndexPage() {
  const t = useTranslations('projects');
  const tDashboard = useTranslations('dashboard');
  const { user } = useAuthStore();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const toast = useToast();

  // filters, sort, search, pagination
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [scope, setScope] = useState<ScopeKey>('all');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [perPageOpen, setPerPageOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<ProjectFilters>({
    environments: [],
    statuses: [],
    dateRange: 'all',
  });

  // modals
  const [newOpen, setNewOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filterWrapRef = useRef<HTMLDivElement>(null);
  const exportWrapRef = useRef<HTMLDivElement>(null);

  const ownerInitials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
    : '';

  /* ───── close outside handlers for export dropdown ───── */
  useEffect(() => {
    if (!exportOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!exportWrapRef.current?.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [exportOpen]);

  /* ───── fetch ───── */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const { data } = await projectApi.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setFetchError(true);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ───── auto-open create modal ───── */
  useEffect(() => {
    if (searchParams.get('create') === '1') setNewOpen(true);
  }, [searchParams]);

  /* ───── seed scope from query string (e.g. ?scope=shared) ───── */
  useEffect(() => {
    const value = searchParams.get('scope');
    if (value === 'owned' || value === 'shared' || value === 'all') {
      setScope(value);
    }
  }, [searchParams]);

  /* ───── counts per scope (computed from raw projects, unaffected by filters) ───── */
  const scopeCounts = useMemo(() => {
    let owned = 0;
    let shared = 0;
    for (const p of projects) {
      if (p.accessSource === 'owner' || !p.accessSource) owned += 1;
      else shared += 1;
    }
    return { all: projects.length, owned, shared };
  }, [projects]);

  /* ───── available filter options, derived ───── */
  const availableEnvironments = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.environment) set.add(p.environment);
    });
    if (set.size === 0) ['Dev', 'Staging', 'Prod'].forEach((e) => set.add(e));
    return Array.from(set);
  }, [projects]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.status) set.add(p.status);
    });
    if (set.size === 0) ['Crawl', 'Running', 'Done'].forEach((s) => set.add(s));
    return Array.from(set);
  }, [projects]);

  /* ───── filter + sort pipeline ───── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const DAY = 86400000;
    const threshold: number | null =
      filters.dateRange === 'today'
        ? now - DAY
        : filters.dateRange === 'week'
          ? now - DAY * 7
          : filters.dateRange === 'month'
            ? now - DAY * 30
            : null;

    let list = projects.filter((p) => {
      // Scope filter — owned vs shared
      if (scope === 'owned' && p.accessSource && p.accessSource !== 'owner') {
        return false;
      }
      if (scope === 'shared' && (p.accessSource === 'owner' || !p.accessSource)) {
        return false;
      }
      if (q && !p.name.toLowerCase().includes(q) && !p.url.toLowerCase().includes(q)) {
        return false;
      }
      if (
        filters.environments.length > 0 &&
        !filters.environments.includes(p.environment || '')
      ) {
        return false;
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(p.status || '')) {
        return false;
      }
      if (threshold !== null) {
        const created = p.createdAt ? new Date(p.createdAt).getTime() : 0;
        if (!created || created < threshold) return false;
      }
      return true;
    });

    list = [...list];
    if (sort === 'newest') {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    } else if (sort === 'oldest') {
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      );
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [projects, search, sort, filters, scope]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Reset to page 1 when search/filter/perPage/scope change
  useEffect(() => {
    setPage(1);
  }, [search, filters, perPage, sort, scope]);

  /* ───── mutations ───── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      toast.success(t('feedback.projectDeleted', { name: deleteTarget.name }));
      fetchProjects();
    } catch (err) {
      toast.error(getApiError(err, t('feedback.deleteFailed')));
    }
  };

  const handleRename = async (newName: string) => {
    if (!renameTarget) return;
    try {
      await projectApi.update(renameTarget._id, { name: newName });
      setRenameTarget(null);
      toast.success(t('feedback.projectRenamed'));
      fetchProjects();
    } catch (err) {
      toast.error(getApiError(err, t('feedback.renameFailed')));
    }
  };

  const activeFilterCount =
    filters.environments.length +
    filters.statuses.length +
    (filters.dateRange !== 'all' ? 1 : 0);

  const clearFilters = () =>
    setFilters({ environments: [], statuses: [], dateRange: 'all' });

  const sortLabel = {
    newest: t('sortNewest'),
    oldest: t('sortOldest'),
    name: t('sortName'),
  }[sort];

  const handleExport = (type: 'pdf' | 'xlsx' | 'csv') => {
    setExportOpen(false);
    const data = filtered.length > 0 ? filtered : projects;
    if (type === 'pdf') exportProjectsPDF(data);
    if (type === 'xlsx') exportProjectsXLSX(data);
    if (type === 'csv') exportProjectsCSV(data);
  };

  return (
    <div className="max-w-8xl mx-auto mt-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-heading">{t('title')}</h1>
          <p className="text-sm text-body mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative" ref={exportWrapRef}>
            <button
              onClick={() => setExportOpen((v) => !v)}
              disabled={projects.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={15} />
              {t('export')}
              <ChevronDown
                size={14}
                className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-theme surface-card shadow-lg z-20 overflow-hidden">
                <ExportItem
                  icon={FileText}
                  label={t('exportPdf')}
                  onClick={() => handleExport('pdf')}
                />
                <ExportItem
                  icon={FileSpreadsheet}
                  label={t('exportExcel')}
                  onClick={() => handleExport('xlsx')}
                />
                <ExportItem
                  icon={FileDown}
                  label={t('exportCsv')}
                  onClick={() => handleExport('csv')}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark"
          >
            <Plus size={16} />
            {t('addProject')}
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        {/* Scope tabs — All / Owned / Shared */}
        <div
          role="tablist"
          aria-label={t('title')}
          className="flex items-center gap-1 p-1 mb-4 rounded-xl border border-theme w-fit"
        >
          <ScopeTab
            active={scope === 'all'}
            label={t('scopeAll')}
            count={scopeCounts.all}
            onClick={() => setScope('all')}
          />
          <ScopeTab
            active={scope === 'owned'}
            label={t('scopeOwned')}
            count={scopeCounts.owned}
            onClick={() => setScope('owned')}
          />
          <ScopeTab
            active={scope === 'shared'}
            label={t('scopeShared')}
            count={scopeCounts.shared}
            onClick={() => setScope('shared')}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
          <div className="flex-1 sm:max-w-xs">
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 border border-theme surface-input transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search size={16} className="text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search')}
                className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-0.5 rounded-md text-muted hover:text-heading transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter popover */}
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
              {t('filter')}
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <FilterPopover
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              filters={filters}
              onChange={setFilters}
              availableEnvironments={availableEnvironments}
              availableStatuses={availableStatuses}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-theme text-sm font-medium text-body transition-colors hover:surface-tertiary"
            >
              <ArrowUpDown size={15} />
              {t('sortBy')}: <span className="text-heading">{sortLabel}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
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
                      {key === 'newest' && t('sortNewest')}
                      {key === 'oldest' && t('sortOldest')}
                      {key === 'name' && t('sortName')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips + result count */}
      {(activeFilterCount > 0 || search) && (
        <div className="flex items-center flex-wrap gap-2 mb-5 text-xs text-body">
          <span className="text-muted">
            {t('totalResults', { count: filtered.length })}
          </span>
          {search && <ChipTag label={`"${search}"`} onRemove={() => setSearch('')} />}
          {filters.environments.map((env) => (
            <ChipTag
              key={env}
              label={env}
              onRemove={() =>
                setFilters({
                  ...filters,
                  environments: filters.environments.filter((e) => e !== env),
                })
              }
            />
          ))}
          {filters.statuses.map((s) => (
            <ChipTag
              key={s}
              label={s}
              onRemove={() =>
                setFilters({
                  ...filters,
                  statuses: filters.statuses.filter((v) => v !== s),
                })
              }
            />
          ))}
          {filters.dateRange !== 'all' && (
            <ChipTag
              label={t(`filters.range_${filters.dateRange}`)}
              onRemove={() => setFilters({ ...filters, dateRange: 'all' })}
            />
          )}
          {(activeFilterCount > 0 || search) && (
            <button
              onClick={() => {
                clearFilters();
                setSearch('');
              }}
              className="text-primary font-semibold hover:underline ml-1"
            >
              {t('clearAll')}
            </button>
          )}
        </div>
      )}

      {/* Fetch error banner */}
      {!loading && fetchError && (
        <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 mb-5 text-sm text-error">
          <AlertCircle size={17} className="flex-shrink-0" />
          <span className="flex-1">{t('feedback.fetchFailed')}</span>
          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
          >
            <RefreshCw size={13} />
            {t('feedback.retry')}
          </button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-theme surface-card h-48 animate-pulse"
            />
          ))}
        </div>
      ) : pageItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pageItems.map((project) => (
            <div key={project._id} className="relative">
              <Link href={`/workspace/${project._id}`} className="block">
                <ProjectCard
                  name={project.name}
                  url={project.url}
                  status={project.status || 'Crawl'}
                  environment={project.environment || 'Dev'}
                  passed={project.passed ?? 0}
                  failed={project.failed ?? 0}
                  totalScenarios={project.totalScenarios ?? 0}
                  duration={project.duration || '0m 0s'}
                  avatar={project.owner?.avatar || user?.avatar}
                  ownerInitials={
                    project.owner
                      ? `${project.owner.firstName?.charAt(0) || ''}${project.owner.lastName?.charAt(0) || ''}`
                      : ownerInitials
                  }
                  accessSource={project.accessSource}
                  sharedViaTeam={project.sharedViaTeam}
                  onRename={() => setRenameTarget(project)}
                  onDelete={() => setDeleteTarget(project)}
                />
              </Link>
            </div>
          ))}
        </div>
      ) : scope === 'shared' ? (
        <div className="rounded-2xl border border-theme surface-card p-16 text-center">
          <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
            <FolderPlus size={22} className="text-muted" />
          </div>
          <p className="text-sm font-medium text-heading mb-1">
            {tDashboard('noSharedProjects')}
          </p>
          <p className="text-xs text-body">{tDashboard('sharedProjectsSubtitle')}</p>
        </div>
      ) : scope === 'owned' && scopeCounts.owned === 0 ? (
        <div className="rounded-2xl border border-theme surface-card p-16 text-center">
          <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
            <FolderPlus size={22} className="text-muted" />
          </div>
          <p className="text-sm font-medium text-heading mb-1">
            {tDashboard('noOwnedProjects')}
          </p>
          <p className="text-xs text-body mb-5">{t('emptySubtitle')}</p>
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark"
          >
            <Plus size={15} />
            {t('addProject')}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-theme surface-card p-16 text-center">
          <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
            <FolderPlus size={22} className="text-muted" />
          </div>
          <p className="text-sm font-medium text-heading mb-1">{t('empty')}</p>
          <p className="text-xs text-body mb-5">{t('emptySubtitle')}</p>
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold transition-colors hover:bg-primary-dark"
          >
            <Plus size={15} />
            {t('addProject')}
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
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
          perPageLabel={t('perPage')}
          pageOfLabel={t('pageOf', { current: safePage, total: totalPages })}
        />
      )}

      {/* Modals */}
      <NewProjectModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => {
          setNewOpen(false);
          fetchProjects();
        }}
      />
      <RenameProjectModal
        project={renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={handleRename}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('confirmDelete')}
        description={t('confirmDeleteDesc')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}

/* ───────── Helpers ───────── */

function ExportItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-body transition-colors hover:surface-tertiary text-left"
    >
      <Icon size={15} className="text-primary flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function ScopeTab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white shadow-sm' : 'text-body hover:text-heading'
      }`}
    >
      {label}
      <span
        className={`inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
          active ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ChipTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 -mr-1 transition-colors"
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
        >
          <ChevronsLeft size={15} />
        </button>
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className={`${btn} text-body hover:surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed`}
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
                p === page ? 'bg-primary text-white' : 'text-body hover:surface-tertiary'
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
        >
          <ChevronRight size={15} />
        </button>
        <button
          onClick={() => go(totalPages)}
          disabled={page === totalPages}
          className={`${btn} text-body hover:surface-tertiary disabled:opacity-40 disabled:cursor-not-allowed`}
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
          <ChevronDown
            size={13}
            className={`text-muted transition-transform ${perPageOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {perPageOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={togglePerPage} />
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
