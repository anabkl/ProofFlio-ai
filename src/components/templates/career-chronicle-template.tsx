"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Award, BookOpen, BriefcaseBusiness, Compass, GraduationCap, Layers3, X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { fadeUp, panelEnter, sectionReveal } from "@/lib/motion";
import type { Copy } from "@/lib/content";

const sections = ["portrait", "chronology", "projects", "toolkit", "contact"] as const;

function useChronicleScroll(count: number) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    articleRefs.current = Array.from({ length: count }, (_, index) => articleRefs.current[index] ?? null);
  }, [count]);

  // Active-chapter tracking mirrors TemplateShell's useActiveSection: an
  // IntersectionObserver per chapter rather than a scroll-position poll.
  useEffect(() => {
    const elements = articleRefs.current;
    const observers = elements.map((element, index) => {
      if (!element) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(index);
        },
        { rootMargin: "-34% 0px -54% 0px", threshold: 0.01 },
      );
      observer.observe(element);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [count]);

  useEffect(() => {
    const update = () => {
      if (!timelineRef.current) return;
      const viewportCenter = window.innerHeight / 2;
      const rect = timelineRef.current.getBoundingClientRect();
      const visibleFromTop = Math.max(0, viewportCenter - rect.top);
      setProgress(Math.min(1, visibleFromTop / Math.max(rect.height, 1)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const setArticleRef = (index: number) => (node: HTMLElement | null) => {
    articleRefs.current[index] = node;
  };

  return { active, progress, timelineRef, setArticleRef };
}

function ToolkitProgress({ skill, value }: { skill: string; value: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.45 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="chronicle-skill relative overflow-hidden rounded-2xl border border-[#cdd8ea] bg-white p-4">
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="font-black text-[#172033]">{skill}</div>
        <span className="rounded-xl bg-[#172033] px-3 py-1 text-xs font-black text-white">{value}%</span>
      </div>
      <div className="relative z-10 mt-3 h-2 rounded-md bg-[#e5ebf4]">
        <div className="h-2 rounded-md bg-[#6c7cff] transition-[width] duration-1000" style={{ width: visible ? `${value}%` : "0%" }} />
      </div>
    </div>
  );
}

type Project = Copy["portfolio"]["projects"][number];
type Timeline = Copy["portfolio"]["timeline"];

function YearRail({ timeline, active }: { timeline: Timeline; active: number }) {
  return (
    <nav aria-label="Jump to a chapter year" className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-[#cdd8ea] bg-white p-2 lg:hidden">
      {timeline.map((item, index) => (
        <a
          key={item.chapter}
          href={`#chronicle-${index}`}
          className={cn(
            "pf-focus shrink-0 rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] transition",
            active === index ? "bg-[#172033] text-white" : "bg-[#f4f7fb] text-[#64748b]",
          )}
          aria-current={active === index ? "true" : undefined}
        >
          {item.date}
        </a>
      ))}
    </nav>
  );
}

export function CareerChronicleTemplate() {
  const { t } = useLocale();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { active, progress, timelineRef, setArticleRef } = useChronicleScroll(t.portfolio.timeline.length);
  const chapterIcons = [GraduationCap, BriefcaseBusiness, BookOpen, Compass] as const;
  const lastChapterIndex = t.portfolio.timeline.length - 1;

  return (
    <TemplateShell templateId="career-chronicle" sections={sections} tone="light">
      <section id="portrait" className="pf-container chronicle-portrait grid gap-10 pb-16 pt-20 lg:grid-cols-[.88fr_1.12fr] lg:items-end">
        <div>
          <p className="inline-flex rounded-2xl border border-[#6c7cff]/20 bg-[#6c7cff]/8 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#4c56c9]">
            {t.templateUi.chronicle.badge}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-tight text-[#172033] sm:text-7xl">{t.portfolio.name}</h1>
          <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-[#475569]">{t.templateUi.chronicle.title}</p>
        </div>
        <aside className="chronicle-intro-panel rounded-[28px] border border-[#cdd8ea] bg-white p-6 shadow-[0_30px_110px_rgba(42,54,88,.10)]">
          <div className="grid grid-cols-2 gap-3">
            {t.portfolio.metrics.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#dbe4f0] bg-[#f7f9fc] p-4">
                <div className="text-3xl font-black text-[#172033]">{value}</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#475569]">{t.portfolio.summary}</p>
        </aside>
      </section>

      <section id="chronology" className="border-y border-[#dbe4f0] bg-white/72 py-16">
        <div className="pf-container mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6c7cff]">{t.templateUi.nav.chronology}</p>
          <h2 className="mt-3 text-4xl font-black text-[#172033]">Four chapters, one direction.</h2>
          <p className="mt-3 leading-7 text-[#64748b]">{t.templateUi.chronicle.title}</p>
        </div>

        <div className="pf-container grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-36 rounded-[28px] border border-[#cdd8ea] bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6c7cff]">{t.templateUi.chronicle.chapterProgress}</p>
              <h2 className="mt-3 text-2xl font-black text-[#172033]">{t.portfolio.timeline[active]?.chapter}</h2>
              <div className="mt-5 h-2 rounded-md bg-[#e5ebf4]">
                <div className="h-2 rounded-md bg-[#6c7cff] transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="mt-6 space-y-2">
                {t.portfolio.timeline.map((item, index) => (
                  <a
                    key={item.chapter}
                    href={`#chronicle-${index}`}
                    className={cn(
                      "pf-focus block rounded-2xl border px-3 py-3 text-sm font-bold transition",
                      active === index ? "border-[#6c7cff]/50 bg-[#6c7cff]/10 text-[#172033]" : "border-[#dbe4f0] bg-[#f8fafc] text-[#64748b]",
                    )}
                    aria-current={active === index ? "true" : undefined}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {item.date} · {item.chapter}
                      {index === lastChapterIndex ? <Compass size={14} className="shrink-0 text-[#6c7cff]" aria-hidden="true" /> : null}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <YearRail timeline={t.portfolio.timeline} active={active} />

            <div ref={timelineRef} className="relative space-y-8 before:absolute before:left-4 before:top-0 before:h-full before:w-1 before:bg-[#e5ebf4] sm:before:left-1/2">
              <div className="absolute left-4 top-0 w-1 rounded-md bg-[#6c7cff] sm:left-1/2" style={{ height: `${progress * 100}%` }} aria-hidden="true" />
              {t.portfolio.timeline.map((item, index) => {
                const Icon = chapterIcons[index] ?? BookOpen;
                const isLeft = index % 2 === 0;
                const isCurrent = index === lastChapterIndex;
                const linkedProject: Project | undefined = t.portfolio.projects[index];
                const linkedCertificate = t.portfolio.certificates[index];

                return (
                  <article
                    key={item.title}
                    id={`chronicle-${index}`}
                    ref={setArticleRef(index)}
                    className={cn("relative sm:flex", isLeft ? "sm:justify-start" : "sm:justify-end")}
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-7 z-10 grid h-9 w-9 place-items-center rounded-2xl border bg-white transition-colors sm:left-1/2 sm:-translate-x-1/2",
                        active === index ? "border-[#6c7cff] text-[#4c56c9]" : "border-[#6c7cff]/35 text-[#6c7cff]",
                      )}
                    >
                      <Icon size={17} />
                    </div>
                    <motion.div
                      variants={fadeUp}
                      initial={sectionReveal.initial}
                      whileInView={sectionReveal.whileInView}
                      viewport={sectionReveal.viewport}
                      className={cn(
                        "ml-14 rounded-[28px] border p-6 shadow-[0_22px_80px_rgba(42,54,88,.08)] sm:ml-0 sm:w-[45%]",
                        isCurrent ? "border-transparent bg-gradient-to-br from-[#172033] via-[#1d2946] to-[#2c3a63] text-white" : "border-[#cdd8ea] bg-white",
                      )}
                    >
                      {isCurrent ? (
                        <p className="mb-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#9fb2ff]">
                          <Compass size={13} /> Current direction
                        </p>
                      ) : null}
                      <p className={cn("text-xs font-black uppercase tracking-[0.18em]", isCurrent ? "text-[#9fb2ff]" : "text-[#6c7cff]")}>
                        {item.date} · {item.chapter}
                      </p>
                      <h3 className={cn("mt-3 text-2xl font-black", isCurrent ? "text-white" : "text-[#172033]")}>{item.title}</h3>
                      <p className={cn("mt-3 leading-7", isCurrent ? "text-white/70" : "text-[#64748b]")}>{item.detail}</p>

                      <div
                        className={cn(
                          "mt-4 rounded-2xl border p-4",
                          isCurrent ? "border-white/15 bg-white/10" : "border-[#6c7cff]/18 bg-[#6c7cff]/8",
                        )}
                      >
                        <p
                          className={cn(
                            "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em]",
                            isCurrent ? "text-[#9fb2ff]" : "text-[#4c56c9]",
                          )}
                        >
                          <Award size={13} /> Milestone
                        </p>
                        <p className={cn("mt-2 text-sm font-bold leading-6", isCurrent ? "text-white/80" : "text-[#475569]")}>{item.learned}</p>
                      </div>

                      {linkedCertificate ? (
                        <p className={cn("mt-3 text-xs font-bold", isCurrent ? "text-white/60" : "text-[#64748b]")}>
                          Certificate earned this chapter: <span className={isCurrent ? "text-white" : "text-[#172033]"}>{linkedCertificate}</span>
                        </p>
                      ) : null}

                      {linkedProject ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProject(linkedProject)}
                          className={cn(
                            "pf-focus mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                            isCurrent
                              ? "border-white/15 bg-white/5 hover:bg-white/10"
                              : "border-[#dbe4f0] bg-[#f7f9fc] hover:border-[#6c7cff]/40",
                          )}
                        >
                          <span>
                            <span className={cn("block text-[10px] font-black uppercase tracking-[0.14em]", isCurrent ? "text-white/50" : "text-[#64748b]")}>
                              Project from this chapter
                            </span>
                            <span className={cn("mt-1 block text-sm font-black", isCurrent ? "text-white" : "text-[#172033]")}>{linkedProject.name}</span>
                          </span>
                          <ArrowUpRight size={16} className={isCurrent ? "text-[#9fb2ff]" : "text-[#6c7cff]"} aria-hidden="true" />
                        </button>
                      ) : null}
                    </motion.div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-[28px] border border-[#cdd8ea] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6c7cff]">Certificates</p>
                  <h3 className="mt-2 text-xl font-black text-[#172033]">Proof accumulated chapter by chapter</h3>
                </div>
                <span className="rounded-xl bg-[#f4f7fb] px-3 py-1 text-xs font-black text-[#64748b]">{t.portfolio.certificates.length} attached</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {t.portfolio.certificates.map((certificate, index) => (
                  <div key={certificate} className="rounded-2xl border border-[#dbe4f0] bg-[#f7f9fc] p-4">
                    <div className="flex items-center gap-2 text-[#6c7cff]">
                      <Award size={15} />
                      <span className="text-xs font-black uppercase tracking-[0.14em] text-[#64748b]">{t.portfolio.timeline[index]?.date ?? ""}</span>
                    </div>
                    <p className="mt-2 text-sm font-black leading-5 text-[#172033]">{certificate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="pf-container py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6c7cff]">{t.templateUi.chronicle.projectDrawer}</p>
          <h2 className="mt-3 text-4xl font-black text-[#172033]">{t.nav.templates}</h2>
        </div>
        <div className="space-y-5">
          {t.portfolio.projects.map((project, index) => (
            <motion.button
              key={project.name}
              type="button"
              onClick={() => setSelectedProject(project)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="pf-focus chronicle-project-card group relative w-full overflow-hidden rounded-[28px] border border-[#cdd8ea] bg-white p-5 text-left"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_1fr_180px] lg:items-center">
                <div className="min-h-36 rounded-2xl border border-[#dbe4f0] bg-[#f4f7fb] p-4">
                  <span className="font-mono text-xs font-black text-[#6c7cff]">0{index + 1}</span>
                  <div className="mt-12 text-sm font-black uppercase tracking-[0.16em] text-[#64748b]">{project.category}</div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#172033]">{project.name}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748b]">{project.detail}</p>
                </div>
                <div className="rounded-2xl border border-[#0f766e]/18 bg-[#0f766e]/8 p-4 text-sm font-black leading-6 text-[#0f766e]">
                  {project.impact}
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#6c7cff]">
                {t.templateUi.chronicle.openProject}
                <Layers3 size={16} />
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section id="toolkit" className="border-y border-[#dbe4f0] bg-[#f7f9fc] py-16">
        <div className="pf-container grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <h2 className="text-4xl font-black text-[#172033]">{t.templateUi.chronicle.toolkit}</h2>
            <p className="mt-4 leading-7 text-[#64748b]">{t.career.recommendation}</p>
          </div>
          <div className="space-y-3">
            {t.portfolio.skills.map(([skill, value]) => (
              <ToolkitProgress key={skill} skill={skill} value={value} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="pf-container py-16">
        <div className="rounded-[28px] border border-[#cdd8ea] bg-[#172033] p-8 text-white">
          <h2 className="text-3xl font-black">{t.portfolio.availability}</h2>
          <p className="mt-3 text-white/62">{t.portfolio.email}</p>
        </div>
      </section>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-end bg-[#172033]/68 p-3 backdrop-blur sm:place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={panelEnter}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-6 text-[#172033] shadow-[0_35px_140px_rgba(0,0,0,.32)]"
              role="dialog"
              aria-modal="true"
            >
              <button type="button" onClick={() => setSelectedProject(null)} className="pf-focus ml-auto grid h-10 w-10 place-items-center rounded-2xl border border-[#dbe4f0]" aria-label={t.templateUi.chronicle.closeProject} title={t.templateUi.chronicle.closeProject}>
                <X size={18} />
              </button>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6c7cff]">{selectedProject.category}</p>
              <h2 className="mt-3 text-4xl font-black">{selectedProject.name}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  [t.templateUi.chronicle.summary, selectedProject.detail],
                  [t.templateUi.chronicle.purpose, selectedProject.impact],
                  [t.templateUi.chronicle.evidence, selectedProject.proof],
                ].map(([label, body]) => (
                  <div key={label} className="rounded-2xl border border-[#dbe4f0] bg-[#f7f9fc] p-4">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6c7cff]">{label}</div>
                    <p className="mt-3 text-sm font-bold leading-6 text-[#475569]">{body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {t.portfolio.skills.slice(0, 5).map(([skill]) => (
                  <span key={skill} className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-xs font-black text-[#475569]">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TemplateShell>
  );
}
