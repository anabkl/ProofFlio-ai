"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { panelEnter, sectionReveal, springSelected } from "@/lib/motion";
import type { Copy } from "@/lib/content";

type Project = Copy["portfolio"]["projects"][number];

const sections = ["intro", "gallery", "process", "contact"] as const;

/** Cycled placeholder "image" gradients so cards read as varied, not identical. */
const cardGradients = [
  "linear-gradient(135deg, #ff8a65, #ffcaa8 55%, #fff3e6)",
  "linear-gradient(135deg, #6f7bff, #b6a9ff 55%, #eef0ff)",
  "linear-gradient(135deg, #22b57d, #a7f0cf 55%, #ecfdf5)",
  "linear-gradient(135deg, #f6ae2d, #ffe29a 55%, #fffaf0)",
  "linear-gradient(135deg, #ef6c9d, #f7b8d0 55%, #fff0f6)",
];

/** Masonry-like span pattern so the grid isn't a uniform card wall. */
function cardSpan(index: number) {
  const beat = index % 4;
  if (beat === 0) return "md:col-span-4 md:row-span-2";
  if (beat === 3) return "md:col-span-4 md:row-span-1";
  return "md:col-span-2 md:row-span-1";
}

function cardMediaHeight(index: number) {
  return index % 4 === 0 ? "h-56" : "h-32";
}

export function CreativeGridTemplate() {
  const { t } = useLocale();
  const [filterIndex, setFilterIndex] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Categories stay stable, English-coded values on project data even across locales,
  // while filter chip labels are translated — so filtering matches by data order,
  // not by comparing a translated label against the untranslated category.
  const categories = useMemo(
    () => Array.from(new Set(t.portfolio.projects.map((project) => project.category))),
    [t.portfolio.projects],
  );
  const activeFilter = t.portfolio.filters[filterIndex] ?? t.portfolio.filters[0];
  const projects =
    filterIndex === 0
      ? t.portfolio.projects
      : t.portfolio.projects.filter((project) => project.category === categories[filterIndex - 1]);

  useEffect(() => {
    if (!selected) return;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  return (
    <TemplateShell templateId="creative-grid" sections={sections} tone="light">
      <section id="intro" className="pf-container creative-hero-stage py-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b4533f]">{t.templates["creative-grid"].name}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-[#151926] sm:text-7xl">{t.portfolio.name}</h1>
        <p className="mt-5 max-w-3xl text-xl leading-8 text-[#5b6472]">{t.portfolio.headline}</p>
      </section>

      <section id="gallery" className="pf-container creative-gallery-stage py-10">
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={t.portfolio.filters[0]}>
          {t.portfolio.filters.map((item, index) => (
            <button
              key={item}
              type="button"
              aria-pressed={filterIndex === index}
              onClick={() => setFilterIndex(index)}
              className={cn(
                "pf-focus rounded-xl border px-4 py-2 text-sm font-black transition",
                filterIndex === index ? "border-[#ff7a66] bg-[#ff7a66] text-white" : "border-[#dbe4f0] bg-white text-[#151926] hover:border-[#ff7a66]/60",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="flex snap-x gap-4 overflow-x-auto pb-5 md:grid md:auto-rows-[150px] md:grid-cols-6 md:overflow-visible"
        >
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
                transition={springSelected}
                onClick={() => setSelected(project)}
                className={cn(
                  "pf-focus group flex min-w-[280px] snap-start flex-col rounded-3xl border border-[#e6d7d0] bg-white p-0 text-left shadow-[0_20px_60px_rgba(151,92,75,.10)] transition hover:-translate-y-1 md:min-w-0",
                  cardSpan(index),
                )}
              >
                <div
                  className={cn("media-sheen rounded-t-3xl", cardMediaHeight(index))}
                  style={{ background: cardGradients[index % cardGradients.length] }}
                />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a66]">{project.category}</p>
                  <h3 className="mt-2 text-2xl font-black text-[#151926]">{project.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#64748b]">{project.signal}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-black uppercase tracking-[0.14em] text-[#b4533f] opacity-0 transition group-hover:opacity-100">
                    {t.common.viewProof}
                    <ArrowUpRight size={13} />
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {projects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#e6d7d0] bg-white/60 p-8 text-center text-sm font-bold text-[#64748b]">
            {activeFilter}
          </p>
        ) : null}
      </section>

      <section id="process" className="pf-container grid gap-4 py-16 md:grid-cols-4">
        {t.templateUi.creative.processSteps.map((step, index) => (
          <motion.div key={step} {...sectionReveal} custom={index} className="rounded-3xl border border-[#e6d7d0] bg-white p-5 text-[#151926]">
            <div className="text-3xl font-black text-[#ff7a66]">0{index + 1}</div>
            <h3 className="mt-4 text-xl font-black">{step}</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">{t.portfolio.timeline[index]?.learned}</p>
          </motion.div>
        ))}
      </section>

      <section id="contact" className="pf-container pb-20">
        <motion.div {...sectionReveal} className="rounded-3xl border border-[#e6d7d0] bg-[#151926] p-8 text-white">
          <h2 className="text-3xl font-black">{t.portfolio.availability}</h2>
          <p className="mt-3 text-white/62">{t.portfolio.email}</p>
        </motion.div>
      </section>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-[#151926]/72 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              variants={panelEnter}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(event) => event.stopPropagation()}
              className="pf-focus max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 text-[#151926] shadow-[0_35px_120px_rgba(0,0,0,.28)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="creative-project-title"
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
              <h2 id="creative-project-title" className="mt-3 text-3xl font-black">
                {selected.name}
              </h2>
              <p className="mt-4 leading-7 text-[#475569]">{selected.detail}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">{t.common.viewProof}</p>
                  <p className="mt-1 font-bold">{selected.proof}</p>
                </div>
                <div className="rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">Impact</p>
                  <p className="mt-1 font-bold">{selected.impact}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TemplateShell>
  );
}
