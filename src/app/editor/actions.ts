"use server";

import { revalidatePath } from "next/cache";
import type { Locale, TemplateId } from "@/lib/content";
import {
  accentOptions,
  editorSectionIds,
  layoutOptions,
  motionOptions,
  projectDisplayOptions,
  spacingOptions,
  typographyOptions,
  type EditorActionResult,
  type EditorDesignSettings,
  type EditorSectionId,
  type SectionVisibility,
  isEditorTemplateId,
} from "@/lib/editor/types";
import { createSupabaseServerClient, type SupabaseServerClient } from "@/lib/supabase/server";

type IdentityInput = {
  portfolioId: string;
  title: string;
  headline: string;
  locale: Locale;
};

type PresentationInput = {
  portfolioId: string;
  selectedTemplateId: TemplateId;
  designSettings: EditorDesignSettings;
  sectionOrder: EditorSectionId[];
  sectionVisibility: SectionVisibility;
  locale: Locale;
};

type ProjectInput = {
  portfolioId: string;
  projectId: string;
  title: string;
  summary: string;
  technologies: string[];
  repositoryUrl: string;
  liveDemoUrl: string;
  locale: Locale;
};

type OwnedContext = {
  supabase: SupabaseServerClient;
  userId: string;
  portfolioId: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function saveEditorIdentityAction(input: IdentityInput): Promise<EditorActionResult> {
  const locale = normalizeLocale(input.locale);
  const title = input.title.trim();
  const headline = input.headline.trim();

  if (!title || title.length > 120 || headline.length > 220) {
    return failure(locale, "validation");
  }

  const context = await getOwnedContext(input.portfolioId, locale);

  if ("ok" in context) {
    return context;
  }

  const { data: current, error: selectError } = await context.supabase
    .from("portfolios")
    .select("profile_settings")
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .single();

  if (selectError) {
    return failure(locale, "database");
  }

  const profileSettings = isRecord(current.profile_settings) ? current.profile_settings : {};
  const { error } = await context.supabase
    .from("portfolios")
    .update({
      title,
      profile_settings: { ...profileSettings, headline },
    })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  if (error) {
    return failure(locale, "database");
  }

  revalidatePath("/editor");
  return success();
}

export async function saveEditorPresentationAction(input: PresentationInput): Promise<EditorActionResult> {
  const locale = normalizeLocale(input.locale);

  if (!isEditorTemplateId(input.selectedTemplateId)) {
    return failure(locale, "validation");
  }

  const designSettings = normalizeDesignSettings(input.designSettings);
  const sectionOrder = normalizeSectionOrder(input.sectionOrder);
  const sectionVisibility = normalizeSectionVisibility(input.sectionVisibility);

  if (!designSettings || !sectionOrder || !sectionVisibility) {
    return failure(locale, "validation");
  }

  const context = await getOwnedContext(input.portfolioId, locale);

  if ("ok" in context) {
    return context;
  }

  const { data: current, error: selectError } = await context.supabase
    .from("portfolios")
    .select("profile_settings")
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .single();

  if (selectError) {
    return failure(locale, "database");
  }

  const profileSettings = isRecord(current.profile_settings) ? current.profile_settings : {};
  const { error } = await context.supabase
    .from("portfolios")
    .update({
      selected_template_id: input.selectedTemplateId,
      design_settings: designSettings,
      profile_settings: {
        ...profileSettings,
        sectionOrder,
        sectionVisibility,
      },
    })
    .eq("id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  if (error) {
    return failure(locale, "database");
  }

  revalidatePath("/editor");
  return success();
}

export async function saveEditorProjectAction(input: ProjectInput): Promise<EditorActionResult> {
  const locale = normalizeLocale(input.locale);
  const title = input.title.trim();
  const summary = input.summary.trim();
  const technologies = input.technologies.map((technology) => technology.trim()).filter(Boolean).slice(0, 16);
  const repositoryUrl = normalizeUrl(input.repositoryUrl);
  const liveDemoUrl = normalizeUrl(input.liveDemoUrl);

  if (
    !title ||
    title.length > 140 ||
    !summary ||
    summary.length > 1200 ||
    technologies.some((technology) => technology.length > 48) ||
    repositoryUrl === null ||
    liveDemoUrl === null ||
    !uuidPattern.test(input.projectId)
  ) {
    return failure(locale, "validation");
  }

  const context = await getOwnedContext(input.portfolioId, locale);

  if ("ok" in context) {
    return context;
  }

  const { data: project, error: projectError } = await context.supabase
    .from("project_drafts")
    .select("id,evidence_references")
    .eq("id", input.projectId)
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .maybeSingle();

  if (projectError || !project) {
    return failure(locale, "forbidden");
  }

  const evidenceIds = normalizeStringArray(project.evidence_references).filter((id) => uuidPattern.test(id));

  if (evidenceIds.length === 0) {
    return failure(locale, "forbidden");
  }

  const { data: review, error: reviewError } = await context.supabase
    .from("proposal_reviews")
    .select("id,edited_content")
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId)
    .in("source_evidence_id", evidenceIds)
    .in("review_state", ["approved", "edited"])
    .limit(1)
    .maybeSingle();

  if (reviewError || !review) {
    return failure(locale, "forbidden");
  }

  const { error: updateError } = await context.supabase
    .from("project_drafts")
    .update({
      title,
      summary,
      stack: technologies,
      repository_url: repositoryUrl,
      live_demo_url: liveDemoUrl,
      status: "approved",
    })
    .eq("id", project.id)
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  if (updateError) {
    return failure(locale, "database");
  }

  const editedContent = isRecord(review.edited_content) ? review.edited_content : {};
  const { error: reviewUpdateError } = await context.supabase
    .from("proposal_reviews")
    .update({
      proposed_title: title,
      proposed_summary: summary,
      review_state: "edited",
      edited_content: { ...editedContent, title, summary },
    })
    .eq("id", review.id)
    .eq("portfolio_id", context.portfolioId)
    .eq("owner_user_id", context.userId);

  if (reviewUpdateError) {
    return failure(locale, "database");
  }

  revalidatePath("/editor");
  return success();
}

async function getOwnedContext(portfolioId: string, locale: Locale): Promise<OwnedContext | EditorActionResult> {
  if (!uuidPattern.test(portfolioId)) {
    return failure(locale, "forbidden");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return failure(locale, "setup");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return failure(locale, "unauthenticated");
  }

  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error || !portfolio) {
    return failure(locale, "forbidden");
  }

  return { supabase, userId: user.id, portfolioId };
}

function normalizeDesignSettings(value: EditorDesignSettings) {
  if (
    !accentOptions.includes(value.accent) ||
    !typographyOptions.includes(value.typography) ||
    !layoutOptions.includes(value.layout) ||
    !projectDisplayOptions.includes(value.projectDisplay) ||
    !spacingOptions.includes(value.spacing) ||
    !motionOptions.includes(value.motion)
  ) {
    return null;
  }

  return value;
}

function normalizeSectionOrder(value: EditorSectionId[]) {
  const unique = [...new Set(value)];
  return unique.length === editorSectionIds.length && unique.every((item) => editorSectionIds.includes(item))
    ? unique
    : null;
}

function normalizeSectionVisibility(value: SectionVisibility) {
  if (!editorSectionIds.every((section) => typeof value[section] === "boolean")) {
    return null;
  }

  return {
    projects: value.projects,
    evidence: value.evidence,
    certificates: value.certificates,
  };
}

function normalizeUrl(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length > 2048) {
    return null;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeLocale(value: Locale): Locale {
  return value === "fr" ? "fr" : "en";
}

function success(): EditorActionResult {
  return { ok: true, savedAt: new Date().toISOString() };
}

function failure(locale: Locale, reason: Extract<EditorActionResult, { ok: false }>["reason"]): EditorActionResult {
  const messages = {
    en: {
      setup: "Supabase is not configured. Your changes remain only in the local recovery buffer.",
      unauthenticated: "Your session expired. Sign in again before saving.",
      forbidden: "This portfolio or project is not available to your account.",
      validation: "Review the highlighted values. Titles, summaries and links must be valid before saving.",
      database: "The workspace could not save this change. Your unsaved text remains available locally.",
    },
    fr: {
      setup: "Supabase n’est pas configuré. Vos modifications restent uniquement dans la récupération locale.",
      unauthenticated: "Votre session a expiré. Reconnectez-vous avant d’enregistrer.",
      forbidden: "Ce portfolio ou ce projet n’est pas accessible à votre compte.",
      validation: "Vérifiez les valeurs signalées. Les titres, résumés et liens doivent être valides avant l’enregistrement.",
      database: "L’espace n’a pas pu enregistrer cette modification. Votre texte non enregistré reste disponible localement.",
    },
  } as const;

  return { ok: false, reason, message: messages[locale][reason] };
}
