import { test, expect } from "@playwright/test";

test.describe("Projects section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#projects");
  });

  test("shows the featured carousel and the All Projects grid with pagination", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { name: "Featured Projects" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All Projects" })).toBeVisible();
    await expect(page.getByText(/showing 1–2 of 8 projects/i)).toBeVisible();
  });

  test("filtering by a category updates the grid and resets to page 1", async ({ page }) => {
    const allProjects = page.locator("#projects");
    await allProjects.getByRole("button", { name: "Utility", exact: true }).click();

    await expect(page.getByText(/showing 1–1 of 1 projects/i)).toBeVisible();
    // ProjectCard always renders both its front and back face in the DOM
    // (the flip is a CSS transform, not conditional rendering), so the
    // title text exists twice per card — assert at least one is visible.
    await expect(page.getByText("Personal Shopping List").first()).toBeVisible();
  });

  test("pagination advances to the next page of the All Projects grid", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();

    await page.getByRole("button", { name: "Next page" }).click();

    await expect(page.getByText(/showing 3–4 of 8 projects/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  test("jumping directly to a page number works", async ({ page }) => {
    await page.getByRole("button", { name: "Page 3" }).click();
    await expect(page.getByText(/showing 5–6 of 8 projects/i)).toBeVisible();
  });

  test("hovering a project card (desktop) flips it to reveal details with a working live-demo link", async ({
    page,
    isMobile,
  }) => {
    // ProjectCard only binds mouseenter/mouseleave when matchMedia
    // (hover: hover) matches — real desktop Chromium reports hover
    // support, so .hover() drives the flip here; touch-emulated projects
    // use tap-to-toggle instead (covered in the next test).
    test.skip(isMobile, "hover-driven flip only applies to hover-capable desktop browsers");

    const card = page
      .getByText("YouTube Clone")
      .first()
      .locator("xpath=ancestor::*[contains(@class,'group')][1]");
    await card.hover();

    const liveDemoLink = page.getByRole("link", { name: /view live demo/i }).first();
    await expect(liveDemoLink).toBeVisible();
    await expect(liveDemoLink).toHaveAttribute("target", "_blank");
    await expect(liveDemoLink).toHaveAttribute(
      "href",
      "https://youtube-clone-plum-nine.vercel.app/",
    );
  });

  test("tapping a project card (touch) flips it to reveal details", async ({ page, isMobile }) => {
    test.skip(!isMobile, "tap-to-flip only applies to touch/non-hover devices");

    const card = page
      .getByText("YouTube Clone")
      .first()
      .locator("xpath=ancestor::*[contains(@class,'group')][1]");
    await card.click();

    await expect(page.getByRole("link", { name: /view live demo/i }).first()).toBeVisible();
  });

  test("GitHub Profile CTA at the bottom of the section is present and correct", async ({
    page,
  }) => {
    const cta = page.getByRole("link", { name: /view github profile/i });
    await expect(cta).toHaveAttribute("href", "https://github.com/ayyappaswamyangadi");
  });
});
