import { redirect } from "next/navigation";
import type { TemplateId } from "@/lib/content";
import {
  accentOptions,
  defaultDesignSettings,
  defaultProfileSettings,
  editorSectionIds,
  layoutOptions,
  motionOptions,
  projectDisplayOptions,
  spacingOptions,
  typographyOptions,
  type EditorDesignSettings,
  type EditorEvidenceItem,
  type EditorInitialState,
  type EditorProfileSettings,
  type EditorProject,
  type EditorSectionId,
  isEditorTemplateId,
} from "@/lib/editor/types";
import type { EvidenceSourceType, ReviewState } from "@/lib/onboarding/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParamsInput = Record<string, string | string[] | undefined>;
type UnknownRecord = Record<string, unknown>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getEditorInitialState(searchParams: SearchParamsInput): Promise<EditorInitialState> {
  const portfolioId = getSingle(searchParams.portfolio);
  const requestedTemplate = getSingle(searchParams.template);
  const selectedTemplateId = isEditorTemplateId(requestedTemplate) ? requestedTemplate : "dark-tech";

  if (!portfolioId) {
    return buildPreviewState(selectedTemplateId);
  }

  if (!uuidPattern.test(portfolioId)) {
    return buildUnavailableState("denied", portfolioId, selectedTemplateId);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return buildUnavailableState("setup_required", portfolioId, selectedTemplateId);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = `/editor?portfolio=${encodeURIComponent(portfolioId)}&onboarding=ready`;
    redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  }

  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .select("id,title,slug,selected_template_id,status,published_at,profile_settings,design_settings,updated_at")
    .eq("id", portfolioId)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (portfolioError) {
    return buildUnavailableState("error", portfolioId, selectedTemplateId);
  }

  if (!portfolio) {
    return buildUnavailableState("denied", portfolioId, selectedTemplateId);
  }

  const [{ data: profile }, evidenceResult, projectResult, reviewResult] = await Promise.all([
    supabase.from("profiles").select("display_name,headline").eq("id", user.id).maybeSingle(),
    supabase
      .from("evidence_items")
      .select("id,source_type,title,description,metadata,created_at")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_drafts")
      .select("id,title,summary,stack,evidence_references,status,repository_url,live_demo_url,updated_at")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("proposal_reviews")
      .select("id,source_evidence_id,proposed_title,proposed_summary,review_state,edited_content")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", user.id),
  ]);

  if (evidenceResult.error || projectResult.error || reviewResult.error) {
    return buildUnavailableState("error", portfolioId, selectedTemplateId);
  }

  const reviewRows = reviewResult.data ?? [];
  const reviewByEvidence = new Map(
    reviewRows
      .filter((review) => typeof review.source_evidence_id === "string")
      .map((review) => [String(review.source_evidence_id), review]),
  );

  const evidenceRows = evidenceResult.data ?? [];
  const evidenceById = new Map(evidenceRows.map((item) => [String(item.id), item]));
  const evidenceItems: EditorEvidenceItem[] = evidenceRows.map((item) => {
    const review = reviewByEvidence.get(String(item.id));
    const reviewState = normalizeReviewState(review?.review_state);

    return {
      id: String(item.id),
      sourceType: normalizeEvidenceSource(item.source_type),
      title: String(item.title ?? "Untitled evidence"),
      description: String(item.description ?? ""),
      createdAt: String(item.created_at ?? ""),
      reviewState,
      approvedForPortfolio: reviewState === "approved" || reviewState === "edited",
    };
  });

  const projects: EditorProject[] = (projectResult.data ?? []).flatMap((project) => {
    const evidenceIds = normalizeStringArray(project.evidence_references);
    const sourceEvidenceId = evidenceIds.find((id) => {
      const sourceType = evidenceById.get(id)?.source_type;
      return sourceType === "manual_project" || sourceType === "github_repository";
    });

    if (!sourceEvidenceId) {
      return [];
    }

    const review = reviewByEvidence.get(sourceEvidenceId);
    const reviewState = normalizeReviewState(review?.review_state);

    if (!review || (reviewState !== "approved" && reviewState !== "edited")) {
      return [];
    }

    const editedContent = isRecord(review.edited_content) ? review.edited_content : {};
    const evidenceMetadata = isRecord(evidenceById.get(sourceEvidenceId)?.metadata)
      ? (evidenceById.get(sourceEvidenceId)?.metadata as UnknownRecord)
      : {};

    return [
      {
        id: String(project.id),
        sourceEvidenceId,
        sourceType: normalizeProjectSource(evidenceById.get(sourceEvidenceId)?.source_type),
        reviewId: String(review.id),
        reviewState,
        title: stringValue(editedContent.title) || String(project.title ?? review.proposed_title ?? "Untitled project"),
        summary: stringValue(editedContent.summary) || String(project.summary ?? review.proposed_summary ?? ""),
        technologies: normalizeStringArray(project.stack),
        repositoryUrl: stringValue(project.repository_url) || stringValue(evidenceMetadata.repositoryUrl),
        liveDemoUrl: stringValue(project.live_demo_url) || stringValue(evidenceMetadata.liveDemoUrl),
      },
    ];
  });

  const profileSettings = normalizeProfileSettings(portfolio.profile_settings, stringValue(profile?.headline));
  const designSettings = normalizeDesignSettings(portfolio.design_settings);

  return {
    mode: "ready",
    canPersist: true,
    portfolio: {
      id: String(portfolio.id),
      title: String(portfolio.title ?? "Untitled ProofFolio"),
      slug: String(portfolio.slug ?? ""),
      displayName: stringValue(profile?.display_name) || profileNameFromEmail(user.email),
      selectedTemplateId: isEditorTemplateId(portfolio.selected_template_id)
        ? portfolio.selected_template_id
        : "developer-signature",
      status:
        portfolio.status === "published"
          ? "published"
          : portfolio.status === "unpublished"
            ? "unpublished"
            : "draft",
      updatedAt: String(portfolio.updated_at ?? ""),
      publishedAt: typeof portfolio.published_at === "string" ? portfolio.published_at : null,
      profileSettings,
      designSettings,
    },
    projects,
    evidenceItems,
  };
}

function buildPreviewState(selectedTemplateId: TemplateId): EditorInitialState {
  return {
    mode: "preview",
    canPersist: false,
    portfolio: {
      id: "preview-editor",
      title: "Maya Chen - Product Engineering Portfolio",
      slug: "maya-chen-proof",
      displayName: "Maya Chen",
      selectedTemplateId,
      status: "draft",
      updatedAt: "",
      publishedAt: null,
      profileSettings: {
        ...defaultProfileSettings,
        headline: "Product-minded frontend engineer building accessible AI and data experiences.",
        targetRole: "Frontend Engineer",
        availability: "Open to internship and junior product engineering roles",
      },
      designSettings: { ...defaultDesignSettings },
    },
    projects: [
      {
        id: "preview-atlas",
        sourceEvidenceId: "preview-evidence-atlas",
        sourceType: "manual_project",
        reviewId: "preview-review-atlas",
        reviewState: "approved",
        title: "Atlas UI Systems",
        summary: "A token-driven component library with documented keyboard states and release evidence.",
        technologies: ["React", "TypeScript", "Accessibility"],
        repositoryUrl: "https://github.com/prooffolio/atlas-ui",
        liveDemoUrl: "https://example.com/atlas-ui",
      },
      {
        id: "preview-modelops",
        sourceEvidenceId: "preview-evidence-modelops",
        sourceType: "github_repository",
        reviewId: "preview-review-modelops",
        reviewState: "edited",
        title: "ModelOps Notes",
        summary: "A local-first experiment notebook that makes model comparisons and product decisions legible.",
        technologies: ["Next.js", "Data visualization", "Local models"],
        repositoryUrl: "https://github.com/prooffolio/modelops-notes",
        liveDemoUrl: "",
      },
    ],
    evidenceItems: [
      {
        id: "preview-evidence-atlas",
        sourceType: "manual_project",
        title: "Atlas UI Systems",
        description: "Manual project evidence",
        createdAt: "2026-07-10T10:00:00.000Z",
        reviewState: "approved",
        approvedForPortfolio: true,
      },
      {
        id: "preview-certificate",
        sourceType: "certificate",
        title: "Accessible Web Interfaces.pdf",
        description: "Private certificate record",
        createdAt: "2026-07-09T10:00:00.000Z",
        reviewState: "approved",
        approvedForPortfolio: true,
      },
      {
        id: "preview-cv",
        sourceType: "cv",
        title: "Maya-Chen-CV.pdf",
        description: "Private CV record",
        createdAt: "2026-07-08T10:00:00.000Z",
        reviewState: "pending",
        approvedForPortfolio: false,
      },
      {
        id: "preview-github",
        sourceType: "github_repository",
        title: "modelops-notes",
        description: "Public GitHub repository metadata imported with user approval.",
        createdAt: "2026-07-08T12:00:00.000Z",
        reviewState: "edited",
        approvedForPortfolio: true,
      },
    ],
  };
}

function buildUnavailableState(
  mode: "setup_required" | "denied" | "error",
  portfolioId: string,
  selectedTemplateId: TemplateId,
): EditorInitialState {
  return {
    ...buildPreviewState(selectedTemplateId),
    mode,
    canPersist: false,
    portfolio: {
      ...buildPreviewState(selectedTemplateId).portfolio,
      id: portfolioId,
      title: "",
      slug: "",
      displayName: "",
      publishedAt: null,
      profileSettings: { ...defaultProfileSettings },
    },
    projects: [],
    evidenceItems: [],
  };
}

function normalizeProfileSettings(value: unknown, fallbackHeadline: string): EditorProfileSettings {
  const record = isRecord(value) ? value : {};
  const rawVisibility = isRecord(record.sectionVisibility) ? record.sectionVisibility : {};
  const rawOrder = normalizeStringArray(record.sectionOrder).filter((item): item is EditorSectionId =>
    editorSectionIds.includes(item as EditorSectionId),
  );
  const sectionOrder = [...new Set(rawOrder)];

  editorSectionIds.forEach((section) => {
    if (!sectionOrder.includes(section)) {
      sectionOrder.push(section);
    }
  });

  return {
    headline: typeof record.headline === "string" ? record.headline : fallbackHeadline,
    targetRole: typeof record.targetRole === "string" ? record.targetRole : "",
    availability: typeof record.availability === "string" ? record.availability : "",
    sectionOrder,
    sectionVisibility: {
      projects: booleanValue(rawVisibility.projects, true),
      evidence: booleanValue(rawVisibility.evidence, true),
      certificates: booleanValue(rawVisibility.certificates, true),
    },
  };
}

function normalizeDesignSettings(value: unknown): EditorDesignSettings {
  const record = isRecord(value) ? value : {};

  return {
    accent: accentOptions.includes(record.accent as (typeof accentOptions)[number])
      ? (record.accent as (typeof accentOptions)[number])
      : defaultDesignSettings.accent,
    typography: typographyOptions.includes(record.typography as EditorDesignSettings["typography"])
      ? (record.typography as EditorDesignSettings["typography"])
      : defaultDesignSettings.typography,
    layout: layoutOptions.includes(record.layout as EditorDesignSettings["layout"])
      ? (record.layout as EditorDesignSettings["layout"])
      : defaultDesignSettings.layout,
    projectDisplay: projectDisplayOptions.includes(record.projectDisplay as EditorDesignSettings["projectDisplay"])
      ? (record.projectDisplay as EditorDesignSettings["projectDisplay"])
      : defaultDesignSettings.projectDisplay,
    spacing: spacingOptions.includes(record.spacing as EditorDesignSettings["spacing"])
      ? (record.spacing as EditorDesignSettings["spacing"])
      : defaultDesignSettings.spacing,
    motion: motionOptions.includes(record.motion as EditorDesignSettings["motion"])
      ? (record.motion as EditorDesignSettings["motion"])
      : defaultDesignSettings.motion,
  };
}

function normalizeEvidenceSource(value: unknown): EvidenceSourceType {
  if (
    value === "cv" ||
    value === "certificate" ||
    value === "manual_project" ||
    value === "github_placeholder" ||
    value === "github_repository"
  ) {
    return value;
  }

  return "manual_project";
}

function normalizeProjectSource(value: unknown): "manual_project" | "github_repository" {
  return value === "github_repository" ? "github_repository" : "manual_project";
}

function normalizeReviewState(value: unknown): ReviewState | null {
  if (value === "pending" || value === "approved" || value === "edited" || value === "rejected") {
    return value;
  }

  return null;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(stringValue).filter(Boolean) : [];
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function profileNameFromEmail(email: string | undefined) {
  return email?.split("@")[0]?.replace(/[._-]+/g, " ") || "ProofFolio user";
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
