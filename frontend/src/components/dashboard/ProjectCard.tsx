'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FolderOpen, Globe, MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';

export type ProjectAccessSource = 'owner' | 'team' | 'member';

interface ProjectCardProps {
  name: string;
  url: string;
  status?: string;
  environment?: string;
  passed?: number;
  failed?: number;
  totalScenarios?: number;
  duration?: string;
  avatar?: string;
  ownerInitials?: string;
  accessSource?: ProjectAccessSource;
  sharedViaTeam?: string;
  onRename?: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({
  name,
  url,
  status = 'Crawl',
  environment = 'Dev',
  passed = 0,
  failed = 0,
  totalScenarios = 0,
  duration = '0m 0s',
  avatar,
  ownerInitials = '',
  accessSource = 'owner',
  sharedViaTeam,
  onRename,
  onDelete,
}: ProjectCardProps) {
  const t = useTranslations('dashboard');
  const tp = useTranslations('projects');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Only the owner can rename / delete — hide the menu for shared projects.
  const canManage = accessSource === 'owner';
  const hasMenu = canManage && Boolean(onRename || onDelete);
  const isShared = accessSource !== 'owner';

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className="h-full min-h-[220px] rounded-2xl border border-theme surface-card shadow-card transition-all duration-200 hover:shadow-card-hover cursor-pointer group flex flex-col">
      {/* Header: project name + avatar/menu */}
      <div className="flex items-center justify-between px-5 py-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg surface-tertiary flex items-center justify-center flex-shrink-0">
            <FolderOpen size={17} className="text-primary" />
          </div>

          <span className="font-semibold font-heading text-sm text-heading truncate">
            {name}
          </span>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isShared && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide"
              title={
                sharedViaTeam
                  ? tp('sharedViaTeam', { team: sharedViaTeam })
                  : tp('sharedBadge')
              }
            >
              <Users size={10} />
              {tp('sharedBadge')}
            </span>
          )}

          {hasMenu && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-heading hover:surface-tertiary transition-colors"
                aria-label="Menu"
              >
                <MoreHorizontal size={16} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-theme surface-card shadow-lg z-20 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onRename && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        onRename();
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-body hover:surface-tertiary transition-colors"
                    >
                      <Pencil size={14} />
                      {tp('rename')}
                    </button>
                  )}

                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-error hover:surface-tertiary transition-colors"
                    >
                      <Trash2 size={14} />
                      {tp('delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-5" style={{ backgroundColor: 'var(--border-color)' }} />

      {/* Body */}
      <div className="p-5 pt-4 flex-1 flex flex-col justify-between">
        {/* URL */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Globe size={14} className="text-muted flex-shrink-0" />
              <span className="text-xs text-body truncate">{url}</span>
            </div>
            {isShared && sharedViaTeam && (
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={12} className="text-muted flex-shrink-0" />
                <span className="text-xs text-muted truncate">
                  {tp('sharedViaTeam', { team: sharedViaTeam })}
                </span>
              </div>
            )}
            {/* Status + Environment */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-3 py-1 rounded-full surface-tertiary text-body">
                {environment}
              </span>
            </div>
          </div>

          <span className="text-xs font-medium px-3 py-1 rounded-full border border-primary text-primary">
            {status}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-auto flex items-center flex-wrap gap-x-3 gap-y-1 pt-3 border-t border-theme text-xs text-body">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            {passed} {t('passed')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error inline-block" />
            {failed} {t('failed')}
          </span>
          <span>
            {totalScenarios} {t('totalScenarios')}
          </span>
        </div>
      </div>
    </div>
  );
}
