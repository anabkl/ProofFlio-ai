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

      await page.goto(route);
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
    await page.goto("/");

    await page.getByRole("button", { name: "FR", exact: true }).click();
    await expect(page.getByText("Transformez votre CV, GitHub et vos réalisations").first()).toBeVisible();

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByText("Turn your CV, GitHub and achievements").first()).toBeVisible();
  });

  test("editor opens from a template selection", async ({ page }) => {
    await page.goto("/editor?template=creative-grid");

    await expect(page.getByRole("button", { name: "Creative Grid" }).first()).toBeVisible();
    await expect(page.getByText("Desktop preview")).toBeVisible();
    await page.getByRole("button", { name: "FR" }).click();
    await expect(page.getByText("Aperçu desktop")).toBeVisible();
  });
});
