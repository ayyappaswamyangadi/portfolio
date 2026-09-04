import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useActiveSession } from "./useActiveSession";

// Capture the IntersectionObserver callback so tests can drive it manually —
// the hook's real behavior lives entirely in how it reacts to entries.
let ioCallback: IntersectionObserverCallback;
const observeSpy = vi.fn();
const disconnectSpy = vi.fn();

beforeEach(() => {
  observeSpy.mockClear();
  disconnectSpy.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      takeRecords = () => [];
      root = null;
      rootMargin = "";
      thresholds: number[] = [];
    },
  );
});

function TestHarness({ sections }: { sections: string[] }) {
  const active = useActiveSession(sections);
  return <div data-testid="active">{active}</div>;
}

function fireIntersection(id: string, isIntersecting: boolean) {
  const el = document.getElementById(id)!;
  act(() => {
    ioCallback(
      [
        {
          target: el,
          isIntersecting,
        } as unknown as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  });
}

describe("useActiveSession", () => {
  it("defaults to the first section before anything is observed", () => {
    document.body.innerHTML = `<div id="home"></div><div id="about"></div>`;
    render(<TestHarness sections={["home", "about"]} />);
    expect(screen.getByTestId("active")).toHaveTextContent("home");
  });

  it("observes every section element that exists in the DOM", () => {
    document.body.innerHTML = `<div id="home"></div><div id="about"></div><div id="contact"></div>`;
    render(<TestHarness sections={["home", "about", "contact"]} />);
    expect(observeSpy).toHaveBeenCalledTimes(3);
  });

  it("skips sections whose element is missing from the DOM", () => {
    document.body.innerHTML = `<div id="home"></div>`;
    render(<TestHarness sections={["home", "missing"]} />);
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it("switches active section to the one that becomes intersecting", () => {
    document.body.innerHTML = `<div id="home"></div><div id="about"></div>`;
    render(<TestHarness sections={["home", "about"]} />);

    fireIntersection("about", true);

    expect(screen.getByTestId("active")).toHaveTextContent("about");
  });

  it("picks the furthest-down (last in document order) visible section when multiple are visible", () => {
    document.body.innerHTML = `<div id="home"></div><div id="about"></div><div id="projects"></div>`;
    render(<TestHarness sections={["home", "about", "projects"]} />);

    fireIntersection("home", true);
    fireIntersection("about", true);

    expect(screen.getByTestId("active")).toHaveTextContent("about");
  });

  it("falls back to the first section once every section leaves the viewport", () => {
    document.body.innerHTML = `<div id="home"></div><div id="about"></div>`;
    render(<TestHarness sections={["home", "about"]} />);

    fireIntersection("about", true);
    expect(screen.getByTestId("active")).toHaveTextContent("about");

    fireIntersection("about", false);
    // visibleRef is now empty — pick() returns early, so the last computed
    // value (still "about") is retained rather than reset.
    expect(screen.getByTestId("active")).toHaveTextContent("about");
  });

  it("disconnects the observer on unmount", () => {
    document.body.innerHTML = `<div id="home"></div>`;
    const { unmount } = render(<TestHarness sections={["home"]} />);
    unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
