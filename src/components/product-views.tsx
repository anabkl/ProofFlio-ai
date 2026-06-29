"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  FileText,
  FolderGit,
  Globe2,
  Monitor,
  Redo2,
  RotateCcw,
  Smartphone,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { HeroScene } from "@/components/hero-scene";
import { useLocale } from "@/components/locale-provider";
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
    <section className="relative min-h-[92svh] overflow-hidden bg-[#05070d] pt-24">
      <div className="absolute inset-0 surface-line opacity-50" />
      <HeroScene />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,13,.94),rgba(5,7,13,.66)_42%,rgba(5,7,13,.34)_100%)]" />
      <div className="pf-container relative z-10 grid min-h-[calc(92svh-96px)] items-center gap-10 py-16 lg:grid-cols-[.92fr_1.08fr]">
        <div className="soft-reveal max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9ed0ff]">{t.hero.eyebrow}</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-3xl text-2xl font-black leading-tight text-[#dfeaff] sm:text-4xl">
            {t.hero.emphasis}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">{t.hero.value}</p>
          <div className="mt-8">
            <PrimaryCtas />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {t.hero.trust.map((item) => (
              <span
                key={item}
                className="rounded-md border border-white/12 bg-white/7 px-3 py-2 text-xs font-bold text-white/72"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <HeroOrbit />
        </div>
      </div>
      <div className="pf-container relative z-10 -mt-8 pb-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#4da3ff]/50 to-transparent" />
      </div>
    </section>
  );
}

function HeroOrbit() {
  const { t } = useLocale();
  const pipelineIcons = [FileText, FolderGit, BadgeCheck, Sparkles, Globe2];

  return (
    <div className="absolute inset-0 hidden lg:block" aria-label={t.hero.mockupTitle}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 620 520" role="img" aria-hidden="true">
        <path className="flow-line" d="M88 260 C190 90 430 90 532 260 C430 430 190 430 88 260Z" fill="none" stroke="#4da3ff" strokeOpacity=".42" strokeWidth="1.4" />
        <path className="flow-line" d="M120 154 C240 250 378 250 500 154" fill="none" stroke="#39e6dc" strokeOpacity=".32" strokeWidth="1.2" />
        <path className="flow-line" d="M126 370 C250 282 376 282 494 370" fill="none" stroke="#67e8a5" strokeOpacity=".26" strokeWidth="1.2" />
      </svg>
      <div className="absolute left-[37%] top-[34%] grid h-36 w-36 place-items-center rounded-lg border border-[#4da3ff]/40 bg-[#08142a]/88 shadow-[0_0_80px_rgba(77,163,255,.20)]">
        <div className="text-center">
          <Sparkles className="mx-auto text-[#9ed0ff]" size={28} />
          <div className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-white/78">ProofFolio</div>
        </div>
      </div>
      {t.hero.pipeline.map((label, index) => {
        const Icon = pipelineIcons[index];
        const positions = [
          "left-4 top-44",
          "left-28 top-9",
          "right-28 top-9",
          "right-4 top-44",
          "left-[31%] bottom-10",
        ];

        return (
          <div
            key={label}
            className={cn(
              "tilt-card absolute w-44 rounded-lg border border-white/12 bg-[#071021]/86 p-4 shadow-2xl backdrop-blur",
              index % 2 === 0 ? "float-a" : "float-b",
              positions[index],
            )}
          >
            <Icon size={20} className="text-[#9ed0ff]" />
            <div className="mt-4 text-sm font-black text-white">{label}</div>
          </div>
        );
      })}
      <div className="absolute bottom-4 right-10 w-64 rounded-lg border border-white/12 bg-white/[0.08] p-4 shadow-2xl backdrop-blur">
        <div className="text-sm font-black">{t.hero.mockupTitle}</div>
        <div className="mt-1 text-xs text-white/55">{t.hero.mockupSubtitle}</div>
        <div className="mt-4 space-y-3">
          {t.hero.cards.map((card) => {
            const Icon = icons[card.icon as keyof typeof icons];
            return (
              <div key={card.label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <Icon size={18} className="text-[#39e6dc]" />
                <div>
                  <div className="text-xs font-bold text-white/55">{card.label}</div>
                  <div className="text-sm font-black text-white">{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TransformationSection() {
  const { t } = useLocale();

  return (
    <section id="product" className="bg-[#071021] py-24">
      <div className="pf-container">
        <SectionIntro {...t.transformation} />
        <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_auto_1fr]">
          <EvidenceColumn title={t.transformation.beforeTitle} items={t.transformation.before} tone="muted" />
          <div className="hidden items-center justify-center lg:flex">
            <div className="grid h-16 w-16 place-items-center rounded-lg border border-[#4da3ff]/35 bg-[#4da3ff]/12">
              <ArrowRight className="text-[#9ed0ff]" />
            </div>
          </div>
          <EvidenceColumn title={t.transformation.afterTitle} items={t.transformation.after} tone="active" />
        </div>
      </div>
    </section>
  );
}

function EvidenceColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: "muted" | "active";
}) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/[0.045] p-5">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={item}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4",
              tone === "active"
                ? "border-[#39e6dc]/24 bg-[#39e6dc]/8 text-white"
                : "border-white/10 bg-black/18 text-white/68",
            )}
          >
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-black",
                tone === "active" ? "bg-[#39e6dc] text-[#04101f]" : "bg-white/9 text-white/56",
              )}
            >
              {index + 1}
            </span>
            <span className="text-sm font-semibold leading-6">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntelligenceSection() {
  const { t } = useLocale();

  return (
    <section className="bg-[#f7fbff] py-24 text-[#101827]">
      <div className="pf-container">
        <SectionIntro {...t.intelligence} dark={false} />
        <div className="mt-14 grid gap-6 lg:grid-cols-[.9fr_1.1fr_.9fr]">
          <DataStack title={t.intelligence.inputTitle} items={t.intelligence.inputs} />
          <div className="rounded-lg border border-[#d9e5f8] bg-white p-6 shadow-[0_24px_80px_rgba(17,31,52,.08)]">
            <div className="grid min-h-80 place-items-center">
              <div className="relative h-72 w-72">
                {t.intelligence.labels.map((label, index) => (
                  <div
                    key={label}
                    className="absolute rounded-lg border border-[#d9e5f8] bg-[#f7fbff] px-3 py-2 text-xs font-black text-[#315dff]"
                    style={{
                      top: `${index % 2 === 0 ? 4 + index * 52 : 42 + index * 42}px`,
                      left: `${index % 2 === 0 ? 0 : 158}px`,
                    }}
                  >
                    {label}
                  </div>
                ))}
                <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-[#4da3ff]/45 bg-[#071021] text-white shadow-[0_24px_70px_rgba(77,163,255,.18)]">
                  <Sparkles size={30} className="text-[#9ed0ff]" />
                </div>
                <div className="absolute inset-10 rotate-12 border border-[#4da3ff]/25" />
                <div className="absolute inset-4 -rotate-6 border border-[#39e6dc]/25" />
              </div>
            </div>
          </div>
          <DataStack title={t.intelligence.outputTitle} items={t.intelligence.outputs} active />
        </div>
      </div>
    </section>
  );
}

function DataStack({ title, items, active = false }: { title: string; items: readonly string[]; active?: boolean }) {
  return (
    <div className="rounded-lg border border-[#d9e5f8] bg-white p-5">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-[#64748b]">{title}</div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className={cn(
              "rounded-lg border px-4 py-3 text-sm font-bold",
              active ? "border-[#39e6dc]/35 bg-[#e7fbf8] text-[#0f766e]" : "border-[#d9e5f8] bg-[#f8fafc] text-[#334155]",
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateShowcase() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<TemplateId>("dark-tech");

  return (
    <section className="bg-[#05070d] py-24">
      <div className="pf-container">
        <SectionIntro {...t.templateShowcase} />
        <div className="mt-14 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <div className="space-y-3">
            {templateIds.map((id) => {
              const template = t.templates[id];
              const Icon = templateMeta[id].icon;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  className={cn(
                    "pf-focus w-full rounded-lg border p-4 text-left transition",
                    selected === id
                      ? "border-[#4da3ff]/55 bg-[#4da3ff]/12"
                      : "border-white/10 bg-white/[0.045] hover:border-white/24",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={20} className="mt-1 text-[#9ed0ff]" />
                    <div>
                      <div className="font-black text-white">{template.name}</div>
                      <div className="mt-1 text-sm leading-6 text-white/58">{template.tag}</div>
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
    <div className="rounded-lg border border-white/12 bg-white/[0.06] p-3 shadow-2xl">
      <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-md bg-[#ff7a66]" />
          <span className="h-2.5 w-2.5 rounded-md bg-[#f7d154]" />
          <span className="h-2.5 w-2.5 rounded-md bg-[#67e8a5]" />
        </div>
        <div className="text-xs font-semibold text-white/45">prooffolio.ai/{templateId}</div>
      </div>
      <div className={cn("mt-3 min-h-[460px] rounded-lg p-6", templateMeta[templateId].className)}>
        <PortfolioPreview templateId={templateId} compact={false} />
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

function RecruiterAndPlans() {
  const { t } = useLocale();

  return (
    <section id="plans" className="bg-[#05070d] py-24">
      <div className="pf-container grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <div className="rounded-lg border border-white/12 bg-white/[0.06] p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.recruiter.kicker}</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white">{t.recruiter.title}</h2>
          <p className="mt-4 text-base leading-7 text-white/64">{t.recruiter.summary}</p>
          <div className="mt-6 rounded-lg border border-[#39e6dc]/22 bg-[#39e6dc]/8 p-4">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#9ff6ef]">{t.recruiter.target}</div>
            <div className="mt-2 text-xl font-black text-white">{t.recruiter.role}</div>
            <div className="mt-2 text-sm text-white/58">{t.recruiter.availability}</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {t.recruiter.skills.map((skill) => (
              <span key={skill} className="rounded-md border border-white/12 bg-white/7 px-3 py-2 text-sm font-bold text-white/76">
                {skill}
              </span>
            ))}
          </div>
          <button className="pf-focus mt-6 inline-flex items-center gap-2 rounded-md bg-[#f7fbff] px-4 py-3 text-sm font-black text-[#071021]">
            {t.recruiter.contact}
            <ChevronRight size={17} />
          </button>
        </div>
        <div className="rounded-lg border border-white/12 bg-white/[0.045] p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.plans.kicker}</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white">{t.plans.title}</h2>
          <p className="mt-3 text-sm leading-6 text-white/54">{t.plans.note}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {t.plans.tiers.map((tier, index) => (
              <div
                key={tier.name}
                className={cn(
                  "rounded-lg border p-4",
                  index === 1 ? "border-[#4da3ff]/45 bg-[#4da3ff]/12" : "border-white/10 bg-black/18",
                )}
              >
                <div className="text-lg font-black text-white">{tier.name}</div>
                <div className="mt-3 text-3xl font-black text-[#9ed0ff]">{tier.price}</div>
                <p className="mt-3 text-sm leading-6 text-white/60">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useLocale();

  return (
    <section className="bg-[#f7fbff] py-24 text-[#101827]">
      <div className="pf-container text-center">
        <h2 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{t.finalCta.title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#475569]">{t.finalCta.body}</p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/editor"
            className="pf-focus inline-flex items-center justify-center gap-2 rounded-md bg-[#071021] px-5 py-3 text-sm font-black text-white hover:bg-[#0f2144]"
          >
            <Monitor size={18} />
            {t.common.openEditor}
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
        <TransformationSection />
        <IntelligenceSection />
        <TemplateShowcase />
        <ProofSection />
        <CareerSection />
        <RecruiterAndPlans />
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
  const { t } = useLocale();
  const template = t.templates[templateId];
  const Icon = templateMeta[templateId].icon;

  return (
    <AppShell>
      <main className={cn("min-h-screen pt-28", templateMeta[templateId].className)}>
        <section className="pf-container py-12">
          <Link href="/templates" className="pf-focus inline-flex items-center gap-2 rounded-md text-sm font-black opacity-70 hover:opacity-100">
            <ChevronRight size={16} className="rotate-180" />
            {t.nav.templates}
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
            <div>
              <Icon size={30} />
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{template.name}</h1>
              <p className="mt-4 text-xl font-bold opacity-76">{template.tag}</p>
              <p className="mt-5 text-base leading-8 opacity-70">{template.profile}</p>
              <div className="mt-6 rounded-lg border border-current/15 bg-white/12 p-4 text-sm font-semibold leading-6">
                {template.motion}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={`/editor?template=${templateId}`} className="pf-focus inline-flex items-center justify-center gap-2 rounded-md bg-[#071021] px-4 py-3 text-sm font-black text-white">
                  <Sparkles size={17} />
                  {t.common.useTemplate}
                </Link>
                <Link href="/demo" className="pf-focus inline-flex items-center justify-center gap-2 rounded-md border border-current/16 px-4 py-3 text-sm font-black">
                  <Eye size={17} />
                  {t.common.demo}
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-current/14 bg-white/18 p-4 shadow-2xl">
              <PortfolioPreview templateId={templateId} compact={false} />
            </div>
          </div>
        </section>
      </main>
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
            <aside className="rounded-lg border border-white/12 bg-white/[0.055] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9ed0ff]">{t.editor.kicker}</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white">{t.editor.title}</h1>
              <p className="mt-4 text-sm leading-6 text-white/58">{t.editor.body}</p>
              <div className="mt-6 flex items-center justify-between rounded-lg border border-[#39e6dc]/22 bg-[#39e6dc]/8 p-3">
                <span className="flex items-center gap-2 text-sm font-bold text-white/72">
                  <CircleDot size={15} className="text-[#67e8a5]" />
                  {t.common.draft}
                </span>
                <span className="text-sm font-black text-[#9ff6ef]">{t.editor.status}</span>
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
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                <div className="rounded-lg border border-white/12 bg-white/[0.055] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/62">
                    <Monitor size={16} />
                    {t.editor.desktopPreview}
                  </div>
                  <div className={cn("rounded-lg p-6", templateMeta[templateId].className)} style={{ ["--accent" as string]: accent }}>
                    <PortfolioPreview templateId={templateId} compact={false} />
                  </div>
                </div>
                <div className="rounded-lg border border-white/12 bg-white/[0.055] p-4">
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
