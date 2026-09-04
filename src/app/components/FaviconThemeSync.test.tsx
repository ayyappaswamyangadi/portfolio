import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FaviconThemeSync } from "./FaviconThemeSync";

const useThemeMock = vi.fn(() => ({ resolvedTheme: "dark" as string | undefined }));
vi.mock("next-themes", () => ({
  useTheme: () => useThemeMock(),
}));

// jsdom never actually loads image resources, so a real `new Image()` never
// reaches `complete: true` / fires `onload` — the component's draw() call
// would hang forever waiting on that. Stub a synchronously-"loaded" Image.
class MockImage {
  onload: (() => void) | null = null;
  complete = true;
  naturalWidth = 100;
  set src(_v: string) {
    // no-op: avoid jsdom attempting any real resource fetch
  }
}

function mockCanvasContext() {
  vi.stubGlobal("Image", MockImage);
  const ctx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    beginPath: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,mock");
  return ctx;
}

describe("FaviconThemeSync", () => {
  afterEach(() => {
    useThemeMock.mockReset();
    useThemeMock.mockReturnValue({ resolvedTheme: "dark" });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.head.innerHTML = "";
  });

  it("renders nothing (null)", () => {
    mockCanvasContext();
    const { container } = render(<FaviconThemeSync />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not throw and does not touch the DOM link when resolvedTheme is undefined", () => {
    useThemeMock.mockReturnValue({ resolvedTheme: undefined });
    const ctx = mockCanvasContext();
    expect(() => render(<FaviconThemeSync />)).not.toThrow();
    expect(ctx.beginPath).not.toHaveBeenCalled();
  });

  it("draws the canvas and repoints the existing SVG favicon link to a data URL", () => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = "/icon.svg";
    document.head.appendChild(link);

    const ctx = mockCanvasContext();
    render(<FaviconThemeSync />);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(link.type).toBe("image/png");
    expect(link.href).toBe("data:image/png;base64,mock");
  });

  it("does nothing to the DOM when no matching svg icon link exists", () => {
    const ctx = mockCanvasContext();
    expect(() => render(<FaviconThemeSync />)).not.toThrow();
    // Drawing still happens even without a link to update.
    expect(ctx.fill).toHaveBeenCalled();
  });

  it("redraws when resolvedTheme changes from dark to light", () => {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);

    const ctx = mockCanvasContext();
    const { rerender } = render(<FaviconThemeSync />);
    const firstCallCount = ctx.createLinearGradient.mock.calls.length;
    expect(firstCallCount).toBeGreaterThan(0);

    useThemeMock.mockReturnValue({ resolvedTheme: "light" });
    rerender(<FaviconThemeSync />);

    expect(ctx.createLinearGradient.mock.calls.length).toBeGreaterThan(firstCallCount);
  });
});
