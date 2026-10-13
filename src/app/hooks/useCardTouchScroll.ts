"use client";

import { useEffect, type RefObject } from "react";

// Per-16ms velocity multiplier for flick momentum, and the speed (px/ms)
// below which it stops — tuned to feel close to iOS's native fling.
const FRICTION = 0.95;
const MIN_VELOCITY = 0.02;

// Touch scrolling for a fixed-size card whose content can overflow, without
// the two iOS problems a nested native scroller has:
//
// 1. Latching — iOS locks a swipe (and its momentum) to the inner scroller it
//    started in, so after the content hits its end the page won't scroll
//    until everything has settled; the user has to stop and wait.
// 2. Shaking — handing the rest of a swipe to the page from JS (scrolling the
//    window mid-touch) makes iOS report touch positions that lag the
//    programmatic scroll, so the page jitters back and forth.
//
// So the element is never a native scroller on touch (`overflow-y: hidden`;
// scrollTop is still settable from JS) and JS never scrolls the page. Each
// swipe is routed once, on its first move:
// - the content can still move that way → this hook scrolls it (momentum
//   included) and cancels the browser's handling for the whole swipe;
// - it's already at that end → the swipe is left untouched, so the browser
//   scrolls the page natively, immediately.
// Horizontal swipes are always left to the browser (the carousel).
export function useCardTouchScroll(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const { overflowY } = el.style;
    el.style.overflowY = "hidden";

    let startX = 0;
    let startY = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;
    let mode: "pending" | "card" | "native" = "native";
    let frame = 0;

    const maxScroll = () => el.scrollHeight - el.clientHeight;

    // Positive `dy` scrolls the content down. Returns false once pinned.
    const scrollCard = (dy: number) => {
      const max = maxScroll();
      const next = Math.min(max, Math.max(0, el.scrollTop + dy));
      el.scrollTop = next;
      return dy > 0 ? next < max : next > 0;
    };

    const stopMomentum = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      stopMomentum();
      const t = e.touches[0];
      startX = t.clientX;
      startY = lastY = t.clientY;
      lastTime = e.timeStamp;
      velocity = 0;
      mode = e.touches.length === 1 ? "pending" : "native";
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];

      if (mode === "pending") {
        const dx = t.clientX - startX;
        const dy = startY - t.clientY; // > 0 = finger up = content scrolls down
        if (dx === 0 && dy === 0) return;
        const canMove =
          Math.abs(dy) >= Math.abs(dx) &&
          (dy > 0 ? el.scrollTop < maxScroll() - 0.5 : el.scrollTop > 0.5);
        // Decided on the very first move: iOS only lets a swipe be cancelled
        // if its first touchmove is, so waiting would hand it to the browser.
        mode = canMove ? "card" : "native";
      }
      if (mode !== "card") return;

      if (e.cancelable) e.preventDefault();
      const step = lastY - t.clientY;
      const dt = Math.max(1, e.timeStamp - lastTime);
      // Smoothed so one jittery touch sample doesn't decide the fling speed.
      velocity = 0.8 * (step / dt) + 0.2 * velocity;
      lastY = t.clientY;
      lastTime = e.timeStamp;
      scrollCard(step);
    };

    const onTouchEnd = (e: TouchEvent) => {
      // A finger that paused before lifting shouldn't fling.
      if (mode !== "card" || e.timeStamp - lastTime > 100) return;
      let prev = performance.now();
      const tick = (now: number) => {
        const dt = now - prev;
        prev = now;
        const moving = scrollCard(velocity * dt);
        velocity *= Math.pow(FRICTION, dt / 16);
        frame =
          moving && Math.abs(velocity) > MIN_VELOCITY
            ? requestAnimationFrame(tick)
            : 0;
      };
      frame = requestAnimationFrame(tick);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    // Not passive: it has to be able to cancel swipes it handles itself.
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", stopMomentum, { passive: true });
    return () => {
      stopMomentum();
      el.style.overflowY = overflowY;
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", stopMomentum);
    };
  }, [ref, enabled]);
}
