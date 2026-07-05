"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { templateMeta, type TemplateId } from "@/lib/content";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useActiveSection(sectionIds: readonly string[]) {
  const [active, setActive] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const observers = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))
      .map((element) => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActive(entry.target.id);
            }
          },
          { rootMargin: "-34% 0px -54% 0px", threshold: 0.01 },
        );

        observer.observe(element);
        return observer;
      });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [sectionIds]);

  return active;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}

export function TemplateShell({
  templateId,
  sections,
  tone = "dark",
  children,
}: {
  templateId: TemplateId;
  sections: readonly string[];
  tone?: "dark" | "light";
  children: React.ReactNode;
}) {
  const { t } = useLocale();
  const active = useActiveSection(sections);
  const progress = useScrollProgress();
  const navLabels = t.templateUi.nav as Record<string, string>;

  return (
    <main className={cn("template-route min-h-screen pt-20", templateMeta[templateId].className)} data-template={templateId}>
      <div className="fixed inset-x-0 top-16 z-40 h-1 bg-black/10" aria-hidden="true">
        <div
          className={cn("h-full transition-[width] duration-150", tone === "light" ? "bg-[#172033]" : "bg-[#4da3ff]")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="pf-container sticky top-20 z-30 pt-4">
        <div
          className={cn(
            "template-nav flex items-center gap-2 overflow-x-auto rounded-2xl border p-2 backdrop-blur",
            tone === "light"
              ? "border-[#172033]/12 bg-white/86 text-[#172033] shadow-[0_18px_60px_rgba(15,23,42,.08)]"
              : "border-white/12 bg-[#05070d]/78 text-white shadow-[0_18px_70px_rgba(0,0,0,.28)]",
          )}
          data-testid="template-nav"
        >
          <Link
            href="/templates"
            className="pf-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-current/12"
            aria-label={t.nav.templates}
            title={t.nav.templates}
          >
            <ArrowLeft size={16} />
          </Link>
          {sections.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "pf-focus shrink-0 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition",
                active === id
                  ? tone === "light"
                    ? "bg-[#172033] text-white"
                    : "bg-[#f7fbff] text-[#071021]"
                  : "opacity-60 hover:opacity-100",
              )}
              aria-current={active === id ? "true" : undefined}
            >
              {navLabels[id] ?? id}
            </a>
          ))}
          <Link
            href={`/editor?template=${templateId}`}
            className="pf-focus ml-auto inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#f7fbff] px-3 py-2 text-xs font-black text-[#071021]"
          >
            <Sparkles size={15} />
            {t.common.useTemplate}
          </Link>
        </div>
      </div>

      {children}
    </main>
  );
}
