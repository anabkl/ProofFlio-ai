"use client";

import { useState } from "react";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";

const sections = ["intro", "featured", "projects", "services", "process", "about", "contact"] as const;

type IndexMode = "visual" | "text" | "chronological";

export function MonographTemplate() {
  const { t } = useLocale();
  const m = t.monograph;
  const [indexMode, setIndexMode] = useState<IndexMode>("visual");

  return (
    <TemplateShell templateId="monograph" sections={sections} tone="light">
      <section id="intro" className="pf-container pb-16 pt-24">
        <div className="flex items-baseline justify-between gap-4 border-b border-[#1c1a17]/12 pb-6">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#9a4b36]">01 — {t.templates.monograph.name}</span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1c1a17]/50">{m.availability}</span>
        </div>
        <h1 className="mt-8 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-[#1c1a17] sm:text-7xl">
          {m.name}
        </h1>
        <p className="mt-4 text-2xl font-bold text-[#9a4b36]">{m.role}</p>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#1c1a17]/72">{m.headline}</p>
        <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-[#1c1a17]/70">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1c1a17]/12 bg-white px-3.5 py-2">
            <MapPin size={15} />
            {m.location}
          </span>
        </div>
      </section>

      <section id="featured" className="border-y border-[#1c1a17]/10 bg-white/60 py-16">
        <div className="pf-container grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[#e7d9c5] via-[#efe4d4] to-[#dbcab0]" aria-hidden="true" />
          <div>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[#9a4b36]">
              {t.templateUi.nav.featured} · {m.featured.year}
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#1c1a17] sm:text-5xl">{m.featured.name}</h2>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-[#1c1a17]/50">{m.featured.client}</p>
            <p className="mt-4 text-lg leading-8 text-[#1c1a17]/72">{m.featured.tag}</p>
            <p className="mt-4 text-base leading-7 text-[#1c1a17]/64">{m.featured.summary}</p>
            <div className="mt-6 rounded-2xl border border-[#9a4b36]/20 bg-[#9a4b36]/6 p-4">
              <p className="text-sm font-bold leading-6 text-[#7a3a29]">{m.featured.outcome}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="pf-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-[#1c1a17]">{t.templateUi.nav.projects}</h2>
          <div role="radiogroup" aria-label="Index" className="inline-flex rounded-full border border-[#1c1a17]/12 bg-white p-1">
            {(["visual", "text", "chronological"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={indexMode === value}
                onClick={() => setIndexMode(value)}
                className={cn(
                  "pf-focus rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.1em] transition",
                  indexMode === value ? "bg-[#1c1a17] text-white" : "text-[#1c1a17]/55 hover:text-[#1c1a17]",
                )}
              >
                {m.indexModes[value]}
              </button>
            ))}
          </div>
        </div>

        {indexMode === "text" ? (
          <div className="mt-8 divide-y divide-[#1c1a17]/10 border-y border-[#1c1a17]/10">
            {m.projects.map((project, index) => (
              <div key={project.name} className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-[#1c1a17]/40">0{index + 2}</span>
                  <span className="font-serif text-xl text-[#1c1a17]">{project.name}</span>
                  <span className="text-sm text-[#1c1a17]/55">{project.tag}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a4b36]">{project.category}</span>
              </div>
            ))}
          </div>
        ) : indexMode === "chronological" ? (
          <div className="mt-8 space-y-6 border-l border-[#1c1a17]/12 pl-6">
            {[{ name: m.featured.name, year: m.featured.year, category: m.featured.tag }, ...m.projects].map((project) => (
              <div key={project.name} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#9a4b36]" />
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#9a4b36]">{project.year}</p>
                <p className="mt-1 font-serif text-2xl text-[#1c1a17]">{project.name}</p>
                <p className="mt-1 text-sm text-[#1c1a17]/60">{project.category}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {m.projects.map((project) => (
              <div key={project.name} className="group">
                <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#efe4d4] to-[#dbcab0] transition group-hover:opacity-85" aria-hidden="true" />
                <p className="mt-3 flex items-center gap-1.5 font-serif text-xl text-[#1c1a17]">
                  {project.name}
                  <ArrowUpRight size={15} className="text-[#9a4b36]" />
                </p>
                <p className="mt-1 text-sm text-[#1c1a17]/58">{project.tag} · {project.year}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="services" className="border-y border-[#1c1a17]/10 bg-[#1c1a17] py-16 text-[#f7f2ea]">
        <div className="pf-container">
          <h2 className="font-serif text-3xl">{t.templateUi.nav.services}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {m.services.map((service, index) => (
              <div key={service.name} className="rounded-2xl border border-white/12 bg-white/[0.04] p-5">
                <span className="font-mono text-xs text-white/40">0{index + 1}</span>
                <p className="mt-2 font-serif text-xl">{service.name}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{service.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="pf-container py-16">
        <h2 className="font-serif text-3xl text-[#1c1a17]">Process</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {m.process.map((item, index) => (
            <div key={item.step} className="rounded-2xl border border-[#1c1a17]/12 bg-white p-5">
              <span className="font-mono text-xs text-[#1c1a17]/40">0{index + 1}</span>
              <p className="mt-2 font-serif text-xl text-[#1c1a17]">{item.step}</p>
              <p className="mt-2 text-sm leading-6 text-[#1c1a17]/62">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="border-y border-[#1c1a17]/10 bg-white/60 py-16">
        <div className="pf-container grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-serif text-3xl text-[#1c1a17]">{t.templateUi.nav.about}</h2>
            <p className="mt-4 text-lg leading-8 text-[#1c1a17]/72">{m.aboutPreview}</p>
          </div>
          <blockquote className="rounded-2xl border border-[#9a4b36]/20 bg-[#9a4b36]/6 p-6">
            <p className="font-serif text-xl leading-relaxed text-[#1c1a17]">“{m.testimonial.quote}”</p>
            <footer className="mt-4 text-sm font-bold text-[#1c1a17]/65">
              {m.testimonial.name} · {m.testimonial.role}
            </footer>
          </blockquote>
        </div>
      </section>

      <section id="contact" className="pf-container py-16">
        <div className="rounded-3xl border border-[#1c1a17]/12 bg-white p-8 text-center sm:p-12">
          <p className="font-serif text-2xl text-[#1c1a17]">{m.availability}</p>
          <a
            href={`mailto:${m.email}`}
            className="pf-focus mt-6 inline-flex items-center gap-2 rounded-full bg-[#1c1a17] px-5 py-3 text-sm font-black text-white transition hover:opacity-85"
          >
            <Mail size={16} />
            {m.contact}
          </a>
        </div>
      </section>
    </TemplateShell>
  );
}
