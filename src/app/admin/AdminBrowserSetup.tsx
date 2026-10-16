"use client";

import { useEffect } from "react";

export const GA_OPT_OUT_KEY = "ga_optout";

// Runs on every admin page view:
// - marks this browser so GoogleAnalytics skips tracking — your own visits
//   to the site shouldn't inflate the numbers you're reading here;
// - purges any copy of /admin the PWA's page cache may have picked up, so
//   private stats never sit in Cache Storage for offline viewing.
export function AdminBrowserSetup() {
  useEffect(() => {
    try {
      localStorage.setItem(GA_OPT_OUT_KEY, "1");
    } catch {}
    if (typeof caches === "undefined") return;
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map(async (name) => {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            await Promise.all(
              keys.filter((req) => new URL(req.url).pathname.startsWith("/admin")).map((req) => cache.delete(req)),
            );
          }),
        ),
      )
      .catch(() => {});
  }, []);
  return null;
}
