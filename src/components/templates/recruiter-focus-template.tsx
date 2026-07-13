"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, ChevronDown, Download, FileText, Mail, MapPin, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { TemplateShell, cn } from "@/components/templates/template-shell";
import { fadeUp, panelEnter, sectionReveal, staggerChildren } from "@/lib/motion";

const sections = ["summary", "scan", "proof", "skills", "cv"] as const;

export function RecruiterFocusTemplate() {
  const { t } = useLocale();
  const [openProject, setOpenProject] = useState<string>(t.portfolio.projects[0]?.name ?? "");

  return (
    <TemplateShell templateId="recruiter-focus" sections={sections} tone="light">
      <section id="summary" className="pf-container recruiter-summary-stage grid gap-8 pb-14 pt-20 lg:grid-cols-[1.08fr_.92fr]">
        <motion.div initial="hidden" animate="visible" variants={staggerChildren(0.08)}>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            <p className="inline-flex rounded-xl border border-[#0f766e]/20 bg-[#0f766e]/8 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#0f766e]">
              {t.templates["recruiter-focus"].name}
            </p>
            <p className="inline-flex rounded-xl border border-[#172033]/10 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#475569]">
              {t.templateUi.recruiter.recruiterOnly}
            </p>
          </motion.div>
          <motion.h1 variants={fadeUp} className="mt-5 text-5xl font-black tracking-tight text-[#172033] sm:text-7xl">
            {t.portfolio.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-2xl font-black text-[#0f766e]">
            {t.portfolio.targetRole}
          </motion.p>
          <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-lg leading-8 text-[#475569]">
            {t.portfolio.summary}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-[#475569]">
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-3 py-2">
              <MapPin size={16} />
              {t.portfolio.location}
            </span>
            <span className="rounded-xl border border-[#dbe4f0] bg-white px-3 py-2">{t.portfolio.availability}</span>
          </motion.div>
        </motion.div>

        <motion.aside
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="recruiter-contact-card rounded-3xl border border-[#dbe4f0] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,.08)] print:break-inside-avoid print:shadow-none"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">{t.templateUi.recruiter.contactPath}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {t.portfolio.metrics.slice(0, 4).map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
                <div className="text-3xl font-black text-[#172033]">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#64748b]">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#475569]">{t.portfolio.email}</p>
          <div className="mt-4 grid gap-2">
            {[t.recruiter.role, t.recruiter.availability, t.recruiter.target].map((item) => (
              <a
                key={item}
                href="#scan"
                className="pf-focus rounded-xl border border-[#dbe4f0] bg-[#f8fafc] px-3 py-2 text-sm font-bold text-[#475569] transition hover:border-[#0f766e]/30 hover:text-[#0f766e]"
              >
                {item}
              </a>
            ))}
          </div>
          <a
            href={`mailto:${t.portfolio.email}`}
            className="pf-focus mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-black text-white"
          >
            <Mail size={16} />
            {t.recruiter.contact}
          </a>
        </motion.aside>
      </section>

      <section id="scan" className="border-y border-[#dbe4f0] bg-white/76 py-14">
        <div className="pf-container">
          <motion.h2 {...sectionReveal} className="text-3xl font-black text-[#172033]">
            {t.templateUi.recruiter.scanTitle}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerChildren(0.06)}
            className="mt-7 grid gap-3 md:grid-cols-5"
          >
            {t.portfolio.scanSteps.map((step, index) => (
              <motion.a
                key={step}
                variants={fadeUp}
                href={index < 3 ? "#proof" : index === 3 ? "#skills" : "#cv"}
                className="pf-focus rounded-3xl border border-[#dbe4f0] bg-white p-4 transition hover:-translate-y-1 hover:border-[#0f766e]/35 print:break-inside-avoid"
              >
                <BadgeCheck size={18} className="text-[#0f766e]" />
                <div className="mt-4 text-lg font-black text-[#172033]">{step}</div>
                <div className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">{index + 1}/5</div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="proof" className="pf-container grid gap-8 py-14 lg:grid-cols-[.75fr_1.25fr]">
        <motion.div {...sectionReveal}>
          <h2 className="text-3xl font-black text-[#172033]">{t.templateUi.recruiter.topProof}</h2>
          <p className="mt-3 leading-7 text-[#64748b]">{t.common.proof}</p>
          <div className="mt-5 rounded-3xl border border-[#dbe4f0] bg-white p-5 print:break-inside-avoid">
            <ShieldCheck className="text-[#0f766e]" />
            <p className="mt-3 text-sm font-bold leading-6 text-[#475569]">{t.recruiter.summary}</p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerChildren(0.08)}
          className="space-y-3"
        >
          {t.portfolio.projects.slice(0, 3).map((project) => {
            const expanded = openProject === project.name;
            return (
              <motion.button
                key={project.name}
                variants={fadeUp}
                type="button"
                onClick={() => setOpenProject(expanded ? "" : project.name)}
                aria-expanded={expanded}
                className="pf-focus w-full rounded-3xl border border-[#dbe4f0] bg-white p-5 text-left text-[#172033] shadow-[0_18px_50px_rgba(15,23,42,.06)] print:break-inside-avoid print:shadow-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black">{project.name}</h3>
                    <p className="mt-2 text-sm font-bold text-[#0f766e]">{project.impact}</p>
                  </div>
                  <ChevronDown className={cn("shrink-0 text-[#64748b] transition-transform duration-200", expanded && "rotate-180")} size={20} />
                </div>
                <div className="mt-4 rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-3 text-sm font-bold text-[#475569]">
                  {project.proof}
                </div>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.p
                      key="detail"
                      variants={panelEnter}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-4 text-sm leading-6 text-[#475569]"
                    >
                      {project.detail}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      <section id="skills" className="pf-container grid gap-6 py-14 lg:grid-cols-[1fr_1fr]">
        <motion.div {...sectionReveal} className="rounded-3xl border border-[#dbe4f0] bg-white p-6 text-[#172033] print:break-inside-avoid">
          <h2 className="text-3xl font-black">{t.templateUi.recruiter.skillClusters}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {t.portfolio.skills.map(([skill, value]) => (
              <div key={skill} className="rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
                <div className="text-lg font-black">{skill}</div>
                <div className="mt-2 h-2 rounded-md bg-[#e2e8f0] print:border print:border-[#172033]/20">
                  <div className="h-2 rounded-md bg-[#0f766e]" style={{ width: `${value}%` }} />
                </div>
                <div className="mt-2 text-sm text-[#64748b]">
                  {value}% · {t.common.proof}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...sectionReveal} className="rounded-3xl border border-[#dbe4f0] bg-white p-6 text-[#172033] print:break-inside-avoid">
          <h2 className="text-3xl font-black">{t.heroPreview.certificates}</h2>
          <div className="mt-6 space-y-3">
            {t.portfolio.certificates.map((certificate) => (
              <div key={certificate} className="flex items-center justify-between rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4">
                <span className="text-sm font-black">{certificate}</span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e]/10 px-3 py-2 text-xs font-black text-[#0f766e]">
                  <BadgeCheck size={14} />
                  {t.common.published}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="cv" className="pf-container grid gap-6 pb-20 lg:grid-cols-[1fr_340px]">
        <motion.div {...sectionReveal} className="rounded-3xl border border-[#dbe4f0] bg-white p-6 text-[#172033] print:break-inside-avoid">
          <h2 className="text-3xl font-black">{t.productStage.recruiter.title}</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[t.recruiter.role, t.recruiter.availability, t.recruiter.target].map((item) => (
              <div key={item} className="rounded-2xl border border-[#dbe4f0] bg-[#f8fafc] p-4 text-sm font-black text-[#172033]">
                {item}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.aside
          {...sectionReveal}
          className="rounded-3xl border border-[#dbe4f0] bg-[#172033] p-6 text-white print:break-inside-avoid print:border-[#172033]/20 print:bg-white print:text-[#172033]"
        >
          <MonitorSmartphone className="text-[#67e8a5] print:text-[#0f766e]" />
          <h2 className="mt-4 text-2xl font-black">{t.templateUi.recruiter.cvPreview}</h2>
          <p className="mt-3 text-sm leading-6 text-white/62 print:text-[#475569]">{t.portfolio.summary}</p>
          <button
            type="button"
            onClick={() => window.print()}
            className="pf-focus print:hidden mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#172033] transition hover:bg-white/90"
          >
            <Download size={16} />
            {t.common.downloadCv}
          </button>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/62 print:hidden">
            <FileText size={14} />
            {t.templateUi.recruiter.downloadNote} · {t.common.draft}
          </div>
        </motion.aside>
      </section>
    </TemplateShell>
  );
}
