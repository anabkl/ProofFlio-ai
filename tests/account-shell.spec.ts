import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const hasSupabaseE2ECredentials = Boolean(
  hasSupabaseConfig && process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD,
);

const CREDENTIAL_SKIP =
  "Set Supabase URL/anon key and E2E_TEST_EMAIL/E2E_TEST_PASSWORD to run authenticated account-shell coverage.";

const oauthFlags = {
  google: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true",
  github: process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true",
  linkedin: process.env.NEXT_PUBLIC_AUTH_LINKEDIN_ENABLED === "true",
};

const screenshotDir = path.join(process.cwd(), "docs/visual-qa/v3-account-shell");

test.describe("V3 account system and product shell", () => {
  test("logged-out header shows Sign in and Create account", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create your portfolio" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=/dashboard",
    );
  });

  test("authenticated header shows the account menu with real options", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, CREDENTIAL_SKIP);

    await signIn(page, "/dashboard");
    const trigger = page.getByRole("button", { name: /Account menu/i });
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(page.getByRole("menuitem", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "My portfolio" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Account settings" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
  });

  test("sign-up preserves the intended next route", async ({ page }) => {
    await page.goto("/auth/sign-up?next=/account", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="next"]')).toHaveValue("/account");
  });

  test("sign-in preserves the intended next route", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/account", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="next"]')).toHaveValue("/account");
  });

  test("invalid external next URL is rejected", async ({ page }) => {
    await page.goto("/auth/sign-in?next=https://evil.example.com", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="next"]')).toHaveValue("/dashboard");

    await page.goto("/auth/sign-up?next=//evil.example.com", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="next"]')).toHaveValue("/onboarding");
  });

  test("dashboard requires authentication", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    if (!hasSupabaseConfig) {
      // Unconfigured Supabase renders an honest notice in place rather than redirecting.
      await expect(page.getByText(/not configured/i)).toBeVisible();
      return;
    }

    expect(page.url()).toContain("/auth/sign-in");
    expect(decodeURIComponent(page.url())).toContain("next=/dashboard");
    await expect(page.getByRole("heading", { name: /Return to your proof workspace/i })).toBeVisible();
  });

  test("account page requires authentication", async ({ page }) => {
    await page.goto("/account", { waitUntil: "domcontentloaded" });

    if (!hasSupabaseConfig) {
      await expect(page.getByText(/not configured/i)).toBeVisible();
      return;
    }

    expect(page.url()).toContain("/auth/sign-in");
    expect(decodeURIComponent(page.url())).toContain("next=/account");
  });

  test("sign out clears access to protected routes", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, CREDENTIAL_SKIP);

    await signIn(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: /Account menu/i }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await page.waitForURL("/");

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/auth/sign-in");
  });

  test("dashboard displays a real portfolio state with a matching action", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, CREDENTIAL_SKIP);

    await signIn(page, "/dashboard");
    await expect(
      page.getByText(/No portfolio started|Onboarding in progress|Evidence review in progress|Editor draft available/),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Start portfolio|Resume onboarding|Review evidence|Continue editing/ }),
    ).toBeVisible();
    await expect(page.getByText("Progress checklist")).toBeVisible();
  });

  test("Google OAuth button appears only when enabled", async ({ page }) => {
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    const button = page.getByRole("button", { name: /Continue with Google/i });

    if (oauthFlags.google) {
      await expect(button).toBeVisible();
    } else {
      await expect(button).toHaveCount(0);
    }
  });

  test("GitHub OAuth button appears only when enabled", async ({ page }) => {
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    const button = page.getByRole("button", { name: /Continue with GitHub/i });

    if (oauthFlags.github) {
      await expect(button).toBeVisible();
    } else {
      await expect(button).toHaveCount(0);
    }
  });

  test("LinkedIn OAuth button appears only when enabled", async ({ page }) => {
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    const button = page.getByRole("button", { name: /Continue with LinkedIn/i });

    if (oauthFlags.linkedin) {
      await expect(button).toBeVisible();
    } else {
      await expect(button).toHaveCount(0);
    }
  });

  test("mobile authenticated navigation works", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, CREDENTIAL_SKIP);

    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, "/dashboard");

    await expect(page.getByRole("navigation", { name: "Account navigation" })).toBeVisible();
    const trigger = page.getByRole("button", { name: /Account menu/i });
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test("auth copy switches between English and French", async ({ page }) => {
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Return to your proof workspace/i })).toBeVisible();

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Reprenez votre espace de preuves/i })).toBeVisible();
  });

  test("dashboard and account copy switches between English and French", async ({ page }) => {
    test.skip(!hasSupabaseE2ECredentials, CREDENTIAL_SKIP);

    await signIn(page, "/dashboard");
    await expect(page.getByText("Welcome back")).toBeVisible();

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Bon retour")).toBeVisible();

    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Paramètres du compte" })).toBeVisible();
  });

  test("no horizontal overflow on auth, dashboard and account at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/auth/sign-up", { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(2);

    if (!hasSupabaseE2ECredentials) {
      return;
    }

    await signIn(page, "/dashboard");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(2);

    await page.goto("/account", { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(2);
  });

  test("captures V3 account shell visual QA screenshots", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Capture account-shell visual QA screenshots once.");
    fs.mkdirSync(screenshotDir, { recursive: true });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "public-header-logged-out-desktop.png") });

    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "sign-in-desktop.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/auth/sign-up", { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "sign-up-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1100 });

    test.skip(!hasSupabaseE2ECredentials, "Set Supabase credentials to capture authenticated account-shell screenshots.");

    const freshEmail = `e2e-empty-${Date.now()}@example.com`;
    await page.goto(`/auth/sign-up?next=${encodeURIComponent("/dashboard")}`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Display name").fill("Empty State QA");
    await page.getByLabel("Email address").fill(freshEmail);
    await page.getByLabel("Password", { exact: true }).fill("Passw0rd!23");
    await page.getByLabel("Confirm password").fill("Passw0rd!23");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Create account/i }).click();
    await page.waitForURL(/\/dashboard/);
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "dashboard-empty-state.png"), fullPage: true });

    await signIn(page, "/dashboard");
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "dashboard-desktop.png"), fullPage: true });

    await page.getByRole("button", { name: /Account menu/i }).click();
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "authenticated-user-menu.png") });
    await page.keyboard.press("Escape");

    await page.goto("/account", { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "account-settings-desktop.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "authenticated-mobile-navigation.png"), fullPage: true });

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Bon retour")).toBeVisible();
    await hideDevIndicators(page);
    await page.screenshot({ path: path.join(screenshotDir, "dashboard-fr-mobile.png"), fullPage: true });
  });
});

async function signIn(page: Page, next: string) {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(next)}`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email address").fill(process.env.E2E_TEST_EMAIL ?? "");
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_TEST_PASSWORD ?? "");
  await page.getByRole("button", { name: /^Sign in$/i }).click();
  await page.waitForURL(new RegExp(next.replace(/[/?]/g, "\\$&")));
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
