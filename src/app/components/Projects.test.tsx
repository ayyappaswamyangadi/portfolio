import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { projects } from "@/lib/projects";
import { Projects } from "./Projects";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

const FEATURED_TITLES = [
  "Grass: Code Agent Computer",
  "TaxAI — AI Research Assistant for CAs",
  "Convo — LLM Memory Dashboard",
  "10X Trade — Futures Trading in Telegram",
];

// The whole flip card (front + back faces) for a project, found via the
// front face's accessible name.
function cardFor(title: string) {
  return screen
    .getByRole("article", { name: `${title} — show details` })
    .closest(".group") as HTMLElement;
}

function carousel() {
  return screen.getByRole("region", { name: "Professional projects" });
}

function getScrollToMock() {
  return Element.prototype.scrollTo as ReturnType<typeof vi.fn>;
}

// Make matchMedia report a desktop (≥1024px) viewport so "More Projects"
// shows three cards per row.
function mockDesktopWidth() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: /min-width/.test(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Projects", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    getScrollToMock().mockClear();
  });

  afterEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("shows the professional products first in the carousel, in order", () => {
    render(<Projects />);

    expect(screen.getByRole("heading", { name: /featured projects/i })).toBeInTheDocument();
    const names = within(carousel())
      .getAllByRole("article")
      .map((a) => a.getAttribute("aria-label")?.replace(" — show details", ""));
    expect(names).toEqual(FEATURED_TITLES);
  });

  it("front of each card shows the screenshot, type, title and a tap hint; the back holds the details", () => {
    render(<Projects />);
    const card = cardFor("Grass: Code Agent Computer");
    const front = within(card).getByRole("article");

    expect(within(front).getByRole("img")).toHaveAttribute(
      "alt",
      "Grass: Code Agent Computer — screenshot",
    );
    expect(within(front).getByText("Professional")).toBeInTheDocument();
    expect(within(front).getByText(/tap to see what i built/i)).toBeInTheDocument();
    expect(within(front).queryByText("What I built")).not.toBeInTheDocument();

    // Details live on the back face.
    expect(within(card).getByText("What I built")).toBeInTheDocument();
    expect(within(card).getByText("React Native")).toBeInTheDocument();
    expect(within(card).getByText("Claude Code (AI-assisted)")).toBeInTheDocument();
  });

  it("flips a card on tap (touch device), firing gaEvent only on the opening tap", async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const card = cardFor("TaxAI — AI Research Assistant for CAs");
    const front = within(card).getByRole("article");

    await user.click(within(front).getByText(/tap to see what i built/i));
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "expand",
      category: "project_card",
      label: "TaxAI — AI Research Assistant for CAs",
    });
    // Once flipped, only the back face takes pointer input.
    expect(front).toHaveStyle({ pointerEvents: "none" });

    gaEventMock.mockClear();
    await user.click(within(card).getAllByText("TaxAI — AI Research Assistant for CAs")[1]);
    expect(gaEventMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: "expand" }),
    );
    expect(front).toHaveStyle({ pointerEvents: "auto" });
  });

  it("links Grass to its website, App Store listing and Product Hunt page", () => {
    render(<Projects />);
    const card = cardFor("Grass: Code Agent Computer");

    expect(card).toHaveTextContent("Live on the App Store · Android waitlist");
    expect(within(card).getByRole("link", { name: "Visit Website" })).toHaveAttribute(
      "href",
      "https://codeongrass.com/",
    );
    expect(within(card).getByRole("link", { name: /on the app store/i })).toHaveAttribute(
      "href",
      "https://apps.apple.com/in/app/grass-code-agent-computer/id6761881356",
    );
    expect(within(card).getByRole("link", { name: /on product hunt/i })).toBeInTheDocument();
  });

  it("links TaxAI and Convo to Product Hunt, with no ranking claim on Convo", () => {
    render(<Projects />);

    expect(
      within(cardFor("TaxAI — AI Research Assistant for CAs")).getByRole("link", {
        name: /view on product hunt/i,
      }),
    ).toHaveAttribute("href", "https://www.producthunt.com/products/taxai");

    const convo = cardFor("Convo — LLM Memory Dashboard");
    expect(within(convo).getByRole("link", { name: /view on product hunt/i })).toBeInTheDocument();
    expect(convo).not.toHaveTextContent(/product of the day|#8/i);
  });

  it("shows 10X Trade as a retired product, without any live links", () => {
    render(<Projects />);
    const card = cardFor("10X Trade — Futures Trading in Telegram");

    expect(within(card).queryAllByRole("link")).toHaveLength(0);
    expect(card).toHaveTextContent("Shipped to production · Since retired");
    expect(within(card).getByText(/has been retired, so no public demo/i)).toBeInTheDocument();
    expect(card).not.toHaveTextContent(/t\.me/i);
  });

  it("More Projects shows a single row and pages through the rest (one card per row on phones)", async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const pages = screen.getByRole("navigation", { name: "More projects pages" });

    expect(screen.getByText(/showing 1–1 of 5 projects/i)).toBeInTheDocument();
    expect(within(pages).getAllByRole("button", { name: /^page \d$/i })).toHaveLength(5);
    expect(
      screen.getByRole("article", { name: "Chools — Learning & Consulting Platform — show details" }),
    ).toBeInTheDocument();

    await user.click(within(pages).getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/showing 2–2 of 5 projects/i)).toBeInTheDocument();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "project_pagination",
      label: "next",
    });
  });

  it("More Projects fits three cards in the row on desktop, with two pages", () => {
    mockDesktopWidth();
    render(<Projects />);
    const pages = screen.getByRole("navigation", { name: "More projects pages" });

    expect(screen.getByText(/showing 1–3 of 5 projects/i)).toBeInTheDocument();
    expect(within(pages).getAllByRole("button", { name: /^page \d$/i })).toHaveLength(2);
  });

  it("marks personal and client projects as built end to end, with the free-tier note", () => {
    mockDesktopWidth();
    render(<Projects />);

    const resume = cardFor("Resume Builder");
    expect(resume).toHaveTextContent("Personal project · designed and built end to end");
    expect(within(resume).getByRole("link", { name: /source code on github/i })).toHaveAttribute(
      "href",
      "https://github.com/ayyappaswamyangadi/resume-builder-nextjs",
    );
    expect(within(resume).getByText(/hosted on a free tier/i)).toBeInTheDocument();

    const client = cardFor("Sarvadharma Marriage Bureau — Registration Form");
    expect(client).toHaveTextContent("Client project · designed and built end to end");
    expect(within(client).queryByRole("link", { name: /github/i })).not.toBeInTheDocument();
    expect(within(client).getByRole("link", { name: "View Live Demo" })).toHaveAttribute(
      "href",
      "https://matrimony-registration-form.vercel.app/",
    );

    expect(
      within(cardFor("Grass: Code Agent Computer")).queryByText(/free tier/i),
    ).not.toBeInTheDocument();
  });

  it("solo projects lead with end-to-end ownership instead of 'What I built'", () => {
    mockDesktopWidth();
    render(<Projects />);

    const resume = cardFor("Resume Builder");
    expect(within(resume).getByText("Sole developer — built end to end")).toBeInTheDocument();
    expect(within(resume).getByText("Key features")).toBeInTheDocument();
    expect(within(resume).queryByText("What I built")).not.toBeInTheDocument();

    const grass = cardFor("Grass: Code Agent Computer");
    expect(within(grass).getByText("What I built")).toBeInTheDocument();
    expect(within(grass).queryByText(/sole developer/i)).not.toBeInTheDocument();
  });

  it("More Projects tabs filter by kind and reset to the first page", async () => {
    const user = userEvent.setup();
    mockDesktopWidth();
    render(<Projects />);
    const tablist = screen.getByRole("tablist", { name: "Filter projects" });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual([
      "All Projects5",
      "Client1",
      "Professional1",
      "Personal3",
    ]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    await user.click(within(screen.getByRole("navigation", { name: "More projects pages" })).getByRole("button", { name: "Next page" }));
    await user.click(within(tablist).getByRole("tab", { name: /personal/i }));
    expect(screen.getByText(/showing 1–3 of 3 projects/i)).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "More projects pages" })).not.toBeInTheDocument();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "project_tab",
      label: "Personal",
    });

    await user.click(within(tablist).getByRole("tab", { name: /client/i }));
    expect(screen.getByText(/showing 1–1 of 1 project$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("article", {
        name: "Sarvadharma Marriage Bureau — Registration Form — show details",
      }),
    ).toBeInTheDocument();
  });

  it("More Projects tabs support arrow-key navigation", async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const tabs = within(screen.getByRole("tablist", { name: "Filter projects" })).getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(tabs[3]).toHaveFocus();
  });

  it("carousel arrows step one card at a time and disable at each end", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const prev = screen.getByRole("button", { name: "Previous project" });
    const next = screen.getByRole("button", { name: "Next project" });
    expect(prev).toBeDisabled();

    await user.click(next);
    expect(getScrollToMock()).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "featured_carousel",
      label: "next",
    });
    expect(prev).not.toBeDisabled();

    // jsdom has no layout, so the carousel assumes one card per view:
    // four cards → four positions.
    await user.click(next);
    await user.click(next);
    expect(next).toBeDisabled();
    expect(screen.getByRole("button", { name: "Go to slide 4 of 4" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("with two cards per view, shows one dot per scroll position and lights the last dot at the end", () => {
    const { container } = render(<Projects />);

    // Lay the carousel out as on a desktop: 400px cards, 820px viewport,
    // 20px gap → two whole cards visible, three reachable positions.
    const scroller = container.querySelector(".carousel-scroll") as HTMLElement;
    for (const card of container.querySelectorAll<HTMLElement>(".featured-card")) {
      Object.defineProperty(card, "offsetWidth", { value: 400, configurable: true });
    }
    Object.defineProperty(scroller, "clientWidth", { value: 820, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");

    Object.defineProperty(scroller, "scrollLeft", { value: 840, configurable: true });
    fireEvent.scroll(scroller);

    const after = screen.getAllByRole("button", { name: /go to slide/i });
    expect(after[2]).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Next project" })).toBeDisabled();
  });

  it("lists every project in the initial markup for crawlers, even ones on later pages", () => {
    const { container } = render(<Projects />);
    const list = container.querySelector(".sr-only ul") as HTMLElement;
    expect(within(list).getAllByRole("listitem")).toHaveLength(projects.length);
  });

  it("no longer shows a GitHub profile CTA under the projects", () => {
    render(<Projects />);
    expect(screen.queryByRole("link", { name: /view github profile/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/more of my code is on github/i)).not.toBeInTheDocument();
  });

  it("flips a card on the first tap, even mid-scroll when no click follows", () => {
    // Touch device: no hover.
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      ...mm(q),
      matches: q === "(hover: hover)" ? false : mm(q).matches,
    })) as typeof window.matchMedia;
    try {
      render(<Projects />);
      const card = cardFor("Grass: Code Agent Computer");
      const front = within(card).getByRole("article");
      fireEvent.touchStart(front, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(front, { changedTouches: [{ clientX: 102, clientY: 101 }] });
      expect(front).toHaveStyle({ pointerEvents: "none" });

      // The browser's follow-up click from that same tap must not flip it back.
      fireEvent.click(front);
      expect(front).toHaveStyle({ pointerEvents: "none" });

      // A swipe is not a tap.
      fireEvent.touchStart(front, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(front, { changedTouches: [{ clientX: 160, clientY: 100 }] });
      expect(front).toHaveStyle({ pointerEvents: "none" });
    } finally {
      window.matchMedia = mm;
    }
  });
});
