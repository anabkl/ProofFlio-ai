"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  FileText,
  FolderGit,
  GitBranch,
  ShieldCheck,
  SquareTerminal,
  X,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";

const sections = ["home", "work", "toolkit", "journey", "proofLab"] as const;

function useRoleTicker(roles: readonly string[]) {
  const [displayed, setDisplayed] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = roles[roleIndex] ?? roles[0] ?? "";
    let timeout: number | undefined;

    if (!isDeleting && displayed.length < current.length) {
      timeout = window.setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 68);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = window.setTimeout(() => setIsDeleting(true), 1450);
    } else if (isDeleting && displayed.length > 0) {
      timeout = window.setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 34);
    } else if (isDeleting) {
      timeout = window.setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((currentIndex) => (currentIndex + 1) % roles.length);
      }, 180);
    }

    return () => window.clearTimeout(timeout);
  }, [displayed, isDeleting, roleIndex, roles]);

  return displayed;
}

type Project = ReturnType<typeof useLocale>["t"]["portfolio"]["projects"][number];

export function DeveloperSignatureTemplate() {
  const { t } = useLocale();
  const displayedRole = useRoleTicker(t.templateUi.developer.roles);
  const [filterIndex, setFilterIndex] = useState(0);
  const [selectedProjectName, setSelectedProjectName] = useState<string>(t.portfolio.projects[0]?.name ?? "");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const activeFilter = t.portfolio.filters[filterIndex] ?? t.portfolio.filters[0];
  const filteredProjects = filterIndex === 0
    ? t.portfolio.projects
    : t.portfolio.projects.filter((project) => project.category === activeFilter);
  const selectedProject = filteredProjects.find((project) => project.name === selectedProjectName) ?? filteredProjects[0] ?? t.portfolio.projects[0];
  const sourceLedger = [
    { Icon: FileText, label: "CV", value: t.hero.cards[0]?.value },
    { Icon: FolderGit, label: "GitHub", value: t.hero.cards[1]?.value },
    { Icon: Award, label: t.heroPreview.certificates, value: t.hero.cards[2]?.value },
  ];

  const skillGroups = useMemo(
    () => [
      {
        title: "AI & Data",
        icon: Brain,
        proof: "Benchmarks + notebooks",
        skills: ["Python", "Data UX", "Model notes", "Evaluation"],
        color: "#2dd4bf",
      },
      {
        title: "Interface Systems",
        icon: Code2,
        proof: "Storybook + a11y notes",
        skills: ["React", "Next.js", "TypeScript", "Design tokens"],
        color: "#4e8cff",
      },
      {
        title: "Delivery",
        icon: Database,
        proof: "APIs + release logs",
        skills: ["Testing", "Deployment", "Docs", "GitHub"],
        color: "#8b5cf6",
      },
    ],
    [],
  );

  function chooseProject(project: Project) {
    setSelectedProjectName(project.name);
    setDrawerOpen(true);
  }

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <TemplateShell templateId="developer-signature" sections={sections}>
      <section id="home" className="developer-signature-hero-v3 pf-container grid min-h-[calc(100svh-80px)] gap-10 py-16 lg:grid-cols-[.94fr_1.06fr] lg:items-center">
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-black uppercase tracking-[0.34em] text-[#2dd4bf]">
            {t.templateUi.developer.eyebrow}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6 max-w-4xl text-6xl font-black leading-[0.86] tracking-tight text-white sm:text-7xl xl:text-[7rem]">
            {t.portfolio.name}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-6 min-h-12 font-mono text-2xl font-black text-[#b5fff6] sm:text-3xl">
            {displayedRole}
            <span className="text-[#8b5cf6]">|</span>
          </motion.div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66">{t.portfolio.summary}</p>
          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            {t.templateUi.developer.proofStates.map((state) => (
              <span key={state} className="developer-proof-chip">
                <ShieldCheck size={15} />
                {state}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-white/64">
            <span>{t.portfolio.targetRole}</span>
            <span className="text-[#2dd4bf]">/</span>
            <span>{t.portfolio.availability}</span>
          </div>
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 26, rotateX: 5, rotateY: -5 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
          transition={{ delay: 0.16, duration: 0.6, ease: "easeOut" }}
          className="developer-proof-terminal"
        >
          <div className="developer-terminal-toolbar">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[#ff7a66]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[#f7d154]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[#67e8a5]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7dd3fc]">proof dossier</span>
            <SquareTerminal size={18} className="text-[#9ed0ff]" />
          </div>
          <div className="developer-command-line">{t.templateUi.developer.command}</div>
          <div className="developer-metric-strip">
            {t.portfolio.metrics.map(([value, label]) => (
              <div key={label}>
                <div className="text-4xl font-black text-white">{value}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/42">{label}</div>
              </div>
            ))}
          </div>
          <div className="developer-source-ledger">
            {sourceLedger.map(({ Icon, label, value }) => (
              <div key={label} className="developer-ledger-row">
                <Icon size={18} className="text-[#2dd4bf]" />
                <div>
                  <div className="text-sm font-black text-white">{label}</div>
                  <div className="mt-1 text-xs leading-5 text-white/50">{value}</div>
                </div>
                <CheckCircle2 size={16} className="ml-auto text-[#2dd4bf]" />
              </div>
            ))}
          </div>
        </motion.aside>
      </section>

      <section id="work" className="developer-work-section pf-container py-20">
        <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
          <div className="developer-work-copy">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7dd3fc]">{t.templateUi.developer.featured}</p>
            <h2 className="mt-4 text-5xl font-black leading-none text-white">{selectedProject?.name}</h2>
            <p className="mt-5 text-lg leading-8 text-white/62">{selectedProject?.detail}</p>
            <div className="mt-6 flex flex-wrap gap-2" aria-label={t.templateUi.developer.filterLabel}>
              {t.portfolio.filters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setFilterIndex(index);
                    setDrawerOpen(true);
                  }}
                  className={cn(
                    "pf-focus rounded-full border px-4 py-2 text-sm font-black transition",
                    filterIndex === index ? "border-transparent bg-[#2dd4bf] text-[#05101d]" : "border-white/12 bg-white/[0.04] text-white/56 hover:text-white",
                  )}
                  aria-pressed={filterIndex === index}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="developer-project-stage">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                className="developer-project-deck"
              >
                {filteredProjects.map((project, index) => (
                  <motion.button
                    key={project.name}
                    type="button"
                    onClick={() => chooseProject(project)}
                    whileHover={{ y: -8, rotateX: 2, rotateY: index % 2 === 0 ? -2 : 2 }}
                    whileTap={{ scale: 0.985 }}
                    className={cn(
                      "developer-project-card pf-focus",
                      selectedProject?.name === project.name && "developer-project-card-active",
                    )}
                  >
                    <span className="font-mono text-xs font-black text-[#2dd4bf]">0{index + 1}</span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7dd3fc]">
                      {project.category}
                    </span>
                    <h3 className="mt-8 text-2xl font-black leading-tight text-white">{project.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/58">{project.impact}</p>
                    <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-black uppercase tracking-[0.16em] text-white/48">
                      <span>{project.proof}</span>
                      <ChevronRight size={18} />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {drawerOpen && selectedProject ? (
                <motion.aside
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 28 }}
                  className="developer-evidence-drawer"
                >
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="developer-drawer-close pf-focus"
                    aria-label={t.common.close}
                  >
                    <X size={16} />
                  </button>
                  <div className="pr-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#2dd4bf]">{t.common.viewProof}</p>
                    <h3 className="mt-3 text-2xl font-black text-white">{selectedProject.signal}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/62">{selectedProject.detail}</p>
                  </div>
                  <div className="mt-6 grid gap-2">
                    {[selectedProject.proof, "GitHub", "Demo", t.templateUi.developer.proofStates[2], t.productStage.evidence.status].map((label) => (
                      <div key={label} className="developer-proof-line">
                        <CheckCircle2 size={16} className="text-[#2dd4bf]" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.aside>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="toolkit" className="developer-toolkit-section border-y border-white/10 py-20">
        <div className="pf-container">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#2dd4bf]">{t.templateUi.developer.toolkitTitle}</p>
            <h2 className="mt-4 text-5xl font-black leading-none text-white">{t.common.proof}</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {skillGroups.map((group) => {
              const Icon = group.icon;
              return (
                <motion.div key={group.title} whileHover={{ y: -5 }} className="developer-toolkit-card">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border" style={{ borderColor: `${group.color}66`, backgroundColor: `${group.color}14` }}>
                      <Icon size={21} style={{ color: group.color }} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{group.proof}</span>
                  </div>
                  <h3 className="mt-7 text-2xl font-black text-white">{group.title}</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-white/10 bg-black/18 px-3 py-2 text-xs font-bold text-white/66">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="journey" className="developer-journey-section pf-container py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7dd3fc]">{t.templateUi.developer.timelineTitle}</p>
          <h2 className="mt-4 text-5xl font-black leading-none text-white">{t.templateUi.nav.journey}</h2>
        </div>
        <div className="developer-history-rail mt-12">
          {t.portfolio.timeline.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={cn("developer-history-item", index % 2 === 0 ? "developer-history-left" : "developer-history-right")}
            >
              <span className="developer-history-dot">{index + 1}</span>
              <div className="developer-history-card">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#2dd4bf]">
                  <Award size={15} />
                  {item.date} · {item.chapter}
                </div>
                <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{item.detail}</p>
                <div className="mt-4 rounded-2xl border border-[#2dd4bf]/18 bg-[#2dd4bf]/8 p-3 text-xs font-bold leading-5 text-[#ccfbf1]">
                  {item.learned}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="proofLab" className="pf-container pb-24">
        <div className="developer-proof-lab">
          <GitBranch className="text-[#9ff6ef]" />
          <div>
            <h2 className="text-3xl font-black text-white">{t.common.proof}</h2>
            <p className="mt-3 max-w-3xl text-white/64">{t.portfolio.availability}</p>
          </div>
          <a href="/onboarding?template=developer-signature" className="pf-focus inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#06101f]">
            {t.common.useTemplate}
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </TemplateShell>
  );
}
