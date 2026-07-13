"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Eye,
  FileText,
  FolderGit,
  Globe2,
  LogOut,
  Menu,
  Monitor,
  Redo2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { LivingTemplatePage } from "@/components/living-templates";
import { Logo } from "@/components/brand/logo";
import { useLocale } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PricingSection } from "@/components/pricing-section";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  icons,
  localeMeta,
  locales,
  newTemplateIds,
  templateCategories,
  templateIds,
  templateMeta,
  type Copy,
  type TemplateCategory,
  type TemplateId,
} from "@/lib/content";

const accentOptions = ["#4da3ff", "#39e6dc", "#67e8a5", "#ff7a66"];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type MarketingUser = { displayName: string; email: string } | null;

export function AppShell({ children, user = null }: { children: React.ReactNode; user?: MarketingUser }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[var(--pf-bg)] text-[var(--pf-text)] transition-colors duration-200">
      <Navigation user={user} />
      {children}
      <Footer />
    </div>
  );
}

function initialsFromName(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "PF";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function Navigation({ user }: { user: MarketingUser }) {
  const { locale, localeReady, setLocale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const links = [
    { href: "/#product", label: t.nav.product },
    { href: "/templates", label: t.nav.templates },
    { href: "/demo", label: t.nav.demo },
    { href: "/#plans", label: t.nav.pricing },
  ];
  const mobileLinks = [
    { href: "/", label: t.nav.home },
    { href: "/templates", label: t.nav.templates },
    { href: "/demo", label: t.nav.demo },
    { href: "/#plans", label: t.nav.pricing },
  ];

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <a href="#main-content" className="pf-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#071021]">
        {t.nav.skip}
      </a>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--pf-bg)]/82 backdrop-blur-xl transition-colors duration-200">
        <div className="pf-container flex min-h-16 items-center justify-between gap-2 py-3 sm:gap-3">
          <Link href="/" className="pf-focus flex min-w-0 items-center gap-2 sm:gap-3">
            <Logo variant="wordmark" size={15} className="text-[var(--pf-text)]" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label={t.nav.primary}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="pf-focus rounded-md px-3 py-2 text-sm font-semibold text-[var(--pf-muted)] transition hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <div
              className="flex shrink-0 rounded-md border border-[var(--line)] bg-[var(--pf-text)]/6 p-1"
              aria-label={t.nav.language}
            >
              {locales.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={!localeReady}
                  onClick={() => setLocale(item)}
                  className={cn(
                    "pf-focus rounded-md px-1.5 py-1.5 text-[11px] font-black transition sm:px-2.5 sm:text-xs",
                    locale === item
                      ? "bg-[var(--pf-text)] text-[var(--pf-bg)]"
                      : "text-[var(--pf-muted)] hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)]",
                  )}
                >
                  {localeMeta[item].label}
                </button>
              ))}
            </div>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="pf-focus hidden shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--pf-text)]/6 py-1 pl-1 pr-3 text-sm font-black text-[var(--pf-text)] transition hover:bg-[var(--pf-text)]/10 lg:inline-flex"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--pf-blue)]/22 text-[11px] font-black text-[var(--pf-blue)]">
                    {initialsFromName(user.displayName || user.email)}
                  </span>
                  <span className="max-w-[120px] truncate">{user.displayName || user.email}</span>
                </Link>
                <form action={signOutAction} className="hidden lg:block">
                  <button
                    type="submit"
                    className="pf-focus inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--pf-text)]/6 px-3 py-2 text-xs font-black text-[var(--pf-muted)] transition hover:bg-[var(--pf-text)]/10 hover:text-[var(--pf-text)]"
                  >
                    <LogOut size={14} />
                    {t.auth.signOut}
                  </button>
                </form>
                <Link
                  href="/dashboard"
                  aria-label={t.nav.dashboard}
                  className="pf-focus inline-flex shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--pf-text)]/6 px-2.5 py-2 lg:hidden"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--pf-blue)]/22 text-[11px] font-black text-[var(--pf-blue)]">
                    {initialsFromName(user.displayName || user.email)}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in?next=/dashboard"
                  className="pf-focus hidden shrink-0 rounded-md px-3 py-2 text-sm font-black text-[var(--pf-muted)] transition hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)] lg:inline-flex lg:items-center"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/auth/sign-up?next=/onboarding"
                  aria-label={t.nav.createAccount}
                  className="pf-focus inline-flex shrink-0 rounded-md bg-[var(--pf-text)] px-2.5 py-2 text-sm font-black text-[var(--pf-bg)] transition hover:opacity-85 sm:px-4"
                >
                  <span className="hidden sm:inline">{t.nav.createAccount}</span>
                  <span className="sm:hidden">{t.nav.startShort}</span>
                </Link>
              </>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="pf-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-[var(--pf-text)]/6 text-[var(--pf-text)] lg:hidden"
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen ? (
            <motion.nav
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              className="border-t border-[var(--line)] bg-[var(--pf-bg)]/96 px-4 pb-4 pt-2 shadow-[0_22px_80px_rgba(0,0,0,.34)] lg:hidden"
              aria-label={t.nav.menu}
            >
              <div className="mx-auto grid max-w-[1180px] gap-2">
                <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--pf-text)]/[0.045] px-4 py-3">
                  <span className="text-sm font-black text-[var(--pf-muted)]">{t.theme.label}</span>
                  <ThemeToggle />
                </div>
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="pf-focus rounded-lg border border-[var(--line)] bg-[var(--pf-text)]/[0.045] px-4 py-3 text-sm font-black text-[var(--pf-text)]/78 hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 grid gap-2 border-t border-[var(--line)] pt-3">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="pf-focus rounded-lg border border-[var(--line)] bg-[var(--pf-text)]/[0.045] px-4 py-3 text-sm font-black text-[var(--pf-text)]/78 hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)]"
                      >
                        {t.nav.dashboard}
                      </Link>
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          onClick={() => setMobileOpen(false)}
                          className="pf-focus w-full rounded-lg border border-[var(--line)] bg-[var(--pf-text)]/[0.045] px-4 py-3 text-left text-sm font-black text-[var(--pf-text)]/78 hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)]"
                        >
                          {t.auth.signOut}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/sign-in?next=/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="pf-focus rounded-lg border border-[var(--line)] bg-[var(--pf-text)]/[0.045] px-4 py-3 text-sm font-black text-[var(--pf-text)]/78 hover:bg-[var(--pf-text)]/8 hover:text-[var(--pf-text)]"
                      >
                        {t.nav.signIn}
                      </Link>
                      <Link
                        href="/auth/sign-up?next=/onboarding"
                        onClick={() => setMobileOpen(false)}
                        className="pf-focus rounded-lg bg-[var(--pf-text)] px-4 py-3 text-center text-sm font-black text-[var(--pf-bg)] hover:opacity-85"
                      >
                        {t.nav.createAccount}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}

function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-[var(--line)] bg-[var(--pf-bg)] transition-colors duration-200">
      <div className="pf-container grid gap-8 py-10 md:grid-cols-[1fr_1.4fr_.8fr]">
        <div>
          <Logo variant="wordmark" size={15} className="text-[var(--pf-text)]" />
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--pf-muted)]">{t.footer.note}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            [t.nav.product, "/#product"],
            [t.nav.demo, "/demo"],
            [t.footer.templates, "/templates"],
            [t.nav.editor, "/editor"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="pf-focus rounded-md py-1 font-semibold text-[var(--pf-muted)] hover:text-[var(--pf-text)]">
              {label}
            </Link>
          ))}
        </div>
        <div className="text-sm text-[var(--pf-muted)]">Next.js · TypeScript · Tailwind</div>
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
    <div className="hero-ctas flex flex-col gap-3 sm:flex-row">
      <Link
        href="/onboarding"
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
    <section className="pf-hero-v3 relative min-h-screen overflow-hidden bg-[#040712] pt-24">
      <div className="absolute inset-0 pf-grid-v3" aria-hidden="true" />
      <div className="pf-hero-v3-plane pf-hero-v3-plane-a" aria-hidden="true" />
      <div className="pf-hero-v3-plane pf-hero-v3-plane-b" aria-hidden="true" />
      <div className="pf-container relative z-10 grid min-h-[calc(100svh-96px)] items-center gap-12 py-12 lg:grid-cols-[.82fr_1.18fr] lg:py-0">
        <div className="soft-reveal max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#2DD4BF]">{t.hero.eyebrow}</p>
          <h1 className="mt-6 whitespace-pre-line text-5xl font-black leading-[0.9] tracking-tight text-[#F8FAFC] sm:text-6xl">
            {t.hero.emphasis}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#A8B3C7] sm:text-lg">{t.hero.value}</p>
          <div className="mt-8">
            <PrimaryCtas />
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2 text-sm font-bold text-[#A8B3C7]">
            {t.hero.trust.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="h-1 w-1 rounded-[2px] bg-[#7757FF]" /> : null}
                {item}
              </span>
            ))}
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-white/10 py-4 text-xs font-black uppercase tracking-[0.16em] text-white/54">
            {t.hero.highlights.map((item) => (
              <span key={item} className="leading-5">{item}</span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[620px] lg:min-h-[720px]">
          <HeroProductPreview />
        </div>
      </div>
    </section>
  );
}

function HeroProductPreview() {
  const { t } = useLocale();
  const [activeView, setActiveView] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const sourceIcons = [FileText, FolderGit, BadgeCheck] as const;
  const activeLabel = t.productStage.tabs[activeView] ?? t.productStage.tabs[0];

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }

  return (
    <div
      className="product-stage evidence-os-stage relative mx-auto min-h-[560px] w-full max-w-[720px] lg:min-h-[690px]"
      aria-label={t.hero.mockupTitle}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      style={{ ["--stage-x" as string]: pointer.x, ["--stage-y" as string]: pointer.y }}
    >
      <div className="evidence-stage-backdrop evidence-stage-backdrop-a" aria-hidden="true" />
      <div className="evidence-stage-backdrop evidence-stage-backdrop-b" aria-hidden="true" />
      <svg className="evidence-stage-lines absolute inset-0 h-full w-full" viewBox="0 0 720 690" role="img" aria-hidden="true">
        <path className="flow-line" d="M102 182 C226 188 268 255 343 332 C421 412 520 423 630 354" fill="none" />
        <path className="flow-line" d="M112 512 C230 462 286 421 354 346 C428 265 505 184 616 154" fill="none" />
        <path className="flow-line flow-line-proof" d="M112 346 C224 312 296 344 356 346 C458 350 534 301 624 247" fill="none" />
      </svg>

      <div className="stage-controls absolute left-1/2 top-0 z-40 flex rounded-xl border border-white/12 bg-[#060b17]/90 p-1 shadow-[0_20px_80px_rgba(0,0,0,.32)] backdrop-blur">
        {t.productStage.tabs.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveView(index)}
            className={cn(
              "pf-focus min-w-24 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition",
              activeView === index ? "bg-[#EAF5FF] text-[#071021]" : "text-[#94A3B8] hover:bg-white/8 hover:text-white",
            )}
            aria-pressed={activeView === index}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="stage-backplate absolute left-[7%] top-[82px] h-[500px] w-[84%] rounded-[34px] border border-[#7757FF]/20 bg-[#080d1b]/68" aria-hidden="true" />

      <div className="stage-window absolute left-[4%] top-[92px] z-20 w-[92%] overflow-hidden rounded-[28px] border border-white/12 bg-[#08101f] shadow-[0_42px_160px_rgba(0,0,0,.52)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 bg-[#11182a] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[#FF6B5F]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[#F7C948]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[#2DD4BF]" />
            </div>
            <span className="hidden text-[10px] font-black uppercase tracking-[0.22em] text-[#7DD3FC] sm:inline">
              Evidence-first portfolio OS
            </span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#94A3B8]">prooffolio.ai/maya</div>
        </div>
        <div className="stage-window-body min-h-[430px] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2DD4BF]">{activeLabel}</div>
              <p className="mt-1 text-xs font-bold text-[#A8B3C7]">{t.productStage.principle}</p>
            </div>
            <div className="hidden grid-cols-3 gap-1 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white/52 sm:grid">
              {t.heroPreview.readinessChecks.map((item) => (
                <span key={item} className="rounded-lg border border-white/8 px-2 py-2">{item}</span>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.985 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              {activeView === 0 ? <StagePortfolioView /> : null}
              {activeView === 1 ? <StageEvidenceView /> : null}
              {activeView === 2 ? <StageRecruiterView /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {t.hero.cards.map((card, index) => {
        const Icon = sourceIcons[index] ?? FileText;
        const position = ["source-card-cv left-0 top-[148px]", "source-card-github right-0 top-[88px]", "source-card-certificates left-[5%] bottom-[42px]"][index];
        return (
          <div
            key={card.label}
            className={cn(
              "stage-source-card absolute z-30 hidden w-40 rounded-2xl border border-white/10 bg-[#111A2B]/94 p-4 shadow-[0_22px_80px_rgba(0,0,0,.34)] backdrop-blur sm:block sm:w-44",
              position,
            )}
          >
            <Icon size={20} className="text-[#2DD4BF]" />
            <div className="mt-4 text-sm font-black text-[#F8FAFC]">{card.label}</div>
            <div className="mt-1 text-xs leading-5 text-[#94A3B8]">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function StagePortfolioView() {
  const { t } = useLocale();

  return (
    <div className="evidence-stage-layout">
      <div className="evidence-profile-pane">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#4E8CFF] to-[#2DD4BF] text-xl font-black text-white shadow-[0_18px_45px_rgba(45,212,191,.18)]">
            {t.portfolio.initials}
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-black leading-none text-[#F8FAFC]">{t.productStage.portfolio.title}</div>
            <div className="mt-2 text-sm font-bold text-[#A8B3C7]">{t.productStage.portfolio.subtitle}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {t.productStage.portfolio.stack.map((tech) => (
            <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-[#CBD5E1]">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/8 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#99F6E4]">{t.productStage.portfolio.label}</div>
          <div className="mt-3 text-sm font-bold leading-6 text-[#D1FAE5]">{t.productStage.portfolio.availability}</div>
          <div className="mt-3 text-xs font-bold text-[#A8B3C7]">{t.productStage.portfolio.certificates}</div>
        </div>
      </div>

      <div className="evidence-publish-pane">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7DD3FC]">{t.common.hosted}</div>
          <ShieldCheck size={19} className="text-[#2DD4BF]" />
        </div>
        <div className="mt-5 space-y-3">
          {t.portfolio.projects.slice(0, 3).map((project, index) => (
            <div key={project.name} className="evidence-project-row">
              <span className="font-mono text-xs font-black text-[#2DD4BF]">0{index + 1}</span>
              <div>
                <div className="text-sm font-black text-white">{project.name}</div>
                <div className="mt-1 text-xs leading-5 text-[#94A3B8]">{project.impact}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageEvidenceView() {
  const { t } = useLocale();

  return (
    <div className="evidence-stage-layout">
      <div className="evidence-profile-pane">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#2DD4BF]">{t.productStage.evidence.label}</div>
        <h3 className="mt-3 text-3xl font-black leading-tight text-white">{t.productStage.evidence.title}</h3>
        <div className="mt-6 space-y-3">
          {t.productStage.evidence.sources.map((source, index) => (
            <div key={source} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
              <span className="text-sm font-bold text-[#CBD5E1]">{source}</span>
              <span className="rounded-md bg-[#2DD4BF]/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#99F6E4]">
                {index === 0 ? t.productStage.evidence.repository : t.productStage.evidence.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="evidence-publish-pane">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">{t.heroPreview.githubActivity}</span>
          <Activity size={16} className="text-[#4E8CFF]" />
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {Array.from({ length: 70 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-3 rounded-[3px] transition hover:scale-125",
                index % 9 === 0 ? "bg-[#2DD4BF]" : index % 5 === 0 ? "bg-[#4E8CFF]" : index % 3 === 0 ? "bg-[#7757FF]/70" : "bg-white/8",
              )}
            />
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {t.portfolio.certificates.slice(0, 3).map((certificate) => (
            <div key={certificate} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-xs font-bold text-[#CBD5E1]">
              <CheckCircle2 size={14} className="text-[#2DD4BF]" />
              <span>{certificate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageRecruiterView() {
  const { t } = useLocale();

  return (
    <div className="evidence-stage-layout">
      <div className="evidence-profile-pane">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#93C5FD]">{t.productStage.recruiter.label}</div>
        <h3 className="mt-3 text-2xl font-black leading-tight text-white">{t.productStage.recruiter.title}</h3>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">{t.productStage.recruiter.target}</div>
          <div className="mt-1 text-sm font-black text-[#F8FAFC]">{t.portfolio.targetRole}</div>
        </div>
        <div className="mt-3 grid gap-2 text-xs font-bold text-[#CBD5E1]">
          <span className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2">{t.portfolio.location}</span>
          <span className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2">{t.portfolio.availability}</span>
        </div>
      </div>
      <div className="evidence-publish-pane">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-white">{t.portfolio.name}</div>
            <div className="mt-1 text-sm font-bold text-[#94A3B8]">{t.portfolio.availability}</div>
          </div>
          <ShieldCheck className="text-[#2DD4BF]" size={24} />
        </div>
        <div className="mt-5 space-y-3">
          {t.portfolio.projects.slice(0, 3).map((project, index) => (
            <div key={project.name} className="rounded-xl border border-white/8 bg-[#07101f]/74 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-black text-white">{project.name}</div>
                <span className="font-mono text-xs font-black text-[#2DD4BF]">0{index + 1}</span>
              </div>
              <div className="mt-1 text-xs leading-5 text-[#94A3B8]">{project.impact}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" className="pf-focus rounded-xl bg-[#EAF5FF] px-4 py-3 text-xs font-black text-[#071021]">
            {t.productStage.recruiter.cv}
          </button>
          <button type="button" className="pf-focus rounded-xl border border-[#2DD4BF]/28 bg-[#2DD4BF]/10 px-4 py-3 text-xs font-black text-[#D1FAE5]">
            {t.productStage.recruiter.contact}
          </button>
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
          <TemplatePreview templateId={templateId} compact={false} />
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
          href={`/onboarding?template=${templateId}`}
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
                <div className="text-xs font-black uppercase tracking-[0.18em] text-white/52">0{index + 1}</div>
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
            href="/onboarding"
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

export function LandingPage({ user = null }: { user?: MarketingUser }) {
  return (
    <AppShell user={user}>
      <main id="main-content">
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

export function DemoPage({ user = null }: { user?: MarketingUser }) {
  const { t } = useLocale();
  const [tab, setTab] = useState(0);

  return (
    <AppShell user={user}>
      <main id="main-content" className="bg-[#05070d] pt-28">
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

export function TemplatesPage({ user = null }: { user?: MarketingUser }) {
  const { t } = useLocale();
  const [category, setCategory] = useState<TemplateCategory | "All">("All");
  const visibleIds = templateIds.filter((id) => category === "All" || templateMeta[id].category === category);

  return (
    <AppShell user={user}>
      <main id="main-content" className="bg-[#05070d] pt-28">
        <section className="pf-container py-14">
          <SectionIntro {...t.templateShowcase} />
          <div role="radiogroup" aria-label={t.common.section} className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={category === "All"}
              onClick={() => setCategory("All")}
              className={cn(
                "pf-focus rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition",
                category === "All" ? "border-white bg-white text-[#071021]" : "border-white/14 text-white/62 hover:text-white",
              )}
            >
              {t.common.all}
            </button>
            {templateCategories.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  "pf-focus rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition",
                  category === item ? "border-white bg-white text-[#071021]" : "border-white/14 text-white/62 hover:text-white",
                )}
              >
                {t.templateShowcase.categories[item]}
              </button>
            ))}
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleIds.map((id) => {
              const template = t.templates[id];
              const Icon = templateMeta[id].icon;
              const isNew = newTemplateIds.includes(id);
              return (
                <article key={id} className="tilt-card relative rounded-lg border border-white/12 bg-white/[0.055] p-4">
                  {isNew ? (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-[#2dd4bf] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#04141a]">
                      {t.common.new}
                    </span>
                  ) : null}
                  <div className={cn("min-h-64 rounded-lg p-5", templateMeta[id].className)}>
                    <TemplatePreview templateId={id} compact />
                  </div>
                  <div className="mt-5 flex items-start gap-3">
                    <Icon size={21} className="mt-1 text-[#9ed0ff]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white">{template.name}</h2>
                        <span className="rounded-md border border-white/14 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/50">
                          {t.templateShowcase.categories[templateMeta[id].category]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/58">{template.profile}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/templates/${id}`} className="pf-focus inline-flex flex-1 items-center justify-center rounded-md border border-white/14 px-4 py-3 text-sm font-black text-white hover:bg-white/8">
                      {t.common.preview}
                    </Link>
                    <Link href={`/onboarding?template=${id}`} className="pf-focus inline-flex flex-1 items-center justify-center rounded-md bg-[#f7fbff] px-4 py-3 text-sm font-black text-[#071021] hover:bg-[#9ed0ff]">
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

export function TemplatePageView({ templateId, user = null }: { templateId: TemplateId; user?: MarketingUser }) {
  return (
    <AppShell user={user}>
      <LivingTemplatePage templateId={templateId} />
    </AppShell>
  );
}

function TemplatePreview({ templateId, compact }: { templateId: TemplateId; compact: boolean }) {
  const { t } = useLocale();

  if (templateId === "minimal-executive") {
    return <MinimalPreview t={t} compact={compact} />;
  }

  if (templateId === "dark-tech") {
    return <DarkTechPreview t={t} compact={compact} />;
  }

  if (templateId === "creative-grid") {
    return <CreativeGridPreview t={t} compact={compact} />;
  }

  if (templateId === "story-journey") {
    return <StoryJourneyPreview t={t} compact={compact} />;
  }

  if (templateId === "recruiter-focus") {
    return <RecruiterFocusPreview t={t} compact={compact} />;
  }

  if (templateId === "developer-signature") {
    return <DeveloperSignaturePreview t={t} compact={compact} />;
  }

  if (templateId === "career-chronicle") {
    return <CareerChroniclePreview t={t} compact={compact} />;
  }

  if (templateId === "signal-os") {
    return <SignalOsPreview t={t} compact={compact} />;
  }

  return <MonographPreview t={t} compact={compact} />;
}

function SignalOsPreview({ t, compact }: { t: Copy; compact: boolean }) {
  const s = t.signalOs;
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-white", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-5 md:grid-cols-[.95fr_1.05fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#8ff0f7]">{s.role}</p>
          <h3 className={cn("mt-3 font-black tracking-tight", compact ? "text-3xl" : "text-5xl")}>{s.name}</h3>
          <p className="mt-3 leading-7 text-white/62">{s.headline}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {s.metrics.slice(0, 4).map(([value, label]) => (
            <div key={label} className="rounded-md border border-[#22d3ee]/25 bg-[#06101f]/82 p-3">
              <div className="text-2xl font-black">{value}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-3">
        {s.projects.slice(0, compact ? 2 : 3).map((project) => (
          <div key={project.name} className="rounded-md border border-white/10 bg-white/[0.055] p-4">
            <div className="font-black">{project.name}</div>
            <p className="mt-2 leading-6 text-white/58">{project.signal}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonographPreview({ t, compact }: { t: Copy; compact: boolean }) {
  const m = t.monograph;
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-[#1c1a17]", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-5 md:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#9a4b36]">{m.role}</p>
          <h3 className={cn("mt-3 font-serif font-black leading-none tracking-tight", compact ? "text-3xl" : "text-5xl")}>{m.name}</h3>
          <p className="mt-4 max-w-xl font-semibold leading-7 text-[#1c1a17]/64">{m.featured.tag}</p>
        </div>
        <div className="aspect-[4/3] rounded-md bg-gradient-to-br from-[#e7d9c5] via-[#efe4d4] to-[#dbcab0]" aria-hidden="true" />
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-3">
        {m.projects.slice(0, compact ? 2 : 3).map((project) => (
          <div key={project.name} className="rounded-md border border-[#1c1a17]/10 bg-white p-4">
            <div className="font-serif font-black">{project.name}</div>
            <p className="mt-2 leading-6 text-[#1c1a17]/60">{project.tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MinimalPreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-5 md:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#315dff]">{t.common.hosted}</p>
          <h3 className={cn("mt-3 font-black leading-none tracking-tight text-[#172033]", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
          <p className="mt-4 max-w-xl font-semibold leading-7 text-[#475569]">{t.portfolio.targetRole}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {t.portfolio.metrics.slice(0, 4).map(([value, label]) => (
            <div key={label} className="rounded-md border border-[#dbe4f0] bg-white p-3 text-[#172033]">
              <div className="text-2xl font-black">{value}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-3">
        {t.portfolio.projects.slice(0, compact ? 2 : 3).map((project) => (
          <div key={project.name} className="rounded-md border border-[#dbe4f0] bg-white p-4 text-[#172033]">
            <div className="font-black">{project.name}</div>
            <p className="mt-2 leading-6 text-[#64748b]">{project.impact}</p>
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="mt-6 space-y-3">
          {t.portfolio.skills.slice(0, 4).map(([skill, value]) => (
            <div key={skill}>
              <div className="mb-1 flex justify-between font-black text-[#172033]">
                <span>{skill}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2 rounded-md bg-[#e2e8f0]">
                <div className="h-2 rounded-md bg-[#315dff]" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DarkTechPreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-white", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-5 md:grid-cols-[.92fr_1.08fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#9ed0ff]">{t.templateUi.dark.flagship}</p>
          <h3 className={cn("mt-3 font-black tracking-tight", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
          <p className="mt-3 leading-7 text-white/62">{t.templateUi.dark.command}</p>
        </div>
        <div className="rounded-md border border-[#4da3ff]/22 bg-[#06101f]/82 p-3 shadow-[0_0_70px_rgba(77,163,255,.13)]">
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: compact ? 40 : 70 }, (_, index) => (
              <span
                key={index}
                className={cn("h-3 rounded-[3px]", index % 7 === 0 ? "bg-[#67e8a5]" : index % 5 === 0 ? "bg-[#4da3ff]" : index % 3 === 0 ? "bg-[#315dff]/70" : "bg-white/8")}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {t.portfolio.projects.slice(0, 3).map((project, index) => (
          <div key={project.name} className="rounded-md border border-white/10 bg-white/[0.055] p-4">
            <div className="font-mono text-[10px] font-black text-[#67e8a5]">0{index + 1}</div>
            <div className="mt-2 font-black">{project.name}</div>
            <p className="mt-2 leading-6 text-white/58">{project.proof}</p>
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {t.portfolio.skills.map(([skill, value]) => (
            <span key={skill} className="rounded-md border border-[#4da3ff]/22 bg-[#4da3ff]/10 px-3 py-2 font-black text-[#d8ecff]">
              {skill} · {value}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CreativeGridPreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-[#151926]", compact ? "text-xs" : "text-sm")}>
      <p className="font-black uppercase tracking-[0.22em] text-[#b4533f]">{t.templates["creative-grid"].name}</p>
      <h3 className={cn("mt-3 max-w-xl font-black leading-tight tracking-tight", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
      <div className="mt-6 grid auto-rows-[92px] grid-cols-4 gap-3">
        {t.portfolio.projects.slice(0, 4).map((project, index) => (
          <div
            key={project.name}
            className={cn(
              "media-sheen rounded-md border border-[#e6d7d0] p-4 text-white",
              index === 0 ? "col-span-2 row-span-2" : "col-span-2",
              compact && index > 2 && "hidden md:block",
            )}
          >
            <div className="relative z-10 font-black">{project.name}</div>
            <p className="relative z-10 mt-2 max-w-xs leading-6 text-white/78">{project.category}</p>
          </div>
        ))}
      </div>
      {!compact ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-4">
          {t.templateUi.creative.processSteps.map((step, index) => (
            <div key={step} className="rounded-md border border-[#e6d7d0] bg-white p-3">
              <div className="font-mono text-xs font-black text-[#ff7a66]">0{index + 1}</div>
              <div className="mt-2 font-black">{step}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StoryJourneyPreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-white", compact ? "text-xs" : "text-sm")}>
      <p className="font-black uppercase tracking-[0.22em] text-[#67e8a5]">{t.templates["story-journey"].name}</p>
      <h3 className={cn("mt-3 max-w-2xl font-black tracking-tight", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="hidden border-l border-[#67e8a5]/35 pl-4 md:block">
          <div className="text-3xl font-black text-[#67e8a5]">{t.portfolio.timeline.length}</div>
          <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/48">{t.templateUi.nav.timeline}</div>
        </div>
        <div className="space-y-3">
          {t.portfolio.timeline.slice(0, compact ? 3 : 4).map((item, index) => (
            <div key={item.chapter} className="relative rounded-md border border-white/10 bg-white/[0.055] p-4 pl-12">
              <span className="absolute left-3 top-4 grid h-7 w-7 place-items-center rounded-md bg-[#67e8a5] text-xs font-black text-[#101010]">{index + 1}</span>
              <div className="font-black">{item.chapter}</div>
              <p className="mt-1 leading-6 text-white/58">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
      {!compact ? (
        <div className="mt-6 grid grid-cols-5 items-end gap-2">
          {t.career.skills.map(([skill, value]) => (
            <div key={skill} className="text-center">
              <div className="mx-auto w-full rounded-md bg-[#67e8a5]" style={{ height: `${Number(value) * 1.15}px` }} />
              <div className="mt-2 text-xs font-bold text-white/54">{skill}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RecruiterFocusPreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-[#172033]", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#0f766e]">{t.templateUi.recruiter.recruiterOnly}</p>
          <h3 className={cn("mt-3 font-black tracking-tight", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
          <p className="mt-3 max-w-xl font-semibold leading-7 text-[#475569]">{t.portfolio.targetRole}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[t.portfolio.location, t.portfolio.availability].map((item) => (
              <span key={item} className="rounded-md border border-[#dbe4f0] bg-white px-3 py-2 font-black text-[#475569]">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-[#dbe4f0] bg-white p-4">
          <div className="text-4xl font-black text-[#0f766e]">60s</div>
          <div className="mt-2 font-black">{t.templateUi.recruiter.scanTitle}</div>
          <div className="mt-4 space-y-2">
            {t.portfolio.scanSteps.slice(0, compact ? 3 : 5).map((step, index) => (
              <div key={step} className="flex items-center justify-between rounded-md bg-[#f8fafc] px-3 py-2">
                <span className="font-bold">{step}</span>
                <span className="font-mono text-xs font-black text-[#0f766e]">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!compact ? (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {t.portfolio.projects.slice(0, 3).map((project) => (
            <div key={project.name} className="rounded-md border border-[#dbe4f0] bg-white p-4">
              <div className="font-black">{project.name}</div>
              <p className="mt-2 leading-6 text-[#64748b]">{project.impact}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DeveloperSignaturePreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-white", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-5 md:grid-cols-[.88fr_1.12fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#39e6dc]">{t.templateUi.developer.eyebrow}</p>
          <h3 className={cn("mt-3 font-black tracking-tight", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
          <p className="mt-3 font-mono leading-7 text-[#9ff6ef]">{t.templateUi.developer.roles[0]} |</p>
          <p className="mt-4 leading-7 text-white/58">{t.templateUi.developer.command}</p>
        </div>
        <div className="rounded-md border border-[#39e6dc]/22 bg-[#06101f] p-4">
          <div className="grid gap-2">
            {t.portfolio.projects.slice(0, compact ? 3 : 4).map((project, index) => (
              <div key={project.name} className="grid grid-cols-[34px_1fr] items-center gap-3 rounded-md border border-white/8 bg-white/[0.045] p-3">
                <span className="font-mono text-xs font-black text-[#39e6dc]">0{index + 1}</span>
                <div>
                  <div className="font-black">{project.name}</div>
                  <div className="mt-1 text-xs text-white/46">{project.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!compact ? (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {["AI & Data", "Frontend", "Systems"].map((group) => (
            <div key={group} className="rounded-md border border-white/10 bg-white/[0.055] p-4">
              <div className="font-black text-[#9ed0ff]">{group}</div>
              <p className="mt-2 leading-6 text-white/56">{t.common.proof}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CareerChroniclePreview({ t, compact }: { t: Copy; compact: boolean }) {
  return (
    <div className={cn("mx-auto w-full max-w-4xl text-[#172033]", compact ? "text-xs" : "text-sm")}>
      <div className="grid gap-5 md:grid-cols-[.78fr_1.22fr]">
        <div>
          <p className="font-black uppercase tracking-[0.22em] text-[#6c7cff]">{t.templateUi.chronicle.badge}</p>
          <h3 className={cn("mt-3 font-black tracking-tight", compact ? "text-3xl" : "text-5xl")}>{t.portfolio.name}</h3>
          <p className="mt-3 max-w-xl font-semibold leading-7 text-[#475569]">{t.templateUi.chronicle.title}</p>
        </div>
        <div className="relative space-y-3 border-l-2 border-[#6c7cff]/25 pl-5">
          {t.portfolio.timeline.slice(0, compact ? 3 : 4).map((item) => (
            <div key={item.chapter} className="relative rounded-md border border-[#dbe4f0] bg-white p-3">
              <span className="absolute -left-[30px] top-4 h-3 w-3 rounded-[5px] bg-[#6c7cff]" />
              <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6c7cff]">{item.date}</div>
              <div className="mt-1 font-black">{item.chapter}</div>
              <p className="mt-1 leading-6 text-[#64748b]">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
      {!compact ? (
        <div className="mt-6 grid gap-2 md:grid-cols-3">
          {t.portfolio.projects.slice(0, 3).map((project) => (
            <div key={project.name} className="rounded-md border border-[#dbe4f0] bg-white p-4">
              <div className="font-black">{project.name}</div>
              <p className="mt-2 leading-6 text-[#64748b]">{project.impact}</p>
            </div>
          ))}
        </div>
      ) : null}
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
  const [evidenceHandoff, setEvidenceHandoff] = useState<{
    ready: boolean;
    portfolioId: string;
    approvedCount: number | null;
  }>({ ready: false, portfolioId: "", approvedCount: null });

  useEffect(() => {
    let active = true;
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const initialTemplate = getInitialTemplate();
      if (initialTemplate !== "dark-tech") {
        setTemplateId(initialTemplate);
        setHistory([initialTemplate]);
        setHistoryIndex(0);
      }

      const portfolioId = params.get("portfolio");
      const onboardingReady = params.get("onboarding") === "ready";

      if (!portfolioId || !onboardingReady) {
        return;
      }

      setEvidenceHandoff({ ready: true, portfolioId, approvedCount: null });

      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        return;
      }

      void (async () => {
        const [{ data: portfolio }, { count }] = await Promise.all([
          supabase.from("portfolios").select("selected_template_id").eq("id", portfolioId).maybeSingle(),
          supabase
            .from("proposal_reviews")
            .select("id", { count: "exact", head: true })
            .eq("portfolio_id", portfolioId)
            .in("review_state", ["approved", "edited"]),
        ]);

        if (!active) {
          return;
        }

        if (templateIds.includes(portfolio?.selected_template_id as TemplateId)) {
          const nextTemplate = portfolio?.selected_template_id as TemplateId;
          setTemplateId(nextTemplate);
          setHistory([nextTemplate]);
          setHistoryIndex(0);
        }

        setEvidenceHandoff({ ready: true, portfolioId, approvedCount: count ?? 0 });
      })();
    });

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
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
      <main id="main-content" className="bg-[#05070d] pt-28">
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
                {evidenceHandoff.ready ? (
                  <div data-testid="editor-evidence-status" className="rounded-md border border-[#4E8CFF]/22 bg-[#4E8CFF]/10 px-3 py-2">
                    <div className="text-sm font-black text-[#BFDBFE]">{t.editor.evidenceReady}</div>
                    <div className="mt-1 text-xs font-bold leading-5 text-white/58">
                      {(evidenceHandoff.approvedCount ?? 0).toString()} {t.editor.approvedEvidence}
                    </div>
                    <div className="mt-1 break-all text-[10px] font-black uppercase tracking-[0.14em] text-white/38">
                      {t.editor.portfolioId}: {evidenceHandoff.portfolioId}
                    </div>
                  </div>
                ) : null}
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
                    <TemplatePreview templateId={templateId} compact={false} />
                  </div>
                </div>
                <div className="editor-preview-card rounded-lg border border-white/12 bg-white/[0.055] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-white/62">
                    <Smartphone size={16} />
                    {t.editor.mobilePreview}
                  </div>
                  <div className="mx-auto w-[250px] rounded-lg border border-white/16 bg-black p-2">
                    <div className={cn("min-h-[520px] rounded-lg p-4", templateMeta[templateId].className)}>
                      <TemplatePreview templateId={templateId} compact />
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
