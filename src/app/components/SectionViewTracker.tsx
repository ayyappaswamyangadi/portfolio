"use client";

import { useEffect } from "react";
import { gaEvent } from "@/lib/gtag";

// "home" is skipped — it's already implied by the initial pageview, so
// tracking it here would just double-count every single visit.
const TRACKED_SECTIONS = ["about", "projects", "contact"];

// Fires once per section per page load, the first time it's scrolled into
// view — gives a simple "how far down the page did they get" funnel without
// needing a full scroll-depth-percentage implementation.
export function SectionViewTracker() {
  useEffect(() => {
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target.id)) return;
          seen.add(entry.target.id);
          gaEvent({ action: "view_section", category: "engagement", label: entry.target.id });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );

    TRACKED_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
