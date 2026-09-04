import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("GoogleAnalytics", () => {
  afterEach(() => {
    vi.doUnmock("@/lib/gtag");
    vi.resetModules();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("renders nothing when GA_MEASUREMENT_ID is unset", async () => {
    vi.doMock("@/lib/gtag", () => ({ GA_MEASUREMENT_ID: undefined }));
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();
  });

  it("injects the gtag.js loader and an inline init script referencing the measurement ID when set", async () => {
    vi.doMock("@/lib/gtag", () => ({ GA_MEASUREMENT_ID: "G-TEST123" }));
    const { GoogleAnalytics } = await import("./GoogleAnalytics");
    render(<GoogleAnalytics />);

    await waitFor(() => {
      const loader = document.querySelector(
        'script[src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"]',
      );
      expect(loader).not.toBeNull();
    });

    await waitFor(() => {
      const init = document.getElementById("ga-init");
      expect(init).not.toBeNull();
      expect(init?.textContent).toContain("gtag('config', 'G-TEST123')");
    });
  });
});
