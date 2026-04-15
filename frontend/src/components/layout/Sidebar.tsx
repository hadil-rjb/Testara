'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import {
  FolderOpen,
  FileText,
  Users,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Clock,
  Menu,
  LucideIcon,
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
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

export default function Sidebar({ recentProjects = [] }: SidebarProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between px-5 h-16">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg -mx-1 px-1 py-1"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Image
                src="/Logo.png"
                alt="Testara"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-heading">
              {tc('testara')}
            </span>
          </Link>
        )}
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            if (mobileOpen) setMobileOpen(false);
          }}
          className="icon-btn hidden lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

      </div>

      <div
        className="h-px w-full mb-4"
        style={{ backgroundColor: 'var(--border-light)' }}
      />

      {/* New Project CTA */}
      <div className="px-4 mb-4">
        <Link
          href="/dashboard"
          className={`group relative flex items-center gap-2.5 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out active:translate-y-0 active:shadow-sm ${
            collapsed ? 'justify-center px-2.5' : 'px-4'
          }`}
          style={{
            background:
              'linear-gradient(135deg, var(--color-primary) 100%, var(--color-primary-light) 100%)',
          }}
          aria-label={t('newProject')}
          title={collapsed ? t('newProject') : undefined}
        >
          <Plus size={18} strokeWidth={2.5} />
          {!collapsed && <span>{t('newProject')}</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="px-3 space-y-0.5"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon
                size={18}
                strokeWidth={item.active ? 2.25 : 2}
                className="flex-shrink-0"
              />
              {!collapsed && <span className="truncate">{t(item.key)}</span>}
            </>
          );

          if (item.disabled) {
            return (
              <div
                key={item.key}
                data-active={item.active}
                data-collapsed={collapsed}
                className="nav-item opacity-45 cursor-not-allowed"
                title={collapsed ? t(item.key) : 'Coming soon'}
                aria-disabled="true"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              data-active={item.active}
              data-collapsed={collapsed}
              className="nav-item"
              aria-current={item.active ? 'page' : undefined}
              title={collapsed ? t(item.key) : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div
        className="h-px w-full mt-5 mb-4"
        style={{ backgroundColor: 'var(--border-light)' }}
      />

      {/* Recent Projects */}
      {collapsed ? (
        <div className="px-3 pb-4 mt-auto">
          <div
            className="flex justify-center py-2 text-muted"
            title={t('recentProjects')}
          >
            <Clock size={18} />
          </div>
        </div>
      ) : (
        <div className="px-3 pb-5 mt-1 flex-1 min-h-0 flex flex-col">
          <button
            onClick={() => setRecentOpen(!recentOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted rounded-md hover:text-heading transition-colors"
            aria-expanded={recentOpen}
          >
            {recentOpen ? (
              <ChevronDown size={13} strokeWidth={2.5} />
            ) : (
              <ChevronRight size={13} strokeWidth={2.5} />
            )}
            <span>{t('recentProjects')}</span>
          </button>
          {recentOpen && (
            <div className="mt-1.5 space-y-0.5 overflow-y-auto">
              {recentProjects.length > 0 ? (
                recentProjects.slice(0, 5).map((project) => (
                  <Link
                    key={project._id}
                    href="/dashboard"
                    className="group flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm text-body transition-colors hover:text-heading"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        'var(--bg-tertiary)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <FolderOpen
                      size={15}
                      className="flex-shrink-0 text-muted group-hover:text-primary transition-colors"
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-muted italic">—</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 icon-btn surface-card shadow-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 border-r border-theme transition-[width,transform] duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-[72px]' : 'w-[250px]'}`}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
        aria-label="Primary"
      >
        {sidebarContent}
      </aside>

      {/* Spacer for layout */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-[width] duration-300 ease-out ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
        aria-hidden="true"
      />
    </>
  );
}
