"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Code2,
  Download,
  Eye,
  FileText,
  FolderGit,
  Mail,
  MapPin,
  MonitorSmartphone,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { templateMeta, type Copy, type TemplateId } from "@/lib/content";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Project = Copy["portfolio"]["projects"][number];

const baseSections = ["intro", "projects", "skills", "evidence", "contact"];

export function LivingTemplatePage({ templateId }: { templateId: TemplateId }) {
  if (templateId === "minimal-executive") {
    return <MinimalExecutive />;
  }

  if (templateId === "dark-tech") {
    return <DarkTech />;
  }

  if (templateId === "creative-grid") {
    return <CreativeGrid />;
  }

  if (templateId === "story-journey") {
    return <StoryJourney />;
  }

  return <RecruiterFocus />;
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
          { rootMargin: "-32% 0px -55% 0px", threshold: 0.01 },
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

function TemplateChrome({
  templateId,
  sections,
  children,
  tone = "dark",
}: {
  templateId: TemplateId;
  sections: readonly string[];
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  const { t } = useLocale();
  const active = useActiveSection(sections);
  const progress = useScrollProgress();
  const navLabels = t.templateUi.nav as Record<string, string>;

  return (
    <main className={cn("template-route min-h-screen pt-20", templateMeta[templateId].className)} data-template={templateId}>
      <div className="fixed inset-x-0 top-16 z-40 h-1 bg-black/10" aria-hidden="true">
        <div
          className={cn("h-full transition-[width] duration-150", tone === "light" ? "bg-[#315dff]" : "bg-[#4da3ff]")}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="pf-container sticky top-20 z-30 pt-4">
        <div
          className={cn(
            "template-nav flex items-center gap-2 overflow-x-auto rounded-lg border p-2 backdrop-blur",
            tone === "light" ? "border-[#172033]/12 bg-white/80 text-[#172033]" : "border-white/12 bg-[#05070d]/74 text-white",
          )}
          data-testid="template-nav"
        >
          <Link
            href="/templates"
            className="pf-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-current/12"
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
                "pf-focus shrink-0 rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition",
                active === id ? "bg-current text-white mix-blend-difference" : "opacity-60 hover:opacity-100",
              )}
              aria-current={active === id ? "true" : undefined}
            >
              {navLabels[id] ?? id.replace("-", " ")}
            </a>
          ))}
          <Link
            href={`/editor?template=${templateId}`}
            className="pf-focus ml-auto inline-flex shrink-0 items-center gap-2 rounded-md bg-[#f7fbff] px-3 py-2 text-xs font-black text-[#071021]"
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

function MetricStrip({ light = false }: { light?: boolean }) {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {t.portfolio.metrics.map(([value, label]) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "rounded-lg border p-4",
            light ? "border-[#dbe4f0] bg-white text-[#172033]" : "border-white/12 bg-white/[0.06] text-white",
          )}
        >
          <div className="text-3xl font-black">{value}</div>
          <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] opacity-58">{label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function SkillBars({ light = false }: { light?: boolean }) {
  const { t } = useLocale();

  return (
    <div className="space-y-5">
      {t.portfolio.skills.map(([skill, value], index) => (
        <motion.div
          key={skill}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 }}
        >
          <div className="mb-2 flex items-center justify-between text-sm font-black">
            <span>{skill}</span>
            <span>{value}%</span>
          </div>
          <div className={cn("h-2 rounded-md", light ? "bg-[#e2e8f0]" : "bg-white/12")}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${value}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-2 rounded-md", light ? "bg-[#315dff]" : "bg-[#4da3ff]")}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  light = false,
  interactive = false,
}: {
  project: Project;
  light?: boolean;
  interactive?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={interactive ? { y: -6, rotateX: 2, rotateY: -3 } : { y: -3 }}
      className={cn(
        "group rounded-lg border p-5 transition",
        light
          ? "border-[#dbe4f0] bg-white text-[#172033] shadow-[0_18px_50px_rgba(15,23,42,.08)]"
          : "border-white/12 bg-white/[0.065] text-white shadow-[0_22px_70px_rgba(0,0,0,.25)]",
        interactive && "dark-tech-proof-card",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-55">{project.category}</p>
          <h3 className="mt-2 text-xl font-black">{project.name}</h3>
        </div>
        <FolderGit size={19} className="opacity-45" />
      </div>
      <p className="mt-4 text-sm font-bold leading-6 opacity-74">{project.signal}</p>
      <div className={cn("mt-4 rounded-md border p-3 text-sm leading-6", light ? "border-[#dbe4f0] bg-[#f8fafc]" : "border-[#4da3ff]/20 bg-[#4da3ff]/8")}>
        {project.proof}
      </div>
      <div className="mt-4 grid overflow-hidden rounded-md border border-current/10">
        <div className="translate-y-0 p-3 text-sm font-black transition group-hover:-translate-y-full">{project.impact}</div>
        <div className="absolute p-3 text-sm leading-6 opacity-0 transition group-hover:opacity-100">{project.detail}</div>
      </div>
    </motion.article>
  );
}

function MinimalExecutive() {
  const { t } = useLocale();
  const sections = useMemo(() => baseSections, []);

  return (
    <TemplateChrome templateId="minimal-executive" sections={sections} tone="light">
      <section id="intro" className="pf-container grid gap-10 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#315dff]">{t.templates["minimal-executive"].name}</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-[#172033] sm:text-7xl">
            {t.portfolio.name}
          </h1>
          <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-[#475569]">{t.portfolio.headline}</p>
        </motion.div>
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="executive-card rounded-lg border border-[#dbe4f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)]"
        >
          <div className="flex items-center gap-3 text-sm font-black text-[#315dff]">
            <Target size={18} />
            {t.portfolio.targetRole}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#475569]">{t.portfolio.availability}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="pf-focus inline-flex items-center justify-center gap-2 rounded-md bg-[#172033] px-4 py-3 text-sm font-black text-white">
              <Eye size={16} />
              {t.common.demo}
            </Link>
            <Link href="/editor" className="pf-focus inline-flex items-center justify-center gap-2 rounded-md border border-[#dbe4f0] px-4 py-3 text-sm font-black text-[#172033]">
              <Mail size={16} />
              {t.common.contact}
            </Link>
          </div>
        </motion.aside>
      </section>
      <section className="pf-container pb-8">
        <MetricStrip light />
      </section>
      <section id="projects" className="pf-container executive-workbench py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#315dff]">{t.common.proof}</p>
            <h2 className="mt-3 text-3xl font-black text-[#172033]">{t.templateUi.minimal.selectedWork}</h2>
          </div>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {t.portfolio.projects.map((project) => (
            <div key={project.name} className="min-w-[280px] snap-start">
              <ProjectCard project={project} light />
            </div>
          ))}
        </div>
      </section>
      <section id="skills" className="pf-container grid gap-8 py-16 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-black text-[#172033]">{t.templateUi.minimal.skillSignal}</h2>
          <p className="mt-4 text-base leading-7 text-[#64748b]">{t.portfolio.summary}</p>
        </div>
        <SkillBars light />
      </section>
      <section id="evidence" className="border-y border-[#dbe4f0] bg-white/62 py-16">
        <div className="pf-container grid gap-3 md:grid-cols-4">
          {t.portfolio.certificates.map((certificate) => (
            <div key={certificate} className="rounded-lg border border-[#dbe4f0] bg-white p-4 text-sm font-black text-[#172033]">
              <BadgeCheck size={18} className="mb-3 text-[#315dff]" />
              {certificate}
            </div>
          ))}
        </div>
      </section>
      <section id="contact" className="pf-container py-16">
        <div className="rounded-lg border border-[#dbe4f0] bg-[#172033] p-8 text-white">
          <p className="text-sm font-bold text-white/62">{t.portfolio.location}</p>
          <h2 className="mt-3 text-3xl font-black">{t.portfolio.availability}</h2>
          <p className="mt-4 text-white/66">{t.portfolio.email}</p>
        </div>
      </section>
    </TemplateChrome>
  );
}

function DarkTech() {
  const { t } = useLocale();
  const sections = useMemo(() => ["intro", "proof", "signals", "skills", "contact"], []);
  const roles = t.templateUi.dark.roles;
  const [roleIndex, setRoleIndex] = useState(0);
  const heatmap = Array.from({ length: 84 }, (_, index) => index);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % roles.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [roles.length]);

  return (
    <TemplateChrome templateId="dark-tech" sections={sections}>
      <div className="dark-tech-field" aria-hidden="true" />
      <div className="dark-tech-light-beam" aria-hidden="true" />
      <section id="intro" className="pf-container relative grid gap-10 py-20 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#9ed0ff]">{t.templateUi.dark.flagship}</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-white sm:text-7xl">{t.portfolio.name}</h1>
          <div className="mt-5 inline-flex rounded-lg border border-[#4da3ff]/22 bg-[#4da3ff]/10 p-2">
            <div className="min-w-72 rounded-md bg-[#06101f] px-4 py-3 text-2xl font-black leading-tight text-[#d8ecff] shadow-[0_0_60px_rgba(77,163,255,.16)]">
              {roles[roleIndex]}
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">{t.portfolio.summary}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {roles.map((item, index) => (
              <span key={item} className="rounded-md border border-[#4da3ff]/28 bg-[#4da3ff]/10 px-3 py-2 text-sm font-black text-[#cfe8ff]">
                <span className={cn("mr-2 inline-block h-2 w-2 rounded-[2px]", roleIndex === index ? "bg-[#67e8a5]" : "bg-white/24")} />
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 grid max-w-xl gap-2 rounded-lg border border-white/10 bg-white/[0.045] p-2 sm:grid-cols-3">
            {t.templateUi.dark.assurance.map((item) => (
              <div key={item} className="rounded-md border border-[#39e6dc]/18 bg-[#39e6dc]/8 px-3 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#c7fffb]">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dark-tech-console relative overflow-hidden rounded-lg border border-[#4da3ff]/22 bg-[#06101f]/88 p-5 shadow-[0_0_120px_rgba(77,163,255,.16)]"
        >
          <div className="dark-tech-radar absolute right-4 top-14 h-28 w-28 rounded-lg border border-[#4da3ff]/20" aria-hidden="true" />
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#9ed0ff]">{t.templateUi.dark.activity}</span>
            <Code2 size={18} className="text-white/44" />
          </div>
          <div className="grid grid-cols-12 gap-1">
            {heatmap.map((item) => (
              <span
                key={item}
                className={cn(
                  "h-4 rounded-[3px] border border-white/5",
                  item % 7 === 0 ? "bg-[#67e8a5]" : item % 5 === 0 ? "bg-[#4da3ff]/80" : item % 3 === 0 ? "bg-[#315dff]/55" : "bg-white/8",
                )}
              />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {t.portfolio.metrics.map(([value, label]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.055] p-3 backdrop-blur">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs font-bold text-white/48">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-[#67e8a5]/18 bg-[#67e8a5]/8 p-3 font-mono text-xs leading-6 text-[#c7ffde]">
            {t.templateUi.dark.command}
          </div>
        </motion.div>
      </section>
      <section id="proof" className="pf-container py-16">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {t.portfolio.projects.map((project) => (
            <ProjectCard key={project.name} project={project} interactive />
          ))}
        </div>
      </section>
      <section id="signals" className="border-y border-white/10 bg-[#071021]/80 py-16">
        <div className="pf-container grid gap-5 md:grid-cols-5">
          {t.templateUi.dark.signals.map((label, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-[#4da3ff]/18 bg-[#4da3ff]/8 p-5"
            >
              <div className="text-3xl font-black text-white">{[38, 12, 214, 6, 91][index]}</div>
              <div className="mt-2 text-sm font-bold text-[#9ed0ff]">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>
      <section id="skills" className="pf-container grid gap-8 py-16 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className="text-4xl font-black text-white">{t.templateUi.dark.skillConstellation}</h2>
          <p className="mt-4 text-white/62">{t.portfolio.headline}</p>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/12 bg-white/[0.045]">
          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[32px] border border-[#4da3ff]/18" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[40px] border border-[#39e6dc]/12" aria-hidden="true" />
          <svg className="absolute inset-0 h-full w-full opacity-55" viewBox="0 0 700 360" aria-hidden="true">
            <path className="flow-line" d="M110 78 C230 178 336 80 492 170 C560 210 600 138 642 92" fill="none" stroke="#4da3ff" strokeOpacity=".34" />
            <path className="flow-line" d="M96 270 C210 190 336 286 478 214 C550 176 602 236 640 276" fill="none" stroke="#39e6dc" strokeOpacity=".24" />
          </svg>
          {t.portfolio.skills.map(([skill, value], index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute rounded-lg border border-[#4da3ff]/24 bg-[#06101f] px-4 py-3 text-sm font-black text-white"
              style={{
                left: `${12 + ((index * 23) % 70)}%`,
                top: `${12 + ((index * 31) % 62)}%`,
                boxShadow: `0 0 ${Number(value) / 2}px rgba(77,163,255,.24)`,
              }}
            >
              {skill} · {value}
            </motion.div>
          ))}
        </div>
      </section>
      <section id="contact" className="pf-container pb-20">
        <div className="rounded-lg border border-[#4da3ff]/25 bg-[#4da3ff]/10 p-8">
          <h2 className="text-3xl font-black text-white">{t.portfolio.availability}</h2>
          <p className="mt-3 text-white/62">{t.portfolio.location}</p>
        </div>
      </section>
    </TemplateChrome>
  );
}

function CreativeGrid() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<string>(t.portfolio.filters[0]);
  const [selected, setSelected] = useState<Project | null>(null);
  const sections = useMemo(() => ["intro", "gallery", "process", "contact"], []);
  const projects = filter === t.portfolio.filters[0] ? t.portfolio.projects : t.portfolio.projects.filter((project) => project.category === filter);

  return (
    <TemplateChrome templateId="creative-grid" sections={sections} tone="light">
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
              onClick={() => setFilter(item)}
              className={cn(
                "pf-focus rounded-md border px-4 py-2 text-sm font-black transition",
                filter === item ? "border-[#ff7a66] bg-[#ff7a66] text-white" : "border-[#dbe4f0] bg-white text-[#151926]",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <motion.div layout className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-6">
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
                  "pf-focus group rounded-lg border border-[#e6d7d0] bg-white p-0 text-left shadow-[0_20px_60px_rgba(151,92,75,.10)] transition hover:-translate-y-1",
                  index === 0 ? "md:col-span-3 md:row-span-2" : "md:col-span-3 xl:col-span-2",
                )}
              >
                <div className="media-sheen h-36 rounded-t-lg" />
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
          <div key={step} className="rounded-lg border border-[#e6d7d0] bg-white p-5 text-[#151926]">
            <div className="text-3xl font-black text-[#ff7a66]">0{index + 1}</div>
            <h3 className="mt-4 text-xl font-black">{step}</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">{t.portfolio.timeline[index]?.learned}</p>
          </div>
        ))}
      </section>
      <section id="contact" className="pf-container pb-20">
        <div className="rounded-lg border border-[#e6d7d0] bg-[#151926] p-8 text-white">
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
              className="max-w-2xl rounded-lg bg-white p-6 text-[#151926]"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="pf-focus ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-[#dbe4f0]"
                aria-label={t.common.close}
                title={t.common.close}
              >
                <X size={17} />
              </button>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff7a66]">{selected.category}</p>
              <h2 className="mt-3 text-3xl font-black">{selected.name}</h2>
              <p className="mt-4 leading-7 text-[#475569]">{selected.detail}</p>
              <div className="mt-5 rounded-md border border-[#dbe4f0] bg-[#f8fafc] p-4 font-bold">{selected.proof}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </TemplateChrome>
  );
}

function StoryJourney() {
  const { t } = useLocale();
  const [open, setOpen] = useState(0);
  const sections = useMemo(() => ["intro", "timeline", "growth", "contact"], []);

  return (
    <TemplateChrome templateId="story-journey" sections={sections}>
      <section id="intro" className="pf-container story-hero-stage py-16">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#67e8a5]">{t.templates["story-journey"].name}</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl">{t.portfolio.name}</h1>
        <p className="mt-5 max-w-3xl text-xl leading-8 text-white/64">{t.portfolio.headline}</p>
      </section>
      <section id="timeline" className="pf-container story-timeline-stage grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 rounded-lg border border-white/12 bg-white/[0.06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#67e8a5]">{t.templateUi.story.currentChapter}</p>
            <h2 className="mt-3 text-2xl font-black text-white">{t.portfolio.timeline[open]?.chapter}</h2>
          </div>
        </aside>
        <div className="relative space-y-5 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-[#67e8a5]/35">
          {t.portfolio.timeline.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-12"
            >
              <span className="absolute left-0 top-5 grid h-8 w-8 place-items-center rounded-md border border-[#67e8a5]/35 bg-[#101010] text-xs font-black text-[#67e8a5]">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => setOpen(index)}
                className="pf-focus w-full rounded-lg border border-white/12 bg-white/[0.06] p-5 text-left text-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#67e8a5]">{item.date} · {item.chapter}</p>
                    <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                  </div>
                  <ChevronRight className={cn("transition", open === index && "rotate-90")} />
                </div>
                <p className="mt-4 leading-7 text-white/62">{item.detail}</p>
                {open === index ? (
                  <div className="mt-4 rounded-md border border-[#67e8a5]/22 bg-[#67e8a5]/8 p-4 text-sm leading-6 text-white/72">
                    {item.learned}
                  </div>
                ) : null}
              </button>
            </motion.article>
          ))}
        </div>
      </section>
      <section id="growth" className="pf-container grid gap-8 py-16 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <h2 className="text-4xl font-black text-white">{t.templateUi.story.careerGraph}</h2>
          <p className="mt-4 text-white/62">{t.career.recommendation}</p>
        </div>
        <div className="grid grid-cols-6 items-end gap-3 rounded-lg border border-white/12 bg-white/[0.06] p-6">
          {t.portfolio.skills.map(([skill, value]) => (
            <div key={skill} className="text-center">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${Number(value) * 2.4}px` }}
                viewport={{ once: true }}
                className="mx-auto w-full rounded-md bg-[#67e8a5]"
              />
              <div className="mt-3 text-xs font-bold text-white/58">{skill}</div>
            </div>
          ))}
        </div>
      </section>
      <section id="contact" className="pf-container pb-20">
        <div className="rounded-lg border border-[#67e8a5]/24 bg-[#67e8a5]/8 p-8">
          <h2 className="text-3xl font-black text-white">{t.portfolio.availability}</h2>
        </div>
      </section>
    </TemplateChrome>
  );
}

function RecruiterFocus() {
  const { t } = useLocale();
  const [open, setOpen] = useState<string>(t.portfolio.projects[0].name);
  const sections = useMemo(() => ["summary", "scan", "proof", "cv"], []);

  return (
    <TemplateChrome templateId="recruiter-focus" sections={sections} tone="light">
      <section id="summary" className="pf-container recruiter-summary-stage grid gap-8 py-14 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0f766e]">{t.templates["recruiter-focus"].name}</p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-[#172033] sm:text-7xl">{t.portfolio.name}</h1>
          <p className="mt-4 text-2xl font-black text-[#0f766e]">{t.portfolio.targetRole}</p>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#475569]">{t.portfolio.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-[#475569]">
            <span className="inline-flex items-center gap-2 rounded-md border border-[#dbe4f0] bg-white px-3 py-2">
              <MapPin size={16} />
              {t.portfolio.location}
            </span>
            <span className="rounded-md border border-[#dbe4f0] bg-white px-3 py-2">{t.portfolio.availability}</span>
          </div>
        </div>
        <aside className="recruiter-contact-card rounded-lg border border-[#dbe4f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">{t.templateUi.recruiter.contactPath}</p>
          <p className="mt-4 text-sm leading-6 text-[#475569]">{t.portfolio.email}</p>
          <Link href="/demo" className="pf-focus mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0f766e] px-4 py-3 text-sm font-black text-white">
            <Mail size={16} />
            {t.recruiter.contact}
          </Link>
        </aside>
      </section>
      <section id="scan" className="border-y border-[#dbe4f0] bg-white/74 py-14">
        <div className="pf-container">
          <h2 className="text-3xl font-black text-[#172033]">{t.templateUi.recruiter.scanTitle}</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            {t.portfolio.scanSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-[#dbe4f0] bg-white p-4">
                <BadgeCheck size={18} className="text-[#0f766e]" />
                <div className="mt-4 text-lg font-black text-[#172033]">{step}</div>
                <div className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">{index + 1}/5</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="proof" className="pf-container grid gap-8 py-14 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <h2 className="text-3xl font-black text-[#172033]">{t.templateUi.recruiter.topProof}</h2>
          <p className="mt-3 text-[#64748b]">{t.common.proof}</p>
        </div>
        <div className="space-y-3">
          {t.portfolio.projects.slice(0, 3).map((project) => (
            <button
              key={project.name}
              type="button"
              onClick={() => setOpen(project.name)}
              className="pf-focus w-full rounded-lg border border-[#dbe4f0] bg-white p-5 text-left text-[#172033]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">{project.name}</h3>
                  <p className="mt-2 text-sm font-bold text-[#0f766e]">{project.impact}</p>
                </div>
                <FileText size={19} className="text-[#64748b]" />
              </div>
              {open === project.name ? <p className="mt-4 text-sm leading-6 text-[#475569]">{project.detail}</p> : null}
            </button>
          ))}
        </div>
      </section>
      <section id="cv" className="pf-container grid gap-6 pb-20 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-[#dbe4f0] bg-white p-6 text-[#172033]">
          <h2 className="text-3xl font-black">{t.templateUi.recruiter.skillClusters}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {t.portfolio.skills.map(([skill, value]) => (
              <div key={skill} className="rounded-md border border-[#dbe4f0] bg-[#f8fafc] p-4">
                <div className="text-lg font-black">{skill}</div>
                <div className="mt-2 text-sm text-[#64748b]">{value}% · {t.common.proof}</div>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-lg border border-[#dbe4f0] bg-[#172033] p-6 text-white">
          <MonitorSmartphone className="text-[#67e8a5]" />
          <h2 className="mt-4 text-2xl font-black">{t.templateUi.recruiter.cvPreview}</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">{t.portfolio.summary}</p>
          <button type="button" className="pf-focus mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-black text-[#172033]">
            <Download size={16} />
            {t.common.downloadCv}
          </button>
        </aside>
      </section>
    </TemplateChrome>
  );
}
