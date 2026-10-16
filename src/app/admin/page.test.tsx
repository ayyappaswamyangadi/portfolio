import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const isAdminMock = vi.fn();
vi.mock("@/lib/adminAuth", () => ({ isAdmin: () => isAdminMock() }));

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({ redirect: (url: string) => redirectMock(url) }));

const getDashboardDataMock = vi.fn();
vi.mock("@/lib/gaData", async (orig) => ({
  ...(await orig<typeof import("@/lib/gaData")>()),
  getDashboardData: (...args: unknown[]) => getDashboardDataMock(...args),
}));

import AdminPage from "./page";
import { GaSetupError } from "@/lib/gaData";

const params = (range?: string) => ({ searchParams: Promise.resolve({ range }) });

describe("/admin", () => {
  beforeEach(() => {
    isAdminMock.mockReset();
    getDashboardDataMock.mockReset();
  });

  it("sends anyone not logged in to the login page without touching GA", async () => {
    isAdminMock.mockResolvedValue(false);
    await expect(AdminPage(params())).rejects.toThrow("REDIRECT:/admin/login");
    expect(getDashboardDataMock).not.toHaveBeenCalled();
  });

  it("shows the setup guide when GA isn't connected yet", async () => {
    isAdminMock.mockResolvedValue(true);
    getDashboardDataMock.mockRejectedValue(new GaSetupError("not-configured"));
    render(await AdminPage(params("7d")));
    expect(screen.getByText("Connect Google Analytics")).toBeInTheDocument();
    expect(getDashboardDataMock).toHaveBeenCalledWith("7d", expect.arrayContaining(["download_cv"]));
  });

  it("shows GA errors in plain words", async () => {
    isAdminMock.mockResolvedValue(true);
    getDashboardDataMock.mockRejectedValue(new GaSetupError("Add the service account as a Viewer."));
    render(await AdminPage(params()));
    expect(screen.getByText("Add the service account as a Viewer.")).toBeInTheDocument();
  });
});
