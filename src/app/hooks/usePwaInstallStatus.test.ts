import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePwaInstallStatus } from "./usePwaInstallStatus";

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
    vi.restoreAllMocks();
    mockMatchMedia(false);
  });

  it("reports not standalone when display-mode is browser", async () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePwaInstallStatus());
    await waitFor(() => expect(result.current.isStandalone).toBe(false));
  });

  it("reports standalone when launched from the home screen", async () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePwaInstallStatus());
    await waitFor(() => expect(result.current.isStandalone).toBe(true));
  });
});
