"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2, Edit3, ShieldCheck, XCircle } from "lucide-react";
import { reviewProposalAction } from "@/app/onboarding/actions";
import type { Copy, TemplateId } from "@/lib/content";
import type { ProposalSuggestion } from "@/lib/onboarding/types";

export function ProposalReviewStep({
  t,
  suggestions,
  portfolioId,
  templateId,
  approvedCount,
  canPersist,
}: {
  t: Copy;
  suggestions: ProposalSuggestion[];
  portfolioId: string;
  templateId: TemplateId;
  approvedCount: number;
  canPersist: boolean;
}) {
  return (
    <section className="space-y-6" aria-labelledby="proposal-heading">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2DD4BF]">{t.onboarding.reviewEyebrow}</p>
          <h2 id="proposal-heading" className="mt-3 text-3xl font-black tracking-tight text-white">
            {t.onboarding.reviewTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#A8B3C7]">{t.onboarding.reviewBody}</p>
        </div>
        <div className="rounded-xl border border-[#2DD4BF]/22 bg-[#2DD4BF]/10 px-4 py-3">
          <div className="text-3xl font-black text-white">{approvedCount}</div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#99F6E4]">{t.onboarding.approvedEvidence}</div>
        </div>
      </div>

      <div className="grid gap-4">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <ProposalCard
              key={suggestion.key}
              t={t}
              suggestion={suggestion}
              portfolioId={portfolioId}
              templateId={templateId}
              canPersist={canPersist}
            />
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-6 text-sm leading-7 text-white/56">
            {t.onboarding.noSuggestions}
          </div>
        )}
      </div>
    </section>
  );
}

function ProposalCard({
  t,
  suggestion,
  portfolioId,
  templateId,
  canPersist,
}: {
  t: Copy;
  suggestion: ProposalSuggestion;
  portfolioId: string;
  templateId: TemplateId;
  canPersist: boolean;
}) {
  const state = suggestion.review?.reviewState ?? "pending";

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.055] p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#4E8CFF]/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#BFDBFE]">
              {t.onboarding.prototypeLabel}
            </span>
            <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/54">
              {localizeSourceLabel(t, suggestion.sourceType)}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-black text-white">{suggestion.proposedTitle}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{suggestion.proposedSummary}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-[#070B14] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/58">
          <ShieldCheck size={15} className={state === "rejected" ? "text-[#ff7a66]" : "text-[#2DD4BF]"} />
          {t.onboarding.reviewStates[state]}
        </span>
      </div>

      <form action={reviewProposalAction} className="mt-5 grid gap-4">
        <input type="hidden" name="portfolioId" value={portfolioId} />
        <input type="hidden" name="templateId" value={templateId} />
        <input type="hidden" name="sourceEvidenceId" value={suggestion.sourceEvidenceId} />
        <label className="block">
          <span className="mb-2 block text-sm font-black text-white/72">{t.onboarding.fields.proposalTitle}</span>
          <input
            name="proposedTitle"
            defaultValue={suggestion.proposedTitle}
            className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black text-white/72">{t.onboarding.fields.proposalSummary}</span>
          <textarea
            name="proposedSummary"
            defaultValue={suggestion.proposedSummary}
            rows={3}
            className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white"
          />
        </label>
        <ProposalActions t={t} disabled={!canPersist} />
      </form>
    </article>
  );
}

function ProposalActions({ t, disabled }: { t: Copy; disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <button
        type="submit"
        name="reviewAction"
        value="approve"
        disabled={isDisabled}
        className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#DDFBFF] px-4 py-3 text-sm font-black text-[#071021] disabled:opacity-55"
      >
        <CheckCircle2 size={17} />
        {pending ? t.onboarding.saving : t.onboarding.approve}
      </button>
      <button
        type="submit"
        name="reviewAction"
        value="edit"
        disabled={isDisabled}
        className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg border border-[#4E8CFF]/30 bg-[#4E8CFF]/12 px-4 py-3 text-sm font-black text-[#BFDBFE] disabled:opacity-55"
      >
        <Edit3 size={17} />
        {t.onboarding.edit}
      </button>
      <button
        type="submit"
        name="reviewAction"
        value="reject"
        disabled={isDisabled}
        className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-4 py-3 text-sm font-black text-[#ffd8d1] disabled:opacity-55"
      >
        <XCircle size={17} />
        {t.onboarding.reject}
      </button>
    </div>
  );
}

function localizeSourceLabel(t: Copy, sourceType: ProposalSuggestion["sourceType"]) {
  if (sourceType === "cv") {
    return t.onboarding.sourceBadges.cv;
  }

  if (sourceType === "certificate") {
    return t.onboarding.sourceBadges.certificate;
  }

  if (sourceType === "github_placeholder") {
    return t.onboarding.sourceBadges.github;
  }

  return t.onboarding.sourceBadges.manualProject;
}
