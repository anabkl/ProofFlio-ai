"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BellRing,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Eye,
  FileText,
  FolderGit,
  Globe2,
  Monitor,
  Redo2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  WandSparkles,
} from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { LivingTemplatePage } from "@/components/living-templates";
import { useLocale } from "@/components/locale-provider";
import { PricingSection } from "@/components/pricing-section";
import {
  icons,
  localeMeta,
  locales,
  templateIds,
  templateMeta,
  type TemplateId,
} from "@/lib/content";

const accentOptions = ["#4da3ff", "#39e6dc", "#67e8a5", "#ff7a66"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#05070d] text-white">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}

function Navigation() {
  const { locale, setLocale, t } = useLocale();
  const links = [
    { href: "/#product", label: t.nav.product },
    { href: "/templates", label: t.nav.templates },
    { href: "/demo", label: t.nav.demo },
    { href: "/#plans", label: t.nav.pricing },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#05070d]/82 backdrop-blur-xl">
      <div className="pf-container flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/" className="pf-focus flex items-center gap-3" aria-label="ProofFolio AI">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#4da3ff]/45 bg-[#08142a] text-sm font-black text-[#9ed0ff]">
            PF
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black tracking-[0.18em]">ProofFolio AI</span>
            <span className="hidden text-[11px] uppercase tracking-[0.24em] text-white/45 sm:block">
              {t.footer.product}
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="pf-focus rounded-md px-3 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/8 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-md border border-white/12 bg-white/6 p-1"
            aria-label={t.nav.language}
          >
            {locales.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                className={cn(
                  "pf-focus rounded-md px-2.5 py-1.5 text-xs font-black transition",
                  locale === item
                    ? "bg-white text-[#071021]"
                    : "text-white/62 hover:bg-white/8 hover:text-white",
                )}
              >
                {localeMeta[item].label}
              </button>
            ))}
          </div>
          <Link
            href="/editor"
            className="pf-focus hidden rounded-md bg-[#f7fbff] px-4 py-2 text-sm font-black text-[#071021] transition hover:bg-[#9ed0ff] sm:inline-flex"
          >
            {t.nav.create}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-white/10 bg-[#05070d]">
      <div className="pf-container grid gap-8 py-10 md:grid-cols-[1fr_1.4fr_.8fr]">
        <div>
          <div className="text-lg font-black">ProofFolio AI</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">{t.footer.note}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            [t.nav.product, "/#product"],
            [t.nav.demo, "/demo"],
            [t.footer.templates, "/templates"],
            [t.nav.editor, "/editor"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="pf-focus rounded-md py-1 font-semibold text-white/66 hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="text-sm text-white/45">Next.js · TypeScript · Tailwind</div>
      </div>
    </footer>
  );
}

function SectionIntro({
  kicker,
  title,
  body,
  dark = true,
}: {
  kicker: string;
  title: string;
  body: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={cn("text-xs font-black uppercase tracking-[0.24em]", dark ? "text-[#9ed0ff]" : "text-[#315dff]")}>
        {kicker}
      </p>
      <h2 className={cn("mt-4 text-3xl font-black tracking-tight sm:text-5xl", dark ? "text-white" : "text-[#101827]")}>
        {title}
      </h2>
      <p className={cn("mt-5 text-base leading-8 sm:text-lg", dark ? "text-white/64" : "text-[#475569]")}>{body}</p>
    </div>
  );
}

function PrimaryCtas() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/editor"
        className="pf-focus inline-flex items-center justify-center gap-2 rounded-md bg-[#f7fbff] px-5 py-3 text-sm font-black text-[#071021] transition hover:bg-[#9ed0ff]"
      >
        <WandSparkles size={18} />
        {t.common.create}
      </Link>
      <Link
        href="/demo"
        className="pf-focus inline-flex items-center justify-center gap-2 rounded-md border border-white/16 bg-white/7 px-5 py-3 text-sm font-black text-white transition hover:bg-white/12"
      >
        <Eye size={18} />
        {t.common.demo}
      </Link>
    </div>
  );
}

function Hero() {
  const { t } = useLocale();

  return (
    <section className="pf-hero-v2 relative min-h-[92svh] overflow-hidden bg-[#070B14] pt-24">
      <div className="absolute inset-0 pf-grid-v2 opacity-70" aria-hidden="true" />
      <div className="pf-hero-light pf-hero-light-a" aria-hidden="true" />
      <div className="pf-hero-light pf-hero-light-b" aria-hidden="true" />
      <HeroScene />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,20,.98),rgba(7,11,20,.82)_45%,rgba(7,11,20,.56)_100%)]" />
      <div className="pf-container relative z-10 grid min-h-[calc(92svh-96px)] items-center gap-10 py-16 lg:grid-cols-[.88fr_1.12fr]">
        <div className="soft-reveal max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2DD4BF]">{t.hero.eyebrow}</p>
          <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-[#F8FAFC] sm:text-7xl">
            {t.hero.emphasis}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#94A3B8] sm:text-lg">{t.hero.value}</p>
          <div className="mt-8">
            <PrimaryCtas />
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2 text-sm font-bold text-[#94A3B8]">
            {t.hero.trust.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="h-1 w-1 rounded-[2px] bg-[#4E8CFF]" /> : null}
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[620px]">
          <HeroProductPreview />
        </div>
      </div>
    </section>
  );
}

function HeroProductPreview() {
  const { t } = useLocale();
  const sourceIcons = [FileText, FolderGit, BadgeCheck];
  const sourcePositions = ["left-0 top-20", "right-0 top-8", "left-8 bottom-16"];

  return (
    <div className="absolute inset-0 hidden lg:block" aria-label={t.hero.mockupTitle}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 680 620" role="img" aria-hidden="true">
        <path className="flow-line" d="M86 172 C198 88 302 132 350 252 C392 356 476 430 606 358" fill="none" stroke="#7757FF" strokeOpacity=".34" strokeWidth="1.3" />
        <path className="flow-line" d="M96 486 C214 402 280 454 342 356 C418 238 500 166 598 112" fill="none" stroke="#4E8CFF" strokeOpacity=".30" strokeWidth="1.2" />
        <path className="flow-line" d="M112 304 C234 246 370 522 560 266" fill="none" stroke="#2DD4BF" strokeOpacity=".24" strokeWidth="1.1" />
      </svg>
      <div className="pf-browser-preview absolute left-[8%] top-8 w-[560px] overflow-hidden rounded-lg border border-white/10 bg-[#0D1422] shadow-[0_45px_160px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between border-b border-white/8 bg-[#111A2B] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-md bg-[#FF6B5F]" />
            <span className="h-2.5 w-2.5 rounded-md bg-[#F7C948]" />
            <span className="h-2.5 w-2.5 rounded-md bg-[#2DD4BF]" />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#94A3B8]">prooffolio.ai/maya</div>
        </div>
        <div className="grid gap-4 p-5">
          <div className="grid gap-4 rounded-lg border border-white/8 bg-[#070B14] p-5 md:grid-cols-[1fr_220px]">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-[#7757FF] to-[#2DD4BF] text-lg font-black text-white">
                  {t.portfolio.initials}
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F8FAFC]">{t.portfolio.name}</div>
                  <div className="mt-1 text-sm font-bold text-[#94A3B8]">{t.portfolio.targetRole}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["React", "Next.js", "Python", "Data UX"].map((tech) => (
                  <span key={tech} className="rounded-md border border-white/8 bg-white/[0.04] px-2.5 py-1.5 text-xs font-black text-[#CBD5E1]">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {t.portfolio.projects.slice(0, 2).map((project) => (
                  <div key={project.name} className="rounded-md border border-white/8 bg-[#111A2B] p-3">
                    <div className="text-sm font-black text-[#F8FAFC]">{project.name}</div>
                    <div className="mt-1 text-xs leading-5 text-[#94A3B8]">{project.impact}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#2DD4BF]/18 bg-[#2DD4BF]/8 p-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#99F6E4]">{t.heroPreview.readinessTitle}</div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-[#F8FAFC]">82</span>
                <span className="pb-2 text-lg font-black text-[#94A3B8]">%</span>
              </div>
              <div className="mt-4 h-2 rounded-md bg-white/10">
                <div className="h-2 w-[82%] rounded-md bg-[#2DD4BF]" />
              </div>
              <div className="mt-5 space-y-2">
                {t.heroPreview.readinessChecks.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-bold text-[#D1FAE5]">
                    <CheckCircle2 size={14} />
                    {item}
                  </div>
                ))}
                <div className="flex items-center gap-2 text-xs font-bold text-[#C4B5FD]">
                  <CircleDot size={14} />
                  {t.heroPreview.aiSuggestions}
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="rounded-lg border border-white/8 bg-[#111A2B] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">{t.heroPreview.githubActivity}</span>
                <Activity size={16} className="text-[#4E8CFF]" />
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
                {Array.from({ length: 56 }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-3 rounded-[3px]",
                      index % 9 === 0 ? "bg-[#2DD4BF]" : index % 5 === 0 ? "bg-[#4E8CFF]" : index % 3 === 0 ? "bg-[#7757FF]/70" : "bg-white/8",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/8 bg-[#111A2B] p-4">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">{t.heroPreview.certificates}</div>
              <div className="mt-4 space-y-2">
                {t.portfolio.certificates.slice(0, 3).map((certificate) => (
                  <div key={certificate} className="rounded-md bg-white/[0.04] px-3 py-2 text-xs font-bold text-[#CBD5E1]">
                    {certificate}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {t.hero.cards.map((card, index) => {
        const Icon = sourceIcons[index] ?? FileText;
        return (
          <div
            key={card.label}
            className={cn(
              "pf-source-card absolute w-44 rounded-lg border border-white/10 bg-[#111A2B]/88 p-4 shadow-[0_22px_80px_rgba(0,0,0,.34)] backdrop-blur",
              index % 2 === 0 ? "float-a" : "float-b",
              sourcePositions[index],
            )}
          >
            <Icon size={20} className="text-[#2DD4BF]" />
            <div className="mt-4 text-sm font-black text-[#F8FAFC]">{card.label}</div>
            <div className="mt-1 text-xs leading-5 text-[#94A3B8]">{card.value}</div>
          </div>
        );
      })}
      <div className="absolute bottom-7 right-8 w-64 rounded-lg border border-[#7757FF]/22 bg-[#7757FF]/12 p-4 shadow-[0_30px_110px_rgba(0,0,0,.32)] backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#DDD6FE]">
          <BellRing size={15} />
          {t.heroPreview.validationQueue}
        </div>
        <div className="mt-4 space-y-2">
          {t.intelligence.approvals.map((item, index) => (
            <div key={item} className="flex items-center gap-2 text-xs font-bold text-[#EDE9FE]">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-[#7757FF] text-[10px] text-white">{index + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImportEvidenceSection() {
  const { t } = useLocale();

  return (
    <section id="product" className="evidence-import-section bg-[#070B14] py-24">
      <div className="pf-container">
        <SectionIntro {...t.importEvidence} />
        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          {t.importEvidence.sources.map((source, index) => {
            const Icon = icons[source.icon as keyof typeof icons];
            return (
              <button
                key={source.name}
                type="button"
                className="pf-focus evidence-source-card group rounded-lg border border-white/10 bg-[#0D1422] p-5 text-left transition hover:-translate-y-1 hover:border-[#4E8CFF]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-[#111A2B] text-[#2DD4BF]">
                    {Icon ? <Icon size={20} /> : <FileText size={20} />}
                  </span>
                  <span className="font-mono text-xs font-black text-[#475569]">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-black text-[#F8FAFC]">{source.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{source.detail}</p>
                <div className="mt-5 h-1 rounded-md bg-white/8">
                  <div className="h-1 rounded-md bg-gradient-to-r from-[#7757FF] via-[#4E8CFF] to-[#2DD4BF] transition-all group-hover:w-full" style={{ width: `${32 + index * 12}%` }} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-10 rounded-lg border border-white/10 bg-[#0D1422] p-5 shadow-[0_30px_120px_rgba(0,0,0,.26)]">
          <div className="grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
            <div className="rounded-lg border border-white/8 bg-[#070B14] p-5">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[#94A3B8]">{t.evidenceBoard.queueTitle}</div>
              <div className="mt-5 space-y-3">
                {t.importEvidence.sources.slice(0, 4).map((source) => (
                  <div key={source.name} className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.035] p-3">
                    <span className="text-sm font-bold text-[#CBD5E1]">{source.name}</span>
                    <CheckCircle2 size={16} className="text-[#2DD4BF]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-[#7757FF]/20 bg-[#111A2B] p-5">
              <div className="absolute inset-0 premium-circuit opacity-35" aria-hidden="true" />
              <div className="relative grid gap-4 md:grid-cols-3">
                {t.evidenceBoard.columns.map((label, index) => (
                  <div key={label} className="rounded-md border border-white/8 bg-[#070B14]/72 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4E8CFF]">{label}</div>
                    <div className="mt-4 text-2xl font-black text-[#F8FAFC]">{[12, 7, 4][index]}</div>
                    <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
                      {t.evidenceBoard.metrics[index] ?? ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const { t } = useLocale();
  const workflowIcons = [Upload, Sparkles, ShieldCheck, Globe2] as const;

  return (
    <section className="workflow-section bg-[#0D1422] py-24 text-[#F8FAFC]">
      <div className="pf-container">
        <SectionIntro {...t.workflow} />
        <div className="mt-14 grid gap-4 lg:grid-cols-4">
          {t.workflow.steps.map((step, index) => (
            <div key={step.number} className="workflow-card rounded-lg border border-white/10 bg-[#111A2B] p-5">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-4xl font-black text-[#7757FF]">{step.number}</span>
                {(() => {
                  const Icon = workflowIcons[index] ?? Globe2;
                  return <Icon size={22} className="text-[#2DD4BF]" />;
                })()}
              </div>
              <h3 className="text-xl font-black text-[#F8FAFC]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{step.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 rounded-lg border border-white/10 bg-[#070B14] p-4 lg:grid-cols-[1fr_1.3fr_1fr]">
          <div className="rounded-lg border border-white/8 bg-[#111A2B] p-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">{t.workflow.steps[0].title}</div>
            <div className="mt-5 space-y-3">
              {t.importEvidence.sources.slice(0, 3).map((source) => (
                <div key={source.name} className="rounded-md border border-white/8 bg-white/[0.035] p-3 text-sm font-bold text-[#CBD5E1]">
                  {source.name}
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-[#4E8CFF]/18 bg-[#111A2B] p-5">
            <div className="absolute inset-0 premium-circuit opacity-25" aria-hidden="true" />
            <div className="relative">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-[#93C5FD]">{t.workflow.steps[1].title}</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {t.intelligence.outputs.slice(0, 4).map((item) => (
                  <div key={item} className="rounded-md border border-white/8 bg-[#070B14]/70 p-4 text-sm font-bold text-[#CBD5E1]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[#2DD4BF]/18 bg-[#2DD4BF]/8 p-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#99F6E4]">{t.workflow.steps[2].title}</div>
            <div className="mt-5 space-y-3">
              {t.intelligence.approvals.map((item, index) => (
                <div key={item} className="rounded-md border border-[#2DD4BF]/18 bg-[#070B14]/58 p-3 text-xs font-bold text-[#D1FAE5]">
                  <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-md bg-[#2DD4BF] text-[10px] font-black text-[#04101f]">
                    {index + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TemplateShowcase() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<TemplateId>("dark-tech");

  return (
    <section className="template-showcase-stage relative overflow-hidden bg-[#05070d] py-24">
      <div className="absolute inset-0 premium-circuit opacity-25" aria-hidden="true" />
      <div className="pf-container">
        <SectionIntro {...t.templateShowcase} />
        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {t.templateShowcase.directions.map((direction) => (
            <button
              key={direction.name}
              type="button"
              onClick={() => setSelected(direction.template as TemplateId)}
              className={cn(
                "pf-focus rounded-lg border p-5 text-left transition",
                selected === direction.template
                  ? "border-[#7757FF]/55 bg-[#7757FF]/14 shadow-[0_18px_70px_rgba(119,87,255,.16)]"
                  : "border-white/10 bg-white/[0.045] hover:border-[#4E8CFF]/35",
              )}
            >
              <div className="text-xl font-black text-white">{direction.name}</div>
              <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{direction.detail}</p>
              <div className="mt-5 h-1 rounded-md bg-white/8">
                <div
                  className="h-1 rounded-md bg-gradient-to-r from-[#7757FF] via-[#4E8CFF] to-[#2DD4BF]"
                  style={{ width: selected === direction.template ? "100%" : "42%" }}
                />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {templateIds.map((id) => {
              const template = t.templates[id];
              const Icon = templateMeta[id].icon;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  className={cn(
                    "pf-focus group w-full rounded-lg border p-4 text-left transition",
                    selected === id
                      ? "border-[#4da3ff]/55 bg-[#4da3ff]/12 shadow-[0_18px_60px_rgba(77,163,255,.12)]"
                      : "border-white/10 bg-white/[0.045] hover:border-white/24",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.055] transition group-hover:border-[#4da3ff]/35">
                      <Icon size={20} className="text-[#9ed0ff]" />
                    </span>
                    <div>
                      <div className="font-black text-white">{template.name}</div>
                      <div className="mt-1 text-sm leading-6 text-white/58">{template.tag}</div>
                      <div className="mt-3 h-1 rounded-md bg-white/8">
                        <div
                          className="h-1 rounded-md"
                          style={{ width: selected === id ? "100%" : "36%", backgroundColor: templateMeta[id].accent }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <TemplateBrowserMockup templateId={selected} />
        </div>
      </div>
    </section>
  );
}

function TemplateBrowserMockup({ templateId }: { templateId: TemplateId }) {
  const { t } = useLocale();
  const template = t.templates[templateId];

  return (
    <div className="template-mockup-shell relative rounded-lg border border-white/12 bg-white/[0.06] p-3 shadow-2xl">
      <div className="absolute -left-5 top-14 h-40 w-32 rounded-lg border border-white/10 bg-white/[0.045] blur-[0.2px]" aria-hidden="true" />
      <div className="absolute -right-6 bottom-24 h-48 w-36 rounded-lg border border-white/10 bg-white/[0.04]" aria-hidden="true" />
      <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-md bg-[#ff7a66]" />
          <span className="h-2.5 w-2.5 rounded-md bg-[#f7d154]" />
          <span className="h-2.5 w-2.5 rounded-md bg-[#67e8a5]" />
        </div>
        <div className="text-xs font-semibold text-white/45">prooffolio.ai/{templateId}</div>
      </div>
      <div className="relative mt-3 overflow-hidden rounded-lg border border-white/10">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${templateMeta[templateId].accent}, transparent)` }}
        />
        <div className={cn("min-h-[460px] p-6", templateMeta[templateId].className)}>
          <PortfolioPreview templateId={templateId} compact={false} />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/templates/${templateId}`}
          className="pf-focus inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/14 bg-white/8 px-4 py-3 text-sm font-black text-white hover:bg-white/12"
        >
          <Eye size={17} />
          {t.common.preview}
        </Link>
        <Link
          href={`/editor?template=${templateId}`}
          className="pf-focus inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#f7fbff] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#9ed0ff]"
        >
          <Sparkles size={17} />
          {t.common.useTemplate}
        </Link>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/58">{template.motion}</p>
    </div>
  );
}

function ProofSection() {
  const { t } = useLocale();

  return (
    <section className="bg-[#071021] py-24">
      <div className="pf-container">
        <div className="grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.proof.kicker}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{t.proof.title}</h2>
            <p className="mt-5 text-lg leading-8 text-white/64">{t.proof.body}</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {t.proof.stats.map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-3xl font-black text-white">{value}</div>
                  <div className="mt-1 text-sm text-white/54">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {t.proof.projects.map((project) => (
              <div key={project.name} className="tilt-card rounded-lg border border-white/12 bg-white/[0.06] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{project.name}</h3>
                    <p className="mt-2 text-sm font-semibold text-[#9ed0ff]">{project.signal}</p>
                  </div>
                  <FolderGit size={20} className="shrink-0 text-white/46" />
                </div>
                <div className="mt-4 rounded-lg border border-[#39e6dc]/20 bg-[#39e6dc]/7 p-3 text-sm leading-6 text-white/72">
                  {project.proof}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CareerSection() {
  const { t } = useLocale();

  return (
    <section className="bg-[#f6efe4] py-24 text-[#151926]">
      <div className="pf-container">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9a4b36]">{t.career.kicker}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{t.career.title}</h2>
            <p className="mt-5 text-lg leading-8 text-[#5f554d]">{t.career.body}</p>
            <div className="mt-8 rounded-lg border border-[#e3d7c8] bg-white/55 p-5 text-sm font-bold leading-7 text-[#51463d]">
              {t.career.recommendation}
            </div>
          </div>
          <div className="rounded-lg border border-[#e3d7c8] bg-white/70 p-6 shadow-[0_24px_80px_rgba(87,61,36,.12)]">
            <div className="space-y-5">
              {t.career.skills.map(([skill, value]) => (
                <div key={skill}>
                  <div className="mb-2 flex items-center justify-between text-sm font-black">
                    <span>{skill}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-3 rounded-md bg-[#eadfce]">
                    <div className="h-3 rounded-md bg-[#ff7a66]" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-5 gap-2">
              {t.career.skills.map(([skill], index) => (
                <div key={skill} className="flex min-h-24 flex-col items-center justify-end gap-2">
                  <div className="w-full rounded-md bg-[#172033]" style={{ height: `${34 + index * 13}px` }} />
                  <div className="text-center text-xs font-bold text-[#5f554d]">{skill}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecruiterSnapshotSection() {
  const { t } = useLocale();

  return (
    <section className="bg-[#05070d] py-24">
      <div className="pf-container grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.recruiter.kicker}</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">{t.recruiter.title}</h2>
          <p className="mt-5 text-lg leading-8 text-white/64">{t.recruiter.summary}</p>
        </div>
        <div className="rounded-lg border border-white/12 bg-white/[0.06] p-6 shadow-[0_30px_100px_rgba(0,0,0,.28)]">
          <div className="rounded-lg border border-[#39e6dc]/22 bg-[#39e6dc]/8 p-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#9ff6ef]">{t.recruiter.target}</div>
            <div className="mt-2 text-2xl font-black text-white">{t.recruiter.role}</div>
            <div className="mt-2 text-sm text-white/58">{t.recruiter.availability}</div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {t.portfolio.scanSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-white/10 bg-black/18 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white/38">0{index + 1}</div>
                <div className="mt-2 text-sm font-black text-white">{step}</div>
              </div>
            ))}
          </div>
          <button type="button" className="pf-focus mt-6 inline-flex items-center gap-2 rounded-md bg-[#f7fbff] px-4 py-3 text-sm font-black text-[#071021]">
            {t.recruiter.contact}
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useLocale();

  return (
    <section className="final-proof-cta relative overflow-hidden bg-[#070B14] py-24 text-[#F8FAFC]">
      <div className="absolute inset-0 pf-grid-v2 opacity-40" aria-hidden="true" />
      <div className="pf-container relative z-10 text-center">
        <h2 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{t.finalCta.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#94A3B8]">{t.finalCta.body}</p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/editor"
            className="pf-focus inline-flex items-center justify-center gap-2 rounded-md bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#070B14] hover:bg-[#BFDBFE]"
          >
            <Monitor size={18} />
            {t.finalCta.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <AppShell>
      <main>
        <Hero />
        <ImportEvidenceSection />
        <WorkflowSection />
        <TemplateShowcase />
        <ProofSection />
        <CareerSection />
        <RecruiterSnapshotSection />
        <PricingSection />
        <FinalCta />
      </main>
    </AppShell>
  );
}

export function DemoPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState(0);

  return (
    <AppShell>
      <main className="bg-[#05070d] pt-28">
        <section className="pf-container pb-20 pt-10">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.demo.kicker}</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">{t.demo.title}</h1>
              <p className="mt-5 text-lg leading-8 text-white/64">{t.demo.body}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {t.demo.tabs.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(index)}
                    className={cn(
                      "pf-focus rounded-md border px-4 py-2 text-sm font-black",
                      tab === index
                        ? "border-[#4da3ff]/55 bg-[#4da3ff]/15 text-white"
                        : "border-white/12 bg-white/6 text-white/62 hover:text-white",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/[0.06] p-4">
              <div className="grid gap-4 md:grid-cols-[.82fr_1.18fr]">
                <div className="rounded-lg bg-[#f7fbff] p-5 text-[#101827]">
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#071021] text-xl font-black text-white">
                    MC
                  </div>
                  <h2 className="mt-5 text-2xl font-black">{t.demo.candidate}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#475569]">{t.demo.headline}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#315dff]">{t.demo.location}</p>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border border-[#39e6dc]/22 bg-[#39e6dc]/8 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white/62">{t.common.score}</span>
                      <span className="text-4xl font-black text-white">91</span>
                    </div>
                    <div className="mt-4 h-3 rounded-md bg-white/12">
                      <div className="h-3 w-[91%] rounded-md bg-[#39e6dc]" />
                    </div>
                  </div>
                  {t.demo.highlights.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/18 p-4">
                      <BadgeCheck size={18} className="mt-0.5 shrink-0 text-[#67e8a5]" />
                      <span className="text-sm font-semibold leading-6 text-white/72">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="border-t border-white/10 bg-[#071021] py-20">
          <div className="pf-container">
            <TemplateBrowserMockup templateId={tab === 1 ? "creative-grid" : tab === 2 ? "recruiter-focus" : "dark-tech"} />
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export function TemplatesPage() {
  const { t } = useLocale();

  return (
    <AppShell>
      <main className="bg-[#05070d] pt-28">
        <section className="pf-container py-14">
          <SectionIntro {...t.templateShowcase} />
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templateIds.map((id) => {
              const template = t.templates[id];
              const Icon = templateMeta[id].icon;
              return (
                <article key={id} className="tilt-card rounded-lg border border-white/12 bg-white/[0.055] p-4">
                  <div className={cn("min-h-64 rounded-lg p-5", templateMeta[id].className)}>
                    <PortfolioPreview templateId={id} compact />
                  </div>
                  <div className="mt-5 flex items-start gap-3">
                    <Icon size={21} className="mt-1 text-[#9ed0ff]" />
                    <div>
                      <h2 className="text-xl font-black text-white">{template.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/58">{template.profile}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/templates/${id}`} className="pf-focus inline-flex flex-1 items-center justify-center rounded-md border border-white/14 px-4 py-3 text-sm font-black text-white hover:bg-white/8">
                      {t.common.preview}
                    </Link>
                    <Link href={`/editor?template=${id}`} className="pf-focus inline-flex flex-1 items-center justify-center rounded-md bg-[#f7fbff] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#9ed0ff]">
                      {t.common.useTemplate}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export function TemplatePageView({ templateId }: { templateId: TemplateId }) {
  return (
    <AppShell>
      <LivingTemplatePage templateId={templateId} />
    </AppShell>
  );
}

function PortfolioPreview({ templateId, compact }: { templateId: TemplateId; compact: boolean }) {
  const { t } = useLocale();
  const template = t.templates[templateId];
  const isDark = templateId === "dark-tech" || templateId === "story-journey";

  return (
    <div className={cn("mx-auto w-full max-w-4xl", compact ? "text-xs" : "text-sm")}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className={cn("font-black uppercase tracking-[0.22em]", isDark ? "text-[#9ed0ff]" : "text-[#315dff]")}>
            {t.common.hosted}
          </div>
          <h3 className={cn("mt-2 font-black tracking-tight", compact ? "text-2xl" : "text-4xl")}>{t.demo.candidate}</h3>
          <p className="mt-2 max-w-xl leading-6 opacity-70">{t.demo.headline}</p>
        </div>
        <div className="hidden rounded-lg border border-current/14 px-4 py-3 text-center sm:block">
          <div className="text-3xl font-black">91</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-62">{t.common.score}</div>
        </div>
      </div>
      <div
        className={cn(
          "mt-8 grid gap-3",
          templateId === "creative-grid" ? "grid-cols-2 md:grid-cols-4" : "md:grid-cols-3",
          compact && "mt-5",
        )}
      >
        {t.proof.projects.map((project, index) => (
          <div
            key={project.name}
            className={cn(
              "rounded-lg border border-current/14 bg-white/14 p-4",
              templateId === "story-journey" && index === 0 && "md:col-span-2",
              templateId === "recruiter-focus" && "bg-white/70",
            )}
          >
            <div className="font-black">{project.name}</div>
            <p className="mt-2 leading-6 opacity-68">{project.signal}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {t.recruiter.skills.slice(0, compact ? 4 : 5).map((skill) => (
          <span key={skill} className="rounded-md border border-current/15 px-3 py-2 font-bold opacity-78">
            {skill}
          </span>
        ))}
      </div>
      {!compact ? (
        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {t.career.skills.map(([skill, value]) => (
            <div key={skill} className="rounded-lg border border-current/12 bg-white/10 p-3">
              <div className="text-xs font-black opacity-60">{skill}</div>
              <div className="mt-2 text-2xl font-black">{value}</div>
            </div>
          ))}
        </div>
      ) : null}
      <p className="mt-6 leading-6 opacity-64">{template.motion}</p>
    </div>
  );
}

export function EditorPage() {
  const { t } = useLocale();
  const [templateId, setTemplateId] = useState<TemplateId>("dark-tech");
  const [accent, setAccent] = useState(accentOptions[0]);
  const [typography, setTypography] = useState(0);
  const [layout, setLayout] = useState(0);
  const [projects, setProjects] = useState(0);
  const [spacing, setSpacing] = useState(1);
  const [animation, setAnimation] = useState(1);
  const [history, setHistory] = useState<TemplateId[]>(["dark-tech"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const initialTemplate = getInitialTemplate();
      if (initialTemplate !== "dark-tech") {
        setTemplateId(initialTemplate);
        setHistory([initialTemplate]);
        setHistoryIndex(0);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function changeTemplate(next: TemplateId) {
    setTemplateId(next);
    setHistory((current) => [...current.slice(0, historyIndex + 1), next]);
    setHistoryIndex((current) => current + 1);
  }

  function undo() {
    setHistoryIndex((current) => {
      const next = Math.max(0, current - 1);
      setTemplateId(history[next]);
      return next;
    });
  }

  function redo() {
    setHistoryIndex((current) => {
      const next = Math.min(history.length - 1, current + 1);
      setTemplateId(history[next]);
      return next;
    });
  }

  return (
    <AppShell>
      <main className="bg-[#05070d] pt-28">
        <section className="pf-container py-12">
          <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
            <aside className="editor-sidebar rounded-lg border border-white/12 bg-white/[0.055] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.editor.kicker}</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{t.editor.title}</h1>
              <p className="mt-4 text-sm leading-6 text-white/58">{t.editor.body}</p>
              <div className="mt-6 grid gap-3 rounded-lg border border-[#39e6dc]/22 bg-[#39e6dc]/8 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-white/72">
                    <CircleDot size={15} className="text-[#67e8a5]" />
                    {t.common.draft}
                  </span>
                  <span className="text-sm font-black text-[#9ff6ef]">{t.editor.status}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/18 px-3 py-2">
                  <span className="text-sm font-bold text-white/60">{t.common.published}</span>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/42">{t.editor.publishState}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="pf-focus inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/12 px-3 py-2 text-sm font-black text-white/68 disabled:opacity-35"
                >
                  <RotateCcw size={16} />
                  {t.editor.undo}
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="pf-focus inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/12 px-3 py-2 text-sm font-black text-white/68 disabled:opacity-35"
                >
                  <Redo2 size={16} />
                  {t.editor.redo}
                </button>
              </div>
              <div className="mt-7 space-y-6">
                <ControlGroup label={t.editor.controls.template}>
                  <div className="grid gap-2">
                    {templateIds.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => changeTemplate(id)}
                        className={cn(
                          "pf-focus rounded-md border px-3 py-2 text-left text-sm font-bold",
                          templateId === id
                            ? "border-[#4da3ff]/55 bg-[#4da3ff]/14 text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:text-white",
                        )}
                      >
                        {t.templates[id].name}
                      </button>
                    ))}
                  </div>
                </ControlGroup>
                <ControlGroup label={t.editor.controls.color}>
                  <div className="flex gap-2">
                    {accentOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAccent(color)}
                        className={cn(
                          "pf-focus h-10 w-10 rounded-md border",
                          accent === color ? "border-white" : "border-white/16",
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </ControlGroup>
                <SegmentGroup label={t.editor.controls.typography} options={t.editor.options.typography} selected={typography} setSelected={setTypography} />
                <SegmentGroup label={t.editor.controls.layout} options={t.editor.options.layout} selected={layout} setSelected={setLayout} />
                <SegmentGroup label={t.editor.controls.projects} options={t.editor.options.projects} selected={projects} setSelected={setProjects} />
                <SegmentGroup label={t.editor.controls.spacing} options={t.editor.options.spacing} selected={spacing} setSelected={setSpacing} />
                <SegmentGroup label={t.editor.controls.animation} options={t.editor.options.animation} selected={animation} setSelected={setAnimation} />
              </div>
            </aside>
            <div className="editor-shell space-y-5 rounded-lg border border-white/10 bg-[#0D1422] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/8 bg-[#070B14] px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white/58">
                  <Clock3 size={16} />
                  {t.editor.loading}
                </div>
                <div className="flex gap-2">
                  <span className="rounded-md border border-white/12 bg-white/6 px-3 py-2 text-xs font-black text-white/68">
                    {t.editor.options.typography[typography]}
                  </span>
                  <span className="rounded-md border border-white/12 bg-white/6 px-3 py-2 text-xs font-black text-white/68">
                    {t.editor.options.layout[layout]}
                  </span>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                <div className="editor-preview-card rounded-lg border border-white/12 bg-white/[0.055] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/62">
                    <Monitor size={16} />
                    {t.editor.desktopPreview}
                  </div>
                  <div className={cn("rounded-lg p-6", templateMeta[templateId].className)} style={{ ["--accent" as string]: accent }}>
                    <PortfolioPreview templateId={templateId} compact={false} />
                  </div>
                </div>
                <div className="editor-preview-card rounded-lg border border-white/12 bg-white/[0.055] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/62">
                    <Smartphone size={16} />
                    {t.editor.mobilePreview}
                  </div>
                  <div className="mx-auto w-[250px] rounded-lg border border-white/16 bg-black p-2">
                    <div className={cn("min-h-[520px] rounded-lg p-4", templateMeta[templateId].className)}>
                      <PortfolioPreview templateId={templateId} compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function getInitialTemplate(): TemplateId {
  if (typeof window === "undefined") {
    return "dark-tech";
  }

  const requested = new URLSearchParams(window.location.search).get("template");
  return templateIds.includes(requested as TemplateId) ? (requested as TemplateId) : "dark-tech";
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/46">{label}</div>
      {children}
    </div>
  );
}

function SegmentGroup({
  label,
  options,
  selected,
  setSelected,
}: {
  label: string;
  options: readonly string[];
  selected: number;
  setSelected: (index: number) => void;
}) {
  return (
    <ControlGroup label={label}>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(index)}
            className={cn(
              "pf-focus rounded-md border px-2 py-2 text-xs font-black",
              selected === index ? "border-[#39e6dc]/55 bg-[#39e6dc]/12 text-white" : "border-white/10 bg-white/5 text-white/58",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </ControlGroup>
  );
}
