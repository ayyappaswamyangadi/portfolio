import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggleButton from "./ThemeToggleButton";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

const setThemeMock = vi.fn();
let mockTheme = "dark";
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: setThemeMock }),
}));

describe("ThemeToggleButton", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    setThemeMock.mockClear();
    mockTheme = "dark";
  });

  it("renders a toggle button once mounted", async () => {
    render(<ThemeToggleButton />);
    expect(await screen.findByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("shows the Sun icon when the current theme is dark", async () => {
    mockTheme = "dark";
    render(<ThemeToggleButton />);
    const button = await screen.findByRole("button", { name: /toggle theme/i });
    expect(button.querySelector("svg")).toHaveClass("lucide-sun");
  });

  it("shows the Moon icon when the current theme is light", async () => {
    mockTheme = "light";
    render(<ThemeToggleButton />);
    const button = await screen.findByRole("button", { name: /toggle theme/i });
    expect(button.querySelector("svg")).toHaveClass("lucide-moon");
  });

  it("switches from light to dark on click and fires the toggle_theme gaEvent", async () => {
    mockTheme = "light";
    render(<ThemeToggleButton />);
    const user = userEvent.setup();

    const button = await screen.findByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(setThemeMock).toHaveBeenCalledWith("dark");
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "toggle_theme",
      category: "engagement",
      label: "dark",
    });
  });

  it("switches from dark to light on click and fires the toggle_theme gaEvent", async () => {
    mockTheme = "dark";
    render(<ThemeToggleButton />);
    const user = userEvent.setup();

    const button = await screen.findByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(setThemeMock).toHaveBeenCalledWith("light");
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "toggle_theme",
      category: "engagement",
      label: "light",
    });
  });
});
