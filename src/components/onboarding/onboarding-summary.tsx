"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowRight, CheckCircle2, Database, FileText } from "lucide-react";
import { continueToEditorAction } from "@/app/onboarding/actions";
import type { Copy, TemplateId } from "@/lib/content";

export function OnboardingSummary({
  t,
  portfolioId,
  templateId,
  approvedCount,
  evidenceCount,
  canPersist,
}: {
  t: Copy;
  portfolioId: string;
  templateId: TemplateId;
  approvedCount: number;
  evidenceCount: number;
  canPersist: boolean;
}) {
  return (
    <section className="space-y-6" aria-labelledby="summary-heading">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2DD4BF]">{t.onboarding.summaryEyebrow}</p>
        <h2 id="summary-heading" className="mt-3 text-3xl font-black tracking-tight text-white">
          {t.onboarding.summaryTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#A8B3C7]">{t.onboarding.summaryBody}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryMetric icon={Database} value={portfolioId.slice(0, 12)} label={t.onboarding.portfolioDraft} />
        <SummaryMetric icon={FileText} value={String(evidenceCount)} label={t.onboarding.savedEvidence} />
        <SummaryMetric icon={CheckCircle2} value={String(approvedCount)} label={t.onboarding.approvedEvidence} />
      </div>

      <div className="rounded-xl border border-[#2DD4BF]/22 bg-[#2DD4BF]/10 p-5">
        <h3 className="text-xl font-black text-white">{t.onboarding.editorReadyTitle}</h3>
        <p className="mt-3 text-sm leading-7 text-[#CFFCF6]">{t.onboarding.editorReadyBody}</p>
        {canPersist ? (
          <form action={continueToEditorAction} className="mt-5">
            <input type="hidden" name="portfolioId" value={portfolioId} />
            <input type="hidden" name="templateId" value={templateId} />
            <ContinueButton label={t.onboarding.continueEditor} saving={t.onboarding.saving} />
          </form>
        ) : (
          <Link
            href={`/editor?template=${templateId}&onboarding=ready`}
            className="pf-focus mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021] hover:bg-[#BFDBFE]"
          >
            {t.onboarding.openPreviewEditor}
            <ArrowRight size={17} />
          </Link>
        )}
      </div>
    </section>
  );
}

function SummaryMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Database;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-5">
      <Icon className="text-[#9ed0ff]" size={20} />
      <div className="mt-4 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-white/48">{label}</div>
    </div>
  );
}

function ContinueButton({ label, saving }: { label: string; saving: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021] hover:bg-[#BFDBFE] disabled:opacity-60"
    >
      {pending ? saving : label}
      <ArrowRight size={17} />
    </button>
  );
}
