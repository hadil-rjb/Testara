'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';

interface WorkspaceLoaderProps {
  mode: 'fetching' | 'crawling';
  projectName?: string;
  projectUrl?: string;
  onComplete?: () => void;
}

/**
 * Beautiful full-area loading state for the workspace.
 *  - `fetching` — brief skeleton while project details load
 *  - `crawling` — animated multi-step "crawl in progress" visual
 */
export default function WorkspaceLoader({
  mode,
  projectName,
  projectUrl,
  onComplete,
}: WorkspaceLoaderProps) {
  const t = useTranslations('workspace');

  const steps = [
    t('crawlStep1'),
    t('crawlStep2'),
    t('crawlStep3'),
    t('crawlStep4'),
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (mode !== 'crawling') return;
    const interval = setInterval(() => {
      setCurrent((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [mode, steps.length, onComplete]);

  if (mode === 'fetching') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Image
            src="/Logo.png"
            alt="Testara"
            width={28}
            height={28}
            className="object-contain animate-pulse"
          />
        </div>
        <h2 className="text-base font-semibold font-heading text-heading mb-1">
          {t('loadingTitle')}
        </h2>
        <p className="text-sm text-muted">{t('loadingSubtitle')}</p>
        <div className="mt-6 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-6 py-16">
        {/* Animated gradient orb */}
        <div className="relative mx-auto w-28 h-28 mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-primary/30 blur-xl animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-xl">
            <Image
              src="/Logo.png"
              alt="Testara"
              width={48}
              height={48}
              className="object-contain brightness-0 invert"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-heading mb-2">
            {t('crawlingTitle')}
          </h2>
          <p className="text-sm text-muted">{t('crawlingSubtitle')}</p>
          {projectName && (
            <div className="mt-5 inline-flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-theme surface-card px-4 py-2.5">
              <span className="text-xs font-semibold text-heading">{projectName}</span>
              {projectUrl && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-[var(--border-color)]" />
                  <span className="text-xs text-muted truncate max-w-[200px]">{projectUrl}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="rounded-2xl border border-theme surface-card p-5 space-y-3">
          {steps.map((step, idx) => {
            const done = idx < current;
            const active = idx === current;
            return (
              <div
                key={step}
                className={`flex items-center gap-3.5 transition-opacity ${
                  idx > current ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    done
                      ? 'bg-primary text-white'
                      : active
                      ? 'bg-primary/10 text-primary'
                      : 'surface-tertiary text-muted'
                  }`}
                >
                  {done ? (
                    <Check size={14} strokeWidth={3} />
                  ) : active ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    done || active ? 'text-heading font-medium' : 'text-body'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1 w-full rounded-full overflow-hidden surface-tertiary">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
