import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePwaInstallStatus } from "./usePwaInstallStatus";
import * as gtag from "@/lib/gtag";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches && query === "(display-mode: standalone)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("usePwaInstallStatus", () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
    mockMatchMedia(false);
  });

  it("reports not standalone and does not log when display-mode is browser", async () => {
    mockMatchMedia(false);
    const gaEventSpy = vi.spyOn(gtag, "gaEvent");
    const { result } = renderHook(() => usePwaInstallStatus());
    await waitFor(() => expect(result.current.isStandalone).toBe(false));
    expect(gaEventSpy).not.toHaveBeenCalled();
  });

  it("reports standalone and logs a pwa_launch_standalone event once per session", async () => {
    mockMatchMedia(true);
    const gaEventSpy = vi.spyOn(gtag, "gaEvent");
    const { result } = renderHook(() => usePwaInstallStatus());
    await waitFor(() => expect(result.current.isStandalone).toBe(true));
    expect(gaEventSpy).toHaveBeenCalledTimes(1);
    expect(gaEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ action: "pwa_launch_standalone", category: "engagement" }),
    );

    // A second mount within the same session (e.g. the badge rendered in
    // both nav clusters) must not double-log the same launch.
    const { result: second } = renderHook(() => usePwaInstallStatus());
    await waitFor(() => expect(second.current.isStandalone).toBe(true));
    expect(gaEventSpy).toHaveBeenCalledTimes(1);
  });
});
