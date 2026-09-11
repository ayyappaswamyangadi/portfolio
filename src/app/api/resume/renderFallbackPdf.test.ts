import { describe, expect, it } from "vitest";
import { renderFallbackPdf } from "./renderFallbackPdf";

describe("renderFallbackPdf", () => {
  it("returns a real, single-page PDF", async () => {
    const buffer = await renderFallbackPdf({
      totalExperienceLabel: "5 yrs 7 months",
      reviseDurationLabel: "4 yrs 4 months",
    });

    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(buffer.byteLength).toBeGreaterThan(1000);
    const pageObjectCount = (
      buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []
    ).length;
    expect(pageObjectCount).toBe(1);
  });

  it("threads the passed-in experience labels through to the rendered bytes", async () => {
    // pdfkit encodes text as hex glyph runs (`<...> TJ`), not literal ASCII,
    // so this can't assert a substring match — instead prove the labels
    // aren't ignored by checking two different label pairs produce two
    // different documents, i.e. this isn't secretly serving a frozen file.
    const a = await renderFallbackPdf({
      totalExperienceLabel: "5 yrs 7 months",
      reviseDurationLabel: "4 yrs 4 months",
    });
    const b = await renderFallbackPdf({
      totalExperienceLabel: "9 yrs 9 months",
      reviseDurationLabel: "8 yrs 8 months",
    });

    expect(a.equals(b)).toBe(false);
  });
});
