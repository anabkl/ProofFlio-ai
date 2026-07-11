import type { User } from "@supabase/supabase-js";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/profile/server";

export type DashboardMainState = "none" | "onboarding" | "review" | "editor_ready";

export type DashboardActivityKind = "evidence" | "reviewApproved" | "reviewEdited" | "reviewRejected";

export type DashboardActivityItem = {
  id: string;
  kind: DashboardActivityKind;
  title: string;
  createdAt: string;
};

export type DashboardChecklist = {
  accountCreated: boolean;
  evidenceAdded: boolean;
  suggestionsReviewed: boolean;
  templateSelected: boolean;
  portfolioCustomized: boolean;
};

export type DashboardState = {
  displayName: string;
  email: string;
  headline: string;
  mainState: DashboardMainState;
  portfolioId: string | null;
  portfolioTitle: string | null;
  checklist: DashboardChecklist;
  activity: DashboardActivityItem[];
};

const emptyChecklist: DashboardChecklist = {
  accountCreated: true,
  evidenceAdded: false,
  suggestionsReviewed: false,
  templateSelected: false,
  portfolioCustomized: false,
};

/**
 * Reads existing state only — never creates a portfolio draft as a side
 * effect of viewing the dashboard (unlike onboarding's ensurePortfolioDraft).
 */
export async function getDashboardState(supabase: SupabaseServerClient, user: User): Promise<DashboardState> {
  const profile = await ensureProfile(supabase, user);

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id,title,selected_template_id,onboarding_state,updated_at")
    .eq("owner_user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!portfolio) {
    return {
      displayName: profile.displayName,
      email: user.email ?? "",
      headline: profile.headline,
      mainState: "none",
      portfolioId: null,
      portfolioTitle: null,
      checklist: emptyChecklist,
      activity: [],
    };
  }

  const [{ data: evidenceRows }, { data: reviewRows }] = await Promise.all([
    supabase
      .from("evidence_items")
      .select("id,title,created_at")
      .eq("portfolio_id", portfolio.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("proposal_reviews")
      .select("id,proposed_title,review_state,updated_at")
      .eq("portfolio_id", portfolio.id)
      .order("updated_at", { ascending: false })
      .limit(20),
  ]);

  const evidence = evidenceRows ?? [];
  const reviews = reviewRows ?? [];
  const reviewedCount = reviews.filter((review) => review.review_state !== "pending").length;
  const templateSelected =
    portfolio.onboarding_state === "template" ||
    portfolio.onboarding_state === "ready" ||
    portfolio.selected_template_id !== "developer-signature";

  const mainState: DashboardMainState =
    portfolio.onboarding_state === "template" || portfolio.onboarding_state === "ready"
      ? "editor_ready"
      : portfolio.onboarding_state === "review"
        ? "review"
        : "onboarding";

  const activity: DashboardActivityItem[] = [
    ...evidence.map((item) => ({
      id: `evidence-${item.id}`,
      kind: "evidence" as const,
      title: String(item.title ?? "Evidence"),
      createdAt: String(item.created_at ?? ""),
    })),
    ...reviews
      .filter((review) => review.review_state !== "pending")
      .map((review) => ({
        id: `review-${review.id}`,
        kind: reviewActivityKind(review.review_state),
        title: String(review.proposed_title ?? "Suggestion"),
        createdAt: String(review.updated_at ?? ""),
      })),
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return {
    displayName: profile.displayName,
    email: user.email ?? "",
    headline: profile.headline,
    mainState,
    portfolioId: String(portfolio.id),
    portfolioTitle: String(portfolio.title ?? ""),
    checklist: {
      accountCreated: true,
      evidenceAdded: evidence.length > 0,
      suggestionsReviewed: reviewedCount > 0,
      templateSelected,
      portfolioCustomized: portfolio.onboarding_state === "ready",
    },
    activity,
  };
}

function reviewActivityKind(reviewState: unknown): DashboardActivityKind {
  if (reviewState === "approved") {
    return "reviewApproved";
  }

  if (reviewState === "edited") {
    return "reviewEdited";
  }

  return "reviewRejected";
}
