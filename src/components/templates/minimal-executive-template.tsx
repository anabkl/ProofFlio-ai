"use client";

import Link from "next/link";
import { BadgeCheck, Eye, Mail, Printer, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { fadeUp, sectionReveal, staggerChildren } from "@/lib/motion";

const sections = ["intro", "projects", "skills", "evidence", "contact"] as const;

export function MinimalExecutiveTemplate() {
  const { t } = useLocale();

  return (
    <TemplateShell templateId="minimal-executive" sections={sections} tone="light">
      <section id="intro" className="pf-container relative overflow-hidden grid gap-10 py-16 lg:grid-cols-[.92fr_1.08fr] lg:items-end">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-4 -top-10 select-none text-[9rem] font-black leading-none text-[#172033]/[0.04] sm:text-[13rem] print:hidden"
        >
          01
        </div>
        <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.08)} className="relative">
          <motion.p variants={fadeUp} className="text-xs font-black uppercase tracking-[0.24em] text-[#315dff]">
            {t.templates["minimal-executive"].name}
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-tight text-[#172033] sm:text-7xl">
            {t.portfolio.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-[#475569]">
            {t.portfolio.headline}
          </motion.p>
        </motion.div>
        <motion.aside
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="executive-card relative rounded-2xl border border-[#dbe4f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)] print:shadow-none"
        >
          <div className="flex items-center gap-3 text-sm font-black text-[#315dff]">
            <Target size={18} />
            {t.portfolio.targetRole}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#475569]">{t.portfolio.availability}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/demo" className="pf-focus inline-flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-4 py-3 text-sm font-black text-white">
              <Eye size={16} />
              {t.common.demo}
            </Link>
            <Link href={`mailto:${t.portfolio.email}`} className="pf-focus inline-flex items-center justify-center gap-2 rounded-xl border border-[#dbe4f0] px-4 py-3 text-sm font-black text-[#172033]">
              <Mail size={16} />
              {t.common.contact}
            </Link>
          </div>
        </motion.aside>
      </section>

      <motion.section {...sectionReveal} className="pf-container pb-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {t.portfolio.metrics.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-[#dbe4f0] bg-white p-5 text-[#172033] print:break-inside-avoid">
              <div className="text-4xl font-black">{value}</div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">{label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      <section id="projects" className="pf-container executive-workbench py-16">
        <motion.div {...sectionReveal} className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#315dff]">{t.common.proof}</p>
            <h2 className="mt-3 text-3xl font-black text-[#172033]">{t.templateUi.minimal.selectedWork}</h2>
          </div>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerChildren(0.08)}
          className="flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible"
        >
          {t.portfolio.projects.map((project, index) => (
            <motion.article
              key={project.name}
              variants={fadeUp}
              className="min-w-[286px] snap-start rounded-2xl border border-[#dbe4f0] bg-white p-5 text-[#172033] shadow-[0_18px_50px_rgba(15,23,42,.08)] print:break-inside-avoid print:shadow-none"
            >
              <div className="font-mono text-xs font-black text-[#315dff]">0{index + 1}</div>
              <h3 className="mt-4 text-xl font-black">{project.name}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">{project.signal}</p>
              <div className="mt-5 rounded-xl border border-[#dbe4f0] bg-[#f8fafc] p-3 text-sm font-black text-[#172033]">{project.impact}</div>
              <p className="mt-4 border-t border-dashed border-[#dbe4f0] pt-3 text-xs font-bold leading-5 text-[#64748b]">
                <span className="font-black uppercase tracking-[0.12em] text-[#315dff]">{t.common.proof}: </span>
                {project.proof}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section id="skills" className="pf-container grid gap-8 py-16 lg:grid-cols-[.8fr_1.2fr]">
        <motion.div {...sectionReveal}>
          <h2 className="text-3xl font-black text-[#172033]">{t.templateUi.minimal.skillSignal}</h2>
          <p className="mt-4 text-base leading-7 text-[#64748b]">{t.portfolio.summary}</p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerChildren(0.06)}
          className="space-y-5"
        >
          {t.portfolio.skills.map(([skill, value]) => (
            <motion.div key={skill} variants={fadeUp}>
              <div className="mb-2 flex items-center justify-between text-sm font-black text-[#172033]">
                <span>{skill}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2 rounded-md bg-[#e2e8f0] print:border print:border-[#172033]/20">
                <motion.div
                  className={cn("h-2 rounded-md bg-[#315dff]")}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="evidence" className="border-y border-[#dbe4f0] bg-white/62 py-16 print:bg-white">
        <div className="pf-container">
          <motion.div {...sectionReveal} className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#315dff]">{t.common.proof}</p>
              <h2 className="mt-3 text-3xl font-black text-[#172033]">{t.portfolio.targetRole}</h2>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="pf-focus print:hidden inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm font-black text-[#172033] transition hover:border-[#315dff]/40 hover:text-[#315dff]"
            >
              <Printer size={16} />
              {t.common.downloadCv}
            </button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerChildren(0.06)}
            className="grid gap-3 md:grid-cols-4"
          >
            {t.portfolio.certificates.map((certificate) => (
              <motion.div
                key={certificate}
                variants={fadeUp}
                className="rounded-2xl border border-[#dbe4f0] bg-white p-4 text-sm font-black text-[#172033] print:break-inside-avoid"
              >
                <BadgeCheck size={18} className="mb-3 text-[#315dff]" />
                {certificate}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            {...sectionReveal}
            className="mt-10 rounded-2xl border border-[#dbe4f0] bg-white p-6 sm:p-8 print:break-inside-avoid print:border-[#172033]/20"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#dbe4f0] pb-4">
              <h3 className="text-2xl font-black text-[#172033]">{t.portfolio.name}</h3>
              <p className="text-sm font-bold text-[#475569]">{t.portfolio.location}</p>
            </div>
            <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[#315dff]">{t.portfolio.targetRole}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#475569]">{t.portfolio.summary}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">{t.templateUi.minimal.skillSignal}</p>
                <p className="mt-2 text-sm leading-6 text-[#172033]">{t.portfolio.skills.map(([skill]) => skill).join(" · ")}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">{t.common.proof}</p>
                <p className="mt-2 text-sm leading-6 text-[#172033]">{t.portfolio.certificates.join(" · ")}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#dbe4f0] pt-4 text-sm font-bold text-[#475569]">
              <span>{t.portfolio.email}</span>
              <span>{t.portfolio.availability}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section id="contact" {...sectionReveal} className="pf-container py-16">
        <div className="rounded-2xl border border-[#dbe4f0] bg-[#172033] p-8 text-white print:border-[#172033]/20 print:bg-white print:text-[#172033]">
          <p className="text-sm font-bold text-white/62 print:text-[#475569]">{t.portfolio.location}</p>
          <h2 className="mt-3 text-3xl font-black">{t.portfolio.availability}</h2>
          <p className="mt-4 text-white/66 print:text-[#475569]">{t.portfolio.email}</p>
        </div>
      </motion.section>
    </TemplateShell>
  );
}
