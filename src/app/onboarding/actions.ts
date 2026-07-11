"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncGitHubRepositories, importGitHubRepositories, disconnectGitHubConnection } from "@/lib/github/server";
import { EVIDENCE_BUCKET, MAX_EVIDENCE_FILE_BYTES } from "@/lib/supabase/config";
import { createSupabaseServerClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { isTemplateId } from "@/lib/onboarding/types";
import type { Locale } from "@/lib/content";

type ActionResult = {
  ok: boolean;
  message?: string;
};

type OnboardingActionContext = {
  supabase: SupabaseServerClient;
  userId: string;
  portfolioId: string;
  templateId: string;
};

export async function uploadEvidenceAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "saveEvidenceFailed"), "upload");
  }

  const sourceType = normalizeUploadSource(formData.get("sourceType"));
  const file = formData.get("file");

  if (!sourceType) {
    redirectActionError(actionMessage(locale, "unsupportedSource"), "upload", context.templateId);
  }

  if (!(file instanceof File) || file.size === 0) {
    redirectActionError(actionMessage(locale, "missingPdf"), "upload", context.templateId);
  }

  const hasPdfMime = file.type === "application/pdf";
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");

  if (!hasPdfMime || !hasPdfExtension) {
    redirectActionError(actionMessage(locale, "invalidPdf"), "upload", context.templateId);
  }

  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    redirectActionError(actionMessage(locale, "pdfTooLarge"), "upload", context.templateId);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
  const storagePath = `${context.userId}/${context.portfolioId}/${sourceType}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await context.supabase.storage
    .from(EVIDENCE_BUCKET)
    .upload(storagePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    redirectActionError(uploadError.message, "upload", context.templateId);
  }

  const { error: insertError } = await context.supabase.from("evidence_items").insert({
    owner_user_id: context.userId,
    portfolio_id: context.portfolioId,
    source_type: sourceType,
    title: file.name,
    description:
      sourceType === "cv"
        ? "Private CV upload. Automated analysis is deferred."
        : "Private certificate upload. Automated extraction is deferred.",
    storage_path: storagePath,
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
    },
  });

  if (insertError) {
    redirectActionError(insertError.message, "upload", context.templateId);
  }

  await context.supabase
    .from("portfolios")
    .update({ onboarding_state: "evidence" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=review&template=${context.templateId}`);
}

export async function startNewDraftAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectActionError(actionMessage(locale, "missingConfig"), "sources");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/onboarding");
  }

  const selectedTemplateId = normalizeTemplateId(formData.get("templateId"));
  const { error } = await supabase.from("portfolios").insert({
    owner_user_id: user.id,
    title: "ProofFolio evidence draft",
    slug: draftSlug(user.id),
    selected_template_id: selectedTemplateId,
    onboarding_state: selectedTemplateId === "developer-signature" ? "sources" : "template",
    status: "draft",
  });

  if (error) {
    redirectActionError(error.message, "sources", selectedTemplateId);
  }

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=sources&template=${selectedTemplateId}`);
}

export async function saveManualProjectAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "saveManualFailed"), "upload");
  }

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const technologies = String(formData.get("technologies") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const repositoryUrl = normalizeOptionalUrl(formData.get("repositoryUrl"));
  const liveDemoUrl = normalizeOptionalUrl(formData.get("liveDemoUrl"));

  if (!title || !summary) {
    redirectActionError("Project title and summary are required.", "upload", context.templateId);
  }

  const { data: evidence, error: evidenceError } = await context.supabase
    .from("evidence_items")
    .insert({
      owner_user_id: context.userId,
      portfolio_id: context.portfolioId,
      source_type: "manual_project",
      title,
      description: summary,
      metadata: {
        technologies,
        repositoryUrl,
        liveDemoUrl,
      },
    })
    .select("id")
    .single();

  if (evidenceError) {
    redirectActionError(evidenceError.message, "upload", context.templateId);
  }

  const { error: projectError } = await context.supabase.from("project_drafts").insert({
    owner_user_id: context.userId,
    portfolio_id: context.portfolioId,
    title,
    summary,
    stack: technologies,
    evidence_references: [evidence.id],
    status: "draft",
  });

  if (projectError) {
    redirectActionError(projectError.message, "upload", context.templateId);
  }

  await context.supabase
    .from("portfolios")
    .update({ onboarding_state: "review" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=review&template=${context.templateId}`);
}

export async function removeEvidenceAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "removeFailed"), "upload");
  }

  const evidenceId = String(formData.get("evidenceId") ?? "");

  if (!evidenceId) {
    redirectActionError(actionMessage(locale, "missingEvidence"), "upload", context.templateId);
  }

  const { data: evidence, error: evidenceError } = await context.supabase
    .from("evidence_items")
    .select("id,source_type,storage_path")
    .eq("id", evidenceId)
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .maybeSingle();

  if (evidenceError) {
    redirectActionError(evidenceError.message, "upload", context.templateId);
  }

  if (!evidence) {
    redirectActionError(actionMessage(locale, "missingEvidence"), "upload", context.templateId);
  }

  if (typeof evidence.storage_path === "string" && evidence.storage_path.length > 0) {
    const { error: storageError } = await context.supabase.storage
      .from(EVIDENCE_BUCKET)
      .remove([evidence.storage_path]);

    if (storageError) {
      redirectActionError(storageError.message, "upload", context.templateId);
    }
  }

  const { error: reviewDeleteError } = await context.supabase
    .from("proposal_reviews")
    .delete()
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .eq("source_evidence_id", evidenceId);

  if (reviewDeleteError) {
    redirectActionError(reviewDeleteError.message, "upload", context.templateId);
  }

  if (evidence.source_type === "manual_project") {
    const { error: projectDeleteError } = await context.supabase
      .from("project_drafts")
      .delete()
      .eq("portfolio_id", context.portfolioId)
      .eq("owner_user_id", context.userId)
      .contains("evidence_references", [evidenceId]);

    if (projectDeleteError) {
      redirectActionError(projectDeleteError.message, "upload", context.templateId);
    }
  }

  const { error: deleteError } = await context.supabase
    .from("evidence_items")
    .delete()
    .eq("id", evidenceId)
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  if (deleteError) {
    redirectActionError(deleteError.message, "upload", context.templateId);
  }

  await context.supabase
    .from("portfolios")
    .update({ onboarding_state: "evidence" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=upload&template=${context.templateId}`);
}

export async function reviewProposalAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "reviewFailed"), "review");
  }

  const sourceEvidenceId = String(formData.get("sourceEvidenceId") ?? "");
  const action = String(formData.get("reviewAction") ?? "approved");
  const proposedTitle = String(formData.get("proposedTitle") ?? "").trim();
  const proposedSummary = String(formData.get("proposedSummary") ?? "").trim();
  const reviewState = action === "reject" ? "rejected" : action === "edit" ? "edited" : "approved";

  if (!sourceEvidenceId || !proposedTitle || !proposedSummary) {
    redirectActionError("A proposal title and summary are required.", "review", context.templateId);
  }

  const payload = {
    portfolio_id: context.portfolioId,
    owner_user_id: context.userId,
    source_evidence_id: sourceEvidenceId,
    proposed_title: proposedTitle,
    proposed_summary: proposedSummary,
    proposal_type: "prototype_project",
    review_state: reviewState,
    edited_content: reviewState === "edited" ? { title: proposedTitle, summary: proposedSummary } : {},
  };

  const { data: existing, error: existingError } = await context.supabase
    .from("proposal_reviews")
    .select("id")
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .eq("source_evidence_id", sourceEvidenceId)
    .eq("proposal_type", "prototype_project")
    .maybeSingle();

  if (existingError) {
    redirectActionError(existingError.message, "review", context.templateId);
  }

  const query = existing
    ? context.supabase.from("proposal_reviews").update(payload).eq("id", existing.id).eq("owner_user_id", context.userId)
    : context.supabase.from("proposal_reviews").insert(payload);

  const { error } = await query;

  if (error) {
    redirectActionError(error.message, "review", context.templateId);
  }

  const nextProjectStatus = reviewState === "rejected" ? "archived" : "approved";
  await context.supabase
    .from("project_drafts")
    .update({
      title: proposedTitle,
      summary: proposedSummary,
      status: nextProjectStatus,
    })
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .contains("evidence_references", [sourceEvidenceId]);

  await context.supabase
    .from("portfolios")
    .update({ onboarding_state: "review" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=review&template=${context.templateId}`);
}

export async function selectTemplateAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "templateFailed"), "template");
  }

  const templateId = String(formData.get("templateId") ?? "");

  if (!isTemplateId(templateId)) {
    redirectActionError("Choose a supported template.", "template", context.templateId);
  }

  const { error } = await context.supabase
    .from("portfolios")
    .update({ selected_template_id: templateId, onboarding_state: "template" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  if (error) {
    redirectActionError(error.message, "template", context.templateId);
  }

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=summary&template=${templateId}`);
}

export async function syncGitHubRepositoriesAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "githubSyncFailed"), "upload", "developer-signature");
  }

  try {
    await syncGitHubRepositories(context.supabase, context.userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : actionMessage(locale, "githubSyncFailed");
    redirectActionError(message, "upload", context.templateId);
  }

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=upload&source=github_repository&template=${context.templateId}`);
}

export async function importGitHubRepositoriesAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "githubImportFailed"), "upload", "developer-signature");
  }

  const selectedRepositoryIds = formData
    .getAll("repositoryId")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  try {
    await importGitHubRepositories(context.supabase, context.userId, context.portfolioId, selectedRepositoryIds);
  } catch (error) {
    const message = error instanceof Error ? error.message : actionMessage(locale, "githubImportFailed");
    redirectActionError(message, "upload", context.templateId);
  }

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=review&template=${context.templateId}`);
}

export async function disconnectGitHubAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "githubDisconnectFailed"), "upload", "developer-signature");
  }

  try {
    await disconnectGitHubConnection(context.supabase, context.userId, context.portfolioId);
  } catch (error) {
    const message = error instanceof Error ? error.message : actionMessage(locale, "githubDisconnectFailed");
    redirectActionError(message, "upload", context.templateId);
  }

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=upload&source=github_repository&template=${context.templateId}`);
}

export async function continueToEditorAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const context = await getActionContext(formData, locale);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? actionMessage(locale, "editorFailed"), "summary");
  }

  await context.supabase
    .from("portfolios")
    .update({ onboarding_state: "ready" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  revalidatePath("/editor");
  redirect(`/editor?portfolio=${context.portfolioId}&onboarding=ready`);
}

function isActionResult(value: ActionResult | OnboardingActionContext): value is ActionResult {
  return "ok" in value;
}

function redirectActionError(message: string, step: string, templateId = "developer-signature"): never {
  const params = new URLSearchParams({
    step,
    template: templateId,
    error: message,
  });

  redirect(`/onboarding?${params.toString()}`);
}

async function getActionContext(formData: FormData, locale: Locale): Promise<ActionResult | OnboardingActionContext> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: actionMessage(locale, "missingConfig") } satisfies ActionResult;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/onboarding");
  }

  const portfolioId = String(formData.get("portfolioId") ?? "");
  const templateParam = String(formData.get("templateId") ?? "developer-signature");
  const templateId = isTemplateId(templateParam) ? templateParam : "developer-signature";

  if (!portfolioId) {
    return { ok: false, message: actionMessage(locale, "missingPortfolio") } satisfies ActionResult;
  }

  const ownsPortfolio = await verifyPortfolioOwnership(supabase, portfolioId, user.id);

  if (!ownsPortfolio) {
    return { ok: false, message: actionMessage(locale, "unavailablePortfolio") } satisfies ActionResult;
  }

  return {
    supabase,
    userId: user.id,
    portfolioId,
    templateId,
  };
}

async function verifyPortfolioOwnership(
  supabase: SupabaseServerClient,
  portfolioId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  return Boolean(data && !error);
}

function normalizeOptionalUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? "").trim();
  return url.length > 0 ? url : null;
}

function normalizeUploadSource(value: FormDataEntryValue | null) {
  if (value === "cv" || value === "certificate") {
    return value;
  }

  return null;
}

function normalizeTemplateId(value: FormDataEntryValue | null) {
  const templateId = String(value ?? "developer-signature");
  return isTemplateId(templateId) ? templateId : "developer-signature";
}

function getActionLocale(formData: FormData): Locale {
  return formData.get("locale") === "fr" ? "fr" : "en";
}

function actionMessage(locale: Locale, key: keyof typeof actionMessages.en) {
  return actionMessages[locale][key];
}

function draftSlug(userId: string) {
  return `draft-${userId.slice(0, 8)}-${Date.now().toString(36)}`;
}

const actionMessages = {
  en: {
    editorFailed: "Unable to open the editor.",
    invalidPdf: "Only PDF files are supported in this sprint.",
    missingConfig: "Supabase is not configured yet.",
    missingEvidence: "This saved evidence item is not available.",
    missingPdf: "Choose a PDF file first.",
    missingPortfolio: "No portfolio draft was found.",
    pdfTooLarge: "PDF uploads must be 10 MB or smaller.",
    removeFailed: "Unable to remove evidence.",
    reviewFailed: "Unable to review proposal.",
    saveEvidenceFailed: "Unable to save evidence.",
    saveManualFailed: "Unable to save manual project.",
    templateFailed: "Unable to select template.",
    githubSyncFailed: "Unable to sync GitHub repositories.",
    githubImportFailed: "Unable to import selected GitHub repositories.",
    githubDisconnectFailed: "Unable to disconnect GitHub right now.",
    unavailablePortfolio: "This portfolio draft is not available.",
    unsupportedSource: "Unsupported evidence source.",
  },
  fr: {
    editorFailed: "Impossible d'ouvrir l'éditeur.",
    invalidPdf: "Seuls les fichiers PDF sont acceptés pendant ce sprint.",
    missingConfig: "Supabase n'est pas encore configuré.",
    missingEvidence: "Cette preuve sauvegardée n'est pas disponible.",
    missingPdf: "Choisissez d'abord un fichier PDF.",
    missingPortfolio: "Aucun brouillon de portfolio n'a été trouvé.",
    pdfTooLarge: "Les fichiers PDF doivent peser 10 Mo ou moins.",
    removeFailed: "Impossible de supprimer la preuve.",
    reviewFailed: "Impossible d'enregistrer la décision.",
    saveEvidenceFailed: "Impossible d'enregistrer la preuve.",
    saveManualFailed: "Impossible d'enregistrer le projet manuel.",
    templateFailed: "Impossible de sélectionner ce template.",
    githubSyncFailed: "Impossible de synchroniser les repositories GitHub.",
    githubImportFailed: "Impossible d'importer les repositories GitHub sélectionnés.",
    githubDisconnectFailed: "Impossible de déconnecter GitHub pour le moment.",
    unavailablePortfolio: "Ce brouillon de portfolio n'est pas disponible.",
    unsupportedSource: "Source de preuve non prise en charge.",
  },
} satisfies Record<Locale, Record<string, string>>;
