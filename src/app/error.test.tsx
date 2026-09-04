import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

describe("Error (route-level error boundary)", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders an error message and a Try again button", () => {
    const error = Object.assign(new Error("boom"), { digest: "abc123" });
    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("logs the error and fires a gaEvent exception on mount", () => {
    const error = new Error("network dropped");
    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(console.error).toHaveBeenCalledWith(error);
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "exception",
      category: "error",
      label: "network dropped",
    });
  });
});
