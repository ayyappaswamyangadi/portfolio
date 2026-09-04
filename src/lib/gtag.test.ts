import { afterEach, describe, expect, it, vi } from "vitest";

describe("gaEvent", () => {
  const originalGtag = window.gtag;

  afterEach(() => {
    window.gtag = originalGtag;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does nothing when NEXT_PUBLIC_GA_ID is unset, even if window.gtag exists", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");
    const { gaEvent } = await import("./gtag");
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    gaEvent({ action: "click", category: "test" });

    expect(gtagSpy).not.toHaveBeenCalled();
  });

  it("does nothing when window.gtag is not a function, even if GA ID is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    const { gaEvent } = await import("./gtag");
    // @ts-expect-error simulating gtag.js not having loaded yet
    window.gtag = undefined;

    expect(() => gaEvent({ action: "click", category: "test" })).not.toThrow();
  });

  it("forwards action/category/label/value to window.gtag as an 'event' call", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    const { gaEvent } = await import("./gtag");
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    gaEvent({ action: "submit", category: "contact_form", label: "success", value: 1 });

    expect(gtagSpy).toHaveBeenCalledWith("event", "submit", {
      event_category: "contact_form",
      event_label: "success",
      value: 1,
    });
  });

  it("passes through undefined label/value when not provided", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    const { gaEvent } = await import("./gtag");
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    gaEvent({ action: "click", category: "navigation" });

    expect(gtagSpy).toHaveBeenCalledWith("event", "click", {
      event_category: "navigation",
      event_label: undefined,
      value: undefined,
    });
  });
});
