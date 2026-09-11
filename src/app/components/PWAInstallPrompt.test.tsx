import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PWAInstallPrompt } from "./PWAInstallPrompt";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

const useIOSInstallMock = vi.fn(() => ({ isIOS: false, isInstalled: false }));
vi.mock("../hooks/useIOSInstall", () => ({
  useIOSInstall: () => useIOSInstallMock(),
}));

const DISMISS_KEY = "pwa-install-dismissed-at";

function dispatchBeforeInstallPrompt(outcome: "accepted" | "dismissed" = "accepted") {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  // dispatchEvent invokes the listener outside React's event system, so the
  // resulting setState must be wrapped in act() to guarantee the DOM has
  // updated by the time the next assertion runs.
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("PWAInstallPrompt", () => {
  afterEach(() => {
    gaEventMock.mockClear();
    useIOSInstallMock.mockReset();
    useIOSInstallMock.mockReturnValue({ isIOS: false, isInstalled: false });
    localStorage.clear();
  });

  it("renders nothing when already installed (standalone)", () => {
    useIOSInstallMock.mockReturnValue({ isIOS: false, isInstalled: true });
    const { container } = render(<PWAInstallPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing on Android/desktop until a beforeinstallprompt event fires", () => {
    const { container } = render(<PWAInstallPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the banner after beforeinstallprompt fires and fires pwa_prompt_shown/android", async () => {
    render(<PWAInstallPrompt />);
    dispatchBeforeInstallPrompt();

    expect(await screen.findByRole("dialog", { name: /install app/i })).toBeInTheDocument();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "pwa_prompt_shown",
      category: "engagement",
      label: "android",
    });
  });

  it("shows the banner immediately on iOS with instructional copy, no Install button, and fires pwa_prompt_shown/ios", () => {
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    render(<PWAInstallPrompt />);

    const dialog = screen.getByRole("dialog", { name: /install app/i });
    expect(dialog).toHaveTextContent(/add to home screen/i);
    expect(within(dialog).queryByRole("button", { name: "Install" })).not.toBeInTheDocument();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "pwa_prompt_shown",
      category: "engagement",
      label: "ios",
    });
  });

  it("does not show the prompt again within 14 days of a dismissal", () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    const { container } = render(<PWAInstallPrompt />);
    expect(container).toBeEmptyDOMElement();
    expect(gaEventMock).not.toHaveBeenCalled();
  });

  it("shows the prompt again once the dismissal is older than 14 days", () => {
    const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(fifteenDaysAgo));
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    render(<PWAInstallPrompt />);
    expect(screen.getByRole("dialog", { name: /install app/i })).toBeInTheDocument();
  });

  it("dismiss button hides the banner, records dismissal, and fires pwa_prompt_dismissed", async () => {
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    render(<PWAInstallPrompt />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /dismiss install prompt/i }));

    // framer-motion's AnimatePresence keeps the element mounted through its
    // exit animation (real timing, driven by rAF) — wait for it to finish
    // unmounting rather than asserting immediately after the click.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "pwa_prompt_dismissed",
      category: "engagement",
      label: "ios",
    });
    expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull();
  });

  it("shows iOS-specific instructions copy in the follow-up note, not the Android install copy", async () => {
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    render(<PWAInstallPrompt />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /dismiss install prompt/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/instructions in the menu/i);
  });

  it("shows Android install copy (not iOS instructions copy) in the follow-up note", async () => {
    render(<PWAInstallPrompt />);
    dispatchBeforeInstallPrompt("dismissed");
    await screen.findByRole("dialog", { name: /install app/i });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Install" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/install anytime from the menu/i);
  });

  it("clicking Install calls prompt(), hides the banner on any outcome, and fires pwa_install", async () => {
    render(<PWAInstallPrompt />);
    const event = dispatchBeforeInstallPrompt("accepted");
    await screen.findByRole("dialog", { name: /install app/i });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Install" }));

    expect(event.prompt).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(gaEventMock).toHaveBeenCalledWith({
        action: "pwa_install",
        category: "engagement",
        label: "accepted",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    // Accepted outcome clears the prompt rather than recording a dismissal.
    expect(localStorage.getItem(DISMISS_KEY)).toBeNull();
  });

  it("records a dismissal timestamp when the install outcome is 'dismissed'", async () => {
    render(<PWAInstallPrompt />);
    dispatchBeforeInstallPrompt("dismissed");
    await screen.findByRole("dialog", { name: /install app/i });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Install" }));

    await waitFor(() => expect(localStorage.getItem(DISMISS_KEY)).not.toBeNull());
  });
});

