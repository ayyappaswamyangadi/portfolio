import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/resume", () => {
  it("returns a real PDF, generated fresh (no-store) with the correct download filename", async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Ayyappa_Swamy_Angadi_Resume.pdf"',
    );
    // Must never be cached — the whole point of generating this on request
    // is that the experience duration inside it reflects the current month,
    // not whatever it was the first time this route was hit.
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const buffer = Buffer.from(await res.arrayBuffer());
    // "%PDF-" magic bytes confirm this is a real PDF, not an error page or
    // empty body silently swallowed by a renderToBuffer failure.
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });
});
