"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import type { Copy } from "@/lib/content";

type Project = Copy["portfolio"]["projects"][number];

const sections = ["intro", "gallery", "process", "contact"] as const;

export function CreativeGridTemplate() {
  const { t } = useLocale();
  const [filterIndex, setFilterIndex] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const activeFilter = t.portfolio.filters[filterIndex] ?? t.portfolio.filters[0];
  const projects = filterIndex === 0 ? t.portfolio.projects : t.portfolio.projects.filter((project) => project.category === activeFilter);

  return (
    <TemplateShell templateId="creative-grid" sections={sections} tone="light">
      <section id="intro" className="pf-container creative-hero-stage py-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b4533f]">{t.templates["creative-grid"].name}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-[#151926] sm:text-7xl">{t.portfolio.name}</h1>
        <p className="mt-5 max-w-3xl text-xl leading-8 text-[#5b6472]">{t.portfolio.headline}</p>
      </section>

      <section id="gallery" className="pf-container creative-gallery-stage py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          {t.portfolio.filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilterIndex(t.portfolio.filters.indexOf(item))}
              className={cn(
                "pf-focus rounded-xl border px-4 py-2 text-sm font-black transition",
                activeFilter === item ? "border-[#ff7a66] bg-[#ff7a66] text-white" : "border-[#dbe4f0] bg-white text-[#151926]",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <motion.div layout className="flex snap-x gap-4 overflow-x-auto pb-5 md:grid md:auto-rows-[minmax(190px,auto)] md:grid-cols-6 md:overflow-visible">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.button
                layout
                key={project.name}
                type="button"
                data-testid={`creative-project-${index}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => setSelected(project)}
                className={cn(
                  "pf-focus group min-w-[300px] snap-start rounded-3xl border border-[#e6d7d0] bg-white p-0 text-left shadow-[0_20px_60px_rgba(151,92,75,.10)] transition hover:-translate-y-1 md:min-w-0",
                  index === 0 ? "md:col-span-3 md:row-span-2" : "md:col-span-3 xl:col-span-2",
                )}
              >
                <div className="media-sheen h-40 rounded-t-3xl" />
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a66]">{project.category}</p>
                  <h3 className="mt-2 text-2xl font-black text-[#151926]">{project.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#64748b]">{project.detail}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <section id="process" className="pf-container grid gap-4 py-16 md:grid-cols-4">
        {t.templateUi.creative.processSteps.map((step, index) => (
          <div key={step} className="rounded-3xl border border-[#e6d7d0] bg-white p-5 text-[#151926]">
            <div className="text-3xl font-black text-[#ff7a66]">0{index + 1}</div>
            <h3 className="mt-4 text-xl font-black">{step}</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">{t.portfolio.timeline[index]?.learned}</p>
          </div>
        ))}
      </section>

      <section id="contact" className="pf-container pb-20">
        <div className="rounded-3xl border border-[#e6d7d0] bg-[#151926] p-8 text-white">
          <h2 className="text-3xl font-black">{t.portfolio.availability}</h2>
          <p className="mt-3 text-white/62">{t.portfolio.email}</p>
        </div>
      </section>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#151926]/72 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 18, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.96 }}
              className="max-w-2xl rounded-3xl bg-white p-6 text-[#151926] shadow-[0_35px_120px_rgba(0,0,0,.28)]"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="pf-focus ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-[#dbe4f0]"
                aria-label={t.common.close}
                title={t.common.close}
              >
                <X size={17} />
              </button>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a66]">{selected.category}</p>
              <h2 className="mt-3 text-3xl font-black">{selected.name}</h2>
              <p className="mt-4 leading-7 text-[#475569]">{selected.detail}</p>
              <div className="mt-5 rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4 font-bold">{selected.proof}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TemplateShell>
  );
}
