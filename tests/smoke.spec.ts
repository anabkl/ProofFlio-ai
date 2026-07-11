import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/demo",
  "/templates",
  "/templates/minimal-executive",
  "/templates/dark-tech",
  "/templates/creative-grid",
  "/templates/story-journey",
  "/templates/recruiter-focus",
  "/templates/developer-signature",
  "/templates/career-chronicle",
  "/editor",
];

const hasSupabaseE2ECredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.E2E_TEST_EMAIL &&
    process.env.E2E_TEST_PASSWORD,
);

const onboardingScreenshotDir = path.join(process.cwd(), "docs/visual-qa/v3-onboarding");
const editorScreenshotDir = path.join(process.cwd(), "docs/visual-qa/v3-editor");

test.describe("ProofFolio AI UI demo", () => {
  for (const route of routes) {
    test(`renders ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.getByText("ProofFolio AI").first()).toBeVisible();
      await expect(page.locator("main").first()).toBeVisible();

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth - window.innerWidth;
      });
      expect(overflow).toBeLessThanOrEqual(2);
      expect(consoleErrors).toEqual([]);
    });
  }

  test("switches between English and French copy", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await expect(page.getByText("Turn your projects into proof").first()).toBeVisible();

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Transformez vos projets en preuves").first()).toBeVisible();
    await expect(page.getByText("Choisir Student").first()).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByText("Turn your projects into proof").first()).toBeVisible();
    await expect(page.getByText("Choose Student").first()).toBeVisible();
  });

  test("pricing uses Free Student VIP with a yearly toggle", async ({ page }) => {
    await page.goto("/#plans", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("pricing-plan-free")).toContainText("Free");
    await expect(page.getByTestId("pricing-plan-student")).toContainText("Student");
    await expect(page.getByTestId("pricing-plan-vip")).toContainText("VIP");
    await expect(page.getByTestId("pricing-plan-student")).toContainText("$5 / month");

    await page.getByTestId("billing-yearly").click();
    await expect(page.getByTestId("pricing-plan-student")).toContainText("$48 / year");
    await expect(page.locator("tbody tr").filter({ hasText: "Templates" })).toContainText("7");
    await expect(page.getByText("Pricing is a product preview")).toBeVisible();
  });

  test("editor opens from a template selection", async ({ page }) => {
    await page.goto("/editor?template=creative-grid", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("editor-live-preview")).toHaveAttribute("data-template", "creative-grid");
    await expect(page.getByRole("button", { name: "Desktop preview" })).toBeVisible();
    await expect(page.getByTestId("editor-save-status")).toContainText("Preview only");
    await page.waitForLoadState("load");
    await page.getByRole("button", { name: "FR" }).click();
    await expect(page.getByRole("button", { name: "Aperçu desktop" })).toBeVisible();
    await expect(page.getByTestId("editor-save-status")).toContainText("Aperçu uniquement");
  });

  test("protected editor denies an unavailable portfolio ID", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run editor ownership coverage.");

    await signInForOnboarding(page);
    await page.goto("/editor?portfolio=00000000-0000-4000-8000-000000000001&onboarding=ready", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByTestId("editor-denied")).toContainText("This portfolio is not available");
  });

  test("editor loads an evidence-ready owned portfolio", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run persisted editor loading coverage.");

    const projectTitle = `E2E editor proof ${Date.now()}`;
    await createApprovedProjectAndOpenEditor(page, projectTitle);

    await expect(page).toHaveURL(/\/editor\?portfolio=[0-9a-f-]+&onboarding=ready/);
    await expect(page.getByTestId("editor-workspace")).toBeVisible();
    await openEditorPanel(page, "editor-projects-panel");
    await expect(page.getByTestId("editor-project-card").filter({ hasText: projectTitle })).toBeVisible();
    await openEditorPanel(page, "editor-evidence-panel");
    await expect(page.getByTestId("editor-evidence-list")).toContainText(projectTitle);
  });

  test("saved editor headline persists after refresh", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run headline persistence coverage.");

    await openOwnedEditor(page);
    const headline = `Evidence-led product engineer ${Date.now()}`;
    await page.getByTestId("editor-headline").fill(headline);
    await expect(page.getByTestId("editor-save-status")).toContainText(/Unsaved changes|Saving/);
    await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("editor-headline")).toHaveValue(headline);
  });

  test("editor template switch persists after refresh", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run editor template persistence coverage.");

    await openOwnedEditor(page);
    await openEditorPanel(page, "editor-appearance-panel");
    await page.getByTestId("editor-template-creative-grid").click();
    await expect(page.getByTestId("editor-template-creative-grid")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    await openEditorPanel(page, "editor-appearance-panel");
    await expect(page.getByTestId("editor-template-creative-grid")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("editor-live-preview")).toHaveAttribute("data-template", "creative-grid");
  });

  test("approved manual project edits persist after refresh", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run project edit persistence coverage.");

    const projectTitle = `E2E editable project ${Date.now()}`;
    const editedTitle = `${projectTitle} refined`;
    await createApprovedProjectAndOpenEditor(page, projectTitle);
    await openEditorPanel(page, "editor-projects-panel");
    const projectCard = page.getByTestId("editor-project-card").filter({ hasText: projectTitle });
    await projectCard.getByLabel("Project title").fill(editedTitle);
    await projectCard.getByLabel("Technologies").fill("Next.js, Supabase, Playwright");
    await projectCard.getByLabel("Repository URL").fill("https://github.com/prooffolio/editor-e2e");
    await expect(page.getByTestId("editor-save-status")).toContainText(/Unsaved changes|Saving/);
    await expect(page.getByTestId("editor-save-status")).toContainText("Saved", { timeout: 12_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    await openEditorPanel(page, "editor-projects-panel");
    const persistedCard = page.getByTestId("editor-project-card").filter({ hasText: editedTitle });
    await expect(persistedCard.getByLabel("Project title")).toHaveValue(editedTitle);
    await expect(persistedCard.getByLabel("Technologies")).toHaveValue("Next.js, Supabase, Playwright");
  });

  test("editor saved-state copy switches between English and French", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run saved-state localization coverage.");

    await openOwnedEditor(page);
    await expect(page.getByTestId("editor-save-status")).toContainText("Saved");
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByTestId("editor-save-status")).toContainText("Enregistré");
  });

  test("mobile editor uses accordions without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/editor?template=dark-tech", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("editor-panels")).toBeVisible();
    await expect(page.getByTestId("editor-identity-panel")).toHaveAttribute("open", "");
    await expect(page.getByTestId("editor-preview-frame")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("captures V3 editor visual QA screenshots", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Capture editor visual QA screenshots once.");
    fs.mkdirSync(editorScreenshotDir, { recursive: true });

    await openEditorForScreenshot(page);
    await page.waitForLoadState("load");
    await openEditorPanel(page, "editor-evidence-panel");
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(editorScreenshotDir, "editor-evidence-ready-desktop.png"),
      fullPage: true,
    });

    await closeEditorPanel(page, "editor-evidence-panel");
    await openEditorPanel(page, "editor-projects-panel");
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(editorScreenshotDir, "editor-project-edit-desktop.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(page.url(), { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(editorScreenshotDir, "editor-mobile.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Construisez le portfolio à partir de contenus fondés sur des preuves.")).toBeVisible();
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(editorScreenshotDir, "editor-fr-mobile.png"),
      fullPage: true,
    });
  });

  test("sign-in and sign-up pages render", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/onboarding", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Return to your proof workspace/i })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();

    await page.goto("/auth/sign-up?next=/onboarding", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Create the account that owns your evidence/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create account/i })).toBeVisible();
  });

  test("/onboarding redirects or blocks protected persistence when unauthenticated", async ({ page }) => {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      await expect(page.getByRole("heading", { name: /Return to your proof workspace/i })).toBeVisible();
      expect(decodeURIComponent(page.url())).toContain("next=/onboarding");
      return;
    }

    await expect(page.getByText("Persistence blocked")).toBeVisible();
    await expect(page.getByText("This local preview does not create a connected account")).toBeVisible();
  });

  test("resume existing draft panel exposes progress and resume action", async ({ page }) => {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      test.skip(true, "Configured Supabase redirects unauthenticated users before draft recovery can render.");
    }

    await expect(page.getByTestId("resume-draft-panel")).toContainText("Resume your evidence draft");
    await expect(page.getByTestId("resume-draft-panel")).toContainText("Sources added");
    await page.getByRole("button", { name: "Resume draft" }).click();
    await expect(page.getByTestId("onboarding-workspace")).toBeFocused();
  });

  test("signed-in onboarding can select a source", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run signed-in onboarding coverage.");

    await signInForOnboarding(page);
    await page.getByTestId("source-manual-project").click();
    await expect(page.getByRole("heading", { name: /Add the proof material/i })).toBeVisible();
  });

  test("signed-in onboarding rejects invalid uploads with localized server validation", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run signed-in upload validation.");

    await signInForOnboarding(page, "/onboarding?step=upload&source=cv");
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Ajoutez les éléments de preuve.")).toBeVisible();
    await page.getByTestId("file-cv").setInputFiles({
      name: "invalid-upload.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a pdf"),
    });
    await page.getByTestId("upload-cv").click();

    await expect(page.getByText("Seuls les fichiers PDF sont acceptés pendant ce sprint.")).toBeVisible();
  });

  test("signed-in onboarding can add and remove manual project evidence", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run manual evidence removal coverage.");

    const title = `E2E removable proof ${Date.now()}`;

    await signInForOnboarding(page, "/onboarding?step=upload&source=manual_project");
    await createManualProject(page, title);
    await page.goto("/onboarding?step=upload&source=manual_project", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("evidence-vault")).toContainText(title);

    const evidenceItem = page.getByTestId("evidence-item-manual_project").filter({ hasText: title });
    await evidenceItem.getByText("Remove evidence").click();
    await evidenceItem.getByTestId("remove-evidence-manual_project").click();
    await page.waitForURL(/step=upload/);
    await expect(page.getByTestId("evidence-vault")).not.toContainText(title);
  });

  test("signed-in proposal review decisions persist after refresh", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run proposal persistence coverage.");

    const suffix = Date.now();
    const approvedTitle = `E2E approved proof ${suffix}`;
    const editedTitle = `E2E edited proof ${suffix}`;
    const rejectedTitle = `E2E rejected proof ${suffix}`;
    const editedFinalTitle = `${editedTitle} refined`;

    await signInForOnboarding(page, "/onboarding?step=upload&source=manual_project");
    await createManualProject(page, approvedTitle);
    await page.goto("/onboarding?step=upload&source=manual_project", { waitUntil: "domcontentloaded" });
    await createManualProject(page, editedTitle);
    await page.goto("/onboarding?step=upload&source=manual_project", { waitUntil: "domcontentloaded" });
    await createManualProject(page, rejectedTitle);

    await reviewProposal(page, approvedTitle, "approve");
    await reviewProposal(page, editedTitle, "edit", editedFinalTitle);
    await reviewProposal(page, rejectedTitle, "reject");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(proposalCard(page, approvedTitle)).toContainText("Approved");
    await expect(proposalCard(page, editedFinalTitle)).toContainText("Edited");
    await expect(proposalCard(page, rejectedTitle)).toContainText("Rejected");
  });

  test("manual project form validation works", async ({ page }) => {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      test.skip(true, "Unauthenticated configured Supabase redirects before local validation can be exercised.");
    }

    await page.getByTestId("source-manual-project").click();
    if (await page.getByTestId("manual-project-submit").isDisabled()) {
      await expect(page.getByText("Persistence blocked")).toBeVisible();
      return;
    }

    await page.getByTestId("manual-project-submit").click();
    await expect(page.getByTestId("manual-project-validation")).toContainText("Add a project title before saving.");
  });

  test("template query parameter preselects the expected template", async ({ page }) => {
    await page.goto("/onboarding?template=dark-tech&step=template", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      expect(decodeURIComponent(page.url())).toContain("template=dark-tech");
      return;
    }

    await expect(page.getByTestId("template-option-dark-tech")).toContainText("Selected");
  });

  test("signed-in template selection persists without a template query parameter", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run template persistence coverage.");

    await signInForOnboarding(page, "/onboarding?template=dark-tech&step=template");
    await expect(page.getByTestId("template-option-dark-tech")).toContainText("Selected");

    await page.goto("/onboarding?step=template", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("template-option-dark-tech")).toContainText("Selected");
  });

  test("header mobile CTA targets sign-up with onboarding as next", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const createLink = page.getByRole("link", { name: "Create your portfolio" }).first();
    await expect(createLink).toBeVisible();
    await expect(createLink).toHaveAttribute("href", "/auth/sign-up?next=/onboarding");
  });

  test("onboarding switches between English and French", async ({ page }) => {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      test.skip(true, "Unauthenticated configured Supabase redirects before onboarding copy can be exercised.");
    }

    await expect(page.getByText("Your uploads stay private. Automated CV analysis and GitHub import are coming next.")).toBeVisible();
    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Vos fichiers restent privés. L’analyse automatique du CV et l’import GitHub arrivent prochainement.")).toBeVisible();
  });

  test("mobile onboarding has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - window.innerWidth;
    });
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("captures V3 onboarding visual QA screenshots", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Capture onboarding visual QA screenshots once.");
    fs.mkdirSync(onboardingScreenshotDir, { recursive: true });

    await openOnboardingForScreenshot(page, "/onboarding?step=sources");
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(onboardingScreenshotDir, "evidence-workspace-desktop.png"),
      fullPage: true,
    });

    await openOnboardingForScreenshot(page, "/onboarding?step=review");
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(onboardingScreenshotDir, "proposal-review-desktop.png"),
      fullPage: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await openOnboardingForScreenshot(page, "/onboarding");
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(onboardingScreenshotDir, "resume-draft-mobile.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Vos fichiers restent privés. L’analyse automatique du CV et l’import GitHub arrivent prochainement.")).toBeVisible();
    await hideDevIndicators(page);
    await page.screenshot({
      path: path.join(onboardingScreenshotDir, "onboarding-fr-mobile.png"),
      fullPage: true,
    });
  });

  test("template pages expose living navigation and interactions", async ({ page }) => {
    await page.goto("/templates/dark-tech", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("template-nav")).toBeVisible();
    await expect(page.getByText("Skill constellation")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);

    await page.goto("/templates/creative-grid", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await expect(page.getByText("Atlas UI Systems").first()).toBeVisible();
    await page.getByTestId("creative-project-0").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goto("/templates/developer-signature", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Developer Signature").first()).toBeVisible();
    await page.getByRole("button", { name: "AI", exact: true }).click();
    await expect(page.getByText("ModelOps Notes").first()).toBeVisible();

    await page.goto("/templates/career-chronicle", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Career Chronicle").first()).toBeVisible();
    await page.getByRole("button", { name: /Open project detail/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

async function signInForOnboarding(page: Page, next = "/onboarding") {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(next)}`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email address").fill(process.env.E2E_TEST_EMAIL ?? "");
  await page.getByLabel("Password").fill(process.env.E2E_TEST_PASSWORD ?? "");
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL(/\/onboarding/);
}

async function openOwnedEditor(page: Page) {
  await signInForOnboarding(page, "/onboarding?step=summary");
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await page.waitForURL(/\/editor\?portfolio=[0-9a-f-]+&onboarding=ready/);
  await expect(page.getByTestId("editor-workspace")).toBeVisible();
}

async function createApprovedProjectAndOpenEditor(page: Page, title: string) {
  await signInForOnboarding(page, "/onboarding?step=upload&source=manual_project");
  await createManualProject(page, title);
  await reviewProposal(page, title, "approve");
  await page.goto("/onboarding?step=summary", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await page.waitForURL(/\/editor\?portfolio=[0-9a-f-]+&onboarding=ready/);
}

async function openEditorForScreenshot(page: Page) {
  if (hasSupabaseE2ECredentials) {
    await openOwnedEditor(page);
    return;
  }

  await page.goto("/editor?template=developer-signature", { waitUntil: "domcontentloaded" });
}

async function openEditorPanel(page: Page, testId: string) {
  const panel = page.getByTestId(testId);

  if ((await panel.getAttribute("open")) === null) {
    await panel.locator("summary").first().click();
  }

  await expect(panel).toHaveAttribute("open", "");
}

async function closeEditorPanel(page: Page, testId: string) {
  const panel = page.getByTestId(testId);

  if ((await panel.getAttribute("open")) !== null) {
    await panel.locator("summary").first().click();
  }

  await expect(panel).not.toHaveAttribute("open", "");
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

async function openOnboardingForScreenshot(page: Page, next: string) {
  if (hasSupabaseE2ECredentials) {
    await signInForOnboarding(page, next);
    return;
  }

  await page.goto(next, { waitUntil: "domcontentloaded" });

  if (page.url().includes("/auth/sign-in")) {
    test.skip(true, "Configured Supabase requires credentials for onboarding screenshots.");
  }
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
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((element) => element.remove());
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
