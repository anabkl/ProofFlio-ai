"use client";

import { useFormStatus } from "react-dom";
import { CheckCircle2, Edit3, ShieldCheck, XCircle } from "lucide-react";
import { reviewProposalAction } from "@/app/onboarding/actions";
import type { Copy, Locale, TemplateId } from "@/lib/content";
import type { ProposalSuggestion } from "@/lib/onboarding/types";

export function ProposalReviewStep({
  t,
  suggestions,
  portfolioId,
  templateId,
  locale,
  approvedCount,
  canPersist,
  aiProviderEnabled,
}: {
  t: Copy;
  suggestions: ProposalSuggestion[];
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  approvedCount: number;
  canPersist: boolean;
  aiProviderEnabled: boolean;
}) {
  const rejectedSuggestions = suggestions.filter((suggestion) => suggestion.review?.reviewState === "rejected");
  const activeSuggestions = suggestions.filter((suggestion) => suggestion.review?.reviewState !== "rejected");

  return (
    <section className="space-y-6" aria-labelledby="proposal-heading">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8EA7FF]">{t.onboarding.reviewEyebrow}</p>
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

      <div className="grid gap-4" data-testid="proposal-review-workspace">
        <div className="rounded-xl border border-white/10 bg-[#070B14]/72 p-4 text-sm leading-6 text-white/58">
          {aiProviderEnabled ? t.onboarding.aiProviderEnabled : t.onboarding.aiProviderDisabled}
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/52">{t.onboarding.activeSuggestions}</h3>
        {activeSuggestions.length > 0 ? (
          activeSuggestions.map((suggestion) => (
            <ProposalCard
              key={suggestion.key}
              t={t}
              suggestion={suggestion}
              portfolioId={portfolioId}
              templateId={templateId}
              locale={locale}
              canPersist={canPersist}
            />
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.045] p-6 text-sm leading-7 text-white/56">
            {t.onboarding.noSuggestions}
          </div>
        )}
      </div>

      {rejectedSuggestions.length > 0 ? (
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-4" data-testid="rejected-audit">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/56">{t.onboarding.rejectedAuditTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-white/48">{t.onboarding.rejectedAuditBody}</p>
          <div className="mt-4 grid gap-2">
            {rejectedSuggestions.map((suggestion) => (
              <article key={suggestion.key} className="rounded-lg border border-white/8 bg-[#070B14]/66 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#ffd8d1]">
                    {t.onboarding.reviewStates.rejected}
                  </span>
                  <span className="text-xs font-bold text-white/48">{localizeSourceLabel(t, suggestion.sourceType)}</span>
                </div>
                <p className="mt-2 text-sm font-black text-white/72">{suggestion.proposedTitle}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function ProposalCard({
  t,
  suggestion,
  portfolioId,
  templateId,
  locale,
  canPersist,
}: {
  t: Copy;
  suggestion: ProposalSuggestion;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
}) {
  const state = suggestion.review?.reviewState ?? "pending";

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.055] p-5" data-testid="proposal-card">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#7C8CFF]/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#C4CBFF]">
              {t.onboarding.prototypeLabel}
            </span>
            <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/54">
              {localizeSourceLabel(t, suggestion.sourceType)}
            </span>
          </div>
          <h3 className="mt-4 text-xl font-black text-white">{suggestion.proposedTitle}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{suggestion.proposedSummary}</p>
          <div className="mt-4 grid gap-3 rounded-lg border border-white/8 bg-[#070B14]/70 p-3 sm:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/42">{t.onboarding.proofContext}</div>
              <p className="mt-2 text-sm font-bold leading-6 text-white/72">{suggestion.sourceTitle}</p>
            </div>
            <p className="text-sm leading-6 text-white/54">{suggestion.proofContext}</p>
          </div>
          {state === "approved" || state === "edited" ? (
            <p className="mt-3 rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/10 p-3 text-sm font-bold leading-6 text-[#CFFCF6]">
              {t.onboarding.evidenceBacked}
            </p>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-[#070B14] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/58">
          <ShieldCheck size={15} className={state === "rejected" ? "text-[#ff7a66]" : "text-[#2DD4BF]"} />
          {t.onboarding.reviewStates[state]}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <ProposalQuickAction
            t={t}
            portfolioId={portfolioId}
            templateId={templateId}
            locale={locale}
            suggestion={suggestion}
            action="approve"
            disabled={!canPersist}
          />
          <ProposalQuickAction
            t={t}
            portfolioId={portfolioId}
            templateId={templateId}
            locale={locale}
            suggestion={suggestion}
            action="reject"
            disabled={!canPersist}
          />
        </div>
        <details className="rounded-lg border border-[#7C8CFF]/24 bg-[#7C8CFF]/8 p-3">
          <summary className="pf-focus cursor-pointer list-none text-sm font-black text-[#DDE3FF]">
            <span className="inline-flex items-center gap-2">
              <Edit3 size={16} />
              {t.onboarding.editSuggestion}
            </span>
          </summary>
          <form action={reviewProposalAction} className="mt-4 grid gap-4">
            <input type="hidden" name="portfolioId" value={portfolioId} />
            <input type="hidden" name="templateId" value={templateId} />
            <input type="hidden" name="locale" value={locale} />
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
            <ProposalEditButton t={t} disabled={!canPersist} />
          </form>
        </details>
      </div>
    </article>
  );
}

function ProposalQuickAction({
  t,
  portfolioId,
  templateId,
  locale,
  suggestion,
  action,
  disabled,
}: {
  t: Copy;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  suggestion: ProposalSuggestion;
  action: "approve" | "reject";
  disabled: boolean;
}) {
  return (
    <form action={reviewProposalAction}>
        <input type="hidden" name="portfolioId" value={portfolioId} />
        <input type="hidden" name="templateId" value={templateId} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="sourceEvidenceId" value={suggestion.sourceEvidenceId} />
        <input type="hidden" name="proposedTitle" value={suggestion.proposedTitle} />
        <input type="hidden" name="proposedSummary" value={suggestion.proposedSummary} />
        <ProposalActionButton t={t} action={action} disabled={disabled} />
    </form>
  );
}

function ProposalActionButton({ t, action, disabled }: { t: Copy; action: "approve" | "reject"; disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  const isApprove = action === "approve";
  const Icon = isApprove ? CheckCircle2 : XCircle;

  return (
      <button
        type="submit"
        name="reviewAction"
        value={action}
        disabled={isDisabled}
        className={[
          "pf-focus inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black disabled:opacity-55",
          isApprove
            ? "bg-[#DDFBFF] text-[#071021]"
            : "border border-[#ff7a66]/30 bg-[#ff7a66]/10 text-[#ffd8d1]",
        ].join(" ")}
      >
        <Icon size={17} />
        {pending ? t.onboarding.saving : isApprove ? t.onboarding.approve : t.onboarding.reject}
      </button>
  );
}

function ProposalEditButton({ t, disabled }: { t: Copy; disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="reviewAction"
      value="edit"
      disabled={pending || disabled}
      className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg border border-[#7C8CFF]/30 bg-[#7C8CFF]/12 px-4 py-3 text-sm font-black text-[#DDE3FF] disabled:opacity-55"
    >
      <Edit3 size={17} />
      {pending ? t.onboarding.saving : t.onboarding.edit}
    </button>
  );
}

function localizeSourceLabel(t: Copy, sourceType: ProposalSuggestion["sourceType"]) {
  if (sourceType === "cv") {
    return t.onboarding.sourceBadges.cv;
  }

  if (sourceType === "certificate") {
    return t.onboarding.sourceBadges.certificate;
  }

  if (sourceType === "github_placeholder" || sourceType === "github_repository") {
    return t.onboarding.sourceBadges.github;
  }

  return t.onboarding.sourceBadges.manualProject;
}
