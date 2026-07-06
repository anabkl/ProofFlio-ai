"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, FileUp, FolderGit, PenLine } from "lucide-react";
import { saveManualProjectAction, uploadEvidenceAction } from "@/app/onboarding/actions";
import type { Copy, TemplateId } from "@/lib/content";
import type { EvidenceItem, EvidenceSourceType } from "@/lib/onboarding/types";

export function EvidenceUploadStep({
  t,
  selectedSource,
  portfolioId,
  templateId,
  canPersist,
  evidenceItems,
}: {
  t: Copy;
  selectedSource: EvidenceSourceType;
  portfolioId: string;
  templateId: TemplateId;
  canPersist: boolean;
  evidenceItems: EvidenceItem[];
}) {
  return (
    <section className="space-y-6" aria-labelledby="upload-heading">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2DD4BF]">{t.onboarding.uploadEyebrow}</p>
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

      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <div className="grid gap-4">
          <FileUploadCard
            t={t}
            sourceType="cv"
            title={t.onboarding.uploadCv}
            detail={t.onboarding.uploadCvDetail}
            portfolioId={portfolioId}
            templateId={templateId}
            canPersist={canPersist}
            highlighted={selectedSource === "cv"}
          />
          <FileUploadCard
            t={t}
            sourceType="certificate"
            title={t.onboarding.uploadCertificate}
            detail={t.onboarding.uploadCertificateDetail}
            portfolioId={portfolioId}
            templateId={templateId}
            canPersist={canPersist}
            highlighted={selectedSource === "certificate"}
          />
          <div className="rounded-xl border border-white/10 bg-[#070B14]/70 p-4">
            <div className="flex items-center gap-3 text-sm font-black text-white/72">
              <FolderGit size={18} className="text-white/38" />
              {t.onboarding.sources.github}
            </div>
            <p className="mt-2 text-sm leading-6 text-white/48">{t.onboarding.githubDeferred}</p>
          </div>
        </div>

        <ManualProjectForm
          t={t}
          portfolioId={portfolioId}
          templateId={templateId}
          canPersist={canPersist}
          highlighted={selectedSource === "manual_project"}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white/56">{t.onboarding.savedEvidence}</h3>
        <div className="mt-4 grid gap-2">
          {evidenceItems.length > 0 ? (
            evidenceItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-[#070B14]/66 px-3 py-3">
                <div>
                  <p className="text-sm font-black text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/48">{item.description}</p>
                </div>
                <span className="shrink-0 rounded-md bg-[#2DD4BF]/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#99F6E4]">
                  {item.sourceType === "manual_project" ? t.onboarding.sources.manualProject : item.sourceType.toUpperCase()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-white/48">{t.onboarding.noEvidence}</p>
          )}
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
  canPersist,
  highlighted,
}: {
  t: Copy;
  sourceType: "cv" | "certificate";
  title: string;
  detail: string;
  portfolioId: string;
  templateId: TemplateId;
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
      <input type="hidden" name="sourceType" value={sourceType} />
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#9ed0ff]">
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
          className="pf-focus block w-full rounded-lg border border-white/12 bg-[#070B14] p-3 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-black file:text-[#071021]"
        />
      </label>
      <UploadButton
        disabled={!canPersist}
        label={sourceType === "cv" ? t.onboarding.uploadCv : t.onboarding.uploadCertificate}
        saving={t.onboarding.saving}
      />
    </form>
  );
}

function ManualProjectForm({
  t,
  portfolioId,
  templateId,
  canPersist,
  highlighted,
}: {
  t: Copy;
  portfolioId: string;
  templateId: TemplateId;
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
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#071021] text-[#99F6E4]">
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
        disabled={!hydrated}
        label={canPersist ? t.onboarding.saveManualProject : t.onboarding.persistenceDisabled}
        saving={t.onboarding.saving}
        testId="manual-project-submit"
      />
    </form>
  );
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
