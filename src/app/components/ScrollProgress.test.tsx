import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScrollProgress } from "./ScrollProgress";

function setDocMetrics({
  scrollTop,
  scrollHeight,
  clientHeight,
}: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  Object.defineProperty(document.documentElement, "scrollTop", {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    value: clientHeight,
    configurable: true,
  });
}

describe("ScrollProgress", () => {
  afterEach(() => {
    setDocMetrics({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 });
  });

  it("renders a progressbar at 0% when the page has no scrollable overflow", () => {
    setDocMetrics({ scrollTop: 0, scrollHeight: 800, clientHeight: 800 });
    render(<ScrollProgress />);

    const bar = screen.getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });

  it("reflects the current scroll position as a percentage on mount", () => {
    setDocMetrics({ scrollTop: 500, scrollHeight: 2000, clientHeight: 1000 });
    render(<ScrollProgress />);

    // total scrollable = 2000 - 1000 = 1000; 500/1000 = 50%
    const bar = screen.getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("updates aria-valuenow and the inner bar width when the window is scrolled", () => {
    setDocMetrics({ scrollTop: 0, scrollHeight: 2000, clientHeight: 1000 });
    render(<ScrollProgress />);

    setDocMetrics({ scrollTop: 1000, scrollHeight: 2000, clientHeight: 1000 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    const bar = screen.getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("reports 100% at the bottom of the page", () => {
    setDocMetrics({ scrollTop: 2000, scrollHeight: 3000, clientHeight: 1000 });
    render(<ScrollProgress />);

    const bar = screen.getByRole("progressbar", { name: /page scroll progress/i });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });
});
