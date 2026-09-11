import { afterEach, describe, expect, it, vi } from "vitest";

describe("GET /api/resume", () => {
  afterEach(() => {
    vi.doUnmock("@react-pdf/renderer");
    vi.doUnmock("./renderFallbackPdf");
    vi.resetModules();
  });

  it("returns a real PDF, generated fresh (no-store) with the correct download filename", async () => {
    const { GET } = await import("./route");
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

  it("falls back to a plain-pdfkit PDF with live experience numbers when renderToBuffer throws", async () => {
    vi.doMock("@react-pdf/renderer", async () => {
      const actual = await vi.importActual<typeof import("@react-pdf/renderer")>(
        "@react-pdf/renderer",
      );
      return {
        ...actual,
        renderToBuffer: vi
          .fn()
          .mockRejectedValue(new Error("simulated yoga-layout WASM crash")),
      };
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { GET } = await import("./route");
    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Ayyappa_Swamy_Angadi_Resume.pdf"',
    );

    const buffer = Buffer.from(await res.arrayBuffer());
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(buffer.byteLength).toBeGreaterThan(1000);
    expect(errorSpy).toHaveBeenCalledWith(
      "[/api/resume] @react-pdf/renderer failed, using plain-pdfkit fallback:",
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  it("returns a real JSON error response (not a broken/empty PDF) when both renderers fail", async () => {
    vi.doMock("@react-pdf/renderer", async () => {
      const actual = await vi.importActual<typeof import("@react-pdf/renderer")>(
        "@react-pdf/renderer",
      );
      return {
        ...actual,
        renderToBuffer: vi
          .fn()
          .mockRejectedValue(new Error("simulated yoga-layout WASM crash")),
      };
    });
    vi.doMock("./renderFallbackPdf", () => ({
      renderFallbackPdf: vi
        .fn()
        .mockRejectedValue(new Error("simulated pdfkit crash")),
    }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { GET } = await import("./route");
    const res = await GET();

    // A client that fired-and-forgot a plain `<a download>` click would
    // have no way to distinguish this from a real PDF and would still save
    // it as one — asserting Content-Type here is what actually guards
    // against a broken/empty file landing in someone's Downloads folder.
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(body.error).toEqual(expect.any(String));
    expect(errorSpy).toHaveBeenCalledWith(
      "[/api/resume] plain-pdfkit fallback also failed:",
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
