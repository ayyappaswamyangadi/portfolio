import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders a 404 message and a link back home", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
