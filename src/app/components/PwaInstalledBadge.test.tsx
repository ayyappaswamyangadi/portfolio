import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PwaInstalledBadge } from "./PwaInstalledBadge";
import type { PwaPlatform } from "@/lib/pwaPlatform";

const usePwaInstallStatusMock = vi.fn<() => { isStandalone: boolean; platform: PwaPlatform }>(() => ({
  isStandalone: false,
  platform: "other",
}));
vi.mock("../hooks/usePwaInstallStatus", () => ({
  usePwaInstallStatus: () => usePwaInstallStatusMock(),
}));

describe("PwaInstalledBadge", () => {
  afterEach(() => {
    usePwaInstallStatusMock.mockReset();
    usePwaInstallStatusMock.mockReturnValue({ isStandalone: false, platform: "other" });
  });

  it("renders nothing when not running standalone", () => {
    const { container } = render(<PwaInstalledBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows an Installed badge with the detected platform when standalone", () => {
    usePwaInstallStatusMock.mockReturnValue({ isStandalone: true, platform: "android" });
    render(<PwaInstalledBadge />);
    expect(screen.getByText("Installed")).toBeInTheDocument();
    expect(screen.getByTitle("Installed on Android")).toBeInTheDocument();
  });
});
