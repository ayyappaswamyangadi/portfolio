import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadCvButton } from "./DownloadCvButton";

const gaEventMock = vi.fn();
vi.mock("@/lib/gtag", () => ({
  gaEvent: (...args: unknown[]) => gaEventMock(...args),
}));

describe("DownloadCvButton", () => {
  beforeEach(() => {
    gaEventMock.mockClear();
  });

  it("renders a download link to the resume PDF with the given className", () => {
    render(<DownloadCvButton gaLabel="test_label" className="my-class" />);

    const link = screen.getByRole("link", { name: /download cv/i });
    expect(link).toHaveAttribute("href", "/resume/Ayyappa_Swamy_Angadi_Resume.pdf");
    expect(link).toHaveAttribute("download");
    expect(link).toHaveClass("my-class");
    expect(link).toHaveAttribute("aria-busy", "false");
  });

  it("fires gaEvent with the exact gaLabel prop on click", async () => {
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="hero_download_cv" className="" />);

    await user.click(screen.getByRole("link", { name: /download cv/i }));

    expect(gaEventMock).toHaveBeenCalledWith({
      action: "download_cv",
      category: "engagement",
      label: "hero_download_cv",
    });
  });

  it("shows a temporary 'Downloading…' loading state after click, then reverts", async () => {
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="footer_download_cv" className="" />);

    const link = screen.getByRole("link", { name: /download cv/i });
    await user.click(link);

    expect(screen.getByText(/downloading…/i)).toBeInTheDocument();
    expect(link).toHaveAttribute("aria-busy", "true");

    await waitFor(
      () => {
        expect(screen.getByRole("link", { name: /download cv/i })).toHaveAttribute(
          "aria-busy",
          "false",
        );
      },
      { timeout: 2000 },
    );
    expect(screen.queryByText(/downloading…/i)).not.toBeInTheDocument();
  });

  it("still fires gaEvent on every click, including while already in the downloading state", async () => {
    const user = userEvent.setup();
    render(<DownloadCvButton gaLabel="repeat_click" className="" />);

    const link = screen.getByRole("link", { name: /download cv/i });
    await user.click(link);
    await user.click(link);

    expect(gaEventMock).toHaveBeenCalledTimes(2);
    expect(gaEventMock).toHaveBeenNthCalledWith(1, {
      action: "download_cv",
      category: "engagement",
      label: "repeat_click",
    });
    expect(gaEventMock).toHaveBeenNthCalledWith(2, {
      action: "download_cv",
      category: "engagement",
      label: "repeat_click",
    });

    await waitFor(
      () => expect(link).toHaveAttribute("aria-busy", "false"),
      { timeout: 2000 },
    );
  });
});
