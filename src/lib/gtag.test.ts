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

    gaEvent("download_cv");

    expect(gtagSpy).not.toHaveBeenCalled();
  });

  it("does nothing when window.gtag is not a function, even if GA ID is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    const { gaEvent } = await import("./gtag");
    // @ts-expect-error simulating gtag.js not having loaded yet
    window.gtag = undefined;

    expect(() => gaEvent("download_cv")).not.toThrow();
  });

  it("sends the event name with its params", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    const { gaEvent } = await import("./gtag");
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    gaEvent("lets_connect_click", { placement: "hero" });

    expect(gtagSpy).toHaveBeenCalledWith("event", "lets_connect_click", { placement: "hero" });
  });

  it("sends an empty params object when none are given", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST123");
    const { gaEvent } = await import("./gtag");
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;

    gaEvent("message_sent");

    expect(gtagSpy).toHaveBeenCalledWith("event", "message_sent", {});
  });
});
