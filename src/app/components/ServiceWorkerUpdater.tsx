"use client";

import { useEffect } from "react";
import { MotionGlobalConfig } from "framer-motion";

// sessionStorage key carrying the reader's place across the swap-to-new-build
// reload. Also read by the inline launch script in layout.tsx, which skips
// the PWA splash for this reload.
export const UPDATE_VIEW_KEY = "sw-update-view";

// How long the user must have stopped touching/scrolling/typing before the
// swap happens — so it never lands mid-gesture.
const IDLE_MS = 1500;

// A saved view older than this is from some unrelated earlier session.
const MAX_VIEW_AGE_MS = 30_000;

type SavedView = {
  // Section the viewport top was in, and how far into it — survives the new
  // build changing the height of the content above.
  section: string | null;
  offset: number;
  y: number;
  carousels: Record<string, number>;
  t: number;
};

function readSavedView(): SavedView | null {
  try {
    const raw = sessionStorage.getItem(UPDATE_VIEW_KEY);
    if (!raw) return null;
    const view = JSON.parse(raw) as SavedView;
    return Date.now() - view.t < MAX_VIEW_AGE_MS ? view : null;
  } catch {
    return null;
  }
}

// Evaluated before hydration: on the swap reload, entrance animations for
// whatever is on screen jump straight to their end state, so the restored
// view appears as it was instead of fading in again.
if (typeof window !== "undefined" && readSavedView()) {
  MotionGlobalConfig.skipAnimations = true;
}

function isTyping() {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
}

function captureView(): SavedView {
  let section: string | null = null;
  let offset = 0;
  for (const el of document.querySelectorAll<HTMLElement>("section[id]")) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= 0 && rect.bottom > 0) {
      section = el.id;
      offset = -rect.top;
      break;
    }
  }
  const carousels: Record<string, number> = {};
  for (const el of document.querySelectorAll<HTMLElement>("[data-scroll-key]")) {
    carousels[el.dataset.scrollKey!] = el.scrollLeft;
  }
  return { section, offset, y: window.scrollY, carousels, t: Date.now() };
}

function applyView(view: SavedView) {
  let top = view.y;
  const anchor = view.section && document.getElementById(view.section);
  if (anchor) {
    top = anchor.getBoundingClientRect().top + window.scrollY + view.offset;
  }
  window.scrollTo({ top, left: 0, behavior: "instant" });
  for (const el of document.querySelectorAll<HTMLElement>("[data-scroll-key]")) {
    const left = view.carousels[el.dataset.scrollKey!];
    if (left !== undefined) el.scrollTo({ left, behavior: "instant" });
  }
}

// The installed app opens instantly from the service worker's precached copy
// (see next.config.ts), while the browser checks for a newer build in the
// background. When a new deploy exists, the new worker installs, takes over
// (skipWaiting + clientsClaim) and fires `controllerchange`. Swapping the
// running JS for the new build needs a reload, so it's made invisible: it
// waits for a moment the user isn't mid-gesture, saves exactly where they
// are, and the new build restores that view with no splash and no replayed
// entrance animations.
export function ServiceWorkerUpdater() {
  useEffect(() => {
    const saved = readSavedView();
    if (saved) {
      try {
        sessionStorage.removeItem(UPDATE_VIEW_KEY);
      } catch {}
      applyView(saved);
      // Late layout (fonts, images, the lazy 3D scene) can shift content
      // after first paint — re-pin a couple of times, then hand control back.
      requestAnimationFrame(() => applyView(saved));
      const repin = setTimeout(() => applyView(saved), 250);
      const release = setTimeout(() => {
        MotionGlobalConfig.skipAnimations = false;
        history.scrollRestoration = "auto";
      }, 800);
      return () => {
        clearTimeout(repin);
        clearTimeout(release);
        MotionGlobalConfig.skipAnimations = false;
      };
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker;

    // The very first install also fires `controllerchange` (clientsClaim),
    // but the page was just loaded from the network and is already current —
    // only a worker *replacing* an existing one means a new build.
    let hasController = !!sw.controller;
    let updateReady = false;
    let swapping = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let lastInteraction = 0;

    const markInteraction = () => {
      lastInteraction = Date.now();
    };

    const isBusy = () =>
      isTyping() ||
      Date.now() - lastInteraction < IDLE_MS ||
      // Reading the back of a flipped project card.
      !!document.querySelector('[data-flipped="true"]');

    const swap = () => {
      if (swapping) return;
      swapping = true;
      try {
        sessionStorage.setItem(UPDATE_VIEW_KEY, JSON.stringify(captureView()));
      } catch {}
      history.scrollRestoration = "manual";
      window.location.reload();
    };

    const trySwap = () => {
      clearTimeout(retry);
      if (!updateReady || swapping) return;
      // Backgrounded: nothing is on screen to disturb.
      if (document.visibilityState === "hidden" || !isBusy()) {
        swap();
        return;
      }
      retry = setTimeout(trySwap, IDLE_MS);
    };

    const onControllerChange = () => {
      if (!hasController) {
        hasController = true;
        return;
      }
      updateReady = true;
      trySwap();
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
        trySwap();
        return;
      }
      checkForUpdate();
    };

    const interactionEvents = [
      "pointerdown",
      "touchstart",
      "touchmove",
      "wheel",
      "scroll",
      "keydown",
    ] as const;
    for (const type of interactionEvents) {
      window.addEventListener(type, markInteraction, {
        capture: true,
        passive: true,
      });
    }
    sw.addEventListener("controllerchange", onControllerChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    checkForUpdate();
    return () => {
      clearTimeout(retry);
      for (const type of interactionEvents) {
        window.removeEventListener(type, markInteraction, { capture: true });
      }
      sw.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
