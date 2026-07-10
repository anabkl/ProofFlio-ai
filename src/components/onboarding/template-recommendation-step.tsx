"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Eye, Sparkles } from "lucide-react";
import { selectTemplateAction } from "@/app/onboarding/actions";
import type { Copy, Locale, TemplateId } from "@/lib/content";
import { recommendedTemplateIds } from "@/lib/onboarding/types";
import { templateMeta } from "@/lib/content";

export function TemplateRecommendationStep({
  t,
  portfolioId,
  selectedTemplateId,
  locale,
  canPersist,
}: {
  t: Copy;
  portfolioId: string;
  selectedTemplateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
}) {
  return (
    <section className="space-y-6" aria-labelledby="template-heading">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2DD4BF]">{t.onboarding.templateEyebrow}</p>
        <h2 id="template-heading" className="mt-3 text-3xl font-black tracking-tight text-white">
          {t.onboarding.templateTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#A8B3C7]">{t.onboarding.templateBody}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {recommendedTemplateIds.map((templateId) => {
          const selected = selectedTemplateId === templateId;
          const template = t.templates[templateId];
          const Icon = templateMeta[templateId].icon;

          return (
            <article
              key={templateId}
              data-testid={`template-option-${templateId}`}
              className={[
                "rounded-xl border p-5 transition",
                selected
                  ? "border-[#4E8CFF]/60 bg-[#4E8CFF]/14 shadow-[0_18px_80px_rgba(78,140,255,.14)]"
                  : "border-white/10 bg-white/[0.045]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#9ed0ff]">
                  <Icon size={21} />
                </span>
                {selected ? (
                  <span className="rounded-md bg-[#DDFBFF] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#071021]">
                    {t.onboarding.selected}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 text-xl font-black text-white">{template.name}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{template.profile}</p>
              <p className="mt-4 rounded-lg border border-white/10 bg-[#070B14]/62 p-3 text-sm font-semibold leading-6 text-white/62">
                {t.onboarding.templateReasons[templateId]}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Link
                  href={`/templates/${templateId}`}
                  className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 px-4 py-3 text-sm font-black text-white/70 hover:bg-white/8"
                >
                  <Eye size={16} />
                  {t.common.preview}
                </Link>
                <form action={selectTemplateAction}>
                  <input type="hidden" name="portfolioId" value={portfolioId} />
                  <input type="hidden" name="templateId" value={templateId} />
                  <input type="hidden" name="locale" value={locale} />
                  <SelectTemplateButton disabled={!canPersist} label={selected ? t.onboarding.selected : t.common.useTemplate} saving={t.onboarding.saving} />
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SelectTemplateButton({ disabled, label, saving }: { disabled: boolean; label: string; saving: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="pf-focus inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#BFDBFE] disabled:opacity-55"
    >
      <Sparkles size={16} />
      {pending ? saving : label}
    </button>
  );
}
