import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { About } from "./About";

// About.tsx computes experience durations from the current date rather than
// hardcoding them, so tests mirror the same month-diff math instead of
// asserting a string that would go stale the moment a month rolls over.
function monthsToLabel(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;
  const yearPart = years > 0 ? `${years} yr${years !== 1 ? "s" : ""}` : "";
  const monthPart =
    remMonths > 0 ? `${remMonths} month${remMonths !== 1 ? "s" : ""}` : "";
  return [yearPart, monthPart].filter(Boolean).join(" ") || "0 months";
}

function monthsBetween(
  start: { year: number; month: number },
  end: { year: number; month: number },
) {
  return (end.year - start.year) * 12 + (end.month - start.month);
}

const now = new Date();
const NOW_YM = { year: now.getFullYear(), month: now.getMonth() + 1 };
const REVISE_START = { year: 2022, month: 5 };
const CHOOLS_PERIOD = {
  start: { year: 2020, month: 10 },
  end: { year: 2022, month: 1 },
};
const reviseDurationLabel = monthsToLabel(monthsBetween(REVISE_START, NOW_YM));
const totalExperienceLabel = monthsToLabel(
  monthsBetween(CHOOLS_PERIOD.start, CHOOLS_PERIOD.end) +
    monthsBetween(REVISE_START, NOW_YM),
);

// "Revise" and "Chools Consultancy Services" each appear twice — once in the
// flowing bio paragraph, once as the experience card's company name (which
// renders as its own gradient <p>, distinguishable by that class).
function experienceCardByCompany(company: string) {
  return screen
    .getAllByText(company)
    .map((el) => el.closest(".project-card"))
    .find((card): card is HTMLElement => card !== null)!;
}

describe("About", () => {
  it("renders the section heading and developer avatar card", () => {
    render(<About />);

    expect(screen.getByRole("heading", { name: /about me/i })).toBeInTheDocument();
    expect(screen.getByText("Ayyappa Swamy Angadi")).toBeInTheDocument();
    const roleText = screen.getByText("Senior Frontend Engineer");
    expect(roleText).toBeInTheDocument();

    // Scope to the avatar card — "React"/"Next.js" tech badge text also
    // appears (as exact whole-node matches) in the skills carousel and the
    // Revise experience card's tech list, so an unscoped query is ambiguous.
    const avatarCard = roleText.closest(".glass-card") as HTMLElement;
    for (const badge of ["React", "Next.js", "TypeScript", "Tailwind"]) {
      expect(within(avatarCard).getByText(badge)).toBeInTheDocument();
    }
    expect(within(avatarCard).getByText("Years")).toBeInTheDocument();
    expect(within(avatarCard).getByText("Projects")).toBeInTheDocument();
    expect(within(avatarCard).getByText("What I bring")).toBeInTheDocument();
    expect(within(avatarCard).getByText("On-site, hybrid or remote")).toBeInTheDocument();
  });

  it("renders the About-me bio paragraphs with key facts", () => {
    render(<About />);

    expect(
      screen.getByText(`${totalExperienceLabel} of professional experience`),
    ).toBeInTheDocument();
    // Both company names appear twice: once in the flowing bio paragraph,
    // once as the experience card's heading — assert at least one exists.
    expect(screen.getAllByText("Chools Consultancy Services").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Revise").length).toBeGreaterThan(0);
  });

  it("renders the skill cards strongest first, with testing and backend marked as beginner", () => {
    render(<About />);

    const groups: Record<string, string[]> = {
      Frontend: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3"],
      "Styling & UI": ["Tailwind CSS", "Styled-Components", "Framer Motion"],
      "State & Data": ["Redux Toolkit", "React Query", "WebSockets", "Server-Sent Events"],
      Performance: ["Code splitting", "Lazy loading", "Core Web Vitals"],
      "Tooling & Deployment": ["Git & GitHub", "Vite", "Vercel"],
      "AI-Assisted Development": ["Claude Code", "Agentic Workflows", "AI Code Review"],
      Testing: ["Vitest", "React Testing Library"],
      Backend: ["Node.js", "Express.js"],
    };

    const cards = Array.from(document.querySelectorAll(".skill-card"));
    expect(cards).toHaveLength(Object.keys(groups).length);
    expect(cards[0]).toHaveTextContent("Frontend");

    expect(screen.queryByText("Material UI")).not.toBeInTheDocument();

    for (const [label, skills] of Object.entries(groups)) {
      const card = screen.getByRole("heading", { name: label }).closest(".skill-card") as HTMLElement;
      expect(card).not.toBeNull();
      for (const skill of skills) {
        expect(within(card).getByText(skill)).toBeInTheDocument();
      }
    }

    for (const label of ["Testing", "Backend"]) {
      const card = screen.getByRole("heading", { name: label }).closest(".skill-card") as HTMLElement;
      expect(within(card).getByText("Beginner")).toBeInTheDocument();
    }
  });

  it("shows the skills as a horizontally scrollable carousel", () => {
    render(<About />);
    const region = screen.getByRole("region", { name: "Technical skills" });
    expect(region.querySelector(".carousel-scroll")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Previous skills" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next skills" })).not.toBeDisabled();
  });

  it("auto-advances the skills carousel and pauses while hovered", () => {
    vi.useFakeTimers();
    try {
      render(<About />);
      const region = screen.getByRole("region", { name: "Technical skills" });
      const prev = screen.getByRole("button", { name: "Previous skills" });
      expect(prev).toBeDisabled();

      act(() => {
        fireEvent.mouseEnter(region);
      });
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      expect(prev).toBeDisabled();

      act(() => {
        fireEvent.mouseLeave(region);
      });
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      expect(prev).not.toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("aligns the highlighted project cards' icons with their text", () => {
    render(<About />);
    const card = screen.getByText("Live on the App Store").closest(".rounded-xl") as HTMLElement;
    expect(card).toHaveClass("items-center");
  });

  it("no longer shows the separate stats bar (the profile card has the numbers)", () => {
    render(<About />);
    for (const label of ["Years Experience", "Projects Delivered", "Companies Worked", "Tech Stack"]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it("doesn't claim React Native or Playwright anywhere in the section", () => {
    const { container } = render(<About />);
    expect(container).not.toHaveTextContent(/react native|expo|playwright/i);
  });

  it("renders both work-experience entries with correct duration/location text", () => {
    render(<About />);

    // getByText's default normalizer collapses runs of whitespace to a
    // single space, so the source data's double-spaced " · " reads as a
    // single space here even though the raw string in About.tsx has two.
    expect(screen.getByRole("heading", { name: /software developer/i })).toBeInTheDocument();
    const chools = experienceCardByCompany("Chools Consultancy Services");
    expect(chools).toHaveTextContent("Oct 2020 – Jan 2022 · 1 yr 3 months");
    expect(chools).toHaveTextContent("Bengaluru, India · Onsite");

    expect(screen.getByRole("heading", { name: /frontend engineer/i })).toBeInTheDocument();
    const revise = experienceCardByCompany("Revise");
    expect(revise).toHaveTextContent(`May 2022 – Present · ${reviseDurationLabel}`);
    expect(revise).toHaveTextContent("Mumbai, India · Remote");
  });

  it("shows the 'Current' badge only for the Revise (current) job, not Chools", () => {
    render(<About />);

    const currentBadge = screen.getByText("Current");
    expect(currentBadge).toBeInTheDocument();

    const reviseCard = experienceCardByCompany("Revise");
    expect(within(reviseCard).getByText("Current")).toBeInTheDocument();

    const choolsCard = experienceCardByCompany("Chools Consultancy Services");
    expect(within(choolsCard).queryByText("Current")).not.toBeInTheDocument();
  });

  it("lists work experience newest first, so the current job is the first card", () => {
    render(<About />);

    const reviseCard = experienceCardByCompany("Revise");
    const choolsCard = experienceCardByCompany("Chools Consultancy Services");
    expect(
      reviseCard.compareDocumentPosition(choolsCard) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Previous role")).toBeInTheDocument();
  });

  it("renders the tech stack logo marquee, with a labeled icon per technology", () => {
    render(<About />);

    const heading = screen.getByText("Tech I Work With");
    expect(heading).toBeInTheDocument();

    // Several of these names also appear as plain-text skill pills earlier
    // in the page (e.g. "TypeScript", "Next.js"), so scope the search to the
    // logo grid's own container rather than the whole document.
    const grid = heading.closest(".mt-16") as HTMLElement;
    expect(grid).not.toBeNull();

    // The marquee track renders each logo twice so the CSS loop is
    // seamless, but only the first copy's label is real text — the second
    // copy draws it with CSS (data-label) so the tech list isn't duplicated
    // in the page's extracted text.
    for (const name of [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
      "TypeScript",
      "Claude Code",
    ]) {
      expect(within(grid).getAllByText(name).length).toBe(1);
      expect(grid.querySelector(`.marquee-dup-label[data-label="${name}"]`)).not.toBeNull();
    }

    // Each logo tile renders an actual SVG icon, not just the text label.
    const reactTile = within(grid).getAllByText("React")[0].closest("div") as HTMLElement;
    expect(reactTile.querySelector("svg")).toBeInTheDocument();

    // The duplicated half is hidden from assistive tech so it isn't
    // announced/tabbed to twice; the real half stays visible.
    const allTiles = grid.querySelectorAll(".tech-logo-tile");
    const hiddenTiles = grid.querySelectorAll('.tech-logo-tile[aria-hidden="true"]');
    expect(hiddenTiles.length).toBe(allTiles.length / 2);
  });
});
