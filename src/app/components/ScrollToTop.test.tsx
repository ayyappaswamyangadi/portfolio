import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ScrollToTop } from "./ScrollToTop";

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, writable: true, configurable: true });
}

describe("ScrollToTop", () => {
  beforeEach(() => {
    setScrollY(0);
  });

  afterEach(() => {
    setScrollY(0);
  });

  it("is not rendered while the page is scrolled less than 400px", () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole("button", { name: /scroll to top/i })).not.toBeInTheDocument();
  });

  it("appears once the page scrolls past 400px", async () => {
    render(<ScrollToTop />);

    setScrollY(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(await screen.findByRole("button", { name: /scroll to top/i })).toBeInTheDocument();
  });

  it("disappears again once scrolled back above the 400px threshold", async () => {
    render(<ScrollToTop />);

    setScrollY(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(await screen.findByRole("button", { name: /scroll to top/i })).toBeInTheDocument();

    setScrollY(0);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /scroll to top/i })).not.toBeInTheDocument(),
    );
  });

  it("scrolls smoothly to the top when clicked", async () => {
    render(<ScrollToTop />);
    const user = userEvent.setup();

    setScrollY(500);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    const button = await screen.findByRole("button", { name: /scroll to top/i });

    await user.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
