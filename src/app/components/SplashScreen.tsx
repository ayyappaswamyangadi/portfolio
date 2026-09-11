"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Mirrors useIOSInstall's detection — kept standalone here rather than
// shared so this component has zero dependencies and can mount as the very
// first thing in <body>, before ThemeProvider or any other client context.
function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// How long the brand mark stays fully visible before fading, and how long
// the fade itself takes — must match the `.splash-screen` transition in
// globals.css.
const MIN_VISIBLE_MS = 1100;
const FADE_MS = 450;

// Shown only for standalone (home-screen-installed) launches, mimicking the
// branded launch screen native apps show before their real UI appears. The
// blocking inline script in layout.tsx adds the `pwa-splash` class to <html>
// synchronously before first paint so this never flashes on regular browser
// tab visits — by the time this component mounts, the overlay is either
// already visible (standalone) or was never shown (browser tab).
export function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (!isStandaloneDisplay()) {
      document.documentElement.classList.remove("pwa-splash");
      setMounted(false);
      return;
    }

    const hideTimer = setTimeout(() => setHidden(true), MIN_VISIBLE_MS);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (!hidden) return;
    document.documentElement.classList.remove("pwa-splash");
    const unmountTimer = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(unmountTimer);
  }, [hidden]);

  if (!mounted) return null;

  return (
    <div
      className={`splash-screen${hidden ? " splash-hidden" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <Image
        src="/icon-192.png"
        width={96}
        height={96}
        alt=""
        priority
        className="splash-screen-logo"
      />
      <p className="splash-screen-name">Ayyappa</p>
      <p className="splash-screen-role">Frontend Engineer</p>
    </div>
  );
}
