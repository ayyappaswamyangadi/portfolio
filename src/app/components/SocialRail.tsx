"use client";

import { gaEvent } from "@/lib/gtag";
import { socials } from "./Footer";

// Fixed social links down the left edge on wide screens — the side-rail
// pattern from well-known developer portfolios. Only from xl up, where the
// page margin is wide enough that it never overlaps content.
export function SocialRail() {
  return (
    <aside
      aria-label="Social links"
      className="fixed bottom-0 left-6 z-40 hidden flex-col items-center gap-4 xl:flex"
    >
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target={s.href.startsWith("http") ? "_blank" : undefined}
          rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={s.label}
          title={s.label}
          onClick={() =>
            gaEvent({ action: "click", category: "social", label: `${s.label.toLowerCase()}_rail` })
          }
          className={`${s.cls} flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-primary`}
        >
          {s.icon}
        </a>
      ))}
      <span className="mt-1 h-24 w-px bg-border" aria-hidden="true" />
    </aside>
  );
}
