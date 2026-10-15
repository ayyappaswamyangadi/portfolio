import { test, expect } from "@playwright/test";

test.describe("Projects section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#projects");
  });

  test("shows the professional carousel and the More Projects grid", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Featured Projects" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Professional work at Revise" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "More Projects" })).toBeAttached();
  });

  test("hovering a project card (desktop) flips it to reveal the details and links", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "hover-driven flip only applies to hover-capable desktop browsers");
    const card = page
      .getByRole("article", { name: "Grass: Code Agent Computer — show details" })
      .locator("xpath=ancestor::*[contains(@class,'group')][1]");
    await card.scrollIntoViewIfNeeded();
    await card.hover();
    const link = card.getByRole("link", { name: "Visit Website", exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://codeongrass.com/");
  });

  test("tapping a project card (touch) flips it to reveal the details", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "tap-to-flip only applies to touch/non-hover devices");
    const card = page
      .getByRole("article", { name: "Grass: Code Agent Computer — show details" })
      .locator("xpath=ancestor::*[contains(@class,'group')][1]");
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(card.getByRole("link", { name: "Visit Website", exact: true })).toBeVisible();
  });

  test("More Projects stays on one row and paginates", async ({ page }) => {
    const pages = page.getByRole("navigation", { name: "More projects pages" });
    await pages.scrollIntoViewIfNeeded();
    const row = page.locator(".more-projects-row");
    const tops = await row.locator(":scope > div:visible").evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().top)),
    );
    expect(new Set(tops).size).toBe(1);
    await pages.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText(/^Showing [2-9]/)).toBeVisible();
  });

  test("carousel cards are never cut off — every visible card fits fully in view", async ({
    page,
  }) => {
    const scroller = page
      .getByRole("region", { name: "Professional projects" })
      .locator(".carousel-scroll");
    await scroller.scrollIntoViewIfNeeded();
    const box = await scroller.boundingBox();
    expect(box).not.toBeNull();

    const cards = page.locator(".featured-card");
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const c = await cards.nth(i).boundingBox();
      if (!c) continue;
      const overlaps = c.x < box!.x + box!.width && c.x + c.width > box!.x;
      if (overlaps) {
        // Any card that's on screen must be entirely on screen.
        expect(c.x).toBeGreaterThanOrEqual(box!.x - 1);
        expect(c.x + c.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
      }
    }
  });

  test("the last carousel dot becomes active at the end", async ({ page }) => {
    const next = page.getByRole("button", { name: "Next project" });
    await next.scrollIntoViewIfNeeded();
    while (await next.isEnabled()) {
      await next.click();
    }
    const dots = page.getByRole("button", { name: /go to slide/i });
    await expect(dots.last()).toHaveAttribute("aria-current", "true");
  });

});
