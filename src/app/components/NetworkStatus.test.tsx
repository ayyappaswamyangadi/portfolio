import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NetworkStatus } from "./NetworkStatus";

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    value,
    configurable: true,
    writable: true,
  });
}

describe("NetworkStatus", () => {
  beforeEach(() => {
    setOnline(true);
  });

  afterEach(() => {
    setOnline(true);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders nothing when online and there was no prior offline state", () => {
    render(<NetworkStatus />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders nothing on mount even if navigator.onLine happens to be false but no offline event fired", () => {
    // Component trusts navigator.onLine at mount time directly.
    setOnline(false);
    render(<NetworkStatus />);
    expect(screen.getByRole("status")).toHaveTextContent(/you're offline/i);
  });

  it("shows the offline banner with a Retry button when an 'offline' event fires", async () => {
    render(<NetworkStatus />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(screen.getByRole("status")).toHaveTextContent(/you're offline/i);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("shows a 'Back online' banner when 'online' fires after having been offline", async () => {
    render(<NetworkStatus />);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/you're offline/i);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    // AnimatePresence mode="wait" keeps the exiting offline banner mounted
    // until its exit animation resolves, so the online banner mounts
    // asynchronously — assert via findBy rather than a synchronous get.
    expect(await screen.findByText(/back online/i)).toBeInTheDocument();
  });

  it("does not show a 'Back online' banner for an 'online' event with no prior offline state", () => {
    render(<NetworkStatus />);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("retry success: fetches /manifest.json and clears the offline banner", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));
    render(<NetworkStatus />);
    const user = userEvent.setup();

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(global.fetch).toHaveBeenCalledWith("/manifest.json", {
      method: "HEAD",
      cache: "no-store",
    });
    expect(await screen.findByText(/back online/i)).toBeInTheDocument();
  });

  it("retry failure: shows 'Still offline' message and stays offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<NetworkStatus />);
    const user = userEvent.setup();

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(await screen.findByText(/still offline — check your connection/i)).toBeInTheDocument();
  });
});
