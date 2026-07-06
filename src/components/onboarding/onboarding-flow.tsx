"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Database, ShieldCheck } from "lucide-react";
import { AuthNavStatus } from "@/components/auth/auth-nav-status";
import { useLocale } from "@/components/locale-provider";
import { EvidenceUploadStep } from "@/components/onboarding/evidence-upload-step";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { OnboardingSummary } from "@/components/onboarding/onboarding-summary";
import { ProposalReviewStep } from "@/components/onboarding/proposal-review-step";
import { SourceSelectionStep } from "@/components/onboarding/source-selection-step";
import { TemplateRecommendationStep } from "@/components/onboarding/template-recommendation-step";
import { localeMeta, locales } from "@/lib/content";
import {
  type EvidenceSourceType,
  type OnboardingInitialState,
  type OnboardingStep,
  onboardingSteps,
} from "@/lib/onboarding/types";

export function OnboardingFlow({ initialState }: { initialState: OnboardingInitialState }) {
  const { locale, localeReady, setLocale, t } = useLocale();
  const [activeStep, setActiveStep] = useState<OnboardingStep>(initialState.step);
  const [selectedSource, setSelectedSource] = useState<EvidenceSourceType>(initialState.selectedSource);
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

  function nextStep() {
    const index = onboardingSteps.indexOf(activeStep);
    setActiveStep(onboardingSteps[Math.min(onboardingSteps.length - 1, index + 1)]);
  }

  function previousStep() {
    const index = onboardingSteps.indexOf(activeStep);
    setActiveStep(onboardingSteps[Math.max(0, index - 1)]);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      <a href="#main-content" className="pf-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#071021]">
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d]/86 backdrop-blur-xl">
        <div className="pf-container flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="pf-focus flex items-center gap-3" aria-label="ProofFolio AI">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#4da3ff]/45 bg-[#08142a] text-sm font-black text-[#9ed0ff]">
              PF
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.18em]">ProofFolio AI</span>
              <span className="hidden text-[11px] uppercase tracking-[0.24em] text-white/45 sm:block">
                {t.onboarding.workspace}
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label={t.nav.primary}>
            <Link className="pf-focus rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/8 hover:text-white" href="/">
              {t.nav.home}
            </Link>
            <Link className="pf-focus rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/8 hover:text-white" href="/templates">
              {t.nav.templates}
            </Link>
            <Link className="pf-focus rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/8 hover:text-white" href="/demo">
              {t.nav.demo}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-white/12 bg-white/6 p-1" aria-label={t.nav.language}>
              {locales.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={!localeReady}
                  onClick={() => setLocale(item)}
                  className={[
                    "pf-focus rounded-md px-2.5 py-1.5 text-xs font-black transition",
                    locale === item ? "bg-white text-[#071021]" : "text-white/62 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  {localeMeta[item].label}
                </button>
              ))}
            </div>
            <AuthNavStatus />
          </div>
        </div>
      </header>

      <main id="main-content" className="relative">
        <div className="absolute inset-0 pf-grid-v3 opacity-45" aria-hidden="true" />
        <div className="pf-container relative z-10 py-10">
          <section className="grid gap-8 pb-10 lg:grid-cols-[360px_1fr]">
            <aside className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#0D1422]/82 p-5 shadow-[0_24px_90px_rgba(0,0,0,.26)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#2DD4BF]">{t.onboarding.kicker}</p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{t.onboarding.title}</h1>
                <p className="mt-4 text-sm leading-7 text-white/58">{t.onboarding.body}</p>
                <div className="mt-5 rounded-lg border border-white/10 bg-[#070B14]/72 p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <Database size={16} className="text-[#9ed0ff]" />
                    {initialState.portfolio.title}
                  </div>
                  <p className="mt-2 break-all text-xs leading-5 text-white/46">{initialState.portfolio.id}</p>
                </div>
              </div>
              <OnboardingProgress steps={steps} activeStep={activeStep} onStepChange={setActiveStep} />
            </aside>

            <section className="min-w-0 rounded-xl border border-white/10 bg-[#0D1422]/88 p-4 shadow-[0_30px_110px_rgba(0,0,0,.3)] backdrop-blur sm:p-6">
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
                  onSelect={(source) => {
                    setSelectedSource(source);
                    setActiveStep("upload");
                  }}
                />
              ) : null}
              {activeStep === "upload" ? (
                <EvidenceUploadStep
                  t={t}
                  selectedSource={selectedSource}
                  portfolioId={initialState.portfolio.id}
                  templateId={initialState.selectedTemplateId}
                  canPersist={canPersist}
                  evidenceItems={initialState.evidenceItems}
                />
              ) : null}
              {activeStep === "review" ? (
                <ProposalReviewStep
                  t={t}
                  suggestions={initialState.suggestions}
                  portfolioId={initialState.portfolio.id}
                  templateId={initialState.selectedTemplateId}
                  approvedCount={initialState.approvedCount}
                  canPersist={canPersist}
                />
              ) : null}
              {activeStep === "template" ? (
                <TemplateRecommendationStep
                  t={t}
                  portfolioId={initialState.portfolio.id}
                  selectedTemplateId={initialState.selectedTemplateId}
                  canPersist={canPersist}
                />
              ) : null}
              {activeStep === "summary" ? (
                <OnboardingSummary
                  t={t}
                  portfolioId={initialState.portfolio.id}
                  templateId={initialState.selectedTemplateId}
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
      </main>
    </div>
  );
}
