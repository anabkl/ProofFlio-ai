import { ArrowUpRight, BadgeCheck, FileBadge2, FolderGit2, LockKeyhole } from "lucide-react";
import { templateMeta, type Copy } from "@/lib/content";
import type {
  EditorEvidenceItem,
  EditorPortfolio,
  EditorProject,
  EditorSectionId,
} from "@/lib/editor/types";

export function EditorPreview({
  portfolio,
  projects,
  evidenceItems,
  compact,
  t,
}: {
  portfolio: EditorPortfolio;
  projects: EditorProject[];
  evidenceItems: EditorEvidenceItem[];
  compact: boolean;
  t: Copy;
}) {
  const { designSettings, profileSettings } = portfolio;
  const lightTemplate = ["minimal-executive", "creative-grid", "recruiter-focus", "career-chronicle"].includes(
    portfolio.selectedTemplateId,
  );
  const approvedEvidence = evidenceItems.filter((item) => item.approvedForPortfolio);
  const spacingClass = designSettings.spacing === "compact" ? "gap-4" : designSettings.spacing === "airy" ? "gap-9" : "gap-6";
  const typographyClass =
    designSettings.typography === "editorial"
      ? "font-serif"
      : designSettings.typography === "compact"
        ? "font-mono"
        : "font-sans";
  const projectGridClass =
    compact || designSettings.layout === "narrative" || designSettings.projectDisplay === "repository-feed"
      ? "grid-cols-1"
      : designSettings.layout === "snapshot"
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";
  const mutedText = lightTemplate ? "text-[#526077]" : "text-white/62";
  const softBorder = lightTemplate ? "border-[#172033]/12" : "border-white/12";
  const softSurface = lightTemplate ? "bg-white/68" : "bg-white/[0.055]";
  const motionClass =
    designSettings.motion === "expressive"
      ? "motion-safe:animate-[soft-reveal_600ms_cubic-bezier(.2,.8,.2,1)_both]"
      : designSettings.motion === "refined"
        ? "transition-shadow duration-300 motion-reduce:transition-none"
        : "";
  const projectCardClass =
    designSettings.projectDisplay === "evidence-cards"
      ? "border-l-4"
      : designSettings.projectDisplay === "repository-feed"
        ? "sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-5"
        : "";

  return (
    <article
      data-testid="editor-live-preview"
      data-template={portfolio.selectedTemplateId}
      className={`${templateMeta[portfolio.selectedTemplateId].className} ${typographyClass} ${motionClass} relative min-w-0 overflow-hidden rounded-lg border ${softBorder} p-5 shadow-[0_28px_90px_rgba(0,0,0,.24)] sm:p-7`}
      style={{ "--editor-accent": designSettings.accent } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${designSettings.accent}, transparent)` }}
      />
      <div className={`relative flex flex-col ${spacingClass}`}>
        <header className="border-b border-current/10 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] ${mutedText}`}>
              <LockKeyhole size={13} aria-hidden="true" />
              {t.editor.preview.privateDraft}
            </span>
            <span className={`text-[11px] font-black uppercase tracking-[0.14em] ${mutedText}`}>
              {t.templates[portfolio.selectedTemplateId].name}
            </span>
          </div>
          <div className="mt-8 max-w-3xl">
            <div className={`text-xs font-black uppercase tracking-[0.18em] ${mutedText}`}>{portfolio.displayName}</div>
            <h2 className={`${compact ? "text-3xl" : "text-4xl sm:text-5xl"} mt-3 font-black leading-[1.08]`}>
              {portfolio.title}
            </h2>
            <p className={`mt-4 max-w-2xl text-sm font-semibold leading-7 sm:text-base ${mutedText}`}>
              {profileSettings.headline || t.editor.preview.headlineFallback}
            </p>
          </div>
          <nav className="mt-7 flex flex-wrap gap-2" aria-label={t.editor.preview.structureLabel}>
            {profileSettings.sectionOrder
              .filter((section) => profileSettings.sectionVisibility[section])
              .map((section) => (
                <span
                  key={section}
                  className={`rounded-md border ${softBorder} ${softSurface} px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em]`}
                >
                  {sectionLabel(section, t)}
                </span>
              ))}
          </nav>
        </header>

        {profileSettings.sectionOrder.map((section) => {
          if (!profileSettings.sectionVisibility[section]) {
            return null;
          }

          if (section === "projects") {
            return (
              <PreviewSection key={section} title={t.editor.preview.projectsTitle} count={projects.length} mutedText={mutedText}>
                {projects.length > 0 ? (
                  <div className={`grid ${projectGridClass} gap-3`}>
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className={`rounded-lg border ${softBorder} ${softSurface} ${projectCardClass} p-4 sm:p-5`}
                        style={designSettings.projectDisplay === "evidence-cards" ? { borderLeftColor: designSettings.accent } : undefined}
                      >
                        <div>
                          <SourceBadge label={t.editor.sourceBadges.manualProject} color={designSettings.accent} />
                          <h3 className="mt-4 text-lg font-black leading-snug">{project.title}</h3>
                          <p className={`mt-2 text-sm leading-6 ${mutedText}`}>{project.summary}</p>
                          {project.technologies.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {project.technologies.map((technology) => (
                                <span key={technology} className={`rounded-md border ${softBorder} px-2 py-1 text-[10px] font-black`}>
                                  {technology}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {project.repositoryUrl || project.liveDemoUrl ? (
                          <div className={`mt-4 flex flex-wrap gap-3 text-xs font-black ${designSettings.projectDisplay === "repository-feed" ? "sm:mt-0 sm:justify-end" : ""}`}>
                            {project.repositoryUrl ? (
                              <a className="pf-focus inline-flex items-center gap-1" href={project.repositoryUrl} target="_blank" rel="noreferrer">
                                {t.editor.preview.repository}
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </a>
                            ) : null}
                            {project.liveDemoUrl ? (
                              <a className="pf-focus inline-flex items-center gap-1" href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                                {t.editor.preview.liveDemo}
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPreviewState label={t.editor.preview.noApprovedProjects} mutedText={mutedText} />
                )}
              </PreviewSection>
            );
          }

          const items = approvedEvidence.filter((item) =>
            section === "certificates" ? item.sourceType === "certificate" : item.sourceType !== "certificate" && item.sourceType !== "manual_project",
          );

          return (
            <PreviewSection
              key={section}
              title={section === "certificates" ? t.editor.preview.certificatesTitle : t.editor.preview.evidenceTitle}
              count={items.length}
              mutedText={mutedText}
            >
              {items.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.id} className={`rounded-lg border ${softBorder} ${softSurface} p-4`}>
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md" style={{ backgroundColor: `${designSettings.accent}22`, color: designSettings.accent }}>
                          {item.sourceType === "certificate" ? <FileBadge2 size={17} /> : <BadgeCheck size={17} />}
                        </span>
                        <div className="min-w-0">
                          <SourceBadge label={sourceLabel(item.sourceType, t)} color={designSettings.accent} />
                          <div className="mt-2 break-words text-sm font-black">{item.title}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyPreviewState label={t.editor.preview.noApprovedEvidence} mutedText={mutedText} />
              )}
            </PreviewSection>
          );
        })}

        <footer className={`flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-4 text-[11px] font-black uppercase tracking-[0.14em] ${mutedText}`}>
          <span className="inline-flex items-center gap-2">
            <BadgeCheck size={14} style={{ color: designSettings.accent }} aria-hidden="true" />
            {t.editor.preview.approvedOnly}
          </span>
          <span className="inline-flex items-center gap-2">
            <FolderGit2 size={14} aria-hidden="true" />
            {projects.length} {t.editor.preview.projectCount}
          </span>
        </footer>
      </div>
    </article>
  );
}

function PreviewSection({
  title,
  count,
  mutedText,
  children,
}: {
  title: string;
  count: number;
  mutedText: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.14em]">{title}</h3>
        <span className={`text-xs font-black ${mutedText}`}>{count.toString().padStart(2, "0")}</span>
      </div>
      {children}
    </section>
  );
}

function SourceBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.13em]" style={{ color }}>
      <BadgeCheck size={12} aria-hidden="true" />
      {label}
    </span>
  );
}

function EmptyPreviewState({ label, mutedText }: { label: string; mutedText: string }) {
  return <div className={`rounded-lg border border-dashed border-current/15 px-4 py-7 text-center text-sm font-semibold ${mutedText}`}>{label}</div>;
}

function sectionLabel(section: EditorSectionId, t: Copy) {
  return t.editor.structure.sections[section];
}

function sourceLabel(source: EditorEvidenceItem["sourceType"], t: Copy) {
  if (source === "certificate") {
    return t.editor.sourceBadges.certificate;
  }

  if (source === "cv") {
    return t.editor.sourceBadges.cv;
  }

  if (source === "github_placeholder") {
    return t.editor.sourceBadges.github;
  }

  return t.editor.sourceBadges.manualProject;
}
