import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { TemplateId } from "@/lib/content";
import {
  type EvidenceItem,
  type EvidenceSourceType,
  type DraftProgress,
  type DraftRecovery,
  type OnboardingInitialState,
  type PortfolioDraft,
  type ProposalReview,
  type ReviewState,
  isTemplateId,
  normalizeEvidenceSource,
  normalizeOnboardingStep,
  sourceLabel,
} from "@/lib/onboarding/types";
import { createSupabaseServerClient, type SupabaseServerClient } from "@/lib/supabase/server";

type SearchParamsInput = Record<string, string | string[] | undefined>;

const previewPortfolio: PortfolioDraft = {
  id: "preview-unconfigured",
  title: "ProofFolio evidence draft",
  selectedTemplateId: "developer-signature",
  onboardingState: "sources",
};

const previewEvidence: EvidenceItem[] = [
  {
    id: "preview-manual-project",
    sourceType: "manual_project",
    title: "Atlas UI Systems",
    description: "Accessible component library with release notes and implementation evidence.",
    storagePath: null,
    metadata: {
      technologies: ["React", "TypeScript", "Accessibility"],
      repositoryUrl: "https://github.com/prooffolio/atlas-ui",
    },
    createdAt: new Date("2026-07-06T00:00:00.000Z").toISOString(),
  },
];

const emptyProgress: DraftProgress = {
  sourcesAdded: 0,
  uploadsCompleted: 0,
  projectsAdded: 0,
  suggestionsApproved: 0,
  templateSelected: false,
};

export async function getOnboardingInitialState(
  searchParams: SearchParamsInput,
): Promise<OnboardingInitialState> {
  const requestedTemplate = getSingle(searchParams.template);
  const step = normalizeOnboardingStep(getSingle(searchParams.step));
  const selectedSource = normalizeEvidenceSource(getSingle(searchParams.source));
  const actionError = getSingle(searchParams.error);
  const requestedTemplateId = isTemplateId(requestedTemplate) ? requestedTemplate : null;
  const selectedTemplateId = requestedTemplateId ?? "developer-signature";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const portfolio = { ...previewPortfolio, selectedTemplateId };
    const suggestions = buildPrototypeSuggestions(previewEvidence, []);
    const progress = buildDraftProgress(portfolio, previewEvidence, []);

    return {
      configured: false,
      authenticated: false,
      portfolio,
      draftRecovery: {
        available: true,
        title: portfolio.title,
        recommendedStep: "sources",
        progress,
        updatedAt: previewEvidence[0]?.createdAt ?? null,
      },
      evidenceItems: previewEvidence,
      proposalReviews: [],
      suggestions,
      selectedTemplateId,
      selectedSource,
      step,
      approvedCount: 0,
      errorMessage: actionError ?? "Supabase is not configured yet. This preview cannot persist evidence.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/onboarding${toQueryString(searchParams)}`;
    redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  }

  try {
    const draft = await ensurePortfolioDraft(supabase, user, requestedTemplateId);
    const portfolio = draft.portfolio;
    const [evidenceItems, proposalReviews] = await Promise.all([
      getEvidenceItems(supabase, portfolio.id),
      getProposalReviews(supabase, portfolio.id),
    ]);
    const suggestions = buildPrototypeSuggestions(evidenceItems, proposalReviews);
    const progress = buildDraftProgress(portfolio, evidenceItems, proposalReviews);

    return {
      configured: true,
      authenticated: true,
      portfolio,
      draftRecovery: buildDraftRecovery(draft.existing, portfolio, evidenceItems, progress),
      evidenceItems,
      proposalReviews,
      suggestions,
      selectedTemplateId: portfolio.selectedTemplateId,
      selectedSource,
      step,
      approvedCount: proposalReviews.filter((review) => review.reviewState === "approved" || review.reviewState === "edited").length,
      errorMessage: actionError,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load onboarding state.";

    return {
      configured: true,
      authenticated: true,
      portfolio: { ...previewPortfolio, id: "setup-error", selectedTemplateId },
      draftRecovery: {
        available: false,
        title: previewPortfolio.title,
        recommendedStep: "sources",
        progress: emptyProgress,
        updatedAt: null,
      },
      evidenceItems: [],
      proposalReviews: [],
      suggestions: [],
      selectedTemplateId,
      selectedSource,
      step,
      approvedCount: 0,
      errorMessage: message,
    };
  }
}

export function buildPrototypeSuggestions(
  evidenceItems: EvidenceItem[],
  proposalReviews: ProposalReview[],
) {
  return evidenceItems
    .filter((item) => item.sourceType !== "github_placeholder")
    .map((item) => {
      const review =
        proposalReviews.find(
          (candidate) => candidate.sourceEvidenceId === item.id && candidate.proposalType === "prototype_project",
        ) ?? null;
      return mapSuggestion(item, review);
    });
}

async function ensurePortfolioDraft(
  supabase: SupabaseServerClient,
  user: User,
  requestedTemplateId: TemplateId | null,
): Promise<{ portfolio: PortfolioDraft; existing: boolean }> {
  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: profileNameFromEmail(user.email),
  });

  const { data: existing, error: selectError } = await supabase
    .from("portfolios")
    .select("id,title,selected_template_id,onboarding_state,updated_at")
    .eq("owner_user_id", user.id)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    if (requestedTemplateId && existing.selected_template_id !== requestedTemplateId) {
      const { error: updateError } = await supabase
        .from("portfolios")
        .update({ selected_template_id: requestedTemplateId, onboarding_state: "template" })
        .eq("id", existing.id)
        .eq("owner_user_id", user.id);

      if (updateError) {
        throw updateError;
      }
    }

    return {
      existing: true,
      portfolio: {
      id: String(existing.id),
      title: String(existing.title ?? "ProofFolio evidence draft"),
      selectedTemplateId: requestedTemplateId ?? (isTemplateId(existing.selected_template_id) ? existing.selected_template_id : "developer-signature"),
      onboardingState: String(existing.onboarding_state ?? "sources"),
      },
    };
  }

  const selectedTemplateId = requestedTemplateId ?? "developer-signature";
  const slug = draftSlug(user.id);
  const { data: created, error: insertError } = await supabase
    .from("portfolios")
    .insert({
      owner_user_id: user.id,
      title: "ProofFolio evidence draft",
      slug,
      selected_template_id: selectedTemplateId,
      onboarding_state: selectedTemplateId === "developer-signature" ? "sources" : "template",
    })
    .select("id,title,selected_template_id,onboarding_state")
    .single();

  if (insertError) {
    throw insertError;
  }

  return {
    existing: false,
    portfolio: {
      id: String(created.id),
      title: String(created.title ?? "ProofFolio evidence draft"),
      selectedTemplateId: isTemplateId(created.selected_template_id) ? created.selected_template_id : "developer-signature",
      onboardingState: String(created.onboarding_state ?? "sources"),
    },
  };
}

async function getEvidenceItems(supabase: SupabaseServerClient, portfolioId: string) {
  const { data, error } = await supabase
    .from("evidence_items")
    .select("id,source_type,title,description,metadata,created_at")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    id: String(item.id),
    sourceType: normalizeSourceType(item.source_type),
    title: String(item.title ?? "Untitled evidence"),
    description: String(item.description ?? ""),
    storagePath: null,
    metadata: isRecord(item.metadata) ? item.metadata : {},
    createdAt: String(item.created_at ?? ""),
  }));
}

async function getProposalReviews(supabase: SupabaseServerClient, portfolioId: string) {
  const { data, error } = await supabase
    .from("proposal_reviews")
    .select("id,source_evidence_id,proposed_title,proposed_summary,proposal_type,review_state,edited_content")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((review) => ({
    id: String(review.id),
    sourceEvidenceId: typeof review.source_evidence_id === "string" ? review.source_evidence_id : null,
    proposedTitle: String(review.proposed_title ?? ""),
    proposedSummary: String(review.proposed_summary ?? ""),
    proposalType: String(review.proposal_type ?? "prototype_project"),
    reviewState: normalizeReviewState(review.review_state),
    editedContent: isRecord(review.edited_content) ? review.edited_content : {},
  }));
}

function mapSuggestion(item: EvidenceItem, review: ProposalReview | null) {
  const stack = Array.isArray(item.metadata.technologies) ? item.metadata.technologies.join(", ") : "";
  const title =
    item.sourceType === "manual_project"
      ? item.title
      : `${sourceLabel(item.sourceType)} evidence: ${item.title}`;
  const summary =
    item.sourceType === "manual_project"
      ? `${item.description}${stack ? ` Stack: ${stack}.` : ""}`
      : `Use ${item.title} as source material for a reviewed portfolio proof block. The uploaded file is stored privately and has not been parsed.`;
  const proofContext =
    item.sourceType === "manual_project"
      ? `Manual project evidence saved by the user${stack ? ` with stack: ${stack}` : ""}.`
      : `${sourceLabel(item.sourceType)} PDF saved privately. No automated parsing is claimed.`;

  return {
    key: `${item.id}:prototype_project`,
    sourceEvidenceId: item.id,
    sourceType: item.sourceType,
    sourceTitle: item.title,
    sourceDescription: item.description,
    label: sourceLabel(item.sourceType),
    proposedTitle: review?.proposedTitle || title,
    proposedSummary: review?.proposedSummary || summary,
    proofContext,
    proposalType: "prototype_project",
    review,
  };
}

function buildDraftProgress(
  portfolio: PortfolioDraft,
  evidenceItems: EvidenceItem[],
  proposalReviews: ProposalReview[],
): DraftProgress {
  const addedSourceTypes = new Set(evidenceItems.map((item) => item.sourceType));
  const approvedCount = proposalReviews.filter((review) => review.reviewState === "approved" || review.reviewState === "edited").length;

  return {
    sourcesAdded: addedSourceTypes.size,
    uploadsCompleted: evidenceItems.filter((item) => item.sourceType === "cv" || item.sourceType === "certificate").length,
    projectsAdded: evidenceItems.filter((item) => item.sourceType === "manual_project").length,
    suggestionsApproved: approvedCount,
    templateSelected: portfolio.onboardingState === "template" || portfolio.onboardingState === "ready" || portfolio.selectedTemplateId !== "developer-signature",
  };
}

function buildDraftRecovery(
  existing: boolean,
  portfolio: PortfolioDraft,
  evidenceItems: EvidenceItem[],
  progress: DraftProgress,
): DraftRecovery {
  return {
    available: existing || evidenceItems.length > 0,
    title: portfolio.title,
    recommendedStep: recommendedStepFromProgress(portfolio, progress),
    progress,
    updatedAt: evidenceItems[0]?.createdAt ?? null,
  };
}

function recommendedStepFromProgress(portfolio: PortfolioDraft, progress: DraftProgress) {
  if (portfolio.onboardingState === "ready") {
    return "summary";
  }

  if (progress.templateSelected) {
    return "summary";
  }

  if (progress.suggestionsApproved > 0) {
    return "template";
  }

  if (progress.sourcesAdded > 0) {
    return "review";
  }

  return "sources";
}

function draftSlug(userId: string) {
  return `draft-${userId.slice(0, 8)}-${Date.now().toString(36)}`;
}

function profileNameFromEmail(email: string | undefined) {
  if (!email) {
    return "ProofFolio user";
  }

  return email.split("@")[0]?.replace(/[._-]+/g, " ") || "ProofFolio user";
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toQueryString(searchParams: SearchParamsInput) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function normalizeSourceType(value: unknown): EvidenceSourceType {
  if (value === "cv" || value === "certificate" || value === "manual_project" || value === "github_placeholder") {
    return value;
  }

  return "manual_project";
}

function normalizeReviewState(value: unknown): ReviewState {
  if (value === "pending" || value === "approved" || value === "edited" || value === "rejected") {
    return value;
  }

  return "pending";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
