import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotFound from "./not-found";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

const usePathnameMock = vi.fn(() => "/some/missing/path");
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("NotFound", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    usePathnameMock.mockReturnValue("/some/missing/path");
  });

  it("renders a 404 message and a link back home", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("fires a page_not_found gaEvent with the current pathname on mount", () => {
    usePathnameMock.mockReturnValue("/oops");
    render(<NotFound />);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "page_not_found",
      category: "error",
      label: "/oops",
    });
  });
});
