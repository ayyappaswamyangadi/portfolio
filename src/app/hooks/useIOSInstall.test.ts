import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIOSInstall } from "./useIOSInstall";

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

function setPlatform(platform: string) {
  Object.defineProperty(window.navigator, "platform", {
    value: platform,
    configurable: true,
  });
}

function setMaxTouchPoints(points: number) {
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    value: points,
    configurable: true,
  });
}

const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15";
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

const INSTALLED_KEY = "pwa-installed";

describe("useIOSInstall", () => {
  afterEach(() => {
    setUserAgent(MAC_UA);
    setPlatform("MacIntel");
    setMaxTouchPoints(0);
    localStorage.removeItem(INSTALLED_KEY);
    // Re-stub matchMedia to the vitest.setup.ts default (matches: false for
    // everything) rather than vi.restoreAllMocks(), which would revert the
    // global setup's vi.fn() to a no-op returning undefined.
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("detects a real iPhone/iPad via user agent", async () => {
    setUserAgent(IPHONE_UA);
    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isIOS).toBe(true));
  });

  it("detects iPadOS 13+ (reports as Mac UA but has multi-touch)", async () => {
    setUserAgent(MAC_UA);
    setPlatform("MacIntel");
    setMaxTouchPoints(5);
    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isIOS).toBe(true));
  });

  it("does not flag a real Mac (no touch points) as iOS", async () => {
    setUserAgent(MAC_UA);
    setPlatform("MacIntel");
    setMaxTouchPoints(0);
    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isIOS).toBe(false));
  });

  it("does not flag a desktop/Windows UA as iOS", async () => {
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    setPlatform("Win32");
    setMaxTouchPoints(0);
    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isIOS).toBe(false));
  });

  it("reports isStandalone true when display-mode: standalone matches", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isStandalone).toBe(true));
  });

  it("reports isStandalone true via the iOS-only navigator.standalone flag", async () => {
    Object.defineProperty(window.navigator, "standalone", {
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isStandalone).toBe(true));

    // @ts-expect-error cleaning up a non-standard property
    delete window.navigator.standalone;
  });

  it("reports isStandalone false when neither signal is present", async () => {
    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isStandalone).toBe(false));
  });

  it("persists an installed flag when standalone, so a later non-standalone load still reports isInstalled", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { result: standaloneResult } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(standaloneResult.current.isInstalled).toBe(true));
    expect(localStorage.getItem(INSTALLED_KEY)).toBe("1");

    // A later load in a plain (non-standalone) tab should still see it as installed.
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { result: laterResult } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(laterResult.current.isStandalone).toBe(false));
    expect(laterResult.current.isInstalled).toBe(true);
  });

  it("sets isInstalled and persists the flag when the appinstalled event fires", async () => {
    const { result } = renderHook(() => useIOSInstall());
    await waitFor(() => expect(result.current.isInstalled).toBe(false));

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    await waitFor(() => expect(result.current.isInstalled).toBe(true));
    expect(localStorage.getItem(INSTALLED_KEY)).toBe("1");
  });
});
