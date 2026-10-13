import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceWorkerUpdater } from "./ServiceWorkerUpdater";

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
});
