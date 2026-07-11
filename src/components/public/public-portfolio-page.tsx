"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Clock3, ExternalLink, FolderGit2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { WorkspaceHeader } from "@/components/workspace-header";
import { templateMeta, type TemplateId } from "@/lib/content";
import type { PublicPortfolioData } from "@/lib/public-portfolios";

export function PublicPortfolioPage({ portfolio }: { portfolio: PublicPortfolioData }) {
  const { t } = useLocale();
  const selectedTemplateId = (portfolio.selectedTemplateId in templateMeta
    ? portfolio.selectedTemplateId
    : "developer-signature") as TemplateId;
  const template = templateMeta[selectedTemplateId];
  const lightTemplate = ["minimal-executive", "creative-grid", "recruiter-focus", "career-chronicle"].includes(
    selectedTemplateId,
  );
  const accent = portfolio.designSettings.accent;
  const surfaceClass = lightTemplate
    ? "bg-[#f6f8fc] text-[#172033]"
    : "bg-[#040813] text-white";
  const mutedText = lightTemplate ? "text-[#526077]" : "text-white/62";
  const borderClass = lightTemplate ? "border-[#172033]/10" : "border-white/10";
  const softSurface = lightTemplate ? "bg-white/78" : "bg-white/[0.05]";
  const projects = portfolio.projects.slice(0, 3);

  return (
    <div className={`min-h-screen overflow-x-hidden ${surfaceClass}`}>
      <WorkspaceHeader contextLabel={t.publicPortfolio.kicker} />
      <main id="main-content">
        <section className={`relative overflow-hidden border-b ${borderClass}`}>
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background: lightTemplate
                ? `radial-gradient(circle at 10% 0%, ${accent}18, transparent 34%), linear-gradient(180deg, rgba(255,255,255,.92), rgba(246,248,252,1))`
                : `radial-gradient(circle at 14% 0%, ${accent}26, transparent 30%), linear-gradient(180deg, rgba(4,8,19,.96), rgba(4,8,19,1))`,
            }}
          />
          <div className="pf-container relative z-10 py-10 sm:py-14">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div className="min-w-0">
                <div className={`inline-flex flex-wrap items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${borderClass} ${softSurface}`}>
                  <BadgeCheck size={13} style={{ color: accent }} />
                  <span>{t.publicPortfolio.evidenceBacked}</span>
                  {portfolio.previewMode ? <span className={mutedText}>{t.publicPortfolio.previewMode}</span> : null}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className={`rounded-md border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${borderClass} ${softSurface}`}>
                    {portfolio.displayName}
                  </span>
                  <span className={`rounded-md border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${borderClass} ${softSurface}`}>
                    {template.className.replace("template-", "").replace(/-/g, " ")}
                  </span>
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl">
                  {portfolio.title}
                </h1>
                <p className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${mutedText}`}>
                  {portfolio.headline || t.publicPortfolio.headlineFallback}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <div className={`rounded-xl border px-4 py-3 ${borderClass} ${softSurface}`}>
                    <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{t.publicPortfolio.targetRole}</div>
                    <div className="mt-2 text-sm font-black">{portfolio.profileSettings.targetRole || t.publicPortfolio.targetRoleFallback}</div>
                  </div>
                  <div className={`rounded-xl border px-4 py-3 ${borderClass} ${softSurface}`}>
                    <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{t.publicPortfolio.availability}</div>
                    <div className="mt-2 text-sm font-black">{portfolio.profileSettings.availability || t.publicPortfolio.availabilityFallback}</div>
                  </div>
                  <div className={`rounded-xl border px-4 py-3 ${borderClass} ${softSurface}`}>
                    <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{t.publicPortfolio.verifiedEvidence}</div>
                    <div className="mt-2 text-sm font-black">{portfolio.proofCount}</div>
                  </div>
                </div>
              </div>

              <aside className={`rounded-2xl border p-5 ${borderClass} ${softSurface}`} data-testid="recruiter-scan-panel">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accent }}>
                  <ShieldCheck size={15} />
                  {t.publicPortfolio.recruiterScan}
                </div>
                <div className="mt-5 grid gap-4">
                  <Metric icon={BriefcaseBusiness} label={t.publicPortfolio.targetRole} value={portfolio.profileSettings.targetRole || t.publicPortfolio.targetRoleFallback} mutedText={mutedText} iconClass={lightTemplate ? "border-[#172033]/10 text-[#526077]" : "border-white/10 text-white/62"} />
                  <Metric icon={Clock3} label={t.publicPortfolio.availability} value={portfolio.profileSettings.availability || t.publicPortfolio.availabilityFallback} mutedText={mutedText} iconClass={lightTemplate ? "border-[#172033]/10 text-[#526077]" : "border-white/10 text-white/62"} />
                  <Metric icon={BadgeCheck} label={t.publicPortfolio.verifiedEvidence} value={`${portfolio.proofCount}`} mutedText={mutedText} iconClass={lightTemplate ? "border-[#172033]/10 text-[#526077]" : "border-white/10 text-white/62"} />
                </div>
                <div className={`mt-5 rounded-xl border p-4 ${borderClass}`}>
                  <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{t.publicPortfolio.topProjects}</div>
                  <div className="mt-3 grid gap-2">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <div key={project.id} className={`rounded-lg border px-3 py-3 ${borderClass}`}>
                          <div className="text-sm font-black">{project.title}</div>
                          <div className={`mt-1 text-xs leading-5 ${mutedText}`}>{project.sourceType === "github_repository" ? t.publicPortfolio.sourceBadges.github : t.publicPortfolio.sourceBadges.manualProject}</div>
                        </div>
                      ))
                    ) : (
                      <div className={`rounded-lg border border-dashed px-3 py-4 text-sm ${mutedText}`}>{t.publicPortfolio.noProjects}</div>
                    )}
                  </div>
                </div>
                <div className={`mt-5 flex items-center justify-between rounded-xl border p-4 ${borderClass}`}>
                  <div>
                    <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{t.publicPortfolio.contact}</div>
                    <div className="mt-1 text-sm font-black">{t.publicPortfolio.contactPlaceholder}</div>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: `${accent}18`, color: accent }}>
                    <Mail size={18} />
                  </span>
                </div>
                <p className={`mt-4 text-xs leading-5 ${mutedText}`}>{t.publicPortfolio.cvPrivacy}</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="pf-container py-8 sm:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section className={`rounded-2xl border p-5 sm:p-6 ${borderClass} ${softSurface}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black">{t.publicPortfolio.projectsTitle}</h2>
                    <p className={`mt-2 text-sm leading-6 ${mutedText}`}>{t.publicPortfolio.projectsBody}</p>
                  </div>
                  <div className={`rounded-md border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${borderClass}`}>
                    {portfolio.projects.length} {t.publicPortfolio.sourceLinkedProjects}
                  </div>
                </div>
                <div className="mt-6 grid gap-4">
                  {portfolio.projects.length > 0 ? (
                    portfolio.projects.map((project) => (
                      <article key={project.id} className={`rounded-xl border p-4 sm:p-5 ${borderClass}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <SourceBadge
                            label={
                              project.sourceType === "github_repository"
                                ? t.publicPortfolio.sourceBadges.github
                                : t.publicPortfolio.sourceBadges.manualProject
                            }
                            accent={accent}
                          />
                          <span className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>
                            {t.publicPortfolio.userApproved}
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-black">{project.title}</h3>
                        <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{project.summary}</p>
                        {project.technologies.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.technologies.map((technology) => (
                              <span key={technology} className={`rounded-md border px-2 py-1 text-[11px] font-black ${borderClass}`}>
                                {technology}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className={`mt-4 rounded-xl border p-4 ${borderClass}`}>
                          <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{t.publicPortfolio.proofContext}</div>
                          <p className="mt-2 text-sm font-semibold leading-6">{project.proofContext}</p>
                        </div>
                        {(project.repositoryUrl || project.liveDemoUrl) ? (
                          <div className="mt-4 flex flex-wrap gap-4 text-sm font-black">
                            {project.repositoryUrl ? (
                              <a className="pf-focus inline-flex items-center gap-2" href={project.repositoryUrl} target="_blank" rel="noreferrer">
                                <FolderGit2 size={16} />
                                {t.publicPortfolio.repository}
                                <ArrowUpRight size={14} />
                              </a>
                            ) : null}
                            {project.liveDemoUrl ? (
                              <a className="pf-focus inline-flex items-center gap-2" href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                                <ExternalLink size={16} />
                                {t.publicPortfolio.liveDemo}
                                <ArrowUpRight size={14} />
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    ))
                  ) : (
                    <div className={`rounded-xl border border-dashed p-5 text-sm ${mutedText}`}>{t.publicPortfolio.noProjects}</div>
                  )}
                </div>
              </section>

              <section className={`rounded-2xl border p-5 sm:p-6 ${borderClass} ${softSurface}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black">{t.publicPortfolio.evidenceTitle}</h2>
                    <p className={`mt-2 text-sm leading-6 ${mutedText}`}>{t.publicPortfolio.evidenceBody}</p>
                  </div>
                  <span className={`rounded-md border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${borderClass}`}>
                    {portfolio.evidence.length} {t.publicPortfolio.verifiedEvidence}
                  </span>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {portfolio.evidence.length > 0 ? (
                    portfolio.evidence.map((item) => (
                      <article key={item.id} className={`rounded-xl border p-4 ${borderClass}`}>
                        <SourceBadge label={sourceBadgeLabel(item.sourceType, t.publicPortfolio.sourceBadges)} accent={accent} />
                        <div className="mt-3 text-lg font-black">{item.title}</div>
                        <p className={`mt-2 text-sm leading-6 ${mutedText}`}>{item.description}</p>
                        <p className={`mt-3 rounded-lg border p-3 text-sm leading-6 ${borderClass}`}>{item.proofContext}</p>
                      </article>
                    ))
                  ) : (
                    <div className={`rounded-xl border border-dashed p-5 text-sm ${mutedText}`}>{t.publicPortfolio.noEvidence}</div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className={`rounded-2xl border p-5 ${borderClass} ${softSurface}`}>
                <div className="flex items-center gap-2 text-sm font-black">
                  <BadgeCheck size={16} style={{ color: accent }} />
                  {t.publicPortfolio.proofStatus}
                </div>
                <div className="mt-4 grid gap-3">
                  <StatusRow label={t.publicPortfolio.evidenceBacked} value={portfolio.proofCount > 0 ? t.publicPortfolio.visible : t.publicPortfolio.hidden} mutedText={mutedText} />
                  <StatusRow label={t.publicPortfolio.userApproved} value={t.publicPortfolio.visible} mutedText={mutedText} />
                  <StatusRow label={t.publicPortfolio.privateFiles} value={t.publicPortfolio.protected} mutedText={mutedText} />
                  <StatusRow label={t.publicPortfolio.publishedStatus} value={portfolio.previewMode ? t.publicPortfolio.previewMode : t.common.published} mutedText={mutedText} />
                </div>
              </section>

              <section className={`rounded-2xl border p-5 ${borderClass} ${softSurface}`}>
                <div className="flex items-center gap-2 text-sm font-black">
                  <LockKeyhole size={16} />
                  {t.publicPortfolio.recruiterNote}
                </div>
                <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{t.publicPortfolio.recruiterBody}</p>
                <Link href="/editor" className="pf-focus mt-4 inline-flex items-center gap-2 text-sm font-black" style={{ color: accent }}>
                  {t.nav.editor}
                  <ArrowUpRight size={14} />
                </Link>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  mutedText,
  iconClass,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  mutedText: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${iconClass}`}>
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>{label}</div>
        <div className="mt-1 text-sm font-black">{value}</div>
      </div>
    </div>
  );
}

function SourceBadge({ label, accent }: { label: string; accent: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ backgroundColor: `${accent}16`, color: accent }}>
      <BadgeCheck size={12} />
      {label}
    </span>
  );
}

function StatusRow({ label, value, mutedText }: { label: string; value: string; mutedText: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={mutedText}>{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function sourceBadgeLabel(
  sourceType: PublicPortfolioData["evidence"][number]["sourceType"],
  labels: {
    cv: string;
    certificate: string;
    manualProject: string;
    github: string;
  },
) {
  if (sourceType === "cv") {
    return labels.cv;
  }

  if (sourceType === "certificate") {
    return labels.certificate;
  }

  return labels.github;
}
