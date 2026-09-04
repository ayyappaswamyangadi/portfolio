import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebVitals } from "./WebVitals";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

type Metric = { name: string; rating: string; value: number };
let reportCallback: ((metric: Metric) => void) | undefined;
const useReportWebVitalsMock = vi.fn((cb: (metric: Metric) => void) => {
  reportCallback = cb;
});
vi.mock("next/web-vitals", () => ({
  useReportWebVitals: (cb: (metric: Metric) => void) => useReportWebVitalsMock(cb),
}));

describe("WebVitals", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    useReportWebVitalsMock.mockClear();
    reportCallback = undefined;
  });

  it("renders nothing and registers a web-vitals report callback", () => {
    const { container } = render(<WebVitals />);
    expect(container).toBeEmptyDOMElement();
    expect(useReportWebVitalsMock).toHaveBeenCalledTimes(1);
    expect(reportCallback).toBeInstanceOf(Function);
  });

  it("forwards a non-CLS metric to gaEvent with the rounded value as-is", () => {
    render(<WebVitals />);
    reportCallback!({ name: "LCP", rating: "good", value: 1234.6 });

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "LCP",
      category: "web_vitals",
      label: "good",
      value: 1235,
    });
  });

  it("scales CLS by 1000 before rounding, since it's a small unitless decimal", () => {
    render(<WebVitals />);
    reportCallback!({ name: "CLS", rating: "needs-improvement", value: 0.0842 });

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "CLS",
      category: "web_vitals",
      label: "needs-improvement",
      value: 84,
    });
  });
});
