import { test, expect } from "@playwright/test";

test.describe("SEO essentials", () => {
  test("home page has the expected title and meta description", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ayyappa.*Frontend Developer/i);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /Frontend Developer/);
  });

  test("has a single canonical link and JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);

    const ldJson = page.locator('script[type="application/ld+json"]');
    await expect(ldJson).toHaveCount(1);
    const raw = await ldJson.first().textContent();
    const data = JSON.parse(raw ?? "{}");
    expect(data["@context"]).toBe("https://schema.org");
    const graph = data["@graph"] as Array<{ "@type": string }>;
    expect(graph.some((node) => node["@type"] === "Person")).toBe(true);
    expect(graph.some((node) => node["@type"] === "WebSite")).toBe(true);
  });

  test("has exactly one h1 on the page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("robots.txt is served and points to the sitemap", async ({ page }) => {
    const res = await page.request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(/Sitemap:/i);
    expect(body.toLowerCase()).toContain("user-agent: *");
    expect(body.toLowerCase()).toContain("allow: /");
  });

  test("sitemap.xml is served and includes the homepage", async ({ page }) => {
    const res = await page.request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toMatch(/<loc>.*<\/loc>/);
  });

  test("manifest.json is served for PWA installability", async ({ page }) => {
    const res = await page.request.get("/manifest.json");
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();
    expect(manifest.icons?.length ?? 0).toBeGreaterThan(0);
  });
});
