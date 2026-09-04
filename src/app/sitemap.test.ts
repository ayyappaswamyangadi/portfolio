import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("returns a single homepage entry with a valid lastModified date", () => {
    const result = sitemap();

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://www.ayyappa.dev");
    expect(result[0].changeFrequency).toBe("monthly");
    expect(result[0].priority).toBe(1);
    expect(result[0].lastModified).toBeInstanceOf(Date);
    expect(Number.isNaN((result[0].lastModified as Date).getTime())).toBe(false);
  });
});
