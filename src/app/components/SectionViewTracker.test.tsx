import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionViewTracker } from "./SectionViewTracker";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

let ioCallback: IntersectionObserverCallback;
const observeSpy = vi.fn();
const unobserveSpy = vi.fn();
const disconnectSpy = vi.fn();

beforeEach(() => {
  observeSpy.mockClear();
  unobserveSpy.mockClear();
  disconnectSpy.mockClear();
  gaEventMock.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe = observeSpy;
      unobserve = unobserveSpy;
      disconnect = disconnectSpy;
      takeRecords = () => [];
      root = null;
      rootMargin = "";
      thresholds: number[] = [];
    },
  );
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fireIntersection(id: string, isIntersecting: boolean) {
  const el = document.getElementById(id)!;
  act(() => {
    ioCallback(
      [{ target: el, isIntersecting } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

describe("SectionViewTracker", () => {
  it("renders nothing", () => {
    const { container } = render(<SectionViewTracker />);
    expect(container).toBeEmptyDOMElement();
  });

  it("only observes the tracked sections (about, projects, contact) that exist in the DOM, skipping home", () => {
    document.body.innerHTML =
      '<div id="home"></div><div id="about"></div><div id="projects"></div><div id="contact"></div>';
    render(<SectionViewTracker />);
    // home is deliberately excluded from TRACKED_SECTIONS.
    expect(observeSpy).toHaveBeenCalledTimes(3);
  });

  it("skips a tracked section whose element is missing from the DOM", () => {
    document.body.innerHTML = '<div id="about"></div>';
    render(<SectionViewTracker />);
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it("fires a view_section gaEvent the first time a tracked section intersects", () => {
    document.body.innerHTML = '<div id="about"></div>';
    render(<SectionViewTracker />);

    fireIntersection("about", true);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "view_section",
      category: "engagement",
      label: "about",
    });
    expect(unobserveSpy).toHaveBeenCalledTimes(1);
  });

  it("does not fire the event again for a section already seen (fires once per section per load)", () => {
    document.body.innerHTML = '<div id="about"></div>';
    render(<SectionViewTracker />);

    fireIntersection("about", true);
    fireIntersection("about", true);

    expect(gaEventMock).toHaveBeenCalledTimes(1);
  });

  it("ignores a non-intersecting entry", () => {
    document.body.innerHTML = '<div id="about"></div>';
    render(<SectionViewTracker />);

    fireIntersection("about", false);

    expect(gaEventMock).not.toHaveBeenCalled();
  });

  it("tracks each distinct section independently", () => {
    document.body.innerHTML = '<div id="about"></div><div id="projects"></div>';
    render(<SectionViewTracker />);

    fireIntersection("about", true);
    fireIntersection("projects", true);

    expect(gaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ label: "about" }),
    );
    expect(gaEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ label: "projects" }),
    );
    expect(gaEventMock).toHaveBeenCalledTimes(2);
  });

  it("disconnects the observer on unmount", () => {
    document.body.innerHTML = '<div id="about"></div>';
    const { unmount } = render(<SectionViewTracker />);
    unmount();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
