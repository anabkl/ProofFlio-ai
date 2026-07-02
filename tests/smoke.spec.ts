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
  "/editor",
];

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
      await expect(page.locator("body")).toBeVisible();

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

    await page.getByRole("button", { name: "FR", exact: true }).click({ force: true });
    await expect(page.getByText("Transformez vos projets en preuves").first()).toBeVisible();
    await expect(page.getByText("Choisir Student").first()).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click({ force: true });
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
    await expect(page.getByText("Pricing is a product preview")).toBeVisible();
  });

  test("editor opens from a template selection", async ({ page }) => {
    await page.goto("/editor?template=creative-grid", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("button", { name: "Creative Grid" }).first()).toBeVisible();
    await expect(page.getByText("Desktop preview")).toBeVisible();
    await page.waitForLoadState("load");
    await page.getByRole("button", { name: "FR" }).click({ force: true });
    await expect(page.getByText("Aperçu desktop")).toBeVisible();
  });

  test("template pages expose living navigation and interactions", async ({ page }) => {
    await page.goto("/templates/dark-tech", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("template-nav")).toBeVisible();
    await expect(page.getByText("Skill constellation")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);

    await page.goto("/templates/creative-grid", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load");
    await expect(page.getByText("Atlas UI Systems").first()).toBeVisible();
    await page.getByTestId("creative-project-0").click({ force: true });
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
