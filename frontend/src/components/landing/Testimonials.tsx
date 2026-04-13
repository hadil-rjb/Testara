'use client';

import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';

const testimonials = [
  {
    reviewKey: 'review1',
    name: 'Artemisia Udinese',
    role: 'Marketing Specialist',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    reviewKey: 'review2',
    name: 'Artemisia Udinese',
    role: 'Marketing Specialist',
    avatar: '/testimonials/avatar-1.png',
  },
  {
    reviewKey: 'review3',
    name: 'Artemisia Udinese',
    role: 'Marketing Specialist',
    avatar: '/testimonials/avatar-1.png',
  },
];

/* Purple quote-mark icon */
function QuoteIcon() {
  return (
    <div className="w-11 h-11 rounded-full surface-card border border-theme flex items-center justify-center shadow-sm">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#654CDE">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.189 11 15c0 1.933-1.567 3.5-3.5 3.5-1.172 0-2.149-.465-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.189 21 15c0 1.933-1.567 3.5-3.5 3.5-1.172 0-2.149-.465-2.917-1.179z" />
      </svg>
    </div>
  );
}

export default function Testimonials() {
  const t = useTranslations('testimonials');

  return (
    <section
      id="testimonials"
      className="px-4 py-24 sm:px-6 lg:px-8 surface-secondary"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block text-sm font-semibold tracking-wide text-primary">
            {t('sectionLabel')}
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl lg:text-[42px] leading-tight">
            {t('title')}
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((person, index) => (
            <div
              key={index}
              className="relative rounded-2xl border border-theme surface-card pt-10 pb-7 px-8 shadow-card transition-shadow duration-300 hover:shadow-card-hover group"
            >
              {/* Floating quote icon — overlaps the top border */}
              <div className="absolute -top-5 left-40">
                <QuoteIcon />
              </div>

              {/* 5 Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-[18px] w-[18px] fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-[15px] leading-[1.7] mb-8 text-body">
                {t(person.reviewKey)}
              </p>

              {/* Divider */}
              <div className="h-px w-full mb-5" style={{ backgroundColor: 'var(--border-color)' }} />

              {/* Author */}
              <div className="flex items-center gap-3.5">
                {/* Avatar */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Initials fallback */}
                  <div
                    className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold rounded-full -z-10"
                    style={{ background: 'linear-gradient(135deg, #654CDE, #8B83FF)' }}
                  >
                    {person.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold leading-tight text-heading">
                    {person.name}
                  </p>
                  <p className="text-xs mt-0.5 text-muted">
                    {person.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
