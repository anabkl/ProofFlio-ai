"use client";

import Link from "next/link";
import { BadgeCheck, Eye, Mail, Target } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";

const sections = ["intro", "projects", "skills", "evidence", "contact"] as const;

export function MinimalExecutiveTemplate() {
  const { t } = useLocale();

  return (
    <TemplateShell templateId="minimal-executive" sections={sections} tone="light">
      <section id="intro" className="pf-container grid gap-10 py-16 lg:grid-cols-[.92fr_1.08fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#315dff]">{t.templates["minimal-executive"].name}</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-tight text-[#172033] sm:text-7xl">
            {t.portfolio.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-[#475569]">{t.portfolio.headline}</p>
        </div>
        <aside className="executive-card rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)]">
          <div className="flex items-center gap-3 text-sm font-black text-[#315dff]">
            <Target size={18} />
            {t.portfolio.targetRole}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#475569]">{t.portfolio.availability}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="pf-focus inline-flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-black text-white">
              <Eye size={16} />
              {t.common.demo}
            </Link>
            <Link href="/editor" className="pf-focus inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbe4f0] px-4 py-3 text-sm font-black text-[#172033]">
              <Mail size={16} />
              {t.common.contact}
            </Link>
          </div>
        </aside>
      </section>

      <section className="pf-container pb-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {t.portfolio.metrics.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-[#dbe4f0] bg-white p-5 text-[#172033]">
              <div className="text-4xl font-black">{value}</div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="pf-container executive-workbench py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#315dff]">{t.common.proof}</p>
            <h2 className="mt-3 text-3xl font-black text-[#172033]">{t.templateUi.minimal.selectedWork}</h2>
          </div>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {t.portfolio.projects.map((project, index) => (
            <article key={project.name} className="min-w-[286px] snap-start rounded-2xl border border-[#dbe4f0] bg-white p-5 text-[#172033] shadow-[0_18px_50px_rgba(15,23,42,.08)]">
              <div className="font-mono text-xs font-black text-[#315dff]">0{index + 1}</div>
              <h3 className="mt-4 text-xl font-black">{project.name}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">{project.signal}</p>
              <div className="mt-5 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] p-3 text-sm font-black text-[#172033]">{project.impact}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="skills" className="pf-container grid gap-8 py-16 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-black text-[#172033]">{t.templateUi.minimal.skillSignal}</h2>
          <p className="mt-4 text-base leading-7 text-[#64748b]">{t.portfolio.summary}</p>
        </div>
        <div className="space-y-5">
          {t.portfolio.skills.map(([skill, value]) => (
            <div key={skill}>
              <div className="mb-2 flex items-center justify-between text-sm font-black text-[#172033]">
                <span>{skill}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2 rounded-md bg-[#e2e8f0]">
                <div className={cn("h-2 rounded-md bg-[#315dff]")} style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="evidence" className="border-y border-[#dbe4f0] bg-white/62 py-16">
        <div className="pf-container grid gap-3 md:grid-cols-4">
          {t.portfolio.certificates.map((certificate) => (
            <div key={certificate} className="rounded-2xl border border-[#dbe4f0] bg-white p-4 text-sm font-black text-[#172033]">
              <BadgeCheck size={18} className="mb-3 text-[#315dff]" />
              {certificate}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="pf-container py-16">
        <div className="rounded-2xl border border-[#dbe4f0] bg-[#172033] p-8 text-white">
          <p className="text-sm font-bold text-white/62">{t.portfolio.location}</p>
          <h2 className="mt-3 text-3xl font-black">{t.portfolio.availability}</h2>
          <p className="mt-4 text-white/66">{t.portfolio.email}</p>
        </div>
      </section>
    </TemplateShell>
  );
}
