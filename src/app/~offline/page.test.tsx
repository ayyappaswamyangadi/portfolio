import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import OfflinePage from "./page";

describe("OfflinePage", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // jsdom doesn't implement real navigation — replace `window.location`
    // with a writable stub so `handleRetry`'s `window.location.href = "/"`
    // doesn't throw "Not implemented: navigation".
    // @ts-expect-error simplified stub for the one property this page sets
    delete window.location;
    (window as unknown as { location: Location }).location = {
      ...originalLocation,
      href: "",
    } as Location;
  });

  afterEach(() => {
    (window as unknown as { location: Location }).location = originalLocation;
  });

  it("renders the offline message with Try again and Go home actions", () => {
    render(<OfflinePage />);

    expect(screen.getByRole("heading", { name: /you're offline/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    const goHome = screen.getByRole("link", { name: /go home/i });
    expect(goHome).toHaveAttribute("href", "/");
  });

  it("navigates home and shows a retrying state when Try again is clicked", async () => {
    const user = userEvent.setup();
    render(<OfflinePage />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    await user.click(retryButton);

    expect(window.location.href).toBe("/");
    expect(screen.getByRole("button", { name: /retrying/i })).toBeDisabled();
  });
});
