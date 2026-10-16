import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DashboardData } from "@/lib/gaData";
import { Dashboard, RangeTabs, SetupGuide } from "./Dashboard";
import { countryFlag, describeSource, formatDuration } from "./eventLabels";

const data: DashboardData = {
  totals: { visitors: 284, newVisitors: 250, pageViews: 308, avgEngagementSec: 83, countries: 12 },
  daily: [
    { date: "2026-10-14", visitors: 284, pageViews: 308 },
    { date: "2026-10-15", visitors: 20, pageViews: 25 },
  ],
  events: {
    lets_connect_click: { count: 9, people: 6 },
    download_cv: { count: 14, people: 11 },
    message_sent: { count: 1, people: 1 },
  },
  countries: [{ name: "India", code: "IN", visitors: 200 }],
  sources: [{ source: "(direct)", channel: "Direct", visitors: 150 }],
  devices: [
    { device: "mobile", visitors: 210 },
    { device: "desktop", visitors: 74 },
  ],
  projects: [{ project: "Grass: Code Agent Computer", clicks: 5 }],
  activeNow: 2,
};

describe("Dashboard", () => {
  it("shows the headline numbers in plain words", () => {
    render(<Dashboard data={data} range="28d" />);
    expect(screen.getByText("Visitors").parentElement).toHaveTextContent("284");
    expect(screen.getByText("Page views").parentElement).toHaveTextContent("308");
    expect(screen.getByText("Countries").parentElement).toHaveTextContent("12");
    expect(screen.getByText("Time spent").parentElement).toHaveTextContent("1m 23s");
  });

  it("lists every tracked button with its count, including ones nobody clicked", () => {
    render(<Dashboard data={data} range="28d" />);
    const cv = screen.getByText("Download CV").closest("li")!;
    expect(cv).toHaveTextContent("14");
    expect(cv).toHaveTextContent("by 11 people");
    expect(screen.getByText("LinkedIn icon").closest("li")).toHaveTextContent("0");
    expect(screen.getByText("Call me box")).toBeInTheDocument();
    expect(screen.getByText("Message sent").closest("li")).toHaveTextContent("by 1 person");
  });

  it("shows countries, sources, devices and projects", () => {
    render(<Dashboard data={data} range="28d" />);
    expect(screen.getByText("India")).toBeInTheDocument();
    expect(screen.getByText("Direct visit")).toBeInTheDocument();
    expect(screen.getByText("Phone").closest("li")).toHaveTextContent("74% of visitors");
    expect(screen.getByText("Grass: Code Agent Computer")).toBeInTheDocument();
  });

  it("hides the per-day chart for today", () => {
    const { rerender } = render(<Dashboard data={data} range="7d" />);
    expect(screen.getByText("Visitors per day")).toBeInTheDocument();
    rerender(<Dashboard data={data} range="today" />);
    expect(screen.queryByText("Visitors per day")).not.toBeInTheDocument();
  });
});

describe("RangeTabs", () => {
  it("uses plain links and marks the current range", () => {
    render(<RangeTabs range="7d" />);
    const nav = screen.getByRole("navigation", { name: "Date range" });
    expect(within(nav).getByRole("link", { name: "Last 7 days" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Last 90 days" })).toHaveAttribute("href", "/admin?range=90d");
  });
});

describe("SetupGuide", () => {
  it("shows the problem when there is one", () => {
    render(<SetupGuide problem="Something specific broke" />);
    expect(screen.getByText("Something specific broke")).toBeInTheDocument();
    expect(screen.getByText("GA_SERVICE_ACCOUNT_JSON")).toBeInTheDocument();
  });
});

describe("label helpers", () => {
  it("formats durations, flags and sources", () => {
    expect(formatDuration(42)).toBe("42s");
    expect(formatDuration(125)).toBe("2m 5s");
    expect(countryFlag("IN")).toBe("🇮🇳");
    expect(countryFlag("(not set)")).toBe("🌐");
    expect(describeSource("lm.linkedin.com", "Referral")).toEqual({
      name: "linkedin.com",
      how: "A link on another website",
    });
  });
});
