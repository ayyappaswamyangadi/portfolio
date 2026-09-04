import { test, expect } from "@playwright/test";

test.describe("Offline/online network status banner", () => {
  test("shows an offline banner when the browser goes offline, and a reconnect banner when it comes back", async ({
    page,
  }) => {
    await page.goto("/");
    // Wait for hydration to actually finish (ThemeToggleButton gates its
    // render behind a mount effect, so its presence is a reliable signal)
    // before dispatching synthetic events — dispatching too early races
    // NetworkStatus's effect attaching its online/offline listeners.
    await expect(page.getByRole("button", { name: "Toggle theme" }).first()).toBeVisible();

    // Deliberately NOT using context.setOffline() here: against the Next.js
    // dev server, real browser-level offline emulation also cuts the
    // dev-server's HMR/RSC socket, which trips the app's real error
    // boundary (a dev-only artifact, not something that happens in
    // production) — confirmed by seeing the app's actual error.tsx render
    // when this test used context.setOffline(true) on WebKit. Driving the
    // component through its `online`/`offline` window events directly
    // exercises the same logic without that side effect.
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    await expect(page.getByText("You're offline")).toBeVisible();
    await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();

    await page.evaluate(() => window.dispatchEvent(new Event("online")));

    await expect(page.getByText("Back online")).toBeVisible();
    await expect(page.getByText("You're offline")).toBeHidden();
  });
});
