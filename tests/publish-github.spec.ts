import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { encryptGitHubToken } from "@/lib/github/crypto";

const hasSupabaseE2ECredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.E2E_TEST_EMAIL &&
    process.env.E2E_TEST_PASSWORD,
);

const hasGitHubUiConfig = Boolean(
  hasSupabaseE2ECredentials &&
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    process.env.GITHUB_CALLBACK_URL &&
    process.env.GITHUB_TOKEN_ENCRYPTION_KEY,
);

const publishScreenshotDir = path.join(process.cwd(), "docs/visual-qa/v3-publish");
const githubScreenshotDir = path.join(process.cwd(), "docs/visual-qa/v3-github");

test.describe("ProofFolio publishing and GitHub", () => {
  test("onboarding exposes a GitHub connect entry point or safe setup fallback", async ({ page }) => {
    if (!hasSupabaseE2ECredentials) {
      test.skip(true, "Set Supabase URL/anon key and E2E credentials to exercise authenticated GitHub onboarding.");
    }

    await signInForOnboarding(page, "/onboarding?step=upload&source=github_repository");

    if (hasGitHubUiConfig) {
      await expect(page.getByTestId("github-connect-link")).toBeVisible();
      await expect(page.getByTestId("github-connect-link")).toHaveAttribute("href", /\/auth\/github\?next=/);
      return;
    }

    await expect(page.getByText("GitHub OAuth is not configured yet.")).toBeVisible();
  });

  test("draft portfolios are not publicly accessible", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E credentials to run public publishing coverage.");

    const { slug } = await createDraftPortfolioInEditor(page, `Draft proof ${Date.now()}`);
    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("published portfolios are accessible and expose recruiter scan metadata", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E credentials to run public publishing coverage.");

    const { slug } = await createPublishedPortfolio(page, `Published proof ${Date.now()}`);
    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("recruiter-scan-panel")).toBeVisible();
    await expect(page.getByText("Evidence-backed portfolio")).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Published proof/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/p/${slug}$`));
    await expect(page.locator("body")).not.toContainText("storage_path");
    await expect(page.locator("body")).not.toContainText("evidence/");
  });

  test("unpublish immediately removes public access", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E credentials to run public publishing coverage.");

    const { slug } = await createPublishedPortfolio(page, `Unpublish proof ${Date.now()}`);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByTestId("editor-unpublish-button").click();
    await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });

    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });

  test("mobile public portfolio has no horizontal overflow", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E credentials to run public publishing coverage.");

    const { slug } = await createPublishedPortfolio(page, `Mobile publish ${Date.now()}`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("GitHub repositories are not imported automatically before selection", async ({ page }) => {
    test.skip(!hasGitHubUiConfig, "Set Supabase and GitHub OAuth env vars to run GitHub import coverage.");

    const repository = buildSeedRepository(`signal-${Date.now()}`);
    await signInForOnboarding(page, "/onboarding?step=upload&source=github_repository");
    const portfolioId = await currentPortfolioId(page);
    await seedGitHubConnection(portfolioId, [repository]);

    await page.goto("/onboarding?step=upload&source=github_repository", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("github-selection-form")).toContainText(repository.fullName);
    await expect(page.getByTestId("evidence-vault")).not.toContainText(repository.name);
  });

  test("selected GitHub repositories import into review and persist through approval", async ({ page }) => {
    test.skip(!hasGitHubUiConfig, "Set Supabase and GitHub OAuth env vars to run GitHub import coverage.");

    const repository = buildSeedRepository(`atlas-${Date.now()}`);
    const { slug } = await createPublishedGitHubPortfolio(page, repository);

    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toContainText(repository.name);
    await expect(page.locator("main")).toContainText("GitHub repository");
  });

  test("GitHub disconnect removes imported evidence", async ({ page }) => {
    test.skip(!hasGitHubUiConfig, "Set Supabase and GitHub OAuth env vars to run GitHub import coverage.");

    const repository = buildSeedRepository(`disconnect-${Date.now()}`);
    await signInForOnboarding(page, "/onboarding?step=upload&source=github_repository");
    const portfolioId = await currentPortfolioId(page);
    await seedGitHubConnection(portfolioId, [repository]);

    await page.goto("/onboarding?step=upload&source=github_repository", { waitUntil: "domcontentloaded" });
    await page.getByLabel(repository.fullName).check();
    await page.getByTestId("github-import-button").click();
    await page.waitForURL(/step=review/);
    await reviewProposal(page, repository.name, "approve");
    await page.goto("/onboarding?step=upload&source=github_repository", { waitUntil: "domcontentloaded" });
    await page.getByTestId("github-disconnect-button").click();
    await page.waitForURL(/source=github_repository/);
    await expect(page.getByTestId("evidence-vault")).not.toContainText(repository.name);
  });

  test("optional AI provider disabled copy stays honest", async ({ page }) => {
    await page.goto("/onboarding?step=review", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      test.skip(true, "Configured Supabase redirects unauthenticated users before review copy can render.");
    }

    await expect(page.getByText("Optional AI provider is disabled.")).toBeVisible();
  });

  test("CI workflow and accessibility checks exist", async ({ page }) => {
    const ciWorkflow = fs.readFileSync(path.join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    expect(ciWorkflow).toContain("npm run lint");
    expect(ciWorkflow).toContain("npm run build");
    expect(ciWorkflow).toContain("npm run test:e2e");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const accessibilityScan = await new AxeBuilder({ page }).analyze();
    const seriousViolations = accessibilityScan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(seriousViolations).toEqual([]);
  });

  test("captures publishing and GitHub screenshots", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Capture screenshots once.");
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E credentials to capture publishing screenshots.");

    fs.mkdirSync(publishScreenshotDir, { recursive: true });
    const { slug } = await createPublishedPortfolio(page, `Screenshot publish ${Date.now()}`);
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(publishScreenshotDir, "editor-publish-desktop.png"),
      fullPage: true,
    });

    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(publishScreenshotDir, "public-portfolio-desktop.png"),
      fullPage: true,
    });

    await expect(page.getByTestId("recruiter-scan-panel")).toBeVisible();
    await hideDevIndicators(page);
    await page.getByTestId("recruiter-scan-panel").screenshot({
      path: path.join(publishScreenshotDir, "recruiter-scan-desktop.png"),
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/p/${slug}`, { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(publishScreenshotDir, "public-portfolio-mobile.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(publishScreenshotDir, "public-portfolio-fr-mobile.png"),
      fullPage: true,
    });

    if (!hasGitHubUiConfig) {
      return;
    }

    fs.mkdirSync(githubScreenshotDir, { recursive: true });
    const repository = buildSeedRepository(`gallery-${Date.now()}`);
    await signInForOnboarding(page, "/onboarding?step=upload&source=github_repository");
    const portfolioId = await currentPortfolioId(page);
    await seedGitHubConnection(portfolioId, [repository]);

    await page.goto("/onboarding?step=upload&source=github_repository", { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(githubScreenshotDir, "github-connect-desktop.png"),
      fullPage: true,
    });
    await page.getByLabel(repository.fullName).check();
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(githubScreenshotDir, "repository-selection-desktop.png"),
      fullPage: true,
    });
    await page.getByTestId("github-import-button").click();
    await page.waitForURL(/step=review/);
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(githubScreenshotDir, "github-proposal-review-desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/onboarding?step=upload&source=github_repository", { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(githubScreenshotDir, "github-selection-mobile.png"),
      fullPage: true,
    });
  });
});

async function signInForOnboarding(page: Page, next = "/onboarding") {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(next)}`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email address").fill(process.env.E2E_TEST_EMAIL ?? "");
  await page.getByLabel("Password").fill(process.env.E2E_TEST_PASSWORD ?? "");
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL(/\/onboarding/);
}

async function currentPortfolioId(page: Page) {
  const cardText = await page.getByTestId("active-draft-card").textContent();
  const match = cardText?.match(/[0-9a-f-]{36}/i);

  if (!match) {
    throw new Error("Could not read the active portfolio id from onboarding.");
  }

  return match[0];
}

async function createDraftPortfolioInEditor(page: Page, title: string) {
  await signInForOnboarding(page, "/onboarding?step=upload&source=manual_project");
  await createManualProject(page, `${title} project`);
  await reviewProposal(page, `${title} project`, "approve");
  await page.goto("/onboarding?step=summary", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await page.waitForURL(/\/editor\?portfolio=[0-9a-f-]+&onboarding=ready/);
  await expect(page.getByTestId("editor-workspace")).toBeVisible();
  await page.getByTestId("editor-portfolio-title").fill(title);
  const slug = `proof-${Date.now().toString(36)}`;
  await openEditorPanel(page, "editor-publish-panel");
  await page.getByTestId("editor-public-slug").fill(slug);
  await page.getByRole("button", { name: "Save slug" }).click();
  await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });
  return { slug };
}

async function createPublishedPortfolio(page: Page, title: string) {
  const { slug } = await createDraftPortfolioInEditor(page, title);
  await page.getByRole("button", { name: "Publish portfolio" }).click();
  await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });
  await expect(page.getByRole("link", { name: "Open public portfolio" })).toBeVisible();
  return { slug };
}

async function createPublishedGitHubPortfolio(page: Page, repository: SeedRepository) {
  await signInForOnboarding(page, "/onboarding?step=upload&source=github_repository");
  const portfolioId = await currentPortfolioId(page);
  await seedGitHubConnection(portfolioId, [repository]);

  await page.goto("/onboarding?step=upload&source=github_repository", { waitUntil: "domcontentloaded" });
  await page.getByLabel(repository.fullName).check();
  await page.getByTestId("github-import-button").click();
  await page.waitForURL(/step=review/);
  await reviewProposal(page, repository.name, "approve");
  await page.goto("/onboarding?step=summary", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await page.waitForURL(/\/editor\?portfolio=[0-9a-f-]+&onboarding=ready/);
  await page.getByTestId("editor-portfolio-title").fill(`GitHub proof ${Date.now()}`);
  const slug = `github-proof-${Date.now().toString(36)}`;
  await openEditorPanel(page, "editor-publish-panel");
  await page.getByTestId("editor-public-slug").fill(slug);
  await page.getByRole("button", { name: "Publish portfolio" }).click();
  await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });
  return { slug };
}

async function createManualProject(page: Page, title: string) {
  const form = page.getByTestId("manual-project-form");

  await form.locator('input[name="title"]').fill(title);
  await form.locator('textarea[name="summary"]').fill(
    "A persistent onboarding proof created by the credential-dependent E2E flow.",
  );
  await form.locator('input[name="technologies"]').fill("Next.js, Supabase, RLS");
  await form.getByTestId("manual-project-submit").click();
  await page.waitForURL(/step=review/);
  await expect(proposalCard(page, title)).toBeVisible();
}

async function reviewProposal(
  page: Page,
  title: string,
  action: "approve" | "edit" | "reject",
  editedTitle?: string,
) {
  const card = proposalCard(page, title);

  if (action === "edit") {
    await card.getByText("Edit suggestion").click();
    await card.locator('input[name="proposedTitle"]').fill(editedTitle ?? `${title} refined`);
    await card.locator('textarea[name="proposedSummary"]').fill(
      "Edited proposal content that should remain saved after a browser refresh.",
    );
  }

  await card.getByRole("button", { name: actionButtonName(action) }).click();
  await page.waitForLoadState("domcontentloaded");

  const expectedTitle = action === "edit" ? editedTitle ?? `${title} refined` : title;
  await expect(proposalCard(page, expectedTitle)).toContainText(expectedReviewState(action));
}

async function openEditorPanel(page: Page, testId: string) {
  const panel = page.getByTestId(testId);

  if ((await panel.getAttribute("open")) === null) {
    await panel.locator("summary").first().click();
  }

  await expect(panel).toHaveAttribute("open", "");
}

async function hideDevIndicators(page: Page) {
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dev-tools-button],
      [data-nextjs-dialog-overlay],
      [data-nextjs-dialog] {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  });
}

function proposalCard(page: Page, title: string) {
  return page.locator("article").filter({ hasText: title }).first();
}

function actionButtonName(action: "approve" | "edit" | "reject") {
  if (action === "approve") {
    return /Approve/i;
  }

  if (action === "edit") {
    return /^Edit$/i;
  }

  return /Reject/i;
}

function expectedReviewState(action: "approve" | "edit" | "reject") {
  if (action === "approve") {
    return "Approved";
  }

  if (action === "edit") {
    return "Edited";
  }

  return "Rejected";
}

type SeedRepository = {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  primaryLanguage: string;
  topics: string[];
  defaultBranch: string;
  stars: number;
  updatedAt: string;
  ownerLogin: string;
  readmePresent: boolean;
};

function buildSeedRepository(slug: string): SeedRepository {
  return {
    id: Number(`${Date.now()}`.slice(-8)),
    name: slug,
    fullName: `proof-user/${slug}`,
    description: "Seeded public GitHub repository for Playwright verification.",
    htmlUrl: `https://github.com/proof-user/${slug}`,
    primaryLanguage: "TypeScript",
    topics: ["nextjs", "portfolio", "evidence"],
    defaultBranch: "main",
    stars: 7,
    updatedAt: new Date().toISOString(),
    ownerLogin: "proof-user",
    readmePresent: true,
  };
}

async function seedGitHubConnection(portfolioId: string, repositories: SeedRepository[]) {
  const { client, userId } = await getSupabaseClient();
  await cleanupGitHubArtifacts(client, userId, portfolioId);
  const encryptedToken = encryptGitHubToken("playwright-token", process.env.GITHUB_TOKEN_ENCRYPTION_KEY ?? "");

  const { error } = await client.from("github_connections").upsert({
    owner_user_id: userId,
    github_user_id: 99_000 + repositories[0]!.id,
    github_login: "proof-user",
    github_name: "Proof User",
    avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    encrypted_access_token: encryptedToken,
    token_scope: "",
    repository_cache: repositories,
    connected_at: new Date().toISOString(),
    last_synced_at: new Date(Date.now() - 120_000).toISOString(),
  });

  if (error) {
    throw error;
  }
}

async function cleanupGitHubArtifacts(
  client: ReturnType<typeof createClient>,
  userId: string,
  portfolioId: string,
) {
  await client.from("github_connections").delete().eq("owner_user_id", userId);

  const { data: evidence } = await client
    .from("evidence_items")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("portfolio_id", portfolioId)
    .eq("source_type", "github_repository");

  const evidenceIds = (evidence ?? []).map((item) => item.id);

  if (evidenceIds.length > 0) {
    await client
      .from("proposal_reviews")
      .delete()
      .eq("owner_user_id", userId)
      .eq("portfolio_id", portfolioId)
      .in("source_evidence_id", evidenceIds);

    const { data: projects } = await client
      .from("project_drafts")
      .select("id,evidence_references")
      .eq("owner_user_id", userId)
      .eq("portfolio_id", portfolioId);

    const projectIds = (projects ?? [])
      .filter((project) => Array.isArray(project.evidence_references) && project.evidence_references.some((reference) => evidenceIds.includes(reference)))
      .map((project) => project.id);

    if (projectIds.length > 0) {
      await client
        .from("project_drafts")
        .delete()
        .eq("owner_user_id", userId)
        .eq("portfolio_id", portfolioId)
        .in("id", projectIds);
    }

    await client
      .from("evidence_items")
      .delete()
      .eq("owner_user_id", userId)
      .eq("portfolio_id", portfolioId)
      .eq("source_type", "github_repository");
  }
}

async function getSupabaseClient() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const { error } = await client.auth.signInWithPassword({
    email: process.env.E2E_TEST_EMAIL ?? "",
    password: process.env.E2E_TEST_PASSWORD ?? "",
  });

  if (error) {
    throw error;
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error("E2E Supabase sign-in did not return a user.");
  }

  return { client, userId: user.id };
}
