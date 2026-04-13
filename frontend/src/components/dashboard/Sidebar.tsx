'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
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
  X,
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
}

interface SidebarProps {
  recentProjects?: Project[];
}

export default function Sidebar({ recentProjects = [] }: SidebarProps) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const [collapsed, setCollapsed] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { key: 'projects' as const, icon: FolderOpen, href: '/dashboard', active: true },
    { key: 'reports' as const, icon: FileText, href: '/dashboard', active: false },
    { key: 'team' as const, icon: Users, href: '/dashboard', active: false },
    { key: 'settings' as const, icon: Settings, href: '/dashboard', active: false },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between px-5 py-4 h-16">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center">
              <Image
                src="/Logo.png"
                alt="Testara"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold font-heading text-heading">
              {tc('testara')}
            </span>
          </Link>
        )}
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            if (mobileOpen) setMobileOpen(false);
          }}
          className="p-1.5 rounded-lg transition-colors hidden lg:flex text-body"
          style={{ backgroundColor: collapsed ? 'transparent' : undefined }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg transition-colors lg:hidden text-body"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <X size={20} />
        </button>
      </div>

      <div className="h-px w-full mb-5" style={{ backgroundColor: 'var(--border-color)' }} />

      {/* New Project Button */}
      <div className="px-4 mb-5">
        <button
          className={`flex items-center gap-2.5 w-full rounded-xl py-2.5 font-medium text-sm text-white transition-colors hover:opacity-90 bg-primary ${
            collapsed ? 'justify-center px-2.5' : 'px-4'
          }`}
        >
          <Plus size={18} />
          {!collapsed && <span>{t('newProject')}</span>}
        </button>
      </div>

<div>
      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-2.5' : 'px-4'
              } ${item.active ? 'surface-tertiary text-primary' : 'text-body'}`}
              onMouseEnter={(e) => {
                if (!item.active) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                if (!item.active) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={20} />
              {!collapsed && <span>{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="h-px w-full mb-5" style={{ backgroundColor: 'var(--border-color)' }} />

      {/* Recent Projects */}
      {collapsed ? (
        /* Collapsed: show clock icon */
        <div className="px-3 pb-5 mt-auto">
          <div className="flex justify-center py-2">
            <Clock size={18} className="text-muted" />
          </div>
        </div>
      ) : (
        <div className="px-3 pb-5 mt-4">
          <button
            onClick={() => setRecentOpen(!recentOpen)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider w-full text-muted"
          >
            {recentOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>{t('recentProjects')}</span>
          </button>
          {recentOpen && (
            <div className="mt-1 space-y-0.5">
              {recentProjects.length > 0 ? (
                recentProjects.slice(0, 5).map((project) => (
                  <Link
                    key={project._id}
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm text-body transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <FolderOpen size={16} className="flex-shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-muted">
                  --
                </div>
              )}
            </div>
          )}
        </div>
      )}
</div>

    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg surface-card shadow-card text-heading lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 border-r border-theme transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-[72px]' : 'w-[250px]'}`}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for layout */}
      <div
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      />
    </>
  );
}
