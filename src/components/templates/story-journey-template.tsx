"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, BookOpen, ChevronRight, FolderGit, GraduationCap, Lightbulb } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { fadeUp, panelEnter } from "@/lib/motion";

const sections = ["intro", "timeline", "growth", "contact"] as const;

/** Purpose-built labels for each of the four fixed timeline chapters. */
const milestoneTypes = [
  { label: "Skill foundation", icon: GraduationCap },
  { label: "Shipped project", icon: FolderGit },
  { label: "Certification", icon: Award },
  { label: "Career focus", icon: BookOpen },
];

/**
 * Tracks which timeline chapter is active via IntersectionObserver (same pattern
 * as template-shell's useActiveSection) and a lightweight scroll-based fill
 * percentage for the sticky rail progress bar.
 */
function useChapterRail(count: number) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const elements = pointRefs.current.filter((element): element is HTMLElement => Boolean(element));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = pointRefs.current.indexOf(entry.target as HTMLElement);
          if (index !== -1) setActive(index);
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    const updateProgress = () => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const visible = Math.max(0, viewportCenter - rect.top);
      setProgress(rect.height > 0 ? Math.min(1, Math.max(0, visible / rect.height)) : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return { active, progress, rootRef, pointRefs };
}

export function StoryJourneyTemplate() {
  const { t } = useLocale();
  const [open, setOpen] = useState<number | null>(0);
  const { active, progress, rootRef, pointRefs } = useChapterRail(t.portfolio.timeline.length);

  const toggleOpen = (index: number) => {
    setOpen((prev) => (prev === index ? null : index));
  };

  return (
    <TemplateShell templateId="story-journey" sections={sections}>
      <section id="intro" className="pf-container story-hero-stage py-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#67e8a5]">{t.templates["story-journey"].name}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl">{t.portfolio.name}</h1>
        <p className="mt-5 max-w-3xl text-xl leading-8 text-white/64">{t.portfolio.headline}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {t.portfolio.timeline.map((item, index) => (
            <a
              key={item.chapter}
              href={`#chapter-${index}`}
              className={cn(
                "pf-focus rounded-2xl border p-4 text-sm font-black transition",
                active === index ? "border-[#67e8a5] bg-[#67e8a5] text-[#101010]" : "border-white/12 bg-white/[0.055] text-white/66 hover:text-white",
              )}
              aria-current={active === index ? "true" : undefined}
            >
              <span className="block font-mono text-xs opacity-70">{item.date}</span>
              {item.chapter}
            </a>
          ))}
        </div>
      </section>

      <section id="timeline" className="pf-container story-timeline-stage grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-3xl border border-white/12 bg-white/[0.06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#67e8a5]">{t.templateUi.story.currentChapter}</p>
            <h2 className="mt-3 text-2xl font-black text-white">{t.portfolio.timeline[active]?.chapter}</h2>
            <div className="mt-5 h-2 rounded-md bg-white/10">
              <motion.div
                className="h-2 rounded-md bg-[#67e8a5]"
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
            <div className="mt-6 space-y-3">
              {t.portfolio.timeline.map((item, index) => (
                <a
                  key={item.chapter}
                  href={`#chapter-${index}`}
                  className={cn(
                    "pf-focus block rounded-2xl border px-3 py-3 text-sm font-bold transition",
                    active === index ? "border-[#67e8a5]/70 bg-[#67e8a5]/12 text-white" : "border-white/8 bg-white/[0.035] text-white/42",
                  )}
                  aria-current={active === index ? "true" : undefined}
                >
                  {item.chapter}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* On small screens this is already a plain vertical stack — no absolutely
            positioned rail elements escape the container width. */}
        <div ref={rootRef} className="relative space-y-5 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-[#67e8a5]/35">
          {t.portfolio.timeline.map((item, index) => {
            const milestone = milestoneTypes[index] ?? { label: t.common.section, icon: BookOpen };
            const Icon = milestone.icon;
            const project = t.portfolio.projects[index % t.portfolio.projects.length];
            const certificate = t.portfolio.certificates[index % t.portfolio.certificates.length];
            const isOpen = open === index;

            return (
              <motion.article
                key={item.title}
                id={`chapter-${index}`}
                ref={(node) => {
                  pointRefs.current[index] = node;
                }}
                className={cn("story-chapter relative pl-12 transition", active === index ? "opacity-100" : "opacity-72")}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
              >
                <span
                  className={cn(
                    "absolute left-0 top-5 grid h-8 w-8 place-items-center rounded-xl border text-xs font-black",
                    active >= index ? "border-[#67e8a5] bg-[#67e8a5] text-[#101010]" : "border-[#67e8a5]/35 bg-[#101010] text-[#67e8a5]",
                  )}
                >
                  {index + 1}
                </span>

                <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5 text-white">
                  <button
                    type="button"
                    onClick={() => toggleOpen(index)}
                    aria-expanded={isOpen}
                    aria-controls={`chapter-detail-${index}`}
                    className="pf-focus flex w-full items-start justify-between gap-4 rounded-xl text-left"
                  >
                    <div>
                      <p className="inline-flex items-center gap-2 rounded-xl border border-[#67e8a5]/20 bg-[#67e8a5]/8 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#67e8a5]">
                        <Icon size={15} />
                        {item.date} &middot; {milestone.label}
                      </p>
                      <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                    </div>
                    <ChevronRight className={cn("mt-1 shrink-0 transition", isOpen && "rotate-90")} aria-hidden="true" />
                  </button>

                  <p className="mt-4 leading-7 text-white/62">{item.detail}</p>

                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#67e8a5]/22 bg-[#67e8a5]/8 p-4">
                    <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#67e8a5]" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#67e8a5]">What I learned</p>
                      <p className="mt-1 text-sm leading-6 text-white/76">{item.learned}</p>
                    </div>
                  </div>

                  {project ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-white/58">
                      <span className="rounded-lg border border-white/10 bg-[#101010]/50 px-2.5 py-1 uppercase tracking-[0.1em] text-white/40">
                        Illustrative project
                      </span>
                      <span className="rounded-xl border border-white/10 bg-[#101010]/50 px-3 py-1.5">{project.name}</span>
                      <span className="rounded-xl border border-white/10 bg-[#101010]/50 px-3 py-1.5">{project.impact}</span>
                    </div>
                  ) : null}

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`chapter-detail-${index}`}
                        variants={panelEnter}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-2"
                      >
                        {project ? (
                          <div className="rounded-2xl border border-white/10 bg-[#101010]/40 p-4">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/40">{t.common.viewProof}</p>
                            <p className="mt-1 text-sm font-bold text-white/80">{project.proof}</p>
                          </div>
                        ) : null}
                        <div className="rounded-2xl border border-white/10 bg-[#101010]/40 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/40">{t.heroPreview.certificates}</p>
                          <p className="mt-1 text-sm font-bold text-white/80">{certificate}</p>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="growth" className="pf-container grid gap-8 py-16 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <h2 className="text-4xl font-black text-white">{t.templateUi.story.careerGraph}</h2>
          <p className="mt-4 text-white/62">{t.career.recommendation}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {t.career.skills.slice(0, 4).map(([skill, value]) => (
              <div key={skill} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="text-2xl font-black text-white">{value}%</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/46">{skill}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 items-end gap-3 rounded-3xl border border-white/12 bg-white/[0.06] p-6 sm:grid-cols-6">
          {t.portfolio.skills.map(([skill, value]) => (
            <div key={skill} className="text-center">
              <div className="mx-auto w-full rounded-xl bg-[#67e8a5]" style={{ height: `${Number(value) * 2.4}px` }} />
              <div className="mt-3 text-xs font-bold text-white/58">{skill}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="pf-container pb-20">
        <div className="rounded-3xl border border-[#67e8a5]/24 bg-[#67e8a5]/8 p-8">
          <h2 className="text-3xl font-black text-white">{t.portfolio.availability}</h2>
        </div>
      </section>
    </TemplateShell>
  );
}
