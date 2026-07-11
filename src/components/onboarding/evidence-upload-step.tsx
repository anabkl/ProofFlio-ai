"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, FileUp, FolderGit, LockKeyhole, PenLine, RefreshCcw, Trash2, Unplug } from "lucide-react";
import { disconnectGitHubAction, importGitHubRepositoriesAction, removeEvidenceAction, saveManualProjectAction, syncGitHubRepositoriesAction, uploadEvidenceAction } from "@/app/onboarding/actions";
import type { Copy, Locale, TemplateId } from "@/lib/content";
import type { GitHubConnectionState } from "@/lib/github/server";
import type { EvidenceItem, EvidenceSourceType } from "@/lib/onboarding/types";

export function EvidenceUploadStep({
  t,
  selectedSource,
  portfolioId,
  templateId,
  locale,
  canPersist,
  evidenceItems,
  github,
}: {
  t: Copy;
  selectedSource: EvidenceSourceType;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
  evidenceItems: EvidenceItem[];
  github: GitHubConnectionState;
}) {
  const selectedEvidence = evidenceItems.filter((item) => item.sourceType === selectedSource);

  return (
    <section className="space-y-6" aria-labelledby="upload-heading">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8EA7FF]">{t.onboarding.uploadEyebrow}</p>
        <h2 id="upload-heading" className="mt-3 text-3xl font-black tracking-tight text-white">
          {t.onboarding.uploadTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#A8B3C7]">{t.onboarding.uploadBody}</p>
      </div>

      {!canPersist ? (
        <div className="rounded-xl border border-[#ff7a66]/24 bg-[#ff7a66]/10 p-4 text-sm font-bold leading-6 text-[#ffd8d1]" role="status">
          {t.onboarding.persistenceBlocked}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_.82fr]">
        <div className="min-w-0">
          {selectedSource === "cv" ? (
            <FileUploadCard
              t={t}
              sourceType="cv"
              title={t.onboarding.uploadCv}
              detail={t.onboarding.uploadCvDetail}
              portfolioId={portfolioId}
              templateId={templateId}
              locale={locale}
              canPersist={canPersist}
              highlighted={selectedSource === "cv"}
            />
          ) : null}
          {selectedSource === "certificate" ? (
            <FileUploadCard
              t={t}
              sourceType="certificate"
              title={t.onboarding.uploadCertificate}
              detail={t.onboarding.uploadCertificateDetail}
              portfolioId={portfolioId}
              templateId={templateId}
              locale={locale}
              canPersist={canPersist}
              highlighted={selectedSource === "certificate"}
            />
          ) : null}
          {selectedSource === "manual_project" ? (
            <ManualProjectForm
              t={t}
              portfolioId={portfolioId}
              templateId={templateId}
              locale={locale}
              canPersist={canPersist}
              highlighted
            />
          ) : null}
          {selectedSource === "github_repository" ? (
            <GitHubImportCard
              t={t}
              portfolioId={portfolioId}
              templateId={templateId}
              locale={locale}
              canPersist={canPersist}
              github={github}
            />
          ) : null}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070B14]/72 p-4" data-testid="evidence-vault">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-[#B7C4FF]">
              <LockKeyhole size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/64">{t.onboarding.evidenceListTitle}</h3>
              <p className="mt-2 text-xs leading-5 text-white/48">{t.onboarding.honestyNotice}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {selectedEvidence.length > 0 ? (
              selectedEvidence.map((item) => (
                <EvidenceVaultItem
                  key={item.id}
                  t={t}
                  item={item}
                  portfolioId={portfolioId}
                  templateId={templateId}
                  locale={locale}
                  canPersist={canPersist}
                />
              ))
            ) : (
              <p className="rounded-lg border border-white/8 bg-white/[0.035] p-3 text-sm leading-6 text-white/48">
                {t.onboarding.noEvidence}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FileUploadCard({
  t,
  sourceType,
  title,
  detail,
  portfolioId,
  templateId,
  locale,
  canPersist,
  highlighted,
}: {
  t: Copy;
  sourceType: "cv" | "certificate";
  title: string;
  detail: string;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
  highlighted: boolean;
}) {
  return (
    <form
      action={uploadEvidenceAction}
      className={[
        "rounded-xl border p-5 transition",
        highlighted ? "border-[#4E8CFF]/50 bg-[#4E8CFF]/10" : "border-white/10 bg-white/[0.045]",
      ].join(" ")}
    >
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="sourceType" value={sourceType} />
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#B7C4FF]">
          <FileUp size={21} />
        </span>
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/54">{detail}</p>
        </div>
      </div>
      <label className="mt-5 block">
        <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/46">PDF</span>
        <input
          name="file"
          type="file"
          accept="application/pdf,.pdf"
          disabled={!canPersist}
          data-testid={`file-${sourceType}`}
          className="pf-focus block w-full rounded-lg border border-white/12 bg-[#070B14] p-3 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-black file:text-[#071021]"
        />
      </label>
      <UploadButton
        disabled={!canPersist}
        label={sourceType === "cv" ? t.onboarding.uploadCv : t.onboarding.uploadCertificate}
        saving={t.onboarding.sourceStates.uploading}
        testId={`upload-${sourceType}`}
      />
    </form>
  );
}

function ManualProjectForm({
  t,
  portfolioId,
  templateId,
  locale,
  canPersist,
  highlighted,
}: {
  t: Copy;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
  highlighted: boolean;
}) {
  const [validation, setValidation] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <form
      action={saveManualProjectAction}
      data-testid="manual-project-form"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        const summary = String(formData.get("summary") ?? "").trim();

        if (!title || !summary) {
          event.preventDefault();
          setValidation(!title ? t.onboarding.validation.projectTitle : t.onboarding.validation.projectSummary);
        }
      }}
      className={[
        "rounded-xl border p-5 transition",
        highlighted ? "border-[#2DD4BF]/50 bg-[#2DD4BF]/10" : "border-white/10 bg-white/[0.045]",
      ].join(" ")}
    >
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="locale" value={locale} />
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#B7C4FF]">
          <PenLine size={21} />
        </span>
        <div>
          <h3 className="text-lg font-black text-white">{t.onboarding.manualProjectTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-white/54">{t.onboarding.manualProjectBody}</p>
        </div>
      </div>
      {validation ? (
        <div data-testid="manual-project-validation" className="mt-4 rounded-lg border border-[#ff7a66]/24 bg-[#ff7a66]/10 p-3 text-sm font-bold text-[#ffd8d1]" role="alert">
          {validation}
        </div>
      ) : null}
      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-black text-white/74">{t.onboarding.fields.projectTitle}</span>
          <input
            name="title"
            data-testid="manual-project-title"
            className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
            placeholder={t.onboarding.placeholders.projectTitle}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black text-white/74">{t.onboarding.fields.summary}</span>
          <textarea
            name="summary"
            rows={4}
            className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
            placeholder={t.onboarding.placeholders.summary}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black text-white/74">{t.onboarding.fields.technologies}</span>
          <input
            name="technologies"
            className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28"
            placeholder={t.onboarding.placeholders.technologies}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-white/74">{t.onboarding.fields.repositoryUrl}</span>
            <input name="repositoryUrl" type="url" className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28" placeholder="https://github.com/..." />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-white/74">{t.onboarding.fields.liveDemoUrl}</span>
            <input name="liveDemoUrl" type="url" className="pf-focus w-full rounded-lg border border-white/12 bg-[#070B14] px-4 py-3 text-white placeholder:text-white/28" placeholder="https://..." />
          </label>
        </div>
      </div>
      <UploadButton
        disabled={!hydrated || !canPersist}
        label={canPersist ? t.onboarding.saveManualProject : t.onboarding.persistenceDisabled}
        saving={t.onboarding.saving}
        testId="manual-project-submit"
      />
    </form>
  );
}

function EvidenceVaultItem({
  t,
  item,
  portfolioId,
  templateId,
  locale,
  canPersist,
}: {
  t: Copy;
  item: EvidenceItem;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
}) {
  return (
    <article className="rounded-lg border border-white/8 bg-[#0B111D] px-3 py-3" data-testid={`evidence-item-${item.sourceType}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#2DD4BF]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#99F6E4]">
              <CheckCircle2 size={12} />
              {t.onboarding.sourceStates.savedPrivately}
            </span>
            <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
              {localizeSource(t, item.sourceType)}
            </span>
          </div>
          <p className="mt-3 break-words text-sm font-black text-white">{item.title}</p>
          <p className="mt-1 text-xs leading-5 text-white/48">{item.description}</p>
        </div>
      </div>
      {canPersist ? (
        <details className="mt-3 rounded-lg border border-[#ff7a66]/20 bg-[#ff7a66]/8 p-3">
          <summary className="pf-focus cursor-pointer list-none text-xs font-black uppercase tracking-[0.14em] text-[#ffd8d1]">
            <span className="inline-flex items-center gap-2">
              <AlertTriangle size={14} />
              {t.onboarding.removeEvidence}
            </span>
          </summary>
          <p className="mt-2 text-xs leading-5 text-[#ffd8d1]/82">{t.onboarding.confirmRemoveBody}</p>
          <form action={removeEvidenceAction} className="mt-3">
            <input type="hidden" name="portfolioId" value={portfolioId} />
            <input type="hidden" name="templateId" value={templateId} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="evidenceId" value={item.id} />
            <button
              type="submit"
              data-testid={`remove-evidence-${item.sourceType}`}
              className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/12 px-3 py-2 text-xs font-black text-[#ffd8d1]"
            >
              <Trash2 size={14} />
              {t.onboarding.removeNow}
            </button>
          </form>
        </details>
      ) : null}
    </article>
  );
}

function localizeSource(t: Copy, sourceType: EvidenceSourceType) {
  if (sourceType === "cv") {
    return t.onboarding.sourceBadges.cv;
  }

  if (sourceType === "certificate") {
    return t.onboarding.sourceBadges.certificate;
  }

  if (sourceType === "github_placeholder" || sourceType === "github_repository") {
    return t.onboarding.sourceBadges.github;
  }

  return t.onboarding.sourceBadges.manualProject;
}

function GitHubImportCard({
  t,
  portfolioId,
  templateId,
  locale,
  canPersist,
  github,
}: {
  t: Copy;
  portfolioId: string;
  templateId: TemplateId;
  locale: Locale;
  canPersist: boolean;
  github: GitHubConnectionState;
}) {
  const connected = github.connected;
  const next = encodeURIComponent(`/onboarding?step=upload&source=github_repository&template=${templateId}`);

  return (
    <div className="rounded-xl border border-white/10 bg-[#070B14]/70 p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#B7C4FF]">
          <FolderGit size={21} />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-white">{t.onboarding.githubTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-white/54">{t.onboarding.githubBody}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[#7C8CFF]/20 bg-[#7C8CFF]/10 p-3 text-sm leading-6 text-[#DDE3FF]">
        {t.onboarding.githubHonesty}
      </div>

      {!github.configured ? (
        <div className="mt-4 rounded-lg border border-[#ff7a66]/24 bg-[#ff7a66]/10 p-4 text-sm font-bold text-[#ffd8d1]">
          {t.onboarding.githubSetupMissing}
        </div>
      ) : !connected ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="text-sm font-black text-white">{t.onboarding.githubConnectTitle}</div>
            <p className="mt-2 text-sm leading-6 text-white/54">{t.onboarding.githubConnectBody}</p>
          </div>
          <a
            href={`/auth/github?next=${next}`}
            data-testid="github-connect-link"
            className="pf-focus inline-flex items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021]"
          >
            <FolderGit size={17} />
            {t.onboarding.githubConnectAction}
          </a>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div>
              <div className="text-sm font-black text-white">{github.name || github.login}</div>
              <div className="mt-1 text-xs leading-5 text-white/48">@{github.login}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={syncGitHubRepositoriesAction}>
                <input type="hidden" name="portfolioId" value={portfolioId} />
                <input type="hidden" name="templateId" value={templateId} />
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" disabled={!canPersist || !github.canSync} data-testid="github-sync-button" className="pf-focus inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-xs font-black text-white/72 disabled:opacity-45">
                  <RefreshCcw size={14} />
                  {t.onboarding.githubSyncAction}
                </button>
              </form>
              <form action={disconnectGitHubAction}>
                <input type="hidden" name="portfolioId" value={portfolioId} />
                <input type="hidden" name="templateId" value={templateId} />
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" disabled={!canPersist} data-testid="github-disconnect-button" className="pf-focus inline-flex items-center gap-2 rounded-lg border border-[#ff7a66]/30 bg-[#ff7a66]/10 px-3 py-2 text-xs font-black text-[#ffd8d1] disabled:opacity-45">
                  <Unplug size={14} />
                  {t.onboarding.githubDisconnectAction}
                </button>
              </form>
            </div>
          </div>

          <form action={importGitHubRepositoriesAction} className="space-y-4" data-testid="github-selection-form">
            <input type="hidden" name="portfolioId" value={portfolioId} />
            <input type="hidden" name="templateId" value={templateId} />
            <input type="hidden" name="locale" value={locale} />
            <div>
              <div className="text-sm font-black text-white">{t.onboarding.githubRepositoryTitle}</div>
              <p className="mt-2 text-sm leading-6 text-white/54">{t.onboarding.githubRepositoryBody}</p>
            </div>
            <div className="grid gap-3">
              {github.repositories.length > 0 ? (
                github.repositories.map((repository) => (
                  <label key={repository.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <input type="checkbox" name="repositoryId" value={repository.id} className="mt-1 h-4 w-4 accent-[#4E8CFF]" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-white">{repository.fullName}</span>
                        {repository.primaryLanguage ? (
                          <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/56">
                            {repository.primaryLanguage}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/56">{repository.description || t.onboarding.githubNoDescription}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/46">
                        <span>{t.onboarding.githubStars.replace("{count}", String(repository.stars))}</span>
                        <span>{t.onboarding.githubUpdated.replace("{date}", formatGitHubDate(repository.updatedAt, locale))}</span>
                        <span>{repository.defaultBranch}</span>
                        <span>{repository.topics.slice(0, 4).join(" · ")}</span>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 p-4 text-sm leading-6 text-white/54">
                  {t.onboarding.githubEmpty}
                </div>
              )}
            </div>
            <UploadButton disabled={!canPersist || github.repositories.length === 0} label={t.onboarding.githubImportAction} saving={t.onboarding.saving} testId="github-import-button" />
          </form>
        </div>
      )}
    </div>
  );
}

function formatGitHubDate(value: string, locale: Locale) {
  if (!value) {
    return locale === "fr" ? "mise a jour recente" : "recent update";
  }

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function UploadButton({ disabled, label, saving, testId }: { disabled: boolean; label: string; saving: string; testId?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      data-testid={testId}
      className="pf-focus mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#F8FAFC] px-5 py-3 text-sm font-black text-[#071021] transition hover:bg-[#BFDBFE] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? saving : label}
      <ArrowRight size={17} />
    </button>
  );
}
