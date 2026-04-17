"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "@/i18n/routing";
import { projectApi } from "@/lib/api";
import { FolderOpen, Globe, ArrowUp } from "lucide-react";

interface WelcomeSectionProps {
  onProjectCreated?: () => void;
}

export default function WelcomeSection({
  onProjectCreated,
}: WelcomeSectionProps) {
  const t = useTranslations("dashboard");
  const { user } = useAuthStore();
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await projectApi.create({
        name: projectName,
        url: projectUrl,
      });
      setProjectName("");
      setProjectUrl("");
      onProjectCreated?.();
      if (data?._id) {
        router.push(`/workspace/${data._id}?new=1`);
      }
    } catch {
      // Error handling can be extended
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-10">
      {/* Hero area with decorative gradient */}
      <div className="relative rounded-3xl px-6 py-12 sm:py-16 mb-0">
        {/* Decorative gradient blur blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[150px] rounded-full bg-primary/10 blur-[100px]" />
        </div>

        {/* Centered greeting */}
        <div className="flex flex-col items-center text-center mt-8">
          {/* Gear icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Image
              src="/Logo.png"
              alt="Testara"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-heading">
            {t("hello")} {user?.firstName} {user?.lastName}
          </h1>
        </div>
      </div>

      {/* Project creation card — centered and elevated */}
      <div className="max-w-2xl mx-auto -mt-8 relative z-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl p-2 border border-theme surface-card shadow-card"
        >
          <div className="space-y-0">
            {/* Project name input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-theme">
              <FolderOpen size={18} className="text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder={t("projectName")}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
              />
            </div>

            {/* URL input */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Globe size={18} className="text-muted flex-shrink-0" />
              <input
                type="url"
                placeholder={t("urlPlaceholder")}
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white dark:text-black transition-all disabled:opacity-60 flex-shrink-0 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--text-primary)" }}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </form>

        {/* Hint text */}
        <p className="mt-4 text-xs text-center text-content-tertiary">{t("urlHint")}</p>
      </div>
    </div>
  );
}
