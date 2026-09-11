import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadCvButton } from "./DownloadCvButton";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

function pdfResponse(bytes = 2000) {
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { "Content-Type": "application/pdf" },
  });
}

// jsdom doesn't implement these at all, so they're assigned once here
// (rather than stubbed/deleted per-test) — React Testing Library's own
// automatic post-test unmount runs the component's cleanup effect, which
// calls URL.revokeObjectURL, and that unmount can fire after a per-test
// afterEach would have already torn the polyfill down.
URL.createObjectURL = vi.fn(() => "blob:mock-url");
URL.revokeObjectURL = vi.fn();

describe("DownloadCvButton", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(URL.createObjectURL).mockClear();
    vi.mocked(URL.revokeObjectURL).mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a button with the given className", () => {
    render(<DownloadCvButton gaLabel="test_label" className="my-class" />);

    const button = screen.getByRole("button", { name: /download cv/i });
    expect(button).toHaveClass("my-class");
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("fires gaEvent with the exact gaLabel prop on click", async () => {
    vi.mocked(fetch).mockResolvedValue(pdfResponse());
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="hero_download_cv" className="" />);

    await user.click(screen.getByRole("button", { name: /download cv/i }));

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "download_cv",
      category: "engagement",
      label: "hero_download_cv",
    });
  });

  it("shows a 'Downloading…' state during the fetch, then reverts on success", async () => {
    let resolveFetch: (res: Response) => void;
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="footer_download_cv" className="" />);

    const button = screen.getByRole("button", { name: /download cv/i });
    await user.click(button);

    expect(screen.getByText(/downloading…/i)).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-busy", "true");

    resolveFetch!(pdfResponse());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /download cv/i })).toHaveAttribute(
        "aria-busy",
        "false",
      );
    });
    expect(screen.queryByText(/downloading…/i)).not.toBeInTheDocument();
  });

  it("triggers a blob download via a temporary link on success", async () => {
    vi.mocked(fetch).mockResolvedValue(pdfResponse());
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="test" className="" />);
    await user.click(screen.getByRole("button", { name: /download cv/i }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    expect(URL.createObjectURL).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("shows a 'Download failed — retry' state when the server responds with an error status, and never calls createObjectURL", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="test" className="" />);

    await user.click(screen.getByRole("button", { name: /download cv/i }));

    expect(await screen.findByText(/download failed/i)).toBeInTheDocument();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("shows the error state when the server responds 200 with an empty body", async () => {
    vi.mocked(fetch).mockResolvedValue(pdfResponse(0));
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="test" className="" />);

    await user.click(screen.getByRole("button", { name: /download cv/i }));

    expect(await screen.findByText(/download failed/i)).toBeInTheDocument();
  });

  it("reverts from the error state back to idle after a delay", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="test" className="" />);

    await user.click(screen.getByRole("button", { name: /download cv/i }));
    expect(await screen.findByText(/download failed/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText(/^download cv$/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  }, 7000);

  it("still fires gaEvent on every click, including while already downloading", async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="repeat_click" className="" />);

    const button = screen.getByRole("button", { name: /download cv/i });
    await user.click(button);
    await user.click(button);

    expect(gaEventMock).toHaveBeenCalledTimes(2);
    // The second click's gaEvent still fires, but the guard inside
    // handleClick means only one fetch actually goes out.
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
