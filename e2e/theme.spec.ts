import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("defaults to dark theme and toggling switches to light", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    const toggle = page.getByRole("button", { name: "Toggle theme" }).first();
    await toggle.click();

    await expect(html).not.toHaveClass(/dark/);
  });

  test("theme preference persists across a reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle theme" }).first().click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.reload();

    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("toggling back to dark restores the dark class", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const toggle = page.getByRole("button", { name: "Toggle theme" }).first();

    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
  });
});
