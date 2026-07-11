"use client";

import Link from "next/link";
import { BarChart3, CheckCircle2, Circle, Rocket, ScanSearch } from "lucide-react";
import { AppShell } from "@/components/app-shell/app-shell";
import { useLocale } from "@/components/locale-provider";
import type { Copy } from "@/lib/content";
import type { DashboardState } from "@/lib/dashboard/server";

export function DashboardView({ state }: { state: DashboardState }) {
  const { t } = useLocale();
  const user = { displayName: state.displayName, email: state.email };
  const mainCard = buildMainCard(state, t);
  const statusKey = state.mainState === "editor_ready" ? "editorReady" : state.mainState;

  return (
    <AppShell user={user} activeNav="dashboard" pageTitle={t.dashboard.title} portfolioId={state.portfolioId}>
      <div className="pf-container py-8 sm:py-10">
        <section>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.dashboard.welcomeBack}</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{state.displayName || state.email}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
            <span className="rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3 py-1 text-[#5eead4]">
              {t.dashboard.accountActive}
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-white/68">
              {t.dashboard.portfolioStatus[statusKey]}
            </span>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-white/12 bg-[#0D1422]/80 p-6">
            {state.portfolioTitle ? (
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9ed0ff]">{state.portfolioTitle}</p>
            ) : null}
            <h2 className="mt-3 text-2xl font-black text-white">{mainCard.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">{mainCard.body}</p>
            <Link
              href={mainCard.href}
              className="pf-focus mt-6 inline-flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021] transition hover:bg-[#BFDBFE]"
            >
              {mainCard.action}
            </Link>
          </div>

          <div className="rounded-xl border border-white/12 bg-[#0D1422]/60 p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/70">{t.dashboard.checklistTitle}</h2>
            <ul className="mt-4 space-y-3">
              {checklistRows(state, t).map((row) => (
                <li key={row.label} className="flex items-center gap-3 text-sm font-bold">
                  {row.done ? (
                    <CheckCircle2 size={18} className="shrink-0 text-[#2DD4BF]" aria-hidden="true" />
                  ) : (
                    <Circle size={18} className="shrink-0 text-white/30" aria-hidden="true" />
                  )}
                  <span className={row.done ? "text-white" : "text-white/56"}>{row.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/12 bg-[#0D1422]/60 p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/70">{t.dashboard.activityTitle}</h2>
            {state.activity.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-white/50">{t.dashboard.activityEmpty}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {state.activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 text-sm">
                    <ScanSearch size={16} className="mt-0.5 shrink-0 text-[#9ed0ff]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{item.title}</p>
                      <p className="text-xs font-semibold text-white/46">{t.dashboard.activityKinds[item.kind]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-white/14 bg-white/[0.02] p-6">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-white/50">{t.dashboard.comingLaterTitle}</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3 opacity-60">
                <Rocket size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-black text-white/70">{t.dashboard.comingLater.publishing}</p>
                  <p className="text-xs leading-5 text-white/44">{t.dashboard.comingLater.publishingBody}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-60">
                <BarChart3 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-black text-white/70">{t.dashboard.comingLater.analytics}</p>
                  <p className="text-xs leading-5 text-white/44">{t.dashboard.comingLater.analyticsBody}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function buildMainCard(state: DashboardState, t: Copy) {
  if (state.mainState === "none") {
    return {
      title: t.dashboard.mainCard.noneTitle,
      body: t.dashboard.mainCard.noneBody,
      action: t.dashboard.actions.start,
      href: "/onboarding",
    };
  }

  if (state.mainState === "onboarding") {
    return {
      title: t.dashboard.mainCard.onboardingTitle,
      body: t.dashboard.mainCard.onboardingBody,
      action: t.dashboard.actions.resume,
      href: "/onboarding",
    };
  }

  if (state.mainState === "review") {
    return {
      title: t.dashboard.mainCard.reviewTitle,
      body: t.dashboard.mainCard.reviewBody,
      action: t.dashboard.actions.review,
      href: "/onboarding?step=review",
    };
  }

  return {
    title: t.dashboard.mainCard.editorTitle,
    body: t.dashboard.mainCard.editorBody,
    action: t.dashboard.actions.continueEditing,
    href: state.portfolioId ? `/editor?portfolio=${state.portfolioId}&onboarding=ready` : "/editor",
  };
}

function checklistRows(state: DashboardState, t: Copy) {
  return [
    { label: t.dashboard.checklist.accountCreated, done: state.checklist.accountCreated },
    { label: t.dashboard.checklist.evidenceAdded, done: state.checklist.evidenceAdded },
    { label: t.dashboard.checklist.suggestionsReviewed, done: state.checklist.suggestionsReviewed },
    { label: t.dashboard.checklist.templateSelected, done: state.checklist.templateSelected },
    { label: t.dashboard.checklist.portfolioCustomized, done: state.checklist.portfolioCustomized },
  ];
}
