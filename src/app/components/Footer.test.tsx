import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "./Footer";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

describe("Footer", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
  });

  it("renders the brand name", () => {
    render(<Footer />);
    expect(screen.getByText("Ayyappa")).toBeInTheDocument();
  });

  it("renders GitHub, LinkedIn, and Email social links with correct hrefs", () => {
    render(<Footer />);

    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("href", "https://github.com/ayyappaswamyangadi");

    const linkedin = screen.getByRole("link", { name: "LinkedIn" });
    expect(linkedin).toHaveAttribute("href", "https://linkedin.com/in/ayyappaswamyangadi");

    const email = screen.getByRole("link", { name: "Email" });
    expect(email).toHaveAttribute("href", "mailto:ayyappaswamy50@gmail.com");
  });

  it("opens external social links (http) in a new tab with rel=noopener noreferrer, but not the mailto link", () => {
    render(<Footer />);

    const github = screen.getByRole("link", { name: "GitHub" });
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");

    const linkedin = screen.getByRole("link", { name: "LinkedIn" });
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    const email = screen.getByRole("link", { name: "Email" });
    expect(email).not.toHaveAttribute("target");
    expect(email).not.toHaveAttribute("rel");
  });

  it("fires a gaEvent labelled '<social>_footer' when a social icon is clicked", async () => {
    render(<Footer />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("link", { name: "GitHub" }));

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "social",
      label: "github_footer",
    });
  });

  it("renders a 'Let's Connect' CTA linking to #contact and firing its own gaEvent", async () => {
    render(<Footer />);
    const user = userEvent.setup();

    const cta = screen.getByRole("link", { name: /let's connect/i });
    expect(cta).toHaveAttribute("href", "#contact");

    await user.click(cta);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "hero_cta",
      label: "lets_connect_footer",
    });
  });

  it("renders a Download CV button", () => {
    render(<Footer />);
    expect(screen.getByRole("button", { name: /download cv/i })).toBeInTheDocument();
  });

  it("renders the current year in the copyright line", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${year} Ayyappa`))).toBeInTheDocument();
  });
});
