'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { projectApi } from '@/lib/api';
import WorkspaceTopBar from '@/components/workspace/WorkspaceTopBar';
import WorkspaceTabs, { WorkspaceTab } from '@/components/workspace/WorkspaceTabs';
import ExplorationView from '@/components/workspace/ExplorationView';
import AgentHelperPanel from '@/components/workspace/AgentHelperPanel';
import WorkspaceLoader from '@/components/workspace/WorkspaceLoader';

interface Project {
  _id: string;
  name: string;
  url: string;
}

type WorkspaceState = 'fetching' | 'crawling' | 'ready' | 'error';

const MOCK_SITEMAP = [
  { path: '/', links: 24, forms: 1, images: 8 },
  { path: '/about', links: 12, forms: 0, images: 4 },
  { path: '/pricing', links: 18, forms: 0, images: 3 },
  { path: '/blog', links: 32, forms: 1, images: 12 },
  { path: '/blog/post-1', links: 14, forms: 0, images: 5 },
  { path: '/contact', links: 8, forms: 1, images: 2 },
  { path: '/login', links: 5, forms: 1, images: 1 },
  { path: '/register', links: 6, forms: 1, images: 1 },
  { path: '/features', links: 22, forms: 0, images: 7 },
  { path: '/dashboard', links: 28, forms: 2, images: 6 },
];

const MOCK_FLOWS = [
  { name: 'Sign up → Email verification → Onboarding', steps: 6 },
  { name: 'Login → Dashboard', steps: 3 },
  { name: 'Browse pricing → Checkout', steps: 5 },
  { name: 'Password reset flow', steps: 4 },
  { name: 'Contact form submission', steps: 3 },
];

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === '1';

  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<WorkspaceState>('fetching');
  const [tab, setTab] = useState<WorkspaceTab>('exploration');
  const [agentOpen, setAgentOpen] = useState(true);

  // Reset to `fetching` when navigating between projects. Setting state
  // during render (guarded by a previous-id check) is the idiomatic React
  // pattern for resetting derived state on a key change.
  const [lastId, setLastId] = useState(id);
  if (lastId !== id) {
    setLastId(id);
    setProject(null);
    setState('fetching');
  }

  // Load the project
  useEffect(() => {
    let cancelled = false;
    projectApi
      .getById(id)
      .then(({ data }) => {
        if (cancelled) return;
        setProject(data);
        // If the user just created the project, show crawling animation
        // Otherwise go straight to ready
        setState(isNew ? 'crawling' : 'ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const stats = {
    attempt: 1,
    totalPages: 20,
    userFlows: 5,
    routes: 60,
  };

  return (
    <div className="flex-1 flex min-w-0 h-full">
      {/* Center column */}
      <div className="flex-1 flex flex-col min-w-0">
        <WorkspaceTopBar
          projectName={project?.name || '...'}
          onToggleAgent={() => setAgentOpen((v) => !v)}
          agentOpen={agentOpen}
        />

        {state === 'fetching' && <WorkspaceLoader mode="fetching" />}

        {state === 'crawling' && (
          <WorkspaceLoader
            mode="crawling"
            projectName={project?.name}
            projectUrl={project?.url}
            onComplete={() => setState('ready')}
          />
        )}

        {state === 'error' && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted">
            Project not found.
          </div>
        )}

        {state === 'ready' && (
          <>
            <WorkspaceTabs active={tab} onChange={setTab} />

            {tab === 'exploration' && (
              <ExplorationView
                projectUrl={project?.url || ''}
                stats={stats}
                sitemap={MOCK_SITEMAP}
                flows={MOCK_FLOWS}
              />
            )}

            {tab === 'scenarios' && <EmptyTab label="Scénarios — à venir" />}
            {tab === 'report' && <EmptyTab label="Rapport — à venir" />}
          </>
        )}
      </div>

      {/* Agent panel */}
      {agentOpen && <AgentHelperPanel />}
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-muted">
      {label}
    </div>
  );
}
