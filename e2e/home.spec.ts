import { test, expect } from "@playwright/test";

test.describe("Home hero", () => {
  test("renders name, availability badge, and meta info", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ayyappa");
    // React dev-mode can momentarily double-render during hydration, so
    // scope with .first() rather than asserting a single strict match.
    await expect(page.getByText(/Available for work · On-site, hybrid or remote/).first()).toBeVisible();
    await expect(page.getByText("Bengaluru, India", { exact: true }).first()).toBeVisible();
    // Exact duration is computed from real dates at render time (see
    // src/lib/experience.ts), so match the pattern rather than a fixed string.
    await expect(
      page.getByText(/\d+\s*yrs?(\s*\d+\s*months?)?\s*of experience/i).first(),
    ).toBeVisible();
  });

  test("typing effect cycles through role text over time", async ({ page }) => {
    await page.goto("/");
    const roleEl = page.locator('span.text-primary[aria-hidden="true"]').first();
    const first = await roleEl.textContent();
    // Poll rather than sample once after a fixed sleep — on a cold dev
    // server hydration can eat most of a fixed window.
    await expect
      .poll(() => roleEl.textContent(), { timeout: 8000 })
      .not.toBe(first);
  });

  test("Let's Connect CTA scrolls to the contact section", async ({ page }) => {
    await page.goto("/");
    await page.locator("main").getByRole("link", { name: "Let's Connect" }).click();
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("Download CV button points at the resume PDF and downloading it succeeds", async ({
    page,
  }) => {
    await page.goto("/");
    const downloadPromise = page.waitForEvent("download");
    // A <button> (not a link): it fetches the live /api/resume PDF and saves
    // it via a blob URL so the file always has the current experience figures.
    await page.locator("main").getByRole("button", { name: /download cv/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });

  test("Mac window card switches between profile and terminal tabs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("profile.ts")).toBeVisible();
    await expect(page.getByText("// at a glance")).toBeVisible();
    await expect(page.getByText('"On-site"')).toBeVisible();

    await page.getByRole("button", { name: /terminal/i }).click();
    await expect(page.getByText("npm run dev")).toBeVisible();
  });
});
