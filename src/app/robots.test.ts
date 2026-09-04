import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows all crawlers on every path and points to the sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe("https://www.ayyappa.dev/sitemap.xml");
  });
});
