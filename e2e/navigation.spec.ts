import { test, expect, type Page } from "@playwright/test";

// Navbar always renders BOTH the desktop link list and the mobile dropdown
// link list in the DOM (only one is display:none at any given viewport
// width), so `data-section` links exist twice. `:visible` reliably resolves
// to whichever copy is actually on-screen at the current viewport/menu
// state, avoiding strict-mode "multiple elements" errors.
function navLink(page: Page, section: string) {
  return page.locator(`nav [data-section="${section}"]:visible`);
}

function hireMeLink(page: Page) {
  return page.locator("nav a:visible", { hasText: "Hire me" });
}

test.describe("Desktop navigation", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("navbar renders logo, section links, and Hire me CTA", async ({ page }) => {
    await page.goto("/");
    // The logo's accessible name ("Home", capitalized via aria-label) is
    // distinct from the "home" section link's literal (lowercase) text.
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(navLink(page, "home")).toBeVisible();
    await expect(navLink(page, "about")).toBeVisible();
    await expect(navLink(page, "projects")).toHaveText("My Work");
    await expect(navLink(page, "contact")).toBeVisible();
    await expect(hireMeLink(page)).toBeVisible();
  });

  test("clicking a nav link scrolls to the matching section", async ({ page }) => {
    await page.goto("/");
    await navLink(page, "projects").click();
    await expect(page.locator("#projects")).toBeInViewport();
  });

  test("clicking Hire me scrolls to the contact section", async ({ page }) => {
    await page.goto("/");
    await hireMeLink(page).click();
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("scrolling down the page updates the active nav pill to the current section", async ({
    page,
  }) => {
    await page.goto("/");
    // Confirm hydration has actually finished and useActiveSession's
    // IntersectionObserver is live (proven by "home" already reading as
    // active) before jumping the scroll position — doing this too early
    // races hydration and produces a scroll the observer never picks up,
    // especially when the dev server is under load from parallel workers.
    await expect(navLink(page, "home")).toHaveClass(/text-white/);
    // useActiveSession's IntersectionObserver only flips "active" once a
    // section's top has crossed into the upper 45% of the viewport
    // (rootMargin "-55%" from the bottom), and — because window.scrollTo
    // jumps instantly rather than animating — the observer only ever sees
    // the final resting position, not anything it passed through along the
    // way. So land just inside the section's top edge, comfortably within
    // that top-45% band, rather than scrolling into its middle/bottom.
    await page.evaluate(() => {
      const el = document.getElementById("projects")!;
      window.scrollTo(0, el.offsetTop + 50);
    });
    // The active-tab pill measures itself against the [data-section] link
    // matching the currently active section — assert that link is styled
    // as active (white text class) rather than the inactive-link classes.
    await expect(navLink(page, "projects")).toHaveClass(/text-white/, { timeout: 10000 });
  });

  test("logo links back to home", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$|\/#?$/);
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu opens and closes via the toggle button", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(navLink(page, "projects")).toBeVisible();
    await expect(navLink(page, "projects")).toHaveText("My Work");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("tapping a mobile nav link scrolls to the section and closes the menu", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await navLink(page, "contact").click();

    await expect(page.locator("#contact")).toBeInViewport();
    await expect(page.getByRole("button", { name: "Toggle menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
