import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "./ThemeProvider";

const nextThemesProviderMock = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);
vi.mock("next-themes", () => ({
  ThemeProvider: (props: { children: React.ReactNode }) => nextThemesProviderMock(props),
}));

describe("ThemeProvider", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider>
        <div>hello</div>
      </ThemeProvider>,
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("passes through all props to next-themes' ThemeProvider unchanged", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div>child</div>
      </ThemeProvider>,
    );

    expect(nextThemesProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "class",
        defaultTheme: "dark",
        enableSystem: true,
      }),
    );
  });
});
