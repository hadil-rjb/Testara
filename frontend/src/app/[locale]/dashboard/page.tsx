'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { projectApi } from '@/lib/api';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { ChevronDown, ArrowRight } from 'lucide-react';

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
}

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

  return (
    <div className="max-w-8xl mx-auto">
      <WelcomeSection onProjectCreated={fetchProjects} />

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <button className="flex items-center gap-2 text-base font-semibold text-heading">
            {t('recentProjects')}
            <ChevronDown size={18} className="text-muted" />
          </button>
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors"
          >
            {tc('seeMore')}
            <ArrowRight size={15} />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((project) => (
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
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-theme surface-card p-16 text-center">
            <div className="w-14 h-14 rounded-full surface-tertiary flex items-center justify-center mx-auto mb-4">
              <FolderEmptyIcon />
            </div>
            <p className="text-sm text-body mb-1 font-medium">
              {t('urlHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Simple empty folder icon for empty state */
function FolderEmptyIcon() {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-muted">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}
