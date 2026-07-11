import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EditorDesignSettings, EditorProfileSettings } from "@/lib/editor/types";

type PublicProject = {
  id: string;
  title: string;
  summary: string;
  technologies: string[];
  repositoryUrl: string;
  liveDemoUrl: string;
  sourceType: "manual_project" | "github_repository";
  sourceTitle: string;
  proofContext: string;
  reviewState: "approved" | "edited";
};

type PublicEvidence = {
  id: string;
  title: string;
  description: string;
  sourceType: "cv" | "certificate" | "github_repository";
  proofContext: string;
};

export type PublicPortfolioData = {
  id: string;
  slug: string;
  title: string;
  selectedTemplateId: string;
  publishedAt: string | null;
  updatedAt: string;
  displayName: string;
  headline: string;
  profileSettings: EditorProfileSettings;
  designSettings: EditorDesignSettings;
  publicSettings: Record<string, unknown>;
  projects: PublicProject[];
  evidence: PublicEvidence[];
  proofCount: number;
  previewMode: boolean;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPublicPortfolioData({
  slug,
  preview,
  portfolioId,
}: {
  slug: string;
  preview: boolean;
  portfolioId?: string;
}): Promise<PublicPortfolioData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    notFound();
  }

  if (preview && portfolioId && uuidPattern.test(portfolioId)) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/auth/sign-in?next=${encodeURIComponent(`/p/${slug}?preview=1&portfolio=${portfolioId}`)}`);
    }

    const publicPreview = await buildOwnedPreview(supabase, user.id, portfolioId, slug);

    if (publicPreview) {
      return { ...publicPreview, previewMode: true };
    }
  }

  const { data, error } = await supabase.rpc("get_public_portfolio", { requested_slug: slug });

  if (error || !data) {
    notFound();
  }

  const portfolio = normalizePublicPortfolioPayload(data);

  if (!portfolio) {
    notFound();
  }

  return { ...portfolio, previewMode: false };
}

export async function getPublishedPortfolioSlugs() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.rpc("list_published_portfolios");

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const slug = typeof record.slug === "string" ? record.slug : "";
    const updatedAt = typeof record.updated_at === "string" ? record.updated_at : "";

    return slug ? [{ slug, updatedAt }] : [];
  });
}

async function buildOwnedPreview(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  portfolioId: string,
  slug: string,
) {
  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .select("id,slug,title,selected_template_id,status,published_at,updated_at,profile_settings,design_settings,public_settings")
    .eq("id", portfolioId)
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (portfolioError || !portfolio || String(portfolio.slug ?? "") !== slug) {
    return null;
  }

  const [{ data: profile }, { data: evidenceRows }, { data: reviewRows }, { data: projectRows }] = await Promise.all([
    supabase.from("profiles").select("display_name,headline").eq("id", userId).maybeSingle(),
    supabase
      .from("evidence_items")
      .select("id,source_type,title,description,metadata")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId),
    supabase
      .from("proposal_reviews")
      .select("id,source_evidence_id,review_state,edited_content")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId)
      .in("review_state", ["approved", "edited"]),
    supabase
      .from("project_drafts")
      .select("id,title,summary,stack,evidence_references,repository_url,live_demo_url")
      .eq("portfolio_id", portfolioId)
      .eq("owner_user_id", userId),
  ]);

  const approvedEvidenceIds = new Set((reviewRows ?? []).map((review) => String(review.source_evidence_id ?? "")));
  const evidenceById = new Map((evidenceRows ?? []).map((evidence) => [String(evidence.id), evidence]));
  const projects = (projectRows ?? []).flatMap((project) => {
    const references = Array.isArray(project.evidence_references)
      ? project.evidence_references.filter((value): value is string => typeof value === "string")
      : [];
    const evidenceId = references.find((reference) => approvedEvidenceIds.has(reference));

    if (!evidenceId) {
      return [];
    }

    const evidence = evidenceById.get(evidenceId);
    const sourceType = evidence?.source_type === "github_repository" ? "github_repository" : "manual_project";
    const edited = (reviewRows ?? []).find((review) => String(review.source_evidence_id ?? "") === evidenceId)?.edited_content;
    const editedRecord = edited && typeof edited === "object" && !Array.isArray(edited) ? (edited as Record<string, unknown>) : {};

    return [
      {
        id: String(project.id),
        title: typeof editedRecord.title === "string" ? editedRecord.title : String(project.title ?? ""),
        summary: typeof editedRecord.summary === "string" ? editedRecord.summary : String(project.summary ?? ""),
        technologies: Array.isArray(project.stack) ? project.stack.filter((value): value is string => typeof value === "string") : [],
        repositoryUrl: String(project.repository_url ?? ""),
        liveDemoUrl: String(project.live_demo_url ?? ""),
        sourceType,
        sourceTitle: String(evidence?.title ?? ""),
        proofContext: typeof evidence?.metadata === "object" && evidence?.metadata && !Array.isArray(evidence.metadata)
          ? String((evidence.metadata as Record<string, unknown>).proofContext ?? "")
          : "",
        reviewState: "approved" as const,
      },
    ];
  });

  const evidence = (evidenceRows ?? [])
    .filter((item) => approvedEvidenceIds.has(String(item.id)) && item.source_type !== "manual_project")
    .flatMap((item) => {
      const sourceType = normalizePublicEvidenceSource(item.source_type);

      if (!sourceType) {
        return [];
      }

      const metadata = item.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata)
        ? (item.metadata as Record<string, unknown>)
        : {};

      return [
        {
          id: String(item.id),
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
          sourceType,
          proofContext: String(metadata.proofContext ?? ""),
        },
      ];
    });

  return normalizePublicPortfolioPayload({
    id: portfolio.id,
    slug: portfolio.slug,
    title: portfolio.title,
    selectedTemplateId: portfolio.selected_template_id,
    publishedAt: portfolio.published_at,
    updatedAt: portfolio.updated_at,
    displayName: profile?.display_name ?? "ProofFolio User",
    headline:
      (portfolio.profile_settings &&
      typeof portfolio.profile_settings === "object" &&
      !Array.isArray(portfolio.profile_settings) &&
      typeof (portfolio.profile_settings as Record<string, unknown>).headline === "string"
        ? String((portfolio.profile_settings as Record<string, unknown>).headline)
        : String(profile?.headline ?? "")),
    profileSettings: portfolio.profile_settings,
    designSettings: portfolio.design_settings,
    publicSettings: portfolio.public_settings,
    projects,
    evidence,
    proofCount: approvedEvidenceIds.size,
  });
}

function normalizePublicPortfolioPayload(data: unknown): PublicPortfolioData | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const slug = typeof record.slug === "string" ? record.slug : "";
  const title = typeof record.title === "string" ? record.title : "";

  if (!slug || !title) {
    return null;
  }

  return {
    id: String(record.id ?? ""),
    slug,
    title,
    selectedTemplateId: typeof record.selectedTemplateId === "string" ? record.selectedTemplateId : "developer-signature",
    publishedAt: typeof record.publishedAt === "string" ? record.publishedAt : null,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : "",
    displayName: typeof record.displayName === "string" ? record.displayName : "ProofFolio User",
    headline: typeof record.headline === "string" ? record.headline : "",
    profileSettings: normalizeProfileSettings(record.profileSettings),
    designSettings: normalizeDesignSettings(record.designSettings),
    publicSettings: isRecord(record.publicSettings) ? record.publicSettings : {},
    projects: normalizeProjects(record.projects),
    evidence: normalizeEvidence(record.evidence),
    proofCount: typeof record.proofCount === "number" ? record.proofCount : 0,
    previewMode: false,
  };
}

function normalizeProfileSettings(value: unknown): EditorProfileSettings {
  const record = isRecord(value) ? value : {};
  const sectionVisibilityRecord = isRecord(record.sectionVisibility) ? record.sectionVisibility : {};
  const defaultSectionOrder: EditorProfileSettings["sectionOrder"] = ["projects", "evidence", "certificates"];
  const sectionOrder = Array.isArray(record.sectionOrder)
    ? record.sectionOrder.filter((item): item is "projects" | "evidence" | "certificates" => item === "projects" || item === "evidence" || item === "certificates")
    : defaultSectionOrder;

  return {
    headline: typeof record.headline === "string" ? record.headline : "",
    targetRole: typeof record.targetRole === "string" ? record.targetRole : "",
    availability: typeof record.availability === "string" ? record.availability : "",
    sectionOrder: sectionOrder.length > 0 ? sectionOrder : defaultSectionOrder,
    sectionVisibility: {
      projects: typeof sectionVisibilityRecord.projects === "boolean" ? sectionVisibilityRecord.projects : true,
      evidence: typeof sectionVisibilityRecord.evidence === "boolean" ? sectionVisibilityRecord.evidence : true,
      certificates: typeof sectionVisibilityRecord.certificates === "boolean" ? sectionVisibilityRecord.certificates : true,
    },
  };
}

function normalizeDesignSettings(value: unknown): EditorDesignSettings {
  const record = isRecord(value) ? value : {};

  return {
    accent: typeof record.accent === "string" ? (record.accent as EditorDesignSettings["accent"]) : "#4da3ff",
    typography:
      record.typography === "editorial" || record.typography === "compact" || record.typography === "technical"
        ? record.typography
        : "technical",
    layout:
      record.layout === "grid" || record.layout === "snapshot" || record.layout === "narrative"
        ? record.layout
        : "narrative",
    projectDisplay:
      record.projectDisplay === "evidence-cards" ||
      record.projectDisplay === "repository-feed" ||
      record.projectDisplay === "case-studies"
        ? record.projectDisplay
        : "case-studies",
    spacing:
      record.spacing === "compact" || record.spacing === "airy" || record.spacing === "balanced"
        ? record.spacing
        : "balanced",
    motion:
      record.motion === "reduced" || record.motion === "expressive" || record.motion === "refined"
        ? record.motion
        : "refined",
  };
}

function normalizeProjects(value: unknown): PublicProject[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const sourceType = item.sourceType === "github_repository" ? "github_repository" : "manual_project";
    return [
      {
        id: String(item.id ?? ""),
        title: String(item.title ?? ""),
        summary: String(item.summary ?? ""),
        technologies: Array.isArray(item.technologies) ? item.technologies.filter((entry): entry is string => typeof entry === "string") : [],
        repositoryUrl: String(item.repositoryUrl ?? ""),
        liveDemoUrl: String(item.liveDemoUrl ?? ""),
        sourceType,
        sourceTitle: String(item.sourceTitle ?? ""),
        proofContext: String(item.proofContext ?? ""),
        reviewState: item.reviewState === "edited" ? "edited" : "approved",
      },
    ];
  });
}

function normalizeEvidence(value: unknown): PublicEvidence[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const sourceType = normalizePublicEvidenceSource(item.sourceType);

    if (!sourceType) {
      return [];
    }

    return [
      {
        id: String(item.id ?? ""),
        title: String(item.title ?? ""),
        description: String(item.description ?? ""),
        sourceType,
        proofContext: String(item.proofContext ?? ""),
      },
    ];
  });
}

function normalizePublicEvidenceSource(value: unknown): PublicEvidence["sourceType"] | null {
  if (value === "cv" || value === "certificate" || value === "github_repository") {
    return value;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
