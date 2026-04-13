'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 surface-primary">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-light px-6 py-16 text-center sm:px-12 sm:py-20">
          <h2 className="relative font-heading text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            {t('title')}
          </h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            {t('subtitle')}
          </p>
          <div className="relative mt-8">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-transform"
            >
              {t('button')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
