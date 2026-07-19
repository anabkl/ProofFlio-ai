"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  Cpu,
  GraduationCap,
  Mail,
  MapPin,
  Radar,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { isImmersiveSceneSupported } from "@/components/templates/signal-os-scene";
import type { Copy } from "@/lib/content";

const SignalOsScene = dynamic(() => import("@/components/templates/signal-os-scene"), { ssr: false });

const sections = ["intro", "signals", "architecture", "projects", "experience", "education", "contact"] as const;

type EvidenceTone = "teal" | "amber" | "red" | "muted";

function evidenceTone(status: string, t: Copy): EvidenceTone {
  if (status === t.evidenceStates.verified || status === t.evidenceStates.approved) {
    return "teal";
  }
  if (status === t.evidenceStates.draft) {
    return "amber";
  }
  if (status === t.evidenceStates.private) {
    return "red";
  }
  return "muted";
}

const toneClass: Record<EvidenceTone, string> = {
  teal: "border-[#2dd4bf]/35 bg-[#2dd4bf]/10 text-[#99f6ec]",
  amber: "border-[#f59e0b]/35 bg-[#f59e0b]/10 text-[#fcd34d]",
  red: "border-[#ef4444]/35 bg-[#ef4444]/10 text-[#fca5a5]",
  muted: "border-white/15 bg-white/[0.06] text-white/62",
};

function StatusBadge({ status, t }: { status: string; t: Copy }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]", toneClass[evidenceTone(status, t)])}>
      <BadgeCheck size={11} />
      {status}
    </span>
  );
}

function StaticSignalMap() {
  const nodes = [
    { x: 18, y: 24 }, { x: 74, y: 14 }, { x: 50, y: 52 }, { x: 12, y: 78 }, { x: 82, y: 70 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-hidden="true">
      {nodes.map((node, index) => {
        const next = nodes[(index + 1) % nodes.length];
        return (
          <line
            key={index}
            x1={node.x}
            y1={node.y}
            x2={next.x}
            y2={next.y}
            stroke="rgba(34,211,238,0.35)"
            strokeWidth={0.4}
          />
        );
      })}
      {nodes.map((node, index) => (
        <circle key={index} cx={node.x} cy={node.y} r={2.2} fill={index % 2 === 0 ? "#22d3ee" : "#7757ff"} />
      ))}
    </svg>
  );
}

export function SignalOsTemplate() {
  const { t } = useLocale();
  const s = t.signalOs;
  const [mode, setMode] = useState<"immersive" | "recruiter">("recruiter");
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("prooffolio-signal-os-mode");
      if (stored === "immersive" || stored === "recruiter") {
        setMode(stored);
      }
      setSceneReady(isImmersiveSceneSupported());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function selectMode(next: "immersive" | "recruiter") {
    setMode(next);
    window.localStorage.setItem("prooffolio-signal-os-mode", next);
  }

  const immersive = mode === "immersive";

  return (
    <TemplateShell templateId="signal-os" sections={sections} tone="dark">
      <section id="intro" className="pf-container relative overflow-hidden pb-16 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 rounded-xl border border-[#22d3ee]/35 bg-[#22d3ee]/8 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#8ff0f7]">
            <Radar size={14} />
            {t.templates["signal-os"].name}
          </p>
          <div role="radiogroup" aria-label="Mode" className="inline-flex rounded-xl border border-white/12 bg-white/6 p-1">
            {(["immersive", "recruiter"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => selectMode(value)}
                className={cn(
                  "pf-focus rounded-lg px-3 py-2 text-xs font-black uppercase tracking-[0.1em] transition",
                  mode === value ? "bg-[#22d3ee] text-[#04141a]" : "text-white/62 hover:text-white",
                )}
              >
                {s.modes[value]}
              </button>
            ))}
          </div>
        </div>

        <h1 className="mt-8 text-5xl font-black tracking-tight text-white sm:text-7xl">{s.name}</h1>
        <p className="mt-3 text-2xl font-black text-[#8ff0f7]">{s.role}</p>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">{s.headline}</p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/54">
          {immersive ? s.modes.immersiveHint : s.modes.recruiterHint}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-white/72">
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2">
            <MapPin size={15} />
            {s.location}
          </span>
          <span className="rounded-xl border border-white/12 bg-white/6 px-3 py-2">{s.availability}</span>
        </div>

        <div className="relative mt-10 h-72 overflow-hidden rounded-3xl border border-white/10 bg-black/30 sm:h-96">
          <StaticSignalMap />
          {immersive && sceneReady ? (
            <div className="hidden lg:block">
              <SignalOsScene />
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {s.metrics.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/54">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="signals" className="border-y border-white/10 bg-black/25 py-16">
        <div className="pf-container">
          <h2 className="text-3xl font-black text-white">{t.templateUi.nav.signals}</h2>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {s.domains.map((domain) => (
              <span key={domain} className="rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2 text-sm font-bold text-white/80">
                {domain}
              </span>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {s.skills.map(([skill, value]) => (
              <div key={skill} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between text-sm font-black text-white">
                  <span>{skill}</span>
                  <span>{value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-md bg-white/10">
                  <div className="h-2 rounded-md bg-[#22d3ee]" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="pf-container py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-black text-white">{s.caseStudy.name}</h2>
          <StatusBadge status={s.caseStudy.status} t={t} />
        </div>
        <p className="mt-2 text-lg font-bold text-[#8ff0f7]">{s.caseStudy.tag}</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Problem</p>
              <p className="mt-2 text-sm leading-6 text-white/78">{s.caseStudy.problem}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Approach</p>
              <p className="mt-2 text-sm leading-6 text-white/78">{s.caseStudy.approach}</p>
            </div>
            <div className="rounded-2xl border border-[#2dd4bf]/25 bg-[#2dd4bf]/8 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#99f6ec]">Outcome</p>
              <p className="mt-2 text-sm leading-6 text-white/85">{s.caseStudy.outcome}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
              <Waypoints size={14} />
              {s.architectureLabel}
            </p>
            <div className="mt-4 space-y-2.5">
              {s.caseStudy.architecture.map((stage, index) => (
                <div key={stage} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#22d3ee]/15 text-[10px] font-black text-[#8ff0f7]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-white/80">{stage}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.caseStudy.stack.map((item) => (
                <span key={item} className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-white/62">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="border-y border-white/10 bg-black/25 py-16">
        <div className="pf-container">
          <h2 className="text-3xl font-black text-white">{t.templateUi.nav.projects}</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {s.projects.map((project) => (
              <div key={project.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{project.name}</h3>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/45">{project.category}</p>
                  </div>
                  <Cpu size={18} className="shrink-0 text-white/40" />
                </div>
                <p className="mt-3 text-sm font-bold text-[#8ff0f7]">{project.signal}</p>
                <p className="mt-3 text-sm leading-6 text-white/68">{project.detail}</p>
                <div className="mt-4">
                  <StatusBadge status={project.status} t={t} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="pf-container py-16">
        <h2 className="text-3xl font-black text-white">{t.templateUi.nav.experience}</h2>
        <div className="mt-7 space-y-3">
          {s.experience.map((item) => (
            <div key={item.role} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-black text-white">{item.role}</h3>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{item.period}</span>
              </div>
              <p className="mt-1 text-sm font-bold text-[#8ff0f7]">{item.org}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="education" className="border-y border-white/10 bg-black/25 py-16">
        <div className="pf-container grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-white">
              <GraduationCap size={20} className="text-[#8ff0f7]" />
              {t.templateUi.nav.education}
            </h2>
            <div className="mt-5 space-y-3">
              {s.education.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-black text-white">{item.title}</p>
                  <p className="mt-1 text-sm font-bold text-white/60">{item.org} · {item.period}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-black text-white">
              <Award size={20} className="text-[#8ff0f7]" />
              {t.heroPreview.certificates}
            </h2>
            <div className="mt-5 space-y-2.5">
              {s.certifications.map((certificate) => (
                <div key={certificate} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                  <span className="text-sm font-bold text-white/82">{certificate}</span>
                  <ShieldCheck size={16} className="text-[#2dd4bf]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="pf-container py-16">
        <div className="rounded-3xl border border-[#22d3ee]/25 bg-[#22d3ee]/8 p-8 text-center sm:p-12">
          <p className="text-sm font-bold text-white/80">{s.availability}</p>
          <a
            href={`mailto:${s.email}`}
            className="pf-focus mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#04141a] transition hover:bg-[#8ff0f7]"
          >
            <Mail size={16} />
            {s.contact}
          </a>
        </div>
      </section>
    </TemplateShell>
  );
}
