import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows crawlers everywhere except the API and offline fallback, and points to the sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/~offline"],
    });
    expect(result.sitemap).toBe("https://www.ayyappa.dev/sitemap.xml");
  });
});
