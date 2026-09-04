import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Projects } from "./Projects";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

// Mirrors the `featured` projects (in array order) and the "All"-category
// pagination order from Projects.tsx's `projects` data, so tests don't have
// to hardcode positions blindly.
const FEATURED_TITLES = [
  "YouTube Clone",
  "Ayyappa & Nayana — Wedding Invitation",
  "URL Shortener",
  "Resume Builder",
];
const ALL_ORDER_PAGE_0 = ["YouTube Clone", "TaskFlow — Todo App"];
const ALL_ORDER_PAGE_1 = ["Ayyappa & Nayana — Wedding Invitation", "URL Shortener"];
const ALL_ORDER_LAST_PAGE = ["Facebook Clone", "Resume Builder"];

// The "All Projects" paginated grid renders its own ProjectCard instances,
// separate from the featured carousel's — a featured project (e.g. YouTube
// Clone, Wedding Invitation) is mounted TWICE on the page. Scope queries to
// just the grid to avoid "multiple elements found" false positives.
function getGridWithin(container: HTMLElement) {
  const grid = container.querySelector('[class*="sm:grid-cols-2"]') as HTMLElement;
  if (!grid) throw new Error("All Projects grid container not found");
  return within(grid);
}

function getScrollByMock() {
  return Element.prototype.scrollBy as ReturnType<typeof vi.fn>;
}
function getScrollToMock() {
  return Element.prototype.scrollTo as ReturnType<typeof vi.fn>;
}

describe("Projects", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    getScrollByMock().mockClear();
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

  it("renders the featured carousel with only featured projects, and all category filter buttons", () => {
    render(<Projects />);

    expect(screen.getByRole("heading", { name: /featured projects/i })).toBeInTheDocument();
    for (const title of FEATURED_TITLES) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
    // TaskFlow is not featured — it should not appear in the carousel's dot
    // indicators (one dot per featured project).
    expect(screen.getAllByLabelText(/go to project/i)).toHaveLength(FEATURED_TITLES.length);

    for (const cat of [
      "All",
      "UI Clone",
      "Full Stack",
      "Productivity",
      "Utility",
      "Personal",
      "Client Work",
    ]) {
      expect(screen.getByRole("button", { name: cat })).toBeInTheDocument();
    }
  });

  it("defaults to the 'All' category, page 1, showing 2 of 8 projects with pagination", () => {
    render(<Projects />);

    expect(screen.getByText(/showing 1–2 of 8 projects/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 4" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Page 5" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).not.toBeDisabled();

    for (const title of ALL_ORDER_PAGE_0) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
  });

  it("filters by category, resets to page 1, hides pagination for a single-project category, and fires gaEvent", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.click(screen.getByRole("button", { name: "UI Clone" }));

    expect(screen.getByText(/showing 1–1 of 1 projects/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "filter",
      category: "project_category",
      label: "UI Clone",
    });
  });

  it("paginates through the 'All' category", async () => {
    const user = userEvent.setup();
    const { container } = render(<Projects />);

    await user.click(screen.getByLabelText("Next page"));

    expect(screen.getByText(/showing 3–4 of 8 projects/i)).toBeInTheDocument();
    // AnimatePresence (mode="wait") briefly keeps the outgoing page's cards
    // mounted (mid-exit-fade) until its ~0.2s exit transition settles, before
    // the incoming page's cards mount — a same-length hint count (2 old vs.
    // 2 new here) isn't a reliable settle signal, so wait for one of the
    // actual incoming titles to show up in the grid instead.
    for (const title of ALL_ORDER_PAGE_1) {
      await waitFor(() =>
        expect(getGridWithin(container).getAllByText(title).length).toBeGreaterThan(0),
      );
    }
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "project_pagination",
      label: "next",
    });

    await user.click(screen.getByRole("button", { name: "Page 4" }));

    expect(screen.getByText(/showing 7–8 of 8 projects/i)).toBeInTheDocument();
    for (const title of ALL_ORDER_LAST_PAGE) {
      await waitFor(() =>
        expect(getGridWithin(container).getAllByText(title).length).toBeGreaterThan(0),
      );
    }
    expect(screen.getByLabelText("Next page")).toBeDisabled();
    expect(screen.getByLabelText("Previous page")).not.toBeDisabled();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "project_pagination",
      label: "page_4",
    });
  });

  it("flips a card open on tap (non-hover device), firing gaEvent only on the opening tap", async () => {
    const user = userEvent.setup();
    const { container } = render(<Projects />);

    // Page 0's first grid card is "YouTube Clone" — scope to the grid since
    // YouTube Clone (featured) also has a separate instance in the carousel.
    const grid = getGridWithin(container);
    const firstCardHint = grid.getAllByText(/hover to see details/i)[0];

    await user.click(firstCardHint);
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "expand",
      category: "project_card",
      label: "YouTube Clone",
    });

    // Back face content for YouTube Clone is now queryable (flip is a CSS
    // transform, not conditional mounting, so it's present either way, but
    // this confirms the right project's back content renders at all).
    expect(
      grid.getByText(/pixel-close clone of youtube's web ui/i),
    ).toBeInTheDocument();
    expect(grid.getByText("Home feed + category chips")).toBeInTheDocument();
    expect(grid.getAllByTitle("GitHub").length).toBeGreaterThan(0);
    expect(grid.getAllByTitle("Live Demo").length).toBeGreaterThan(0);

    gaEventMock.mockClear();
    await user.click(firstCardHint);
    // Closing tap should not re-fire the "expand" event.
    expect(gaEventMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: "expand" }),
    );
  });

  it("hides the GitHub link but keeps Live Demo for a project with no githubUrl", async () => {
    const user = userEvent.setup();
    const { container } = render(<Projects />);

    await user.click(screen.getByRole("button", { name: "Personal" }));
    // Only "Ayyappa & Nayana — Wedding Invitation" is in the Personal
    // category, but it's also featured, so scope to the grid instance —
    // the carousel's copy of the same project still has a GitHub link.
    // Also wait for AnimatePresence's exit transition to settle so the
    // outgoing "All" page's cards aren't still mounted alongside it (see
    // the pagination test above for the same race) — wait for the actual
    // incoming title rather than a hint count, which happened to differ
    // here (2 outgoing vs. 1 incoming) but isn't a reliable general signal.
    await waitFor(() =>
      expect(
        getGridWithin(container).getAllByText(
          "Ayyappa & Nayana — Wedding Invitation",
        ).length,
      ).toBeGreaterThan(0),
    );
    const grid = getGridWithin(container);
    const hint = grid.getByText(/hover to see details/i);
    await user.click(hint);

    expect(grid.queryByTitle("GitHub")).not.toBeInTheDocument();
    expect(grid.getByTitle("Live Demo")).toBeInTheDocument();
    expect(grid.getByText(/view live demo/i)).toBeInTheDocument();
  });

  it("featured carousel: next arrow scrolls forward and fires gaEvent; prev arrow appears once scrolled and scrolls backward", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    expect(screen.queryByLabelText("Previous project")).not.toBeInTheDocument();
    const nextArrow = screen.getByLabelText("Next project");

    await user.click(nextArrow);

    expect(getScrollByMock()).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number), behavior: "smooth" }),
    );
    const [firstCallArgs] = getScrollByMock().mock.calls[0];
    expect(firstCallArgs.left).toBeGreaterThan(0);
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "featured_carousel",
      label: "next",
    });

    // Simulate the carousel having scrolled away from the start so the
    // prev arrow becomes visible (its visibility is driven by the
    // scroll container's onScroll handler, not by clicking next itself).
    const scrollContainer = nextArrow.parentElement!.querySelector(
      ".carousel-scroll",
    ) as HTMLElement;
    Object.defineProperty(scrollContainer, "scrollLeft", { value: 50, configurable: true });
    Object.defineProperty(scrollContainer, "scrollWidth", { value: 2000, configurable: true });
    Object.defineProperty(scrollContainer, "clientWidth", { value: 340, configurable: true });
    fireEvent.scroll(scrollContainer);

    const prevArrow = await screen.findByLabelText("Previous project");
    getScrollByMock().mockClear();
    await user.click(prevArrow);

    const [prevCallArgs] = getScrollByMock().mock.calls[0];
    expect(prevCallArgs.left).toBeLessThan(0);
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "featured_carousel",
      label: "prev",
    });
  });

  it("clicking a carousel dot scrolls to that project and fires a labeled gaEvent", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const dots = screen.getAllByLabelText(/go to project/i);
    await user.click(dots[1]);

    expect(getScrollToMock()).toHaveBeenCalled();
    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "featured_carousel",
      label: `dot_${FEATURED_TITLES[1]}`,
    });
  });

  it("renders the GitHub profile CTA with the correct href and fires gaEvent on click", async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const cta = screen.getByRole("link", { name: /view github profile/i });
    expect(cta).toHaveAttribute("href", "https://github.com/ayyappaswamyangadi");

    await user.click(cta);

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "click",
      category: "social",
      label: "github_profile_projects_cta",
    });
  });
});
