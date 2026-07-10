"use client";

import Link from "next/link";
import { AuthNavStatus } from "@/components/auth/auth-nav-status";
import { useLocale } from "@/components/locale-provider";
import { localeMeta, locales } from "@/lib/content";

export function WorkspaceHeader({ contextLabel }: { contextLabel: string }) {
  const { locale, localeReady, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070d]/86 backdrop-blur-xl">
      <div className="pf-container flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/" className="pf-focus flex min-w-0 items-center gap-3" aria-label="ProofFolio AI">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#4da3ff]/45 bg-[#08142a] text-sm font-black text-[#9ed0ff]">
            PF
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black tracking-[0.18em]">ProofFolio AI</span>
            <span className="hidden truncate text-[11px] uppercase tracking-[0.24em] text-white/45 sm:block">
              {contextLabel}
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
  );
}
