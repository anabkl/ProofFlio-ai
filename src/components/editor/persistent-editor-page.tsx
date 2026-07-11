"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  ChevronDown,
  CircleDot,
  Eye,
  EyeOff,
  FileBadge2,
  FileText,
  FolderKanban,
  Gauge,
  Globe2,
  LayoutPanelTop,
  LoaderCircle,
  LockKeyhole,
  Monitor,
  Palette,
  RefreshCcw,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
  X,
} from "lucide-react";
import {
  saveEditorIdentityAction,
  saveEditorPublishSettingsAction,
  saveEditorPresentationAction,
  saveEditorProjectAction,
  publishPortfolioAction,
  unpublishPortfolioAction,
} from "@/app/editor/actions";
import { useLocale } from "@/components/locale-provider";
import { EditorPreview } from "@/components/editor/editor-preview";
import { WorkspaceHeader } from "@/components/workspace-header";
import { templateIds, type Copy } from "@/lib/content";
import {
  accentOptions,
  layoutOptions,
  motionOptions,
  projectDisplayOptions,
  spacingOptions,
  typographyOptions,
  type EditorDesignSettings,
  type EditorInitialState,
  type EditorPortfolio,
  type EditorProject,
  type EditorSectionId,
} from "@/lib/editor/types";

type SaveState = "preview" | "unsaved" | "saving" | "saved" | "failed";
type PreviewViewport = "desktop" | "mobile";

type RecoveryPayload = {
  identity?: { title: string; headline: string; targetRole: string; availability: string };
  projects?: Record<string, Pick<EditorProject, "title" | "summary" | "technologies" | "repositoryUrl" | "liveDemoUrl">>;
  updatedAt: string;
};

export function PersistentEditorPage({
  initialState,
  hideHeader = false,
}: {
  initialState: EditorInitialState;
  hideHeader?: boolean;
}) {
  const { t } = useLocale();

  if (initialState.mode === "setup_required" || initialState.mode === "denied" || initialState.mode === "error") {
    return <EditorUnavailable mode={initialState.mode} t={t} hideHeader={hideHeader} />;
  }

  return <EditorWorkspace initialState={initialState} hideHeader={hideHeader} />;
}

function EditorWorkspace({ initialState, hideHeader }: { initialState: EditorInitialState; hideHeader: boolean }) {
  const { locale, t } = useLocale();

  const [portfolio, setPortfolio] = useState(initialState.portfolio);
  const [projects, setProjects] = useState(initialState.projects);
  const [saveState, setSaveState] = useState<SaveState>(initialState.canPersist ? "saved" : "preview");
  const [saveMessage, setSaveMessage] = useState("");
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");
  const [identityDirty, setIdentityDirty] = useState(false);
  const [dirtyProjectIds, setDirtyProjectIds] = useState<Set<string>>(new Set());
  const [recovery, setRecovery] = useState<RecoveryPayload | null>(null);
  const identityRevision = useRef(0);
  const presentationRevision = useRef(0);
  const projectRevisions = useRef<Record<string, number>>({});
  const recoveryKey = `prooffolio-editor-recovery:${portfolio.id}`;
  const dirtyProjectKey = [...dirtyProjectIds].sort().join(":");

  const approvedEvidenceCount = useMemo(
    () => initialState.evidenceItems.filter((item) => item.approvedForPortfolio).length,
    [initialState.evidenceItems],
  );

  useEffect(() => {
    if (!initialState.canPersist) {
      return;
    }

    const timer = window.setTimeout(() => setRecovery(readRecovery(recoveryKey)), 0);
    return () => window.clearTimeout(timer);
  }, [initialState.canPersist, recoveryKey]);

  const persistIdentity = useCallback(async () => {
    if (!initialState.canPersist) {
      return;
    }

    const revision = identityRevision.current;
    const snapshot = {
      title: portfolio.title,
      headline: portfolio.profileSettings.headline,
      targetRole: portfolio.profileSettings.targetRole,
      availability: portfolio.profileSettings.availability,
    };
    setSaveState("saving");
    setSaveMessage("");

    const result = await saveEditorIdentityAction({
      portfolioId: portfolio.id,
      title: snapshot.title,
      headline: snapshot.headline,
      targetRole: snapshot.targetRole,
      availability: snapshot.availability,
      locale,
    });

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.message);
      return;
    }

    if (revision === identityRevision.current) {
      setIdentityDirty(false);
      clearRecoveryIdentity(recoveryKey);
      setSaveState("saved");
    } else {
      setSaveState("unsaved");
    }
  }, [initialState.canPersist, locale, portfolio, recoveryKey]);

  useEffect(() => {
    if (!identityDirty || !initialState.canPersist) {
      return;
    }

    const timer = window.setTimeout(() => void persistIdentity(), 850);
    return () => window.clearTimeout(timer);
  }, [identityDirty, initialState.canPersist, persistIdentity, portfolio.title, portfolio.profileSettings.headline]);

  const persistProject = useCallback(
    async (projectId: string) => {
      if (!initialState.canPersist) {
        return;
      }

      const project = projects.find((candidate) => candidate.id === projectId);

      if (!project) {
        return;
      }

      const revision = projectRevisions.current[projectId] ?? 0;
      setSaveState("saving");
      setSaveMessage("");
      const result = await saveEditorProjectAction({
        portfolioId: portfolio.id,
        projectId,
        title: project.title,
        summary: project.summary,
        technologies: project.technologies,
        repositoryUrl: project.repositoryUrl,
        liveDemoUrl: project.liveDemoUrl,
        locale,
      });

      if (!result.ok) {
        setSaveState("failed");
        setSaveMessage(result.message);
        return;
      }

      if (revision === (projectRevisions.current[projectId] ?? 0)) {
        setDirtyProjectIds((current) => {
          const next = new Set(current);
          next.delete(projectId);
          return next;
        });
        clearRecoveryProject(recoveryKey, projectId);
        setProjects((current) =>
          current.map((candidate) => (candidate.id === projectId ? { ...candidate, reviewState: "edited" } : candidate)),
        );
        setSaveState("saved");
      } else {
        setSaveState("unsaved");
      }
    },
    [initialState.canPersist, locale, portfolio.id, projects, recoveryKey],
  );

  useEffect(() => {
    if (!dirtyProjectKey || !initialState.canPersist) {
      return;
    }

    const ids = dirtyProjectKey.split(":").filter(Boolean);
    const timer = window.setTimeout(() => {
      ids.forEach((projectId) => void persistProject(projectId));
    }, 950);
    return () => window.clearTimeout(timer);
  }, [dirtyProjectKey, initialState.canPersist, persistProject, projects]);

  function updateIdentity(field: "title" | "headline" | "targetRole" | "availability", value: string) {
    const nextIdentity = {
      title: field === "title" ? value : portfolio.title,
      headline: field === "headline" ? value : portfolio.profileSettings.headline,
      targetRole: field === "targetRole" ? value : portfolio.profileSettings.targetRole,
      availability: field === "availability" ? value : portfolio.profileSettings.availability,
    };

    identityRevision.current += 1;
    setPortfolio((current) => ({
      ...current,
      title: nextIdentity.title,
      profileSettings: {
        ...current.profileSettings,
        headline: nextIdentity.headline,
        targetRole: nextIdentity.targetRole,
        availability: nextIdentity.availability,
      },
    }));
    setIdentityDirty(true);
    setSaveState(initialState.canPersist ? "unsaved" : "preview");
    if (initialState.canPersist) {
      writeRecoveryIdentity(recoveryKey, nextIdentity);
    }
  }

  function updateProject(projectId: string, patch: Partial<EditorProject>) {
    projectRevisions.current[projectId] = (projectRevisions.current[projectId] ?? 0) + 1;
    setProjects((current) => {
      const next = current.map((project) => (project.id === projectId ? { ...project, ...patch } : project));
      const changed = next.find((project) => project.id === projectId);

      if (changed && initialState.canPersist) {
        writeRecoveryProject(recoveryKey, changed);
      }

      return next;
    });
    setDirtyProjectIds((current) => new Set(current).add(projectId));
    setSaveState(initialState.canPersist ? "unsaved" : "preview");
  }

  async function applyPresentation(nextPortfolio: EditorPortfolio) {
    presentationRevision.current += 1;
    const revision = presentationRevision.current;
    setPortfolio(nextPortfolio);

    if (!initialState.canPersist) {
      setSaveState("preview");
      return;
    }

    setSaveState("saving");
    setSaveMessage("");
    const result = await saveEditorPresentationAction({
      portfolioId: nextPortfolio.id,
      selectedTemplateId: nextPortfolio.selectedTemplateId,
      designSettings: nextPortfolio.designSettings,
      sectionOrder: nextPortfolio.profileSettings.sectionOrder,
      sectionVisibility: nextPortfolio.profileSettings.sectionVisibility,
      locale,
    });

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.message);
      return;
    }

    setSaveState(revision === presentationRevision.current ? "saved" : "unsaved");
  }

  function updateDesign<K extends keyof EditorDesignSettings>(key: K, value: EditorDesignSettings[K]) {
    void applyPresentation({
      ...portfolio,
      designSettings: { ...portfolio.designSettings, [key]: value },
    });
  }

  function toggleSection(section: EditorSectionId) {
    void applyPresentation({
      ...portfolio,
      profileSettings: {
        ...portfolio.profileSettings,
        sectionVisibility: {
          ...portfolio.profileSettings.sectionVisibility,
          [section]: !portfolio.profileSettings.sectionVisibility[section],
        },
      },
    });
  }

  function moveSection(section: EditorSectionId, direction: -1 | 1) {
    const order = [...portfolio.profileSettings.sectionOrder];
    const index = order.indexOf(section);
    const target = index + direction;

    if (target < 0 || target >= order.length) {
      return;
    }

    [order[index], order[target]] = [order[target], order[index]];
    void applyPresentation({
      ...portfolio,
      profileSettings: { ...portfolio.profileSettings, sectionOrder: order },
    });
  }

  function restoreRecovery() {
    if (!recovery) {
      return;
    }

    if (recovery.identity) {
      identityRevision.current += 1;
      setPortfolio((current) => ({
        ...current,
        title: recovery.identity?.title ?? current.title,
        profileSettings: {
          ...current.profileSettings,
          headline: recovery.identity?.headline ?? current.profileSettings.headline,
          targetRole: recovery.identity?.targetRole ?? current.profileSettings.targetRole,
          availability: recovery.identity?.availability ?? current.profileSettings.availability,
        },
      }));
      setIdentityDirty(true);
    }

    if (recovery.projects) {
      const projectIds = new Set(Object.keys(recovery.projects));
      setProjects((current) =>
        current.map((project) => {
          const recovered = recovery.projects?.[project.id];

          if (!recovered) {
            return project;
          }

          projectRevisions.current[project.id] = (projectRevisions.current[project.id] ?? 0) + 1;
          return { ...project, ...recovered };
        }),
      );
      setDirtyProjectIds((current) => new Set([...current, ...projectIds]));
    }

    setRecovery(null);
    setSaveState("unsaved");
  }

  function dismissRecovery() {
    window.localStorage.removeItem(recoveryKey);
    setRecovery(null);
  }

<<<<<<< HEAD
=======
  const publishState =
    portfolio.status === "published"
      ? "published"
      : portfolio.status === "unpublished"
        ? "unpublished"
        : portfolio.title.trim() && portfolio.slug.trim() && (projects.length > 0 || approvedEvidenceCount > 0)
          ? "ready"
          : "draft";
  const previewHref = portfolio.slug ? `/p/${portfolio.slug}?preview=1&portfolio=${portfolio.id}` : "/editor";
  const publicHref = portfolio.slug ? `/p/${portfolio.slug}` : "/editor";

  async function saveSlug() {
    if (!initialState.canPersist) {
      return;
    }

    setSaveState("saving");
    setSaveMessage("");
    const result = await saveEditorPublishSettingsAction({
      portfolioId: portfolio.id,
      slug: portfolio.slug,
      locale,
    });

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.message);
      return;
    }

    setSaveState("saved");
  }

  async function publishPortfolio() {
    if (!initialState.canPersist) {
      return;
    }

    setSaveState("saving");
    setSaveMessage("");
    const result = await publishPortfolioAction({
      portfolioId: portfolio.id,
      slug: portfolio.slug,
      locale,
    });

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.message);
      return;
    }

    setPortfolio((current) => ({
      ...current,
      status: "published",
      publishedAt: new Date().toISOString(),
    }));
    setSaveState("saved");
  }

  async function unpublishPortfolio() {
    if (!initialState.canPersist || !window.confirm(t.editor.publish.confirmUnpublish)) {
      return;
    }

    setSaveState("saving");
    setSaveMessage("");
    const result = await unpublishPortfolioAction({
      portfolioId: portfolio.id,
      slug: portfolio.slug,
      locale,
    });

    if (!result.ok) {
      setSaveState("failed");
      setSaveMessage(result.message);
      return;
    }

    setPortfolio((current) => ({
      ...current,
      status: "unpublished",
    }));
    setSaveState("saved");
  }

>>>>>>> origin/main
  // hideHeader means an ancestor AppShell already owns the page's <main> landmark.
  const MainTag = hideHeader ? "div" : "main";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      {!hideHeader ? (
        <a href="#main-content" className="pf-focus sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-[#071021]">
          {t.nav.skip}
        </a>
      ) : null}
      {!hideHeader ? <WorkspaceHeader contextLabel={t.editor.kicker} /> : null}
      <MainTag id={hideHeader ? undefined : "main-content"} className="min-w-0 bg-[#05070d]" data-testid="editor-workspace">
        <section className="pf-container py-8 sm:py-12">
          <div className="mb-7 flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#9ed0ff]">
                <span>{t.editor.kicker}</span>
                <span className="text-white/24">/</span>
                <span className="text-white/46">{portfolio.displayName}</span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{t.editor.workspaceTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">{t.editor.workspaceBody}</p>
            </div>
            <SaveStatus state={saveState} message={saveMessage} t={t} />
          </div>

          {recovery ? (
            <div data-testid="editor-recovery-banner" className="mb-6 flex flex-col gap-4 rounded-lg border border-[#FBBF24]/24 bg-[#FBBF24]/8 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <RefreshCcw className="mt-0.5 shrink-0 text-[#FCD34D]" size={18} aria-hidden="true" />
                <div>
                  <div className="text-sm font-black text-white">{t.editor.recovery.title}</div>
                  <p className="mt-1 text-xs leading-5 text-white/58">{t.editor.recovery.body}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={restoreRecovery} className="pf-focus rounded-md bg-[#F8FAFC] px-3 py-2 text-xs font-black text-[#071021]">
                  {t.editor.recovery.restore}
                </button>
                <button type="button" onClick={dismissRecovery} className="pf-focus inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/12 text-white/62" aria-label={t.editor.recovery.dismiss} title={t.editor.recovery.dismiss}>
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          <div className={`mb-6 flex items-start gap-3 rounded-lg border p-4 ${initialState.canPersist ? "border-[#2DD4BF]/22 bg-[#2DD4BF]/8" : "border-[#4E8CFF]/22 bg-[#4E8CFF]/9"}`}>
            {initialState.canPersist ? <ShieldCheck className="mt-0.5 shrink-0 text-[#5EEAD4]" size={19} /> : <Eye className="mt-0.5 shrink-0 text-[#9ed0ff]" size={19} />}
            <div>
              <div className="text-sm font-black text-white">
                {initialState.canPersist ? t.editor.persistence.ready : t.editor.persistence.preview}
              </div>
              <p className="mt-1 text-xs leading-5 text-white/56">
                {initialState.canPersist ? t.editor.persistence.readyBody : t.editor.persistence.previewBody}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(340px,450px)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-3" data-testid="editor-panels">
              <EditorPanel icon={UserRound} title={t.editor.panels.identity} description={t.editor.panelDescriptions.identity} defaultOpen testId="editor-identity-panel">
                <div className="grid gap-4">
                  <Field label={t.editor.fields.portfolioTitle} htmlFor="editor-portfolio-title">
                    <input id="editor-portfolio-title" data-testid="editor-portfolio-title" value={portfolio.title} onChange={(event) => updateIdentity("title", event.target.value)} maxLength={120} required className="editor-input" />
                  </Field>
                  <Field label={t.editor.fields.headline} htmlFor="editor-headline">
                    <textarea id="editor-headline" data-testid="editor-headline" value={portfolio.profileSettings.headline} onChange={(event) => updateIdentity("headline", event.target.value)} maxLength={220} rows={4} className="editor-input resize-y" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.editor.fields.targetRole} htmlFor="editor-target-role">
                      <input id="editor-target-role" value={portfolio.profileSettings.targetRole} onChange={(event) => updateIdentity("targetRole", event.target.value)} maxLength={100} className="editor-input" />
                    </Field>
                    <Field label={t.editor.fields.availability} htmlFor="editor-availability">
                      <input id="editor-availability" value={portfolio.profileSettings.availability} onChange={(event) => updateIdentity("availability", event.target.value)} maxLength={120} className="editor-input" />
                    </Field>
                  </div>
                  <button type="button" onClick={() => void persistIdentity()} disabled={!initialState.canPersist || !identityDirty || saveState === "saving"} className="pf-focus inline-flex w-fit items-center gap-2 rounded-md border border-white/14 bg-white/6 px-3 py-2 text-xs font-black text-white disabled:opacity-40">
                    <Save size={15} aria-hidden="true" />
                    {t.editor.actions.saveNow}
                  </button>
                </div>
              </EditorPanel>

              <EditorPanel icon={Globe2} title={t.editor.panels.publish} description={t.editor.panelDescriptions.publish} defaultOpen testId="editor-publish-panel">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#4E8CFF]/24 bg-[#4E8CFF]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#BFDBFE]">
                      {t.editor.publish.states[publishState]}
                    </span>
                    <span className="text-xs leading-5 text-white/52">{t.editor.publish.warning}</span>
                  </div>
                  <Field label={t.editor.publish.slugLabel} htmlFor="editor-public-slug">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input id="editor-public-slug" data-testid="editor-public-slug" value={portfolio.slug} onChange={(event) => setPortfolio((current) => ({ ...current, slug: event.target.value.toLowerCase() }))} maxLength={60} className="editor-input" />
                      <button type="button" onClick={() => void saveSlug()} disabled={!initialState.canPersist || saveState === "saving" || portfolio.status === "published"} className="pf-focus rounded-md border border-white/14 bg-white/6 px-3 py-2 text-xs font-black text-white disabled:opacity-40">
                        {t.editor.publish.saveSlug}
                      </button>
                    </div>
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/42">{t.editor.publish.requirements}</div>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
                        <li>{t.editor.publish.requirementTitle}</li>
                        <li>{t.editor.publish.requirementTemplate}</li>
                        <li>{t.editor.publish.requirementEvidence}</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/42">{t.editor.publish.previewLink}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={previewHref} className="pf-focus inline-flex items-center gap-2 rounded-md border border-white/12 px-3 py-2 text-xs font-black text-white/74">
                          <Eye size={14} />
                          {t.editor.publish.previewAction}
                        </Link>
                        {portfolio.status === "published" ? (
                          <Link href={publicHref} className="pf-focus inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black text-[#071021]">
                            <Globe2 size={14} />
                            {t.editor.publish.viewPublic}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" data-testid="editor-publish-button" onClick={() => void publishPortfolio()} disabled={!initialState.canPersist || saveState === "saving"} className="pf-focus inline-flex items-center gap-2 rounded-md bg-[#F8FAFC] px-4 py-2.5 text-xs font-black text-[#071021] disabled:opacity-40">
                      <BadgeCheck size={15} aria-hidden="true" />
                      {t.editor.publish.publishAction}
                    </button>
                    <button type="button" data-testid="editor-unpublish-button" onClick={() => void unpublishPortfolio()} disabled={!initialState.canPersist || saveState === "saving" || portfolio.status !== "published"} className="pf-focus inline-flex items-center gap-2 rounded-md border border-[#ff7a66]/24 bg-[#ff7a66]/10 px-4 py-2.5 text-xs font-black text-[#ffd8d1] disabled:opacity-35">
                      <EyeOff size={15} aria-hidden="true" />
                      {t.editor.publish.unpublishAction}
                    </button>
                  </div>
                </div>
              </EditorPanel>

              <EditorPanel icon={FolderKanban} title={t.editor.panels.projects} description={t.editor.panelDescriptions.projects} testId="editor-projects-panel">
                {projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.map((project, index) => (
                      <ProjectEditor key={project.id} project={project} index={index} dirty={dirtyProjectIds.has(project.id)} canPersist={initialState.canPersist} saveState={saveState} onChange={(patch) => updateProject(project.id, patch)} onSave={() => void persistProject(project.id)} t={t} />
                    ))}
                  </div>
                ) : (
                  <EmptyPanel icon={FolderKanban} title={t.editor.emptyStates.projectsTitle} body={t.editor.emptyStates.projectsBody} action={t.editor.actions.returnToOnboarding} />
                )}
              </EditorPanel>

              <EditorPanel icon={FileBadge2} title={t.editor.panels.evidence} description={t.editor.panelDescriptions.evidence} testId="editor-evidence-panel">
                <div className="mb-4 flex items-start gap-3 rounded-md border border-[#4E8CFF]/18 bg-[#4E8CFF]/8 p-3">
                  <LockKeyhole className="mt-0.5 shrink-0 text-[#9ed0ff]" size={16} aria-hidden="true" />
                  <p className="text-xs leading-5 text-white/58">{t.editor.evidence.privateNotice}</p>
                </div>
                {initialState.evidenceItems.length > 0 ? (
                  <div className="space-y-2" data-testid="editor-evidence-list">
                    {initialState.evidenceItems.map((item) => (
                      <div key={item.id} className="flex min-w-0 items-start justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <SourcePill source={item.sourceType} t={t} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${item.approvedForPortfolio ? "text-[#5EEAD4]" : "text-white/38"}`}>
                              {item.approvedForPortfolio ? t.editor.evidence.approved : t.editor.evidence.privateOnly}
                            </span>
                          </div>
                          <div className="mt-2 break-words text-sm font-black text-white">{item.title}</div>
                          {item.description ? <p className="mt-1 text-xs leading-5 text-white/48">{item.description}</p> : null}
                        </div>
                        {item.approvedForPortfolio ? <BadgeCheck className="shrink-0 text-[#2DD4BF]" size={17} aria-label={t.editor.evidence.approved} /> : <LockKeyhole className="shrink-0 text-white/30" size={16} aria-label={t.editor.evidence.privateOnly} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel icon={FileText} title={t.editor.emptyStates.evidenceTitle} body={t.editor.emptyStates.evidenceBody} action={t.editor.actions.returnToOnboarding} />
                )}
              </EditorPanel>

              <EditorPanel icon={LayoutPanelTop} title={t.editor.panels.structure} description={t.editor.panelDescriptions.structure} testId="editor-structure-panel">
                <div className="space-y-2">
                  {portfolio.profileSettings.sectionOrder.map((section, index) => (
                    <div key={section} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
                      <input id={`section-${section}`} type="checkbox" checked={portfolio.profileSettings.sectionVisibility[section]} onChange={() => toggleSection(section)} className="h-4 w-4 accent-[#4E8CFF]" />
                      <label htmlFor={`section-${section}`} className="min-w-0 flex-1 text-sm font-black text-white/78">
                        {t.editor.structure.sections[section]}
                      </label>
                      <button type="button" onClick={() => moveSection(section, -1)} disabled={index === 0} className="pf-focus inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/54 disabled:opacity-25" aria-label={`${t.editor.actions.moveUp} ${t.editor.structure.sections[section]}`} title={t.editor.actions.moveUp}>
                        <ArrowUp size={14} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => moveSection(section, 1)} disabled={index === portfolio.profileSettings.sectionOrder.length - 1} className="pf-focus inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-white/54 disabled:opacity-25" aria-label={`${t.editor.actions.moveDown} ${t.editor.structure.sections[section]}`} title={t.editor.actions.moveDown}>
                        <ArrowDown size={14} aria-hidden="true" />
                      </button>
                      {portfolio.profileSettings.sectionVisibility[section] ? <Eye size={15} className="text-[#5EEAD4]" aria-hidden="true" /> : <EyeOff size={15} className="text-white/28" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
              </EditorPanel>

              <EditorPanel icon={Palette} title={t.editor.panels.appearance} description={t.editor.panelDescriptions.appearance} testId="editor-appearance-panel">
                <div className="space-y-5">
                  <ControlLabel label={t.editor.controls.template}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {templateIds.map((templateId) => (
                        <button key={templateId} type="button" data-testid={`editor-template-${templateId}`} aria-pressed={portfolio.selectedTemplateId === templateId} onClick={() => void applyPresentation({ ...portfolio, selectedTemplateId: templateId })} className={`pf-focus rounded-md border px-3 py-2 text-left text-xs font-black transition ${portfolio.selectedTemplateId === templateId ? "border-[#4E8CFF]/58 bg-[#4E8CFF]/15 text-white" : "border-white/10 bg-white/[0.035] text-white/58 hover:text-white"}`}>
                          {t.templates[templateId].name}
                        </button>
                      ))}
                    </div>
                  </ControlLabel>
                  <ControlLabel label={t.editor.controls.color}>
                    <div className="flex flex-wrap gap-2">
                      {accentOptions.map((accent) => (
                        <button key={accent} type="button" onClick={() => updateDesign("accent", accent)} aria-label={`${t.editor.controls.color} ${accent}`} aria-pressed={portfolio.designSettings.accent === accent} className={`pf-focus h-10 w-10 rounded-md border-2 ${portfolio.designSettings.accent === accent ? "border-white" : "border-transparent"}`} style={{ backgroundColor: accent }} />
                      ))}
                    </div>
                  </ControlLabel>
                  <SelectControl label={t.editor.controls.typography} value={portfolio.designSettings.typography} options={typographyOptions} labels={t.editor.options.typography} onChange={(value) => updateDesign("typography", value)} />
                  <SelectControl label={t.editor.controls.layout} value={portfolio.designSettings.layout} options={layoutOptions} labels={t.editor.options.layout} onChange={(value) => updateDesign("layout", value)} />
                  <SelectControl label={t.editor.controls.projects} value={portfolio.designSettings.projectDisplay} options={projectDisplayOptions} labels={t.editor.options.projects} onChange={(value) => updateDesign("projectDisplay", value)} />
                  <SelectControl label={t.editor.controls.spacing} value={portfolio.designSettings.spacing} options={spacingOptions} labels={t.editor.options.spacing} onChange={(value) => updateDesign("spacing", value)} />
                </div>
              </EditorPanel>

              <EditorPanel icon={Gauge} title={t.editor.panels.motion} description={t.editor.panelDescriptions.motion} testId="editor-motion-panel">
                <div className="grid grid-cols-3 gap-2" role="group" aria-label={t.editor.controls.animation}>
                  {motionOptions.map((option, index) => (
                    <button key={option} type="button" aria-pressed={portfolio.designSettings.motion === option} onClick={() => updateDesign("motion", option)} className={`pf-focus rounded-md border px-2 py-2 text-xs font-black ${portfolio.designSettings.motion === option ? "border-[#2DD4BF]/52 bg-[#2DD4BF]/12 text-white" : "border-white/10 bg-white/[0.035] text-white/54"}`}>
                      {t.editor.options.animation[index]}
                    </button>
                  ))}
                </div>
              </EditorPanel>
            </div>

            <section className="min-w-0 xl:sticky xl:top-24 xl:self-start" aria-label={t.editor.preview.label}>
              <div className="editor-shell min-w-0 rounded-lg border border-white/10 bg-[#0D1422] p-3 sm:p-4">
                <div className="mb-4 flex flex-col gap-3 rounded-md border border-white/8 bg-[#070B14] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-black text-white">{t.editor.preview.label}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/46">
                      <span>{approvedEvidenceCount} {t.editor.preview.approvedSources}</span>
                      <span aria-hidden="true">·</span>
                      <span>{projects.length} {t.editor.preview.projectCount}</span>
                    </div>
                  </div>
                  <div className="flex w-fit rounded-md border border-white/10 bg-white/5 p-1" role="group" aria-label={t.editor.preview.viewport}>
                    <button type="button" onClick={() => setPreviewViewport("desktop")} aria-pressed={previewViewport === "desktop"} className={`pf-focus inline-flex h-9 w-9 items-center justify-center rounded-md ${previewViewport === "desktop" ? "bg-white text-[#071021]" : "text-white/54"}`} aria-label={t.editor.desktopPreview} title={t.editor.desktopPreview}>
                      <Monitor size={16} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setPreviewViewport("mobile")} aria-pressed={previewViewport === "mobile"} className={`pf-focus inline-flex h-9 w-9 items-center justify-center rounded-md ${previewViewport === "mobile" ? "bg-white text-[#071021]" : "text-white/54"}`} aria-label={t.editor.mobilePreview} title={t.editor.mobilePreview}>
                      <Smartphone size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div data-testid="editor-preview-frame" className={`mx-auto min-w-0 transition-[max-width] duration-300 motion-reduce:transition-none ${previewViewport === "mobile" ? "max-w-[390px]" : "max-w-none"}`}>
                  <EditorPreview portfolio={portfolio} projects={projects} evidenceItems={initialState.evidenceItems} compact={previewViewport === "mobile"} t={t} />
                </div>
              </div>
            </section>
          </div>
        </section>
      </MainTag>
    </div>
  );
}

function EditorUnavailable({
  mode,
  t,
  hideHeader,
}: {
  mode: "setup_required" | "denied" | "error";
  t: Copy;
  hideHeader: boolean;
}) {
  const state = t.editor.unavailable[mode];
  const MainTag = hideHeader ? "div" : "main";

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      {!hideHeader ? <WorkspaceHeader contextLabel={t.editor.kicker} /> : null}
      <MainTag id={hideHeader ? undefined : "main-content"} className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#05070d] px-4 py-12">
        <section data-testid={`editor-${mode}`} className="w-full max-w-2xl rounded-lg border border-white/12 bg-[#0D1422] p-6 text-center sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-[#FBBF24]/24 bg-[#FBBF24]/8 text-[#FCD34D]">
            <AlertTriangle size={21} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-black text-white sm:text-3xl">{state.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/58">{state.body}</p>
          <Link href="/onboarding" className="pf-focus mt-6 inline-flex rounded-md bg-white px-4 py-2.5 text-sm font-black text-[#071021]">
            {t.editor.actions.returnToOnboarding}
          </Link>
        </section>
      </MainTag>
    </div>
  );
}

function EditorPanel({ icon: Icon, title, description, defaultOpen = false, testId, children }: { icon: typeof UserRound; title: string; description: string; defaultOpen?: boolean; testId: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      data-testid={testId}
      className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="pf-focus flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#4E8CFF]/22 bg-[#4E8CFF]/10 text-[#9ed0ff]">
          <Icon size={17} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-white">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-white/46">{description}</span>
        </span>
        <ChevronDown size={17} className="shrink-0 text-white/42 transition group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <div className="border-t border-white/8 p-4">{children}</div>
    </details>
  );
}

function ProjectEditor({ project, index, dirty, canPersist, saveState, onChange, onSave, t }: { project: EditorProject; index: number; dirty: boolean; canPersist: boolean; saveState: SaveState; onChange: (patch: Partial<EditorProject>) => void; onSave: () => void; t: Copy }) {
  const prefix = `editor-project-${project.id}`;
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <details
      data-testid="editor-project-card"
      className="rounded-md border border-white/10 bg-[#070B14]"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="pf-focus flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
        <SourcePill source={project.sourceType} t={t} />
        <span className="min-w-0 flex-1 truncate text-sm font-black text-white/78">{project.title}</span>
        {dirty ? <CircleDot size={14} className="text-[#FCD34D]" aria-label={t.editor.saveStates.unsaved} /> : <BadgeCheck size={14} className="text-[#2DD4BF]" aria-label={t.editor.evidence.approved} />}
        <ChevronDown size={15} className="text-white/38" aria-hidden="true" />
      </summary>
      <div className="grid gap-4 border-t border-white/8 p-3">
        <Field label={t.editor.fields.projectTitle} htmlFor={`${prefix}-title`}>
          <input id={`${prefix}-title`} value={project.title} onChange={(event) => onChange({ title: event.target.value })} maxLength={140} required className="editor-input" />
        </Field>
        <Field label={t.editor.fields.summary} htmlFor={`${prefix}-summary`}>
          <textarea id={`${prefix}-summary`} value={project.summary} onChange={(event) => onChange({ summary: event.target.value })} maxLength={1200} rows={5} required className="editor-input resize-y" />
        </Field>
        <Field label={t.editor.fields.technologies} htmlFor={`${prefix}-technologies`}>
          <input id={`${prefix}-technologies`} value={project.technologies.join(", ")} onChange={(event) => onChange({ technologies: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="editor-input" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.editor.fields.repositoryUrl} htmlFor={`${prefix}-repository`}>
            <input id={`${prefix}-repository`} type="url" value={project.repositoryUrl} onChange={(event) => onChange({ repositoryUrl: event.target.value })} placeholder="https://github.com/..." className="editor-input" />
          </Field>
          <Field label={t.editor.fields.liveDemoUrl} htmlFor={`${prefix}-demo`}>
            <input id={`${prefix}-demo`} type="url" value={project.liveDemoUrl} onChange={(event) => onChange({ liveDemoUrl: event.target.value })} placeholder="https://..." className="editor-input" />
          </Field>
        </div>
        <button type="button" onClick={onSave} disabled={!canPersist || !dirty || saveState === "saving"} className="pf-focus inline-flex w-fit items-center gap-2 rounded-md border border-white/14 bg-white/6 px-3 py-2 text-xs font-black text-white disabled:opacity-40">
          <Save size={15} aria-hidden="true" />
          {t.editor.actions.saveProject}
        </button>
      </div>
    </details>
  );
}

function SaveStatus({ state, message, t }: { state: SaveState; message: string; t: Copy }) {
  const Icon = state === "saving" ? LoaderCircle : state === "failed" ? AlertTriangle : state === "saved" ? BadgeCheck : state === "preview" ? Eye : CircleDot;
  const color = state === "failed" ? "text-[#FCA5A5]" : state === "saved" ? "text-[#5EEAD4]" : state === "unsaved" ? "text-[#FCD34D]" : "text-[#9ed0ff]";

  return (
    <div className="lg:text-right" role="status" aria-live="polite" data-testid="editor-save-status">
      <div className={`inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm font-black ${color}`}>
        <Icon size={16} className={state === "saving" ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />
        {t.editor.saveStates[state]}
      </div>
      {message ? <p className="mt-2 max-w-sm text-xs leading-5 text-[#FCA5A5]">{message}</p> : null}
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-white/52">{label}</label>
      {children}
    </div>
  );
}

function ControlLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-white/52">{label}</legend>
      {children}
    </fieldset>
  );
}

function SelectControl<T extends string>({ label, value, options, labels, onChange }: { label: string; value: T; options: readonly T[]; labels: readonly string[]; onChange: (value: T) => void }) {
  const id = `editor-select-${options.join("-")}`;

  return (
    <Field label={label} htmlFor={id}>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} className="editor-input">
        {options.map((option, index) => <option key={option} value={option}>{labels[index]}</option>)}
      </select>
    </Field>
  );
}

function SourcePill({ source, t }: { source: "cv" | "certificate" | "manual_project" | "github_placeholder" | "github_repository"; t: Copy }) {
  const label =
    source === "cv"
      ? t.editor.sourceBadges.cv
      : source === "certificate"
        ? t.editor.sourceBadges.certificate
        : source === "github_placeholder" || source === "github_repository"
          ? t.editor.sourceBadges.github
          : t.editor.sourceBadges.manualProject;
  return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#4E8CFF]/20 bg-[#4E8CFF]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#BFDBFE]"><BadgeCheck size={11} aria-hidden="true" />{label}</span>;
}

function EmptyPanel({ icon: Icon, title, body, action }: { icon: typeof FolderKanban; title: string; body: string; action: string }) {
  return (
    <div className="rounded-md border border-dashed border-white/12 px-4 py-7 text-center">
      <Icon className="mx-auto text-white/28" size={22} aria-hidden="true" />
      <div className="mt-3 text-sm font-black text-white/72">{title}</div>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/46">{body}</p>
      <Link href="/onboarding" className="pf-focus mt-4 inline-flex text-xs font-black text-[#9ed0ff]">{action}</Link>
    </div>
  );
}

function readRecovery(key: string): RecoveryPayload | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RecoveryPayload;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeRecoveryIdentity(key: string, identity: RecoveryPayload["identity"]) {
  const current = readRecovery(key) ?? { updatedAt: new Date().toISOString() };
  writeRecovery(key, { ...current, identity, updatedAt: new Date().toISOString() });
}

function writeRecoveryProject(key: string, project: EditorProject) {
  const current = readRecovery(key) ?? { updatedAt: new Date().toISOString() };
  writeRecovery(key, {
    ...current,
    projects: {
      ...current.projects,
      [project.id]: {
        title: project.title,
        summary: project.summary,
        technologies: project.technologies,
        repositoryUrl: project.repositoryUrl,
        liveDemoUrl: project.liveDemoUrl,
      },
    },
    updatedAt: new Date().toISOString(),
  });
}

function clearRecoveryIdentity(key: string) {
  const current = readRecovery(key);
  if (!current) return;
  delete current.identity;
  persistOrClearRecovery(key, current);
}

function clearRecoveryProject(key: string, projectId: string) {
  const current = readRecovery(key);
  if (!current?.projects) return;
  delete current.projects[projectId];
  persistOrClearRecovery(key, current);
}

function persistOrClearRecovery(key: string, payload: RecoveryPayload) {
  if (!payload.identity && (!payload.projects || Object.keys(payload.projects).length === 0)) {
    window.localStorage.removeItem(key);
    return;
  }
  writeRecovery(key, payload);
}

function writeRecovery(key: string, payload: RecoveryPayload) {
  try {
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Local recovery is best-effort when storage is unavailable.
  }
}
