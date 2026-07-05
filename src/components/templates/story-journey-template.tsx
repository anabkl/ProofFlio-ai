"use client";

import { useEffect, useRef, useState } from "react";
import { Award, BookOpen, ChevronRight, FolderGit, GraduationCap } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";

const sections = ["intro", "timeline", "growth", "contact"] as const;

function useJourneyProgress(count: number) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const update = () => {
      const viewportCenter = window.innerHeight / 2;
      pointRefs.current.forEach((point, index) => {
        if (!point) return;
        if (point.getBoundingClientRect().top <= viewportCenter) {
          setActive(index);
        }
      });

      if (rootRef.current) {
        const rect = rootRef.current.getBoundingClientRect();
        const visible = Math.max(0, viewportCenter - rect.top);
        setProgress(Math.min(1, visible / rect.height));
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [count]);

  return { active, progress, rootRef, pointRefs };
}

export function StoryJourneyTemplate() {
  const { t } = useLocale();
  const [open, setOpen] = useState(0);
  const { active, progress, rootRef, pointRefs } = useJourneyProgress(t.portfolio.timeline.length);
  const milestoneTypes = [
    { label: t.common.section, icon: GraduationCap },
    { label: t.nav.templates, icon: FolderGit },
    { label: t.heroPreview.certificates, icon: Award },
    { label: t.career.kicker, icon: BookOpen },
  ];

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
              <div className="h-2 rounded-md bg-[#67e8a5]" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="mt-6 space-y-3">
              {t.portfolio.timeline.map((item, index) => (
                <a
                  key={item.chapter}
                  href={`#chapter-${index}`}
                  className={cn(
                    "block rounded-2xl border px-3 py-3 text-sm font-bold transition",
                    active === index ? "border-[#67e8a5]/70 bg-[#67e8a5]/12 text-white" : "border-white/8 bg-white/[0.035] text-white/42",
                  )}
                >
                  {item.chapter}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <div ref={rootRef} className="relative space-y-5 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-[#67e8a5]/35">
          {t.portfolio.timeline.map((item, index) => (
            <article
              key={item.title}
              id={`chapter-${index}`}
              className={cn("story-chapter relative pl-12 transition", active === index ? "opacity-100" : "opacity-72")}
              ref={(node) => { pointRefs.current[index] = node; }}
            >
              <span className={cn("absolute left-0 top-5 grid h-8 w-8 place-items-center rounded-xl border text-xs font-black", active >= index ? "border-[#67e8a5] bg-[#67e8a5] text-[#101010]" : "border-[#67e8a5]/35 bg-[#101010] text-[#67e8a5]")}>
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => setOpen(index)}
                className="pf-focus w-full rounded-3xl border border-white/12 bg-white/[0.06] p-5 text-left text-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {(() => {
                      const milestone = milestoneTypes[index] ?? { label: t.common.section, icon: BookOpen };
                      const Icon = milestone.icon;
                      return (
                        <p className="inline-flex items-center gap-2 rounded-xl border border-[#67e8a5]/20 bg-[#67e8a5]/8 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#67e8a5]">
                          <Icon size={15} />
                          {item.date} · {milestone.label}
                        </p>
                      );
                    })()}
                    <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                  </div>
                  <ChevronRight className={cn("transition", open === index && "rotate-90")} />
                </div>
                <p className="mt-4 leading-7 text-white/62">{item.detail}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    t.portfolio.projects[index % t.portfolio.projects.length]?.name,
                    t.portfolio.certificates[index % t.portfolio.certificates.length],
                    t.portfolio.projects[index % t.portfolio.projects.length]?.impact,
                  ].map((detail, detailIndex) => (
                    <span key={detail ?? `${index}-${detailIndex}`} className="rounded-xl border border-white/10 bg-[#101010]/50 px-3 py-2 text-xs font-bold text-white/58">
                      {detail}
                    </span>
                  ))}
                </div>
                {open === index ? (
                  <div className="mt-4 rounded-2xl border border-[#67e8a5]/22 bg-[#67e8a5]/8 p-4 text-sm leading-6 text-white/72">
                    {item.learned}
                  </div>
                ) : null}
              </button>
            </article>
          ))}
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
