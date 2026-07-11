"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Database, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { startNewDraftAction } from "@/app/onboarding/actions";
import { useLocale } from "@/components/locale-provider";
import { WorkspaceHeader } from "@/components/workspace-header";
import { EvidenceUploadStep } from "@/components/onboarding/evidence-upload-step";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { OnboardingSummary } from "@/components/onboarding/onboarding-summary";
import { ProposalReviewStep } from "@/components/onboarding/proposal-review-step";
import { SourceSelectionStep } from "@/components/onboarding/source-selection-step";
import { TemplateRecommendationStep } from "@/components/onboarding/template-recommendation-step";
import {
  type DraftProgress,
  type EvidenceSourceType,
  type OnboardingInitialState,
  type OnboardingStep,
  onboardingSteps,
} from "@/lib/onboarding/types";

export function OnboardingFlow({
  initialState,
  hideHeader = false,
}: {
  initialState: OnboardingInitialState;
  hideHeader?: boolean;
}) {
  const { locale, t } = useLocale();
  const [activeStep, setActiveStep] = useState<OnboardingStep>(initialState.step);
  const [selectedSource, setSelectedSource] = useState<EvidenceSourceType>(initialState.selectedSource);
  const stepPanelRef = useRef<HTMLElement>(null);
  const mountedRef = useRef(false);
  const canPersist = initialState.configured && initialState.authenticated && initialState.portfolio.id !== "setup-error";
  const steps = useMemo(
    () =>
      onboardingSteps.map((id) => ({
        id,
        label: t.onboarding.steps[id].label,
        detail: t.onboarding.steps[id].detail,
      })),
    [t],
  );

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    stepPanelRef.current?.focus({ preventScroll: true });
  }, [activeStep]);

  function changeStep(step: OnboardingStep) {
    setActiveStep(step);
  }

  function resumeDraft(step: OnboardingStep) {
    const panel = stepPanelRef.current;
    panel?.focus({ preventScroll: true });
    setActiveStep(step);
    window.requestAnimationFrame(() => {
      panel?.focus({ preventScroll: true });
    });
  }

  function nextStep() {
    const index = onboardingSteps.indexOf(activeStep);
    changeStep(onboardingSteps[Math.min(onboardingSteps.length - 1, index + 1)]);
  }

  function previousStep() {
    const index = onboardingSteps.indexOf(activeStep);
    changeStep(onboardingSteps[Math.max(0, index - 1)]);
  }

  // hideHeader means an ancestor AppShell already owns the page's <main> landmark.
  const MainTag = hideHeader ? "div" : "main";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      {!hideHeader ? (
        <a href="#main-content" className="pf-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#071021]">
          {t.nav.skip}
        </a>
      ) : null}
      {!hideHeader ? <WorkspaceHeader contextLabel={t.onboarding.workspace} /> : null}

      <MainTag id={hideHeader ? undefined : "main-content"} className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(78,140,255,.12),transparent_34%),linear-gradient(180deg,rgba(11,18,34,.92),rgba(5,7,13,1))]" aria-hidden="true" />
        <div className="absolute inset-0 pf-grid-v3 opacity-20" aria-hidden="true" />
        <div className="pf-container relative z-10 py-8 sm:py-10">
          <section className="grid gap-6 pb-10 lg:grid-cols-[350px_1fr] xl:grid-cols-[380px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#0B111D]/92 p-5 shadow-[0_24px_90px_rgba(0,0,0,.26)]">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8EA7FF]">{t.onboarding.kicker}</p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{t.onboarding.title}</h1>
                <p className="mt-4 text-sm leading-7 text-white/58">{t.onboarding.body}</p>
                <div className="mt-5 rounded-lg border border-white/10 bg-[#070B14]/72 p-3" data-testid="active-draft-card">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <Database size={16} className="text-[#9ed0ff]" />
                    {initialState.portfolio.title}
                  </div>
                  <p className="mt-2 break-all text-xs leading-5 text-white/46">{initialState.portfolio.id}</p>
                </div>
              </div>
              {initialState.draftRecovery.available ? (
                <DraftRecoveryCard
                  t={t}
                  locale={locale}
                  templateId={initialState.selectedTemplateId}
                  progress={initialState.draftRecovery.progress}
                  recommendedStep={initialState.draftRecovery.recommendedStep}
                  onResume={() => resumeDraft(initialState.draftRecovery.recommendedStep)}
                  canPersist={canPersist}
                />
              ) : null}
              <OnboardingProgress steps={steps} activeStep={activeStep} onStepChange={changeStep} />
            </aside>

            <section
              ref={stepPanelRef}
              tabIndex={-1}
              className="min-w-0 rounded-xl border border-white/10 bg-[#0B111D]/94 p-4 shadow-[0_30px_110px_rgba(0,0,0,.3)] outline-none sm:p-6"
              aria-label={steps.find((step) => step.id === activeStep)?.label}
              data-testid="onboarding-workspace"
            >
              <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-white/8 bg-[#070B14]/72 p-4 md:flex-row md:items-center">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={19} className={canPersist ? "mt-0.5 text-[#2DD4BF]" : "mt-0.5 text-[#ff7a66]"} />
                  <div>
                    <div className="text-sm font-black text-white">
                      {canPersist ? t.onboarding.connectedStatus : t.onboarding.previewStatus}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/50">{initialState.errorMessage ?? t.onboarding.connectedDetail}</p>
                    {!canPersist ? (
                      <p className="mt-1 text-xs leading-5 text-white/50">{t.onboarding.persistenceBlocked}</p>
                    ) : null}
                  </div>
                </div>
                {!canPersist ? (
                  <Link
                    href="/auth/sign-up?next=/onboarding"
                    className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#BFDBFE]"
                  >
                    {t.auth.signUpAction}
                    <ArrowRight size={16} />
                  </Link>
                ) : null}
              </div>

              {activeStep === "sources" ? (
                <SourceSelectionStep
                  t={t}
                  templateId={initialState.selectedTemplateId}
                  selectedSource={selectedSource}
                  evidenceItems={initialState.evidenceItems}
                  errorMessage={initialState.errorMessage}
                  canPersist={canPersist}
                  github={initialState.github}
                  onSelect={(source) => {
                    setSelectedSource(source);
                    changeStep("upload");
                  }}
                />
              ) : null}
              {activeStep === "upload" ? (
                <EvidenceUploadStep
                  t={t}
                  selectedSource={selectedSource}
                  portfolioId={initialState.portfolio.id}
                  templateId={initialState.selectedTemplateId}
                  locale={locale}
                  canPersist={canPersist}
                  evidenceItems={initialState.evidenceItems}
                  github={initialState.github}
                />
              ) : null}
              {activeStep === "review" ? (
                <ProposalReviewStep
                  t={t}
                  suggestions={initialState.suggestions}
                  portfolioId={initialState.portfolio.id}
                  templateId={initialState.selectedTemplateId}
                  locale={locale}
                  approvedCount={initialState.approvedCount}
                  canPersist={canPersist}
                  aiProviderEnabled={initialState.aiProviderEnabled}
                />
              ) : null}
              {activeStep === "template" ? (
                <TemplateRecommendationStep
                  t={t}
                  portfolioId={initialState.portfolio.id}
                  selectedTemplateId={initialState.selectedTemplateId}
                  locale={locale}
                  canPersist={canPersist}
                />
              ) : null}
              {activeStep === "summary" ? (
                <OnboardingSummary
                  t={t}
                  portfolioId={initialState.portfolio.id}
                  templateId={initialState.selectedTemplateId}
                  locale={locale}
                  approvedCount={initialState.approvedCount}
                  evidenceCount={initialState.evidenceItems.length}
                  canPersist={canPersist}
                />
              ) : null}

              <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={activeStep === "sources"}
                  className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 px-4 py-3 text-sm font-black text-white/70 hover:bg-white/8 disabled:opacity-35"
                >
                  <ArrowLeft size={16} />
                  {t.onboarding.back}
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={activeStep === "summary"}
                  className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#BFDBFE] disabled:opacity-35"
                >
                  {t.onboarding.next}
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </section>
        </div>
      </MainTag>
    </div>
  );
}

function DraftRecoveryCard({
  t,
  locale,
  templateId,
  progress,
  recommendedStep,
  onResume,
  canPersist,
}: {
  t: ReturnType<typeof useLocale>["t"];
  locale: string;
  templateId: string;
  progress: DraftProgress;
  recommendedStep: OnboardingStep;
  onResume: () => void;
  canPersist: boolean;
}) {
  return (
    <section className="rounded-xl border border-[#7C8CFF]/24 bg-[#10162A]/86 p-4" data-testid="resume-draft-panel">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#7C8CFF]/28 bg-[#7C8CFF]/10 text-[#C4CBFF]">
          <FileText size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-black text-white">{t.onboarding.resumeTitle}</h2>
          <p className="mt-2 text-xs leading-5 text-white/55">{t.onboarding.resumeBody}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-white/8 bg-[#070B14]/70 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
            {t.onboarding.progressTitle}
          </span>
          <span className="rounded-md bg-[#4E8CFF]/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#BFDBFE]">
            {t.onboarding.steps[recommendedStep].label}
          </span>
        </div>
        <div className="grid gap-2">
          <ProgressMetric label={t.onboarding.progress.sourcesAdded} value={String(progress.sourcesAdded)} />
          <ProgressMetric label={t.onboarding.progress.uploadsCompleted} value={String(progress.uploadsCompleted)} />
          <ProgressMetric label={t.onboarding.progress.projectsAdded} value={String(progress.projectsAdded)} />
          <ProgressMetric label={t.onboarding.progress.suggestionsApproved} value={String(progress.suggestionsApproved)} />
          <ProgressMetric
            label={t.onboarding.progress.templateSelected}
            value={progress.templateSelected ? t.onboarding.progressStates.done : t.onboarding.progressStates.pending}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={onResume}
          className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#DDE6FF]"
        >
          <Sparkles size={16} />
          {t.onboarding.resumeDraft}
        </button>
        {canPersist ? (
          <form action={startNewDraftAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="templateId" value={templateId} />
            <button
              type="submit"
              className="pf-focus inline-flex w-full items-center justify-center rounded-lg border border-white/12 px-4 py-3 text-sm font-black text-white/72 hover:bg-white/8"
            >
              {t.onboarding.startNewDraft}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}

function ProgressMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-white/52">{label}</span>
      <span className="inline-flex items-center gap-1 font-black text-white">
        <CheckCircle2 size={13} className="text-[#2DD4BF]" />
        {value}
      </span>
    </div>
  );
}
