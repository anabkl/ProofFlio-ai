import { templateIds, type TemplateId } from "@/lib/content";

export const onboardingSteps = ["sources", "upload", "review", "template", "summary"] as const;
export type OnboardingStep = (typeof onboardingSteps)[number];

export type EvidenceSourceType = "cv" | "certificate" | "manual_project" | "github_placeholder";
export type ReviewState = "pending" | "approved" | "edited" | "rejected";

export type PortfolioDraft = {
  id: string;
  title: string;
  selectedTemplateId: TemplateId;
  onboardingState: string;
};

export type EvidenceItem = {
  id: string;
  sourceType: EvidenceSourceType;
  title: string;
  description: string;
  storagePath: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ProposalReview = {
  id: string;
  sourceEvidenceId: string | null;
  proposedTitle: string;
  proposedSummary: string;
  proposalType: string;
  reviewState: ReviewState;
  editedContent: Record<string, unknown>;
};

export type ProposalSuggestion = {
  key: string;
  sourceEvidenceId: string;
  sourceType: EvidenceSourceType;
  label: string;
  proposedTitle: string;
  proposedSummary: string;
  proposalType: string;
  review: ProposalReview | null;
};

export type OnboardingInitialState = {
  configured: boolean;
  authenticated: boolean;
  portfolio: PortfolioDraft;
  evidenceItems: EvidenceItem[];
  proposalReviews: ProposalReview[];
  suggestions: ProposalSuggestion[];
  selectedTemplateId: TemplateId;
  selectedSource: EvidenceSourceType;
  step: OnboardingStep;
  approvedCount: number;
  errorMessage?: string;
};

export const recommendedTemplateIds = [
  "developer-signature",
  "dark-tech",
  "recruiter-focus",
] as const satisfies readonly TemplateId[];

export function isTemplateId(value: string | null | undefined): value is TemplateId {
  return Boolean(value && templateIds.includes(value as TemplateId));
}

export function normalizeOnboardingStep(value: string | null | undefined): OnboardingStep {
  return onboardingSteps.includes(value as OnboardingStep) ? (value as OnboardingStep) : "sources";
}

export function normalizeEvidenceSource(value: string | null | undefined): EvidenceSourceType {
  if (value === "cv" || value === "certificate" || value === "manual_project" || value === "github_placeholder") {
    return value;
  }

  return "cv";
}

export function sourceLabel(sourceType: EvidenceSourceType) {
  if (sourceType === "manual_project") {
    return "Manual project";
  }

  if (sourceType === "github_placeholder") {
    return "GitHub - coming soon";
  }

  return sourceType === "cv" ? "CV" : "Certificate";
}
