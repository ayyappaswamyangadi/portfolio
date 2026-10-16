import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionGlobalConfig } from "framer-motion";
import { ServiceWorkerUpdater, UPDATE_VIEW_KEY } from "./ServiceWorkerUpdater";

const originalLocation = window.location;
let reloadMock: ReturnType<typeof vi.fn>;
let update: ReturnType<typeof vi.fn>;

function stubServiceWorker(controller: object | null) {
  const sw = Object.assign(new EventTarget(), {
    controller,
    getRegistration: vi.fn(() => Promise.resolve({ update })),
  });
  Object.defineProperty(navigator, "serviceWorker", {
    value: sw,
    configurable: true,
  });
  return sw;
}

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("ServiceWorkerUpdater", () => {
  beforeEach(() => {
    reloadMock = vi.fn();
    update = vi.fn(() => Promise.resolve());
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, reload: reloadMock },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
    });
    // @ts-expect-error — removing the test stub
    delete navigator.serviceWorker;
    setVisibility("visible");
    sessionStorage.clear();
    document.body.innerHTML = "";
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("reloads onto the new build when an updated worker takes over", () => {
    const sw = stubServiceWorker({});
    render(<ServiceWorkerUpdater />);

    sw.dispatchEvent(new Event("controllerchange"));
    sw.dispatchEvent(new Event("controllerchange"));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("does not reload on the very first install (no previous controller)", () => {
    const sw = stubServiceWorker(null);
    render(<ServiceWorkerUpdater />);

    sw.dispatchEvent(new Event("controllerchange"));
    expect(reloadMock).not.toHaveBeenCalled();

    // A later deploy replacing that first worker is a real update.
    sw.dispatchEvent(new Event("controllerchange"));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("defers the reload while the user is typing, until the app is backgrounded", () => {
    const sw = stubServiceWorker({});
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    render(<ServiceWorkerUpdater />);

    sw.dispatchEvent(new Event("controllerchange"));
    expect(reloadMock).not.toHaveBeenCalled();

    setVisibility("hidden");
    expect(reloadMock).toHaveBeenCalledTimes(1);
    input.remove();
  });

  it("checks for a new build on launch and whenever the app returns to the foreground", async () => {
    const sw = stubServiceWorker({});
    render(<ServiceWorkerUpdater />);
    await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(1));

    setVisibility("visible");
    await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    expect(sw.getRegistration).toHaveBeenCalledTimes(2);
  });

  it("saves the reader's place before swapping to the new build", () => {
    const section = document.createElement("section");
    section.id = "projects";
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      top: -120,
      bottom: 500,
    } as DOMRect);
    const carousel = document.createElement("div");
    carousel.dataset.scrollKey = "featured-projects";
    carousel.scrollLeft = 340;
    document.body.append(section, carousel);
    const sw = stubServiceWorker({});
    render(<ServiceWorkerUpdater />);

    sw.dispatchEvent(new Event("controllerchange"));
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(history.scrollRestoration).toBe("manual");
    const saved = JSON.parse(sessionStorage.getItem(UPDATE_VIEW_KEY)!);
    expect(saved).toMatchObject({
      section: "projects",
      offset: 120,
      carousels: { "featured-projects": 340 },
    });
  });

  it("waits until the user stops scrolling or touching before swapping", () => {
    vi.useFakeTimers();
    const sw = stubServiceWorker({});
    render(<ServiceWorkerUpdater />);

    window.dispatchEvent(new Event("touchstart"));
    sw.dispatchEvent(new Event("controllerchange"));
    expect(reloadMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(1500);
    expect(reloadMock).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1500);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("does not swap while a project card is flipped over", () => {
    vi.useFakeTimers();
    const card = document.createElement("div");
    card.dataset.flipped = "true";
    document.body.appendChild(card);
    const sw = stubServiceWorker({});
    render(<ServiceWorkerUpdater />);

    sw.dispatchEvent(new Event("controllerchange"));
    vi.advanceTimersByTime(5000);
    expect(reloadMock).not.toHaveBeenCalled();

    card.dataset.flipped = "false";
    vi.advanceTimersByTime(1500);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("restores the saved view on the new build without replaying animations", () => {
    vi.useFakeTimers();
    const scrollTo = vi.fn();
    vi.spyOn(window, "scrollTo").mockImplementation(scrollTo);
    const section = document.createElement("section");
    section.id = "about";
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      top: 900,
    } as DOMRect);
    const carousel = document.createElement("div");
    carousel.dataset.scrollKey = "skills";
    const carouselScroll = vi.fn();
    carousel.scrollTo = carouselScroll;
    document.body.append(section, carousel);
    sessionStorage.setItem(
      UPDATE_VIEW_KEY,
      JSON.stringify({
        section: "about",
        offset: 50,
        y: 1234,
        carousels: { skills: 200 },
        t: Date.now(),
      }),
    );
    MotionGlobalConfig.skipAnimations = true;
    stubServiceWorker({});
    render(<ServiceWorkerUpdater />);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 950,
      left: 0,
      behavior: "instant",
    });
    expect(carouselScroll).toHaveBeenCalledWith({
      left: 200,
      behavior: "instant",
    });
    expect(sessionStorage.getItem(UPDATE_VIEW_KEY)).toBeNull();

    vi.advanceTimersByTime(800);
    expect(MotionGlobalConfig.skipAnimations).toBe(false);
  });
});
