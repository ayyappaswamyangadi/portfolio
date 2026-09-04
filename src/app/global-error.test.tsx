import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// global-error.tsx does `import "./globals.css"` — the project's
// postcss.config.mjs uses Next's string-plugin-name shorthand
// (`plugins: ["@tailwindcss/postcss"]`), which Next resolves itself but
// plain Vite's PostCSS loader rejects outright ("Invalid PostCSS Plugin"),
// even with vitest.config.ts's `css: false`. Mock the CSS import away —
// these tests assert on DOM/behavior, not real applied styles.
vi.mock("./globals.css", () => ({}));

import GlobalError from "./global-error";

// GlobalError renders its own <html>/<body> (Next.js replaces the whole root
// layout on a root-level error) — RTL mounts into document.body, so this
// nests <html> inside the real document's <body>. jsdom tolerates this
// structurally without throwing; we only assert on content/behavior, not on
// document structure validity.
describe("GlobalError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders without throwing and shows an application error message", () => {
    render(<GlobalError error={new Error("fatal")} reset={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /application error/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<GlobalError error={new Error("fatal")} reset={reset} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("logs the error to the console on mount", () => {
    const error = new Error("top-level crash");
    render(<GlobalError error={error} reset={vi.fn()} />);

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
