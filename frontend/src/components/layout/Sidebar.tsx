'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { projectApi } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';
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
    {
      key: 'team',
      icon: Users,
      href: '/dashboard',
      active: false,
      disabled: true,
    },
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
            <Plus
              size={collapsed ? 14 : 12}
              strokeWidth={2.75}
              className="text-white"
            />
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
        <div className="px-3 mt-6 flex-1 min-h-0 flex flex-col">
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
            <div className="mt-1 space-y-0.5 overflow-y-auto pb-4 custom-scroll">
              {sortedProjects.length > 0 ? (
                sortedProjects.slice(0, 8).map((project) => {
                  const isActiveItem = isProjectItemActive(project._id);
                  const isRenaming = renamingProjectId === project._id;

                  return (
                    <div
                      key={project._id}
                      className="group/item relative"
                    >
                      {editingProjectId === project._id ? (
                        <div className="flex items-center px-2.5 h-9 rounded-lg ring-1 ring-primary/40 bg-black/[0.03]">
                          <input
                            autoFocus
                            value={editingProjectName}
                            onChange={(event) =>
                              setEditingProjectName(event.target.value)
                            }
                            onBlur={() => void submitInlineRename(project)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                void submitInlineRename(project);
                              }
                              if (event.key === 'Escape') {
                                event.preventDefault();
                                cancelInlineRename();
                              }
                            }}
                            className="flex-1 min-w-0 bg-transparent text-[13.5px] text-heading outline-none placeholder:text-muted"
                            placeholder={tp('rename')}
                            aria-label={tp('rename')}
                            disabled={isRenaming}
                          />
                        </div>
                      ) : (
                        <Link
                          href={`/workspace/${project._id}`}
                          data-active={isActiveItem}
                          className={`relative flex items-center px-2.5 pr-9 h-9 rounded-lg text-[13.5px] transition-colors ${
                            isActiveItem
                              ? 'bg-black/[0.06] text-heading font-medium'
                              : 'text-body hover:bg-black/5 hover:text-heading'
                          }`}
                          onClick={(event) => {
                            setOpenProjectMenuId(null);
                            markProjectAsOpened(
                              project._id,
                              Math.round(
                                window.performance.timeOrigin + event.timeStamp,
                              ),
                            );
                          }}
                        >
                          {/* Active indicator bar */}
                          <span
                            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full transition-colors ${
                              isActiveItem ? 'bg-primary' : 'bg-transparent'
                            }`}
                          />
                          <span className="truncate">
                            {project.title ?? project.name ?? 'Untitled project'}
                          </span>
                        </Link>
                      )}

                      {/* Actions menu trigger */}
                      {editingProjectId !== project._id && (
                        <div
                          ref={
                            openProjectMenuId === project._id ? menuRef : undefined
                          }
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-150 ${
                            openProjectMenuId === project._id
                              ? 'opacity-100'
                              : 'opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:pointer-events-auto group-focus-within/item:opacity-100 group-focus-within/item:pointer-events-auto'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setOpenProjectMenuId((prev) =>
                                prev === project._id ? null : project._id,
                              );
                            }}
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors ${
                              openProjectMenuId === project._id
                                ? 'bg-black/10 text-heading'
                                : 'text-muted hover:bg-black/10 hover:text-heading'
                            }`}
                            aria-label="Project actions"
                            aria-expanded={openProjectMenuId === project._id}
                            title="Project actions"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {openProjectMenuId === project._id && (
                            <div
                              className="absolute right-0 top-[calc(100%+4px)] min-w-[160px] rounded-lg border border-theme surface-card shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 z-30"
                              role="menu"
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  startInlineRename(project);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 h-9 text-[13px] text-body hover:bg-black/5 hover:text-heading transition-colors"
                              >
                                <Pencil size={13} strokeWidth={1.8} />
                                <span>{tp('rename')}</span>
                              </button>
                              <div
                                className="h-px w-full"
                                style={{ backgroundColor: 'var(--border-light)' }}
                              />
                              <button
                                type="button"
                                role="menuitem"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  void handleDeleteProject(project);
                                }}
                                className="flex w-full items-center gap-2.5 px-3 h-9 text-[13px] text-error hover:bg-error/10 transition-colors"
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