"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, Cpu, FolderGit, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { cardSelect, panelEnter, springSelected } from "@/lib/motion";

const sections = ["intro", "proof", "signals", "skills", "contact"] as const;

export function DarkTechTemplate() {
  const { t } = useLocale();
  const roles = t.templateUi.dark.roles;
  const [roleIndex, setRoleIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(0);
  const [heat, setHeat] = useState<number | null>(null);
  const activeProject = t.portfolio.projects[selectedProject] ?? t.portfolio.projects[0];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % roles.length);
    }, 2300);

    return () => window.clearInterval(timer);
  }, [roles.length]);

  const signalValues = useMemo(() => {
    const findMetric = (needle: string) =>
      t.portfolio.metrics.find(([, label]) => label.toLowerCase().includes(needle))?.[0];
    const commitSignal = t.portfolio.projects.reduce((total, project) => total + project.detail.length, 0);

    return [
      findMetric("repo") ?? String(t.portfolio.projects.length),
      String(t.portfolio.projects.length),
      String(commitSignal),
      String(t.portfolio.certificates.length),
      findMetric("readi") ?? String(t.portfolio.skills.length),
    ];
  }, [t.portfolio.certificates.length, t.portfolio.metrics, t.portfolio.projects, t.portfolio.skills.length]);

  const heatSkill = heat === null ? null : t.portfolio.skills[heat % t.portfolio.skills.length];

  return (
    <TemplateShell templateId="dark-tech" sections={sections}>
      <div className="dark-tech-field" aria-hidden="true" />
      <div className="dark-tech-light-beam" aria-hidden="true" />
      <section id="intro" className="pf-container relative grid gap-10 py-20 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9ed0ff]">{t.templateUi.dark.flagship}</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-white sm:text-7xl">{t.portfolio.name}</h1>
          <div className="mt-5 inline-flex rounded-2xl border border-[#4da3ff]/22 bg-[#4da3ff]/10 p-2">
            <div className="min-w-72 rounded-xl bg-[#06101f] px-4 py-3 text-2xl font-black leading-tight text-[#d8ecff] shadow-[0_0_60px_rgba(77,163,255,.16)]">
              {roles[roleIndex]}
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/62">{t.portfolio.summary}</p>
          <div className="mt-8 grid max-w-xl gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-2 sm:grid-cols-3">
            {t.templateUi.dark.assurance.map((item) => (
              <div key={item} className="rounded-xl border border-[#39e6dc]/18 bg-[#39e6dc]/8 px-3 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#c7fffb]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="dark-tech-console relative overflow-hidden rounded-3xl border border-[#4da3ff]/22 bg-[#06101f]/90 p-5 shadow-[0_0_120px_rgba(77,163,255,.16)]">
          <div className="dark-tech-radar absolute right-4 top-14 h-28 w-28 rounded-2xl border border-[#4da3ff]/20" aria-hidden="true" />
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#9ed0ff]">{t.templateUi.dark.activity}</span>
            <Code2 size={18} className="text-white/44" />
          </div>
          <div className="grid grid-cols-12 gap-1" onMouseLeave={() => setHeat(null)}>
            {Array.from({ length: 84 }, (_, index) => (
              <button
                key={index}
                type="button"
                onMouseEnter={() => setHeat(index)}
                onFocus={() => setHeat(index)}
                onBlur={() => setHeat(null)}
                className={cn(
                  "pf-focus h-4 rounded-[3px] border border-white/5 transition hover:scale-125",
                  index % 7 === 0 ? "bg-[#67e8a5]" : index % 5 === 0 ? "bg-[#4da3ff]/80" : index % 3 === 0 ? "bg-[#315dff]/55" : "bg-white/8",
                  heat === index && "ring-2 ring-[#67e8a5]",
                )}
                aria-label={`activity-${index}`}
              />
            ))}
          </div>
          <div className="mt-2 min-h-5 font-mono text-[11px] font-bold text-[#9ed0ff]/80">
            {heatSkill ? `signal · ${heatSkill[0]} · ${heatSkill[1]}%` : "hover a cell for a live signal read"}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {t.portfolio.metrics.map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs font-bold text-white/48">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-[#67e8a5]/18 bg-[#67e8a5]/8 p-3 font-mono text-xs leading-6 text-[#c7ffde]">
            {t.templateUi.dark.command}
          </div>
        </div>
      </section>

      <section id="proof" className="pf-container py-16">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-white/12 bg-white/[0.055] p-4">
            <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#9ed0ff]">{t.common.proof}</div>
            <div className="space-y-2">
              {t.portfolio.projects.map((project, index) => {
                const isModel = project.category.toLowerCase().includes("ai") || project.category.toLowerCase().includes("data");
                const SignalIcon = isModel ? Cpu : FolderGit;
                const selected = selectedProject === index;
                return (
                  <motion.button
                    key={project.name}
                    type="button"
                    onClick={() => setSelectedProject(index)}
                    aria-pressed={selected}
                    variants={cardSelect}
                    animate={selected ? "selected" : "rest"}
                    transition={springSelected}
                    className={cn(
                      "pf-focus w-full rounded-2xl border p-4 text-left transition-colors",
                      selected ? "border-[#4da3ff]/55 bg-[#4da3ff]/14" : "border-white/10 bg-white/[0.035] hover:border-white/24",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-black text-white">{project.name}</div>
                      <SignalIcon size={15} className={selected ? "text-[#67e8a5]" : "text-white/40"} aria-hidden="true" />
                    </div>
                    <div className="mt-1 text-xs font-bold text-white/48">{project.category}</div>
                  </motion.button>
                );
              })}
            </div>
          </aside>
          <div className="dark-tech-project-deck relative overflow-hidden rounded-3xl border border-[#4da3ff]/22 bg-[#071021]/88 p-6 shadow-[0_35px_130px_rgba(0,0,0,.3)]">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">{t.templateUi.nav.architecture}</p>
            <AnimatePresence mode="wait">
              <motion.article
                key={activeProject?.name}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={panelEnter}
              >
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#67e8a5]">{activeProject?.category}</p>
                    <h2 className="mt-3 text-4xl font-black text-white">{activeProject?.name}</h2>
                  </div>
                  <FolderGit className="text-[#9ed0ff]" size={28} aria-hidden="true" />
                </div>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">{activeProject?.detail}</p>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Impact", value: activeProject?.impact },
                    { label: "Signal", value: activeProject?.signal },
                    { label: t.common.viewProof, value: activeProject?.proof },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9ed0ff]/70">{item.label}</div>
                      <div className="mt-2 text-sm font-bold leading-6 text-white/72">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="signals" className="border-y border-white/10 bg-[#071021]/80 py-16">
        <div className="pf-container grid gap-5 md:grid-cols-5">
          {t.templateUi.dark.signals.map((label, index) => (
            <div key={label} className="rounded-2xl border border-[#4da3ff]/18 bg-[#4da3ff]/8 p-5">
              <div className="text-3xl font-black text-white">{signalValues[index]}</div>
              <div className="mt-2 text-sm font-bold text-[#9ed0ff]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="skills" className="pf-container grid gap-8 py-16 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className="text-4xl font-black text-white">{t.templateUi.dark.skillConstellation}</h2>
          <p className="mt-4 text-white/62">{t.portfolio.headline}</p>
        </div>
        <div className="relative min-h-[380px] overflow-hidden rounded-3xl border border-white/12 bg-white/[0.045]">
          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[32px] border border-[#4da3ff]/18" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[40px] border border-[#39e6dc]/12" aria-hidden="true" />
          <svg className="absolute inset-0 h-full w-full opacity-55" viewBox="0 0 700 380" aria-hidden="true">
            <path className="flow-line" d="M110 78 C230 178 336 80 492 170 C560 210 600 138 642 92" fill="none" stroke="#4da3ff" strokeOpacity=".34" />
            <path className="flow-line" d="M96 270 C210 190 336 286 478 214 C550 176 602 236 640 276" fill="none" stroke="#39e6dc" strokeOpacity=".24" />
          </svg>
          {t.portfolio.skills.map(([skill, value], index) => (
            <div
              key={skill}
              className="absolute rounded-2xl border border-[#4da3ff]/24 bg-[#06101f] px-4 py-3 text-sm font-black text-white"
              style={{
                left: `${10 + ((index * 23) % 70)}%`,
                top: `${12 + ((index * 31) % 62)}%`,
                boxShadow: `0 0 ${Number(value) / 2}px rgba(77,163,255,.24)`,
              }}
            >
              {skill} · {value}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="pf-container pb-20">
        <div className="rounded-3xl border border-[#4da3ff]/25 bg-[#4da3ff]/10 p-8">
          <ShieldCheck className="text-[#67e8a5]" />
          <h2 className="mt-4 text-3xl font-black text-white">{t.portfolio.availability}</h2>
          <p className="mt-3 text-white/62">{t.portfolio.location}</p>
        </div>
      </section>
    </TemplateShell>
  );
}
