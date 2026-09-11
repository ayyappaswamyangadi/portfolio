import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SplashScreen } from "./SplashScreen";

function setStandalone(value: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: value && query === "(display-mode: standalone)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("SplashScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    document.documentElement.classList.remove("pwa-splash");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.classList.remove("pwa-splash");
  });

  it("unmounts immediately in a regular browser tab (not standalone)", async () => {
    setStandalone(false);
    render(<SplashScreen />);

    await waitFor(() =>
      expect(document.querySelector(".splash-screen")).not.toBeInTheDocument()
    );
  });

  it("shows the brand name and role when launched standalone", () => {
    setStandalone(true);
    render(<SplashScreen />);

    expect(screen.getByText("Ayyappa")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
  });

  it("fades out and unmounts after the min-visible delay when standalone", async () => {
    setStandalone(true);
    render(<SplashScreen />);

    expect(document.querySelector(".splash-screen")).not.toHaveClass("splash-hidden");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(document.querySelector(".splash-screen")).toHaveClass("splash-hidden");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });
    expect(document.querySelector(".splash-screen")).not.toBeInTheDocument();
  });

  it("removes the pwa-splash class once it starts hiding", async () => {
    document.documentElement.classList.add("pwa-splash");
    setStandalone(true);
    render(<SplashScreen />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(document.documentElement.classList.contains("pwa-splash")).toBe(false);
  });
});
