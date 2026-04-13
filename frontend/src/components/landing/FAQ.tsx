"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

const faqKeys = ["q1", "q2", "q3", "q4"] as const;

export default function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8 surface-primary">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {t("sectionLabel")}
          </span>
          <h2 className="font-heading text-3xl font-extrabold text-heading sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-body">
            {t("subtitle")}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqKeys.map((key, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-theme surface-card transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center gap-3 px-6 py-5 text-left"
                >
                  <span className="flex-1 font-heading text-sm font-semibold text-heading sm:text-base">
                    {t(`${key}.question`)}
                  </span>
                  <ChevronDown
                    className={`h-8 w-8 shrink-0 transition-all duration-300 ease-out rounded-full p-2 ${
                      isOpen ? "rotate-180 bg-primary text-white" : "text-muted"
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-body">
                      {t(`${key}.answer`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
