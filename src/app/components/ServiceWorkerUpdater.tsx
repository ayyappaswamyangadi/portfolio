"use client";

import { useEffect } from "react";

function isTyping() {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}

// The installed app opens instantly from the service worker's precached copy
// (see next.config.ts), while the browser checks for a newer build in the
// background. When a new deploy exists, the new worker installs, takes over
// (skipWaiting + clientsClaim) and fires `controllerchange` — this swaps the
// page to the new build right then, instead of leaving the old build on
// screen until the next launch.
export function ServiceWorkerUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker;

    // The very first install also fires `controllerchange` (clientsClaim),
    // but the page was just loaded from the network and is already current —
    // only a worker *replacing* an existing one means a new build.
    const hadController = !!sw.controller;
    let reloading = false;
    let pendingReload = false;

    const reload = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    const onControllerChange = () => {
      if (!hadController) return;
      // Don't wipe out a half-typed contact form — finish the swap the next
      // time the app is backgrounded instead.
      if (isTyping()) {
        pendingReload = true;
        return;
      }
      reload();
    };

    // Check for a new build explicitly rather than relying on the browser's
    // own navigation-time check, which can be deferred (verified in Chromium:
    // a launch served from the precache didn't pick up a new deploy until an
    // explicit update()). The request is just sw.js, revalidated by ETag.
    const checkForUpdate = () => {
      sw.getRegistration()
        .then((registration) => registration?.update())
        .catch(() => {});
    };

    // iOS usually resumes a backgrounded PWA rather than relaunching it, and
    // a resume doesn't navigate at all — so also check every time the app
    // comes back to the foreground.
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (pendingReload) reload();
        return;
      }
      checkForUpdate();
    };

    sw.addEventListener("controllerchange", onControllerChange);
    checkForUpdate();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      sw.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
