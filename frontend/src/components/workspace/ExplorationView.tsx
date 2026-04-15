'use client';

import { useTranslations } from 'next-intl';
import {
  FileText,
  GitBranch,
  Route,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  LinkIcon,
  ListTodo,
  Image as ImageIcon,
} from 'lucide-react';

interface CrawlStats {
  totalPages: number;
  userFlows: number;
  routes: number;
  attempt: number;
}

interface SitemapEntry {
  path: string;
  links: number;
  forms: number;
  images: number;
}

interface UserFlow {
  name: string;
  steps: number;
}

interface ExplorationViewProps {
  projectUrl: string;
  stats: CrawlStats;
  sitemap: SitemapEntry[];
  flows: UserFlow[];
}

export default function ExplorationView({
  projectUrl,
  stats,
  sitemap,
  flows,
}: ExplorationViewProps) {
  const t = useTranslations('workspace');

  const statCards = [
    { key: 'totalPages', icon: FileText, value: stats.totalPages, label: t('crawl.totalPages') },
    { key: 'userFlows', icon: GitBranch, value: stats.userFlows, label: t('crawl.userFlows') },
    { key: 'routes', icon: Route, value: stats.routes, label: t('crawl.routes') },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      {/* Crawl Results */}
      <section className="rounded-2xl border border-theme surface-card p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold font-heading text-heading">
                {t('crawl.title')}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full surface-tertiary text-muted">
                {t('crawl.attempt')} #{stats.attempt}
              </span>
            </div>
            <p className="text-xs text-muted flex items-center gap-1.5">
              <ExternalLink size={12} />
              {projectUrl}
            </p>
          </div>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-primary border border-primary/30 transition-colors hover:bg-primary/5">
            <RefreshCw size={13} />
            {t('crawl.recrawl')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="rounded-xl border border-theme surface-primary p-4 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={19} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold font-heading text-heading leading-tight">
                    {card.value}
                  </div>
                  <div className="text-xs text-muted truncate">{card.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sitemap */}
      <section className="rounded-2xl border border-theme surface-card overflow-hidden">
        <div className="p-5 border-b border-theme">
          <h2 className="text-base font-semibold font-heading text-heading">
            {t('sitemap.title')}
          </h2>
          <p className="text-xs text-muted mt-0.5">{t('sitemap.subtitle')}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted border-b border-theme">
                <th className="px-5 py-3">{t('sitemap.url')}</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <LinkIcon size={12} /> {t('sitemap.links')}
                  </span>
                </th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <ListTodo size={12} /> {t('sitemap.forms')}
                  </span>
                </th>
                <th className="px-4 py-3 text-center hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    <ImageIcon size={12} /> {t('sitemap.images')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sitemap.map((row, i) => (
                <tr
                  key={row.path}
                  className={`text-body transition-colors hover:surface-tertiary ${
                    i !== sitemap.length - 1 ? 'border-b border-theme' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-heading">{row.path}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted">
                    {row.links}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted">
                    {row.forms}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell text-muted">
                    {row.images}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Flows */}
      <section className="rounded-2xl border border-theme surface-card overflow-hidden">
        <div className="p-5 border-b border-theme">
          <h2 className="text-base font-semibold font-heading text-heading">
            {t('flows.title')}
          </h2>
          <p className="text-xs text-muted mt-0.5">{t('flows.subtitle')}</p>
        </div>

        <ul>
          {flows.map((flow, i) => (
            <li
              key={flow.name}
              className={`flex items-center justify-between px-5 py-3.5 transition-colors hover:surface-tertiary cursor-pointer ${
                i !== flows.length - 1 ? 'border-b border-theme' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GitBranch size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-heading truncate">
                    {flow.name}
                  </div>
                  <div className="text-xs text-muted">
                    {flow.steps} {t('flows.steps')}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted flex-shrink-0" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
