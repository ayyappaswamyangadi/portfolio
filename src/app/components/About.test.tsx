import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

// Capture every IntersectionObserver instance constructed during a test —
// framer-motion's own `whileInView` machinery also constructs real
// IntersectionObservers (About.tsx has several whileInView wrappers), so we
// can't assume construction order lines up with AnimatedStat instances.
// Instead each mock instance records the element(s) passed to `.observe()`,
// and tests look up "the observer watching the element whose text contains
// this stat's label" — AnimatedStat's own manual observer targets its
// `.project-card` wrapper directly, with no ancestor whileInView wrapper
// around the stats bar, so this lookup is unambiguous.
type IOInstance = { cb: IntersectionObserverCallback; elements: Element[] };
let ioInstances: IOInstance[] = [];
const disconnectSpy = vi.fn();

beforeEach(() => {
  ioInstances = [];
  disconnectSpy.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private instance: IOInstance;
      constructor(cb: IntersectionObserverCallback) {
        this.instance = { cb, elements: [] };
        ioInstances.push(this.instance);
      }
      observe = (el: Element) => this.instance.elements.push(el);
      unobserve = vi.fn();
      disconnect = disconnectSpy;
      takeRecords = () => [];
      root = null;
      rootMargin = "";
      thresholds: number[] = [];
    },
  );
});

function fireIntersectingForLabel(label: string) {
  const instance = ioInstances.find((i) =>
    i.elements.some(
      (el) => el.classList.contains("project-card") && el.textContent?.includes(label),
    ),
  );
  if (!instance) throw new Error(`No IntersectionObserver found watching an element with text "${label}"`);
  act(() => {
    instance.cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  });
}

// The counter's numeric value and suffix render as separate text nodes
// inside one .gradient-text div (`{display}{suffix}`), so getByText("0")
// can't find a whole-node match — read the combined textContent instead.
function counterText(card: HTMLElement) {
  return card.querySelector(".gradient-text")?.textContent;
}

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
    expect(screen.getByText("Ayyappa")).toBeInTheDocument();
    const roleText = screen.getByText("// Frontend Engineer");
    expect(roleText).toBeInTheDocument();

    // Scope to the avatar card — "React"/"Next.js" tech badge text also
    // appears (as exact whole-node matches) in the skills carousel and the
    // Revise experience card's tech list, so an unscoped query is ambiguous.
    const avatarCard = roleText.closest(".glass-card") as HTMLElement;
    for (const badge of ["React", "Next.js", "TS", "Redux"]) {
      expect(within(avatarCard).getByText(badge)).toBeInTheDocument();
    }
    expect(within(avatarCard).getByText("Yrs Exp.")).toBeInTheDocument();
    expect(within(avatarCard).getByText("Projects")).toBeInTheDocument();
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

  it("renders all 7 skill groups with their skills", () => {
    render(<About />);

    const groups: Record<string, string[]> = {
      "Core Languages": ["JavaScript (ES2022+)", "TypeScript", "HTML5", "CSS3"],
      "Frameworks & Libraries": [
        "React.js",
        "Next.js",
        "Redux Toolkit",
        "React Query",
        "Styled-Components",
        "Tailwind CSS",
      ],
      "State Management": ["Redux", "Context API", "React Hook Form"],
      "Tools & DevOps": ["Git", "GitHub Actions", "Webpack", "Vite", "Vercel"],
      Performance: ["Lighthouse audits", "Code splitting", "Lazy loading", "Web Vitals"],
      "Backend & APIs (Beginner)": ["Node.js", "Express.js", "REST APIs"],
      "AI-Augmented Development": [
        "Claude Code",
        "AI Pair Programming",
        "Prompt Engineering",
        "Agentic Dev Workflows",
        "AI Code Review",
      ],
    };

    for (const [label, skills] of Object.entries(groups)) {
      const groupLabel = screen.getByText(label);
      expect(groupLabel).toBeInTheDocument();
      const card = groupLabel.closest(".skill-carousel-card") as HTMLElement;
      expect(card).not.toBeNull();
      for (const skill of skills) {
        expect(within(card).getByText(skill)).toBeInTheDocument();
      }
    }
  });

  it("hides the prev arrow initially (scrollLeft=0) and shows the next arrow", () => {
    render(<About />);

    expect(screen.queryByRole("button", { name: /previous skills/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next skills/i })).toBeInTheDocument();
  });

  it("scrolling the skills carousel via the next arrow does not throw and triggers scroll behavior", async () => {
    const user = userEvent.setup();
    render(<About />);

    const scrollBySpy = vi.spyOn(Element.prototype, "scrollBy");
    await user.click(screen.getByRole("button", { name: /next skills/i }));

    expect(scrollBySpy).toHaveBeenCalled();
    scrollBySpy.mockRestore();
  });

  it("renders both work-experience entries with correct duration/location text", () => {
    render(<About />);

    // getByText's default normalizer collapses runs of whitespace to a
    // single space, so the source data's double-spaced " · " reads as a
    // single space here even though the raw string in About.tsx has two.
    expect(screen.getByRole("heading", { name: /software developer/i })).toBeInTheDocument();
    expect(screen.getByText("Oct 2020 – Jan 2022 · 1 yr 3 months")).toBeInTheDocument();
    expect(screen.getByText("Bengaluru, India · Onsite")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /frontend engineer/i })).toBeInTheDocument();
    expect(
      screen.getByText(`May 2022 – Present · ${reviseDurationLabel}`),
    ).toBeInTheDocument();
    expect(screen.getByText("Mumbai, India · Remote")).toBeInTheDocument();
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

  it("renders all 4 stat cards with their labels, starting at 0 (suffix always shown)", () => {
    render(<About />);

    // The suffix ("+" or "") is static and renders immediately — only the
    // numeric part animates from 0, so "Companies Worked" (no suffix) shows
    // a bare "0" while the others show "0+".
    const expected: Record<string, string> = {
      "Years Experience": "0+",
      "Projects Delivered": "0+",
      "Companies Worked": "0",
      "Tech Stack": "0+",
    };
    for (const [label, initial] of Object.entries(expected)) {
      const card = screen.getByText(label).closest(".project-card") as HTMLElement;
      expect(counterText(card)).toBe(initial);
    }
  });

  it("animates a stat counter up to its target value once its card intersects the viewport", async () => {
    render(<About />);

    const yearsCard = screen.getByText("Years Experience").closest(".project-card") as HTMLElement;
    expect(counterText(yearsCard)).toBe("0+");

    fireIntersectingForLabel("Years Experience");

    await waitFor(() => {
      expect(counterText(yearsCard)).toBe("5+");
    });
  });

  it("animates the Tech Stack counter (15+) independently of the other stat cards", async () => {
    render(<About />);

    const techCard = screen.getByText("Tech Stack").closest(".project-card") as HTMLElement;

    fireIntersectingForLabel("Tech Stack");

    await waitFor(() => {
      expect(counterText(techCard)).toBe("15+");
    });

    // A stat card that never intersected stays at 0.
    const companiesCard = screen.getByText("Companies Worked").closest(".project-card") as HTMLElement;
    expect(counterText(companiesCard)).toBe("0");
  });

  it("renders the tech stack logo marquee below the stat cards, with a labeled icon per technology", () => {
    render(<About />);

    const heading = screen.getByText("Tech I Work With");
    expect(heading).toBeInTheDocument();

    // Several of these names also appear as plain-text skill pills earlier
    // in the page (e.g. "TypeScript", "Next.js"), so scope the search to the
    // logo grid's own container rather than the whole document.
    const grid = heading.closest(".mt-12") as HTMLElement;
    expect(grid).not.toBeNull();

    // The marquee track renders each logo twice (a duplicated, aria-hidden
    // copy back-to-back with the real one) so the CSS loop is seamless.
    for (const name of [
      "React",
      "Next.js",
      "Redux",
      "Node.js",
      "TypeScript",
      "Claude Code",
    ]) {
      expect(within(grid).getAllByText(name).length).toBe(2);
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
