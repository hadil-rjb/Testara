"use client";

import { useTranslations } from "next-intl";
import { FolderOpen, Globe } from "lucide-react";

interface ProjectCardProps {
  name: string;
  url: string;
  status?: string;
  environment?: string;
  passed?: number;
  failed?: number;
  totalScenarios?: number;
  duration?: string;
  avatar?: string;
  ownerInitials?: string;
}

export default function ProjectCard({
  name,
  url,
  status = "Crawl",
  environment = "Dev",
  passed = 0,
  failed = 0,
  totalScenarios = 0,
  duration = "0m 0s",
  avatar,
  ownerInitials = "",
}: ProjectCardProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="rounded-2xl border border-theme surface-card shadow-card transition-all duration-200 hover:shadow-card-hover cursor-pointer group">
      {/* Header: project name + avatar */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg surface-tertiary flex items-center justify-center flex-shrink-0">
            <FolderOpen size={17} className="text-primary" />
          </div>
          <span className="font-semibold font-heading text-sm text-heading truncate">
            {name}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 border-2 border-primary/20 flex-shrink-0 ml-3">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary text-[11px] font-bold">
              {ownerInitials}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px mx-5"
        style={{ backgroundColor: "var(--border-color)" }}
      />

      {/* Body */}
      <div className="p-5 pt-4">
        {/* URL */}
        <div className="flex items-center justify-between gap-1.5">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Globe size={14} className="text-muted flex-shrink-0" />
              <span className="text-xs text-body truncate">{url}</span>
            </div>
            {/* Status + Environment */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-3 py-1 rounded-full surface-tertiary text-body">
                {environment}
              </span>
            </div>
          </div>

          <span className="text-xs font-medium px-3 py-1 rounded-full border border-primary text-primary">
            {status}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-3 border-t border-theme text-xs text-body">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            {passed} {t("passed")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-error inline-block" />
            {failed} {t("failed")}
          </span>
          <span>
            {totalScenarios} {t("totalScenarios")}
          </span>
          <span className="text-muted ml-auto">{duration}</span>
        </div>
      </div>
    </div>
  );
}
