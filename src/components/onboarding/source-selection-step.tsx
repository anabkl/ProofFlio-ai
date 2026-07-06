"use client";

import Link from "next/link";
import { Award, FileText, FolderGit, PenLine, ShieldCheck } from "lucide-react";
import type { Copy, TemplateId } from "@/lib/content";
import type { EvidenceItem, EvidenceSourceType } from "@/lib/onboarding/types";

const sourceIcons = {
  cv: FileText,
  certificate: Award,
  manual_project: PenLine,
  github_placeholder: FolderGit,
} as const;

export function SourceSelectionStep({
  t,
  templateId,
  selectedSource,
  evidenceItems,
  onSelect,
}: {
  t: Copy;
  templateId: TemplateId;
  selectedSource: EvidenceSourceType;
  evidenceItems: EvidenceItem[];
  onSelect: (source: EvidenceSourceType) => void;
}) {
  const sources = [
    { id: "cv", label: t.onboarding.sources.cv, detail: t.onboarding.sources.cvDetail, disabled: false },
    { id: "certificate", label: t.onboarding.sources.certificate, detail: t.onboarding.sources.certificateDetail, disabled: false },
    { id: "manual_project", label: t.onboarding.sources.manualProject, detail: t.onboarding.sources.manualDetail, disabled: false },
    { id: "github_placeholder", label: t.onboarding.sources.github, detail: t.onboarding.sources.githubDetail, disabled: true },
  ] as const;

  return (
    <section className="space-y-6" aria-labelledby="sources-heading">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2DD4BF]">{t.onboarding.stepEyebrow}</p>
        <h2 id="sources-heading" className="mt-3 text-3xl font-black tracking-tight text-white">
          {t.onboarding.sourcesTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#A8B3C7]">{t.onboarding.sourcesBody}</p>
      </div>

      <div className="rounded-xl border border-[#2DD4BF]/24 bg-[#2DD4BF]/8 p-4 text-sm font-bold leading-6 text-[#CFFCF6]">
        <ShieldCheck className="mb-2 text-[#99F6E4]" size={18} />
        {t.onboarding.honestyNotice}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sources.map((source) => {
          const Icon = sourceIcons[source.id];
          const count = evidenceItems.filter((item) => item.sourceType === source.id).length;
          const active = selectedSource === source.id;

          const cardContent = (
            <>
              <span className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#9ed0ff]">
                  <Icon size={21} />
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.055] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/56">
                  {source.disabled ? t.onboarding.comingSoon : count > 0 ? `${count} ${t.onboarding.saved}` : t.onboarding.ready}
                </span>
              </span>
              <span className="mt-5 block text-xl font-black text-white">{source.label}</span>
              <span className="mt-3 block text-sm leading-6 text-white/58">{source.detail}</span>
            </>
          );

          const cardClassName = [
            "pf-focus group min-h-44 rounded-xl border p-5 text-left transition",
            active
              ? "border-[#4E8CFF]/60 bg-[#4E8CFF]/14 shadow-[0_18px_80px_rgba(78,140,255,.14)]"
              : "border-white/10 bg-white/[0.05] hover:border-white/22",
            source.disabled ? "cursor-not-allowed opacity-60" : "",
          ].join(" ");

          return source.disabled ? (
            <button
              key={source.id}
              type="button"
              disabled
              data-testid={`source-${source.id.replace("_", "-")}`}
              className={cardClassName}
            >
              {cardContent}
            </button>
          ) : (
            <Link
              key={source.id}
              href={`/onboarding?step=upload&source=${source.id}&template=${templateId}`}
              onClick={(event) => {
                event.preventDefault();
                onSelect(source.id);
              }}
              data-testid={`source-${source.id.replace("_", "-")}`}
              className={cardClassName}
              aria-current={active ? "true" : undefined}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
