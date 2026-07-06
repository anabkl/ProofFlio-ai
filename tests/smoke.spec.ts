import { expect, test } from "@playwright/test";

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

    await expect(page.getByRole("button", { name: "Creative Grid" }).first()).toBeVisible();
    await expect(page.getByText("Desktop preview")).toBeVisible();
    await page.waitForLoadState("load");
    await page.getByRole("button", { name: "FR" }).click();
    await expect(page.getByText("Aperçu desktop")).toBeVisible();
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

  test("signed-in onboarding can select a source", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run signed-in onboarding coverage.");

    await page.goto("/auth/sign-in?next=/onboarding", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email address").fill(process.env.E2E_TEST_EMAIL ?? "");
    await page.getByLabel("Password").fill(process.env.E2E_TEST_PASSWORD ?? "");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await page.waitForURL(/\/onboarding/);
    await page.getByTestId("source-manual-project").click();
    await expect(page.getByRole("heading", { name: /Add the proof material/i })).toBeVisible();
  });

  test("manual project form validation works", async ({ page }) => {
    await page.goto("/onboarding", { waitUntil: "domcontentloaded" });

    if (page.url().includes("/auth/sign-in")) {
      test.skip(true, "Unauthenticated configured Supabase redirects before local validation can be exercised.");
    }

    await page.getByTestId("source-manual-project").click();
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

  test("header mobile CTA targets onboarding", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const startLink = page.getByRole("link", { name: "Start with your evidence" }).first();
    await expect(startLink).toBeVisible();
    await expect(startLink).toHaveAttribute("href", "/onboarding");
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
