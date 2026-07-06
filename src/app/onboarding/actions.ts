"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EVIDENCE_BUCKET } from "@/lib/supabase/config";
import { createSupabaseServerClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { isTemplateId } from "@/lib/onboarding/types";

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
  const context = await getActionContext(formData);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? "Unable to save evidence.", "upload");
  }

  const sourceType = String(formData.get("sourceType") ?? "");
  const file = formData.get("file");

  if (sourceType !== "cv" && sourceType !== "certificate") {
    redirectActionError("Unsupported evidence source.", "upload", context.templateId);
  }

  if (!(file instanceof File) || file.size === 0) {
    redirectActionError("Choose a PDF file first.", "upload", context.templateId);
  }

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    redirectActionError("Only PDF files are supported in this sprint.", "upload", context.templateId);
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

export async function saveManualProjectAction(formData: FormData) {
  const context = await getActionContext(formData);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? "Unable to save manual project.", "upload");
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

export async function reviewProposalAction(formData: FormData) {
  const context = await getActionContext(formData);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? "Unable to review proposal.", "review");
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

  await context.supabase
    .from("portfolios")
    .update({ onboarding_state: "review" })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  revalidatePath("/onboarding");
  redirect(`/onboarding?step=review&template=${context.templateId}`);
}

export async function selectTemplateAction(formData: FormData) {
  const context = await getActionContext(formData);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? "Unable to select template.", "template");
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

export async function continueToEditorAction(formData: FormData) {
  const context = await getActionContext(formData);

  if (isActionResult(context)) {
    redirectActionError(context.message ?? "Unable to open the editor.", "summary");
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

async function getActionContext(formData: FormData): Promise<ActionResult | OnboardingActionContext> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { ok: false, message: "Supabase is not configured yet." } satisfies ActionResult;
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
    return { ok: false, message: "No portfolio draft was found." } satisfies ActionResult;
  }

  const ownsPortfolio = await verifyPortfolioOwnership(supabase, portfolioId, user.id);

  if (!ownsPortfolio) {
    return { ok: false, message: "This portfolio draft is not available." } satisfies ActionResult;
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
