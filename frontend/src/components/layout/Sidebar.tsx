'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { projectApi } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { useLocalStorage, useToast } from '@/hooks';
import { getApiError } from '@/lib/utils';
import Image from 'next/image';
import {
  FolderOpen,
  FileText,
  Users,
  Settings,
  Plus,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Menu,
  MoreHorizontal,
  Pencil,
  Trash2,
  LucideIcon,
  X,
} from 'lucide-react';

interface Project {
  _id: string;
  name?: string;
  title?: string;
  /**
   * `'owner'` means the current user owns this project; anything else
   * (`'team'` or `'member'`) is access granted via a team — for those
   * we hide the rename / delete menu since only the owner can mutate.
   * Optional for back-compat with callers that haven't been wired yet.
   */
  accessSource?: 'owner' | 'team' | 'member';
  sharedViaTeam?: string;
}

interface SidebarProps {
  recentProjects?: Project[];
}

interface NavItem {
  key: 'projects' | 'reports' | 'team' | 'settings';
  icon: LucideIcon;
  href: string;
  active: boolean;
  disabled?: boolean;
}

const EMPTY_PROJECT_ACTIVITY: Record<string, number> = {};

export default function Sidebar({ recentProjects = [] }: SidebarProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const tp = useTranslations('projects');
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const isEnterprise = user?.accountType === 'enterprise';

  const [collapsed, setCollapsed] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [fetchedRecentProjects, setFetchedRecentProjects] = useState<Project[]>([]);
  const [projectActivity, setProjectActivity] = useLocalStorage<Record<string, number>>(
    STORAGE_KEYS.recentProjectActivity,
    EMPTY_PROJECT_ACTIVITY,
  );

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (recentProjects.length > 0) {
      return;
    }

    let isMounted = true;

    const fetchRecentProjects = async () => {
      try {
        const { data } = await projectApi.getAll();
        if (!isMounted) return;
        setFetchedRecentProjects(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setFetchedRecentProjects([]);
      }
    };

    void fetchRecentProjects();
    return () => {
      isMounted = false;
    };
  }, [recentProjects]);

  const projectsToDisplay =
    recentProjects.length > 0 ? recentProjects : fetchedRecentProjects;

  useEffect(() => {
    const match = pathname.match(/\/workspace\/([^/?#]+)/);
    if (!match) return;

    const openedProjectId = decodeURIComponent(match[1]);
    const openedAt = Date.now();

    setProjectActivity((prev) => ({
      ...prev,
      [openedProjectId]: openedAt,
    }));
  }, [pathname, setProjectActivity]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    if (!openProjectMenuId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenProjectMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openProjectMenuId]);

  const sortedProjects = useMemo(() => {
    return [...projectsToDisplay].sort((a, b) => {
      const activityDiff = (projectActivity[b._id] ?? 0) - (projectActivity[a._id] ?? 0);
      if (activityDiff !== 0) return activityDiff;

      const nameA = (a.title ?? a.name ?? '').toLowerCase();
      const nameB = (b.title ?? b.name ?? '').toLowerCase();
      const nameDiff = nameA.localeCompare(nameB);
      if (nameDiff !== 0) return nameDiff;

      return a._id.localeCompare(b._id);
    });
  }, [projectsToDisplay, projectActivity]);

  const markProjectAsOpened = (projectId: string, openedAt: number) => {
    setProjectActivity((prev) => ({
      ...prev,
      [projectId]: openedAt,
    }));
  };

  const startInlineRename = (project: Project) => {
    const currentName = (project.title ?? project.name ?? '').trim();
    setEditingProjectId(project._id);
    setEditingProjectName(currentName);
    setOpenProjectMenuId(null);
  };

  const cancelInlineRename = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
    setRenamingProjectId(null);
  };

  const submitInlineRename = async (project: Project) => {
    const currentName = (project.title ?? project.name ?? '').trim();
    const trimmedName = editingProjectName.trim();

    if (!trimmedName) {
      toast.error(tp('feedback.nameRequired'));
      return;
    }

    if (trimmedName === currentName) {
      cancelInlineRename();
      return;
    }

    setRenamingProjectId(project._id);

    try {
      await projectApi.update(project._id, { name: trimmedName });

      setFetchedRecentProjects((prev) =>
        prev.map((item) =>
          item._id === project._id
            ? { ...item, name: trimmedName, title: trimmedName }
            : item,
        ),
      );

      toast.success(tp('feedback.projectRenamed'));
      cancelInlineRename();
    } catch (err) {
      toast.error(getApiError(err, tp('feedback.renameFailed')));
      setRenamingProjectId(null);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const projectName = (project.title ?? project.name ?? 'Project').trim();
    const confirmed = window.confirm(tp('confirmDeleteDesc'));

    if (!confirmed) return;

    try {
      await projectApi.delete(project._id);

      setFetchedRecentProjects((prev) => prev.filter((item) => item._id !== project._id));
      setProjectActivity((prev) => {
        const next = { ...prev };
        delete next[project._id];
        return next;
      });

      if (pathname.includes(`/workspace/${project._id}`)) {
        router.push('/dashboard/projects');
      }

      toast.success(tp('feedback.projectDeleted', { name: projectName }));
      setOpenProjectMenuId(null);
    } catch (err) {
      toast.error(getApiError(err, tp('feedback.deleteFailed')));
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const isProjectItemActive = (projectId: string) => {
    const projectWorkspacePath = `/workspace/${projectId}`;
    return (
      pathname === projectWorkspacePath || pathname.startsWith(`${projectWorkspacePath}/`)
    );
  };

  const navItems: NavItem[] = [
    {
      key: 'projects',
      icon: FolderOpen,
      href: '/dashboard/projects',
      active: isActive('/dashboard/projects') || isActive('/workspace'),
    },
    {
      key: 'reports',
      icon: FileText,
      href: '/dashboard',
      active: false,
      disabled: true,
    },
    // Team is enterprise-only: hidden for individual accounts
    ...(isEnterprise
      ? [
          {
            key: 'team' as const,
            icon: Users,
            href: '/dashboard/team',
            active: isActive('/dashboard/team'),
          },
        ]
      : []),
    {
      key: 'settings',
      icon: Settings,
      href: '/dashboard/settings',
      active: isActive('/dashboard/settings'),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ============ HEADER : Logo + Collapse ============ */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-theme mb-2 ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 -mx-1 px-1 py-1 rounded-md hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <Image
                src="/Logo.png"
                alt="Testara"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-heading">
              {tc('testara')}
            </span>
          </Link>
        )}

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-heading hover:bg-black/5 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-heading hover:bg-black/5 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {/* ============ NEW PROJECT CTA ============ */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} mt-1`}>
        <Link
          href="/dashboard"
          aria-label={t('newProject')}
          title={collapsed ? t('newProject') : undefined}
          className={`group flex items-center ${
            collapsed ? 'justify-center' : 'gap-2.5 px-2.5'
          } h-9 rounded-lg text-[13.5px] font-medium text-heading hover:bg-black/5 transition-colors`}
        >
          <span
            className={`flex items-center justify-center rounded-full bg-primary transition-transform duration-200 group-hover:scale-105 ${
              collapsed ? 'w-7 h-7' : 'w-5 h-5'
            }`}
          >
            <Plus size={collapsed ? 14 : 12} strokeWidth={2.75} className="text-white" />
          </span>
          {!collapsed && <span className="truncate">{t('newProject')}</span>}
        </Link>
      </div>

      {/* ============ NAVIGATION ============ */}
      <nav
        className={`flex flex-col mt-1 ${collapsed ? 'px-2' : 'px-3'}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          const baseClasses = `group relative flex items-center ${
            collapsed ? 'justify-center' : 'gap-2.5 px-2.5'
          } h-9 rounded-lg text-[13.5px] transition-colors`;

          const stateClasses = item.active
            ? 'bg-black/[0.06] text-heading font-medium'
            : 'text-body hover:bg-black/5 hover:text-heading';

          if (item.disabled) {
            return (
              <div
                key={item.key}
                className={`${baseClasses} opacity-40 cursor-not-allowed`}
                aria-disabled="true"
                title={collapsed ? t(item.key) : 'Coming soon'}
              >
                {/* Active indicator placeholder (keeps spacing consistent) */}
                {!collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-transparent" />
                )}
                <Icon size={17} strokeWidth={1.8} />
                {!collapsed && (
                  <>
                    <span className="truncate">{t(item.key)}</span>
                  </>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`${baseClasses} ${stateClasses}`}
              aria-current={item.active ? 'page' : undefined}
              title={collapsed ? t(item.key) : undefined}
            >
              {/* Active indicator bar */}
              {!collapsed && (
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full transition-colors ${
                    item.active ? 'bg-primary' : 'bg-transparent'
                  }`}
                />
              )}
              <Icon size={17} strokeWidth={item.active ? 2 : 1.8} />
              {!collapsed && <span className="truncate">{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ============ RECENT PROJECTS ============ */}
      {!collapsed && (
        <div className="px-3 mt-4 flex-1 min-h-0 flex flex-col">
          <button
            onClick={() => setRecentOpen(!recentOpen)}
            className="flex items-center gap-1 px-2.5 h-7 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted hover:text-heading rounded-md transition-colors shrink-0"
            aria-expanded={recentOpen}
          >
            <span>{t('recentProjects')}</span>
            <ChevronDown
              size={12}
              strokeWidth={2.5}
              className={`transition-transform duration-200 ${
                recentOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {recentOpen && (
            <div className="mt-1 space-y-0.5 flex-1 overflow-y-auto custom-scroll">
              {sortedProjects.length > 0 ? (
                sortedProjects.slice(0, 8).map((project) => {
                  const isActiveItem = isProjectItemActive(project._id);
                  const isRenaming = renamingProjectId === project._id;
                  const isMenuOpen = openProjectMenuId === project._id;
                  // Only the owner can rename / delete; for projects we
                  // can access via a team we hide the action menu entirely.
                  // Treat missing accessSource as owner for back-compat.
                  const canManage =
                    !project.accessSource || project.accessSource === 'owner';

                  const isShared = !canManage;

                  return (
                    <div
                      key={project._id}
                      ref={isMenuOpen ? menuRef : undefined}
                      className="group/item relative flex items-center"
                      data-active={isActiveItem || undefined}
                      data-menu-open={isMenuOpen || undefined}
                    >
                      {/* ===== PROJECT LINK ===== */}
                      {editingProjectId === project._id ? (
                        <div className="flex flex-1 items-center px-2.5 h-9 rounded-lg ring-1 ring-primary/40 surface-tertiary">
                          <input
                            autoFocus
                            value={editingProjectName}
                            onChange={(e) => setEditingProjectName(e.target.value)}
                            onBlur={() => void submitInlineRename(project)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void submitInlineRename(project);
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelInlineRename();
                              }
                            }}
                            className="flex-1 bg-transparent text-[13.5px] text-heading outline-none placeholder:text-muted"
                            placeholder={tp('rename')}
                            aria-label={tp('rename')}
                            disabled={isRenaming}
                          />
                        </div>
                      ) : (
                        <Link
                          href={`/workspace/${project._id}`}
                          title={project.title ?? project.name ?? 'Untitled project'}
                          className={`relative flex flex-1 items-center gap-1.5 px-2.5 ${
                            canManage ? 'pr-9' : 'pr-2.5'
                          } h-9 rounded-lg text-[13.5px] transition-colors ${
                            isActiveItem
                              ? 'surface-tertiary text-heading font-medium'
                              : 'text-body hover:surface-tertiary hover:text-heading'
                          }`}
                          onClick={() => setOpenProjectMenuId(null)}
                          aria-current={isActiveItem ? 'page' : undefined}
                        >
                          {/* Active indicator bar */}
                          <span
                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full transition-colors ${
                              isActiveItem ? 'bg-primary' : 'bg-transparent'
                            }`}
                            aria-hidden="true"
                          />

                          <span className="truncate flex-1">
                            {project.title ?? project.name ?? 'Untitled project'}
                          </span>

                          {/* Shared indicator — visible at all times so the
                             user knows why the action menu isn't there. */}
                          {isShared && (
                            <span
                              className="flex-shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary"
                              title={
                                project.sharedViaTeam
                                  ? tp('sharedViaTeam', { team: project.sharedViaTeam })
                                  : tp('sharedBadge')
                              }
                              aria-label={tp('sharedBadge')}
                            >
                              <Users size={9} strokeWidth={2.25} />
                            </span>
                          )}
                        </Link>
                      )}

                      {/* ===== ACTION BUTTON ===== */}
                      {editingProjectId !== project._id && canManage && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenProjectMenuId(isMenuOpen ? null : project._id);
                            }}
                            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                              isMenuOpen
                                ? 'opacity-100 surface-tertiary text-heading'
                                : 'text-muted opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100 hover:surface-tertiary hover:text-heading'
                            }`}
                            aria-label={tp('rename') + ' / ' + tp('delete')}
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {/* ===== DROPDOWN ===== */}
                          {isMenuOpen && (
                            <div
                              role="menu"
                              className="absolute right-0 top-[calc(100%+6px)] min-w-[160px] rounded-lg border border-theme surface-card shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                role="menuitem"
                                type="button"
                                className="flex w-full items-center gap-2.5 px-3 h-9 text-[13px] text-body hover:surface-tertiary hover:text-heading transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startInlineRename(project);
                                }}
                              >
                                <Pencil size={13} strokeWidth={1.8} />
                                <span>{tp('rename')}</span>
                              </button>

                              <div
                                className="h-px w-full"
                                style={{ backgroundColor: 'var(--border-color)' }}
                                aria-hidden="true"
                              />

                              <button
                                role="menuitem"
                                type="button"
                                className="flex w-full items-center gap-2.5 px-3 h-9 text-[13px] text-error hover:bg-error/10 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  void handleDeleteProject(project);
                                }}
                              >
                                <Trash2 size={13} strokeWidth={1.8} />
                                <span>{tp('delete')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-2.5 py-3 text-[12.5px] text-muted">
                  {t('recentProjects')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-3.5 z-40 inline-flex items-center justify-center w-10 h-10 rounded-lg surface-card border border-theme shadow-sm text-heading hover:bg-black/5 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 border-r border-theme transition-[width,transform] duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-[68px]' : 'w-[248px]'}`}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
        aria-label="Primary"
      >
        {sidebarContent}
      </aside>

      {/* Spacer for layout */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-[width] duration-300 ease-out ${
          collapsed ? 'w-[68px]' : 'w-[248px]'
        }`}
        aria-hidden="true"
      />

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }
        .custom-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
}
