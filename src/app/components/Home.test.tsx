import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// react-three-fiber WebGL scene doesn't run in jsdom and isn't the concern
// of this component's own tests — stub it out before importing Home.
vi.mock("./HeroScene", () => ({ default: () => null }));

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

import { getTotalExperienceLabel } from "@/lib/experience";
import Home from "./Home";

describe("Home", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the hero heading, availability badge, and meta info", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("I'm Ayyappa");
    // Exact/case-sensitive: the MacWindow profile tab separately renders a
    // lowercase "available for work" status line, which a case-insensitive
    // regex query would also match, making the query ambiguous.
    expect(screen.getByText("Available for work")).toBeInTheDocument();
    expect(screen.getByText("Bengaluru, Karnataka, India")).toBeInTheDocument();
    expect(
      screen.getByText(`${getTotalExperienceLabel()} Experience`),
    ).toBeInTheDocument();
  });

  it("renders the 'Let's Connect' CTA linking to #contact and fires gaEvent on click", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const cta = screen.getByRole("link", { name: /let's connect/i });
    expect(cta).toHaveAttribute("href", "#contact");

    await user.click(cta);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "hero_cta",
      label: "lets_connect",
    });
  });

  it("renders a Download CV link pointing at the resume PDF", () => {
    render(<Home />);
    const dl = screen.getByRole("link", { name: /download cv/i });
    expect(dl).toHaveAttribute("href", "/resume/Ayyappa_Swamy_Angadi_Resume.pdf");
  });

  it("renders the quick-stats grid labels", () => {
    render(<Home />);
    expect(screen.getByText("Years Exp.")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Companies")).toBeInTheDocument();
  });

  it("defaults the Mac window to the profile.ts tab, showing profile fields", () => {
    render(<Home />);

    expect(screen.getByText("profile.ts")).toBeInTheDocument();
    expect(screen.getByText('"Ayyappa"')).toBeInTheDocument();
    expect(screen.getByText('"Frontend Engineer"')).toBeInTheDocument();
    expect(screen.getByText('"5+ Years"')).toBeInTheDocument();
  });

  it("switches to the terminal tab on click and fires gaEvent", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const terminalTab = screen.getByRole("button", { name: /terminal/i });
    await user.click(terminalTab);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "hero_mac_window",
      label: "terminal_tab",
    });
    // Profile-only content should no longer be present once switched away.
    expect(screen.queryByText('"Ayyappa"')).not.toBeInTheDocument();
  });

  it("reveals terminal lines progressively once the terminal tab is active", async () => {
    vi.useFakeTimers();
    render(<Home />);

    // Plain fireEvent (not userEvent) — userEvent's own internal delay
    // machinery deadlocks against fake timers in this environment.
    fireEvent.click(screen.getByRole("button", { name: /terminal/i }));

    // First line ("~/portfolio" prompt) appears after the first tick.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60);
    });
    expect(screen.getAllByText("~/portfolio").length).toBeGreaterThan(0);

    // Advance well past every remaining line's delay so the terminal
    // finishes rendering its whole scripted sequence, ending on the command
    // that lists recent commits. Stepping in small increments (rather than
    // one large jump) reliably lets each state update's effect schedule the
    // next timer in turn — a single large advanceTimersByTimeAsync call was
    // observed to stop short of running the whole chained sequence.
    for (let i = 0; i < 25; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(80);
      });
    }
    expect(screen.getByText(/git log --oneline -3/)).toBeInTheDocument();
  });

  it("types the first role character-by-character, then eventually cycles away from it", async () => {
    vi.useFakeTimers();
    render(<Home />);

    const typedRole = () => document.querySelector('span.text-primary[aria-hidden="true"]');

    expect(typedRole()?.textContent).toBe("");

    // "Frontend Engineer" is 17 characters, typed at 100ms/char — advance in
    // small steps so each intermediate setTimeout has a chance to schedule
    // the next one via the effect it triggers.
    for (let i = 0; i < 17; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }
    expect(typedRole()?.textContent).toBe("Frontend Engineer");

    // After the full word types out: pauses 1800ms, then deletes at
    // 55ms/char before typing the next role. Step in small increments (a
    // single large advanceTimersByTimeAsync call was observed to stop short
    // of running the whole chained pause->delete sequence) and just assert
    // it's no longer sitting on the complete first word — the exact
    // character count at an arbitrary point mid-delete is timing-sensitive
    // and not worth pinning down.
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }
    expect(typedRole()?.textContent).not.toBe("Frontend Engineer");
  });
});
