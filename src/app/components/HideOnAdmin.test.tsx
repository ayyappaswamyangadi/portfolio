import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HideOnAdmin } from "./HideOnAdmin";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

describe("HideOnAdmin", () => {
  it("renders its children on site pages", () => {
    pathname = "/";
    render(<HideOnAdmin>navbar</HideOnAdmin>);
    expect(screen.getByText("navbar")).toBeInTheDocument();
  });

  it("renders nothing under /admin", () => {
    pathname = "/admin/login";
    render(<HideOnAdmin>navbar</HideOnAdmin>);
    expect(screen.queryByText("navbar")).not.toBeInTheDocument();
  });
});
