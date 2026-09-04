import { test, expect } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of viewports) {
  test.describe(`Layout at ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("page never scrolls horizontally", async ({ page }) => {
      await page.goto("/");
      // Give the fonts/animations a moment to settle before measuring.
      await page.waitForTimeout(500);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test("all four main sections render", async ({ page }) => {
      await page.goto("/");
      for (const id of ["home", "about", "projects", "contact"]) {
        await expect(page.locator(`#${id}`)).toBeAttached();
      }
    });
  });
}

test.describe("Scroll-to-top button", () => {
  test("appears after scrolling past 400px and scrolls back to top", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Scroll to top" });
    await expect(button).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 800));
    await expect(button).toBeVisible();

    // On iOS the PWA install banner (bottom-fixed, `md:hidden`) can overlap
    // the scroll-to-top button (also bottom-fixed) and intercept its click —
    // dismiss it first if it showed up, same as a real user would have to.
    const dismissInstallPrompt = page.getByRole("button", { name: "Dismiss install prompt" });
    if (await dismissInstallPrompt.isVisible().catch(() => false)) {
      await dismissInstallPrompt.click();
    }

    await button.click();
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50);
  });
});
