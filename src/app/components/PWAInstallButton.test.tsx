import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PWAInstallButton } from "./PWAInstallButton";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

const useIOSInstallMock = vi.fn(() => ({ isIOS: false, isInstalled: false }));
vi.mock("../hooks/useIOSInstall", () => ({
  useIOSInstall: () => useIOSInstallMock(),
}));

function dispatchBeforeInstallPrompt(overrides: Partial<{ prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }> = {}) {
  const event = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };
  event.prompt = overrides.prompt ?? vi.fn().mockResolvedValue(undefined);
  event.userChoice = overrides.userChoice ?? Promise.resolve({ outcome: "accepted" });
  // dispatchEvent invokes the listener outside React's event system, so the
  // resulting setState must be wrapped in act() or the DOM update isn't
  // guaranteed to have flushed by the time the next assertion runs.
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("PWAInstallButton", () => {
  afterEach(() => {
    gaEventMock.mockClear();
    useIOSInstallMock.mockReset();
    useIOSInstallMock.mockReturnValue({ isIOS: false, isInstalled: false });
  });

  it("renders nothing when there is no beforeinstallprompt event and the device is not iOS", () => {
    const { container } = render(<PWAInstallButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing on iOS when already running standalone (installed)", () => {
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: true });
    const { container } = render(<PWAInstallButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stays hidden if beforeinstallprompt fires again after the device already has the app installed", () => {
    // Regression: Chrome doesn't reliably stop firing beforeinstallprompt on
    // every later visit (e.g. a plain browser tab after installing via
    // Chrome's own omnibox icon) — isInstalled must win over a stray event.
    useIOSInstallMock.mockReturnValue({ isIOS: false, isInstalled: true });
    const { container } = render(<PWAInstallButton />);
    dispatchBeforeInstallPrompt();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the Install button after a beforeinstallprompt event fires", () => {
    render(<PWAInstallButton />);
    dispatchBeforeInstallPrompt();
    expect(screen.getByRole("button", { name: /install app/i })).toBeInTheDocument();
  });

  it("clicking Install calls prompt(), awaits userChoice, and fires a gaEvent with the outcome", async () => {
    const promptFn = vi.fn().mockResolvedValue(undefined);
    render(<PWAInstallButton />);
    dispatchBeforeInstallPrompt({ prompt: promptFn, userChoice: Promise.resolve({ outcome: "accepted" }) });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /install app/i }));

    expect(promptFn).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(gaEventMock).toHaveBeenCalledWith({
        action: "pwa_install",
        category: "engagement",
        label: "accepted",
      }),
    );
  });

  it("clears the prompt (button disappears) once the outcome is accepted", async () => {
    render(<PWAInstallButton />);
    dispatchBeforeInstallPrompt({ userChoice: Promise.resolve({ outcome: "accepted" }) });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /install app/i }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /install app/i })).not.toBeInTheDocument(),
    );
  });

  it("keeps the button available after a dismissed outcome (prompt not cleared)", async () => {
    render(<PWAInstallButton />);
    dispatchBeforeInstallPrompt({ userChoice: Promise.resolve({ outcome: "dismissed" }) });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /install app/i }));

    await waitFor(() =>
      expect(gaEventMock).toHaveBeenCalledWith(
        expect.objectContaining({ label: "dismissed" }),
      ),
    );
    expect(screen.getByRole("button", { name: /install app/i })).toBeInTheDocument();
  });

  it("on iOS (not standalone), shows the button and clicking shows install instructions instead of calling prompt()", async () => {
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    render(<PWAInstallButton />);

    const button = screen.getByRole("button", { name: /install app/i });
    expect(button).toHaveAttribute("aria-expanded", "false");

    const user = userEvent.setup();
    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("tooltip")).toHaveTextContent(/add to home screen/i);
    expect(gaEventMock).not.toHaveBeenCalled();
  });

  it("on iOS, clicking Install again toggles the tooltip closed", async () => {
    useIOSInstallMock.mockReturnValue({ isIOS: true, isInstalled: false });
    render(<PWAInstallButton />);
    const button = screen.getByRole("button", { name: /install app/i });

    const user = userEvent.setup();
    await user.click(button);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.click(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
