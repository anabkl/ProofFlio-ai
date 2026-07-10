import { templateIds, type TemplateId } from "@/lib/content";
import type { EvidenceSourceType, ReviewState } from "@/lib/onboarding/types";

export const editorSectionIds = ["projects", "evidence", "certificates"] as const;
export type EditorSectionId = (typeof editorSectionIds)[number];

export const typographyOptions = ["editorial", "technical", "compact"] as const;
export type EditorTypography = (typeof typographyOptions)[number];

export const layoutOptions = ["narrative", "grid", "snapshot"] as const;
export type EditorLayout = (typeof layoutOptions)[number];

export const projectDisplayOptions = ["case-studies", "evidence-cards", "repository-feed"] as const;
export type EditorProjectDisplay = (typeof projectDisplayOptions)[number];

export const spacingOptions = ["compact", "balanced", "airy"] as const;
export type EditorSpacing = (typeof spacingOptions)[number];

export const motionOptions = ["reduced", "refined", "expressive"] as const;
export type EditorMotion = (typeof motionOptions)[number];

export const accentOptions = ["#4da3ff", "#39e6dc", "#67e8a5", "#ff7a66"] as const;

export type SectionVisibility = Record<EditorSectionId, boolean>;

export type EditorProfileSettings = {
  headline: string;
  sectionOrder: EditorSectionId[];
  sectionVisibility: SectionVisibility;
};

export type EditorDesignSettings = {
  accent: (typeof accentOptions)[number];
  typography: EditorTypography;
  layout: EditorLayout;
  projectDisplay: EditorProjectDisplay;
  spacing: EditorSpacing;
  motion: EditorMotion;
};

export type EditorPortfolio = {
  id: string;
  title: string;
  displayName: string;
  selectedTemplateId: TemplateId;
  status: "draft" | "published";
  updatedAt: string;
  profileSettings: EditorProfileSettings;
  designSettings: EditorDesignSettings;
};

export type EditorEvidenceItem = {
  id: string;
  sourceType: EvidenceSourceType;
  title: string;
  description: string;
  createdAt: string;
  reviewState: ReviewState | null;
  approvedForPortfolio: boolean;
};

export type EditorProject = {
  id: string;
  sourceEvidenceId: string;
  sourceType: "manual_project";
  reviewId: string;
  reviewState: "approved" | "edited";
  title: string;
  summary: string;
  technologies: string[];
  repositoryUrl: string;
  liveDemoUrl: string;
};

export type EditorLoadMode = "ready" | "preview" | "setup_required" | "denied" | "error";

export type EditorInitialState = {
  mode: EditorLoadMode;
  canPersist: boolean;
  portfolio: EditorPortfolio;
  projects: EditorProject[];
  evidenceItems: EditorEvidenceItem[];
};

export type EditorActionResult =
  | { ok: true; savedAt: string }
  | { ok: false; reason: "setup" | "unauthenticated" | "forbidden" | "validation" | "database"; message: string };

export const defaultProfileSettings: EditorProfileSettings = {
  headline: "",
  sectionOrder: [...editorSectionIds],
  sectionVisibility: {
    projects: true,
    evidence: true,
    certificates: true,
  },
};

export const defaultDesignSettings: EditorDesignSettings = {
  accent: accentOptions[0],
  typography: "technical",
  layout: "narrative",
  projectDisplay: "case-studies",
  spacing: "balanced",
  motion: "refined",
};

export function isEditorTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && templateIds.includes(value as TemplateId);
}
