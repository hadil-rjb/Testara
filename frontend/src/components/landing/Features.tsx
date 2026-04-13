"use client";

import { useTranslations } from "next-intl";
import { Compass, Sparkles, Play, Shield, FileText, Users } from "lucide-react";

const features = [
  { key: "exploration", icon: Compass },
  { key: "scenarios", icon: Sparkles },
  { key: "execution", icon: Play },
  { key: "security", icon: Shield },
  { key: "reports", icon: FileText },
  { key: "collaboration", icon: Users },
] as const;

export default function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8 surface-primary">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full text-xs font-semibold uppercase tracking-wider text-primary">
            {t("sectionLabel")}
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-body">
            {t("subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {features.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="group flex items-start gap-4 rounded-2xl border border-theme surface-card p-6 transition-all backdrop-blur-md hover:border-primary"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                <Icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex flex-col">
                <h3 className="mb-1 font-heading text-lg font-semibold text-heading">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-body">
                  {t(`${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
