import { defineConfig, devices } from "@playwright/test";

// Port 3210 is a scratch port deliberately different from 3000, which this
// repo often has a live `next start` process on outside of test runs — see
// project memory notes on not colliding with that server.
const PORT = 3210;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Capped rather than left at Playwright's auto-detected default: several
  // tests assert on real IntersectionObserver/scroll timing (e.g. the
  // active-nav-pill test), which is sensitive to main-thread contention —
  // running too many Chromium instances in parallel against one dev server
  // starves those callbacks and produces flaky failures that pass in
  // isolation. 2 workers is a reliability/speed tradeoff, not a hard limit.
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  timeout: 30_000,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    // Dev server (not a production build) — fast to start/iterate, and the
    // PWA plugin is already disabled in development (see next.config.ts),
    // which avoids service-worker interference with test runs.
    command: `npx next dev --turbopack -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
