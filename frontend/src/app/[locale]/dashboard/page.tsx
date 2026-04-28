'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { projectApi } from '@/lib/api';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { ArrowRight, FolderOpen, Users } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  url: string;
  status?: string;
  environment?: string;
  passed?: number;
  failed?: number;
  totalScenarios?: number;
  duration?: string;
  owner?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  accessSource?: 'owner' | 'team' | 'member';
  sharedViaTeam?: string;
}

const SECTION_LIMIT = 3;

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await projectApi.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      // Silently handle — empty state shown
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fetchProjects();
    });

    return () => cancelAnimationFrame(frame);
  }, [fetchProjects]);

  const ownerInitials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
    : '';

  const { ownedProjects, sharedProjects } = useMemo(() => {
    const owned: Project[] = [];
    const shared: Project[] = [];
    for (const p of projects) {
      if (p.accessSource === 'owner' || !p.accessSource) {
        owned.push(p);
      } else {
        shared.push(p);
      }
    }
    return { ownedProjects: owned, sharedProjects: shared };
  }, [projects]);

  const renderCard = (project: Project) => (
    <Link key={project._id} href={`/workspace/${project._id}`}>
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
      />
    </Link>
  );

  return (
    <div className="max-w-8xl mx-auto">
      <WelcomeSection onProjectCreated={fetchProjects} />

      {/* ───────── My Projects (owned) ───────── */}
      <ProjectSection
        icon={<FolderOpen size={16} className="text-primary" />}
        title={t('ownedProjects')}
        subtitle={t('ownedProjectsSubtitle')}
        count={ownedProjects.length}
        countLabel={t('projectCount', { count: ownedProjects.length })}
        seeMoreHref="/dashboard/projects?scope=owned"
        seeMoreLabel={tc('seeMore')}
        emptyText={t('noOwnedProjects')}
        emptyHint={t('urlHint')}
      >
        {ownedProjects.slice(0, SECTION_LIMIT).map(renderCard)}
      </ProjectSection>

      {/* ───────── Shared with me ───────── */}
      <ProjectSection
        icon={<Users size={16} className="text-primary" />}
        title={t('sharedProjects')}
        subtitle={t('sharedProjectsSubtitle')}
        count={sharedProjects.length}
        countLabel={t('projectCount', { count: sharedProjects.length })}
        seeMoreHref="/dashboard/projects?scope=shared"
        seeMoreLabel={tc('seeMore')}
        emptyText={t('noSharedProjects')}
        className="mt-10"
      >
        {sharedProjects.slice(0, SECTION_LIMIT).map(renderCard)}
      </ProjectSection>
    </div>
  );
}

/* ───────── Section wrapper ───────── */
interface ProjectSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  count: number;
  countLabel: string;
  seeMoreHref: string;
  seeMoreLabel: string;
  emptyText: string;
  emptyHint?: string;
  className?: string;
  children: React.ReactNode;
}

function ProjectSection({
  icon,
  title,
  subtitle,
  count,
  countLabel,
  seeMoreHref,
  seeMoreLabel,
  emptyText,
  emptyHint,
  className = '',
  children,
}: ProjectSectionProps) {
  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg surface-tertiary flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-heading truncate">
                {title}
              </h2>
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {count}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          </div>
        </div>

        {count > 0 && (
          <Link
            href={seeMoreHref}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors flex-shrink-0"
          >
            {seeMoreLabel}
            <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {count > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {children}
        </div>
      ) : (
        <div className="rounded-2xl border border-theme surface-card p-12 text-center">
          <div className="w-12 h-12 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-3">
            <FolderEmptyIcon />
          </div>
          <p className="text-sm text-body font-medium mb-1">{emptyText}</p>
          {emptyHint && (
            <p className="text-xs text-muted">{emptyHint}</p>
          )}
          <span className="sr-only">{countLabel}</span>
        </div>
      )}
    </section>
  );
}

/* Simple empty folder icon for empty state */
function FolderEmptyIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-muted">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
