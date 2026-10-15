import { test, expect, devices } from "@playwright/test";

// The whole contact card is the link, and the location card hands off to the
// device's own maps app on phones. Each block emulates a device regardless of
// which Playwright project is running it.
// test.use() can't switch browser engine inside a describe, so take each
// device's viewport/UA/touch settings without its defaultBrowserType.
function emulate(name: keyof typeof devices) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...rest } = devices[name];
  return rest;
}

function locationCard(page: import("@playwright/test").Page) {
  return page.getByRole("link", { name: /open in maps/i });
}

test.describe("Contact cards", () => {
  test("email and phone cards are whole-card links", async ({ page }) => {
    await page.goto("/#contact");
    const email = page.getByRole("link", { name: /send an email/i });
    await expect(email).toHaveAttribute("href", "mailto:ayyappaswamy50@gmail.com");
    await expect(email).toContainText("I reply within 24 hours");
    await expect(page.getByRole("link", { name: /^call/i })).toHaveAttribute(
      "href",
      "tel:+918792594229",
    );
  });
});

test.describe("Location card on desktop", () => {
  test.use(emulate("Desktop Chrome"));
  test("opens Google Maps in a new tab", async ({ page }) => {
    await page.goto("/#contact");
    const card = locationCard(page);
    await expect(card).toHaveAttribute("href", /google\.com\/maps/);
    await expect(card).toHaveAttribute("target", "_blank");
    const [popup] = await Promise.all([page.waitForEvent("popup"), card.click()]);
    await expect(popup).toHaveURL(/google\.[^/]+\/maps/);
  });
});

test.describe("Location card on iPhone", () => {
  test.use(emulate("iPhone 13"));
  test("opens Apple Maps (the Maps app) in place", async ({ page }) => {
    await page.goto("/#contact");
    const card = locationCard(page);
    await expect(card).toHaveAttribute("href", /^https:\/\/maps\.apple\.com\/\?q=Bengaluru/);
    await expect(card).not.toHaveAttribute("target", "_blank");
  });
});

test.describe("Location card on Android", () => {
  test.use(emulate("Pixel 7"));
  test("hands off to the maps app via a geo: link", async ({ page }) => {
    await page.goto("/#contact");
    const card = locationCard(page);
    await expect(card).toHaveAttribute("href", /^geo:0,0\?q=Bengaluru/);
    await expect(card).not.toHaveAttribute("target", "_blank");
  });
});
