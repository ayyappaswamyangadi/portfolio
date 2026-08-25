"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveSession } from "../hooks/useActiveSession";
import ThemeToggleButton from "./ThemeToggleButton";
import { PWAInstallButton } from "./PWAInstallButton";

const sections = ["home", "about", "projects", "contact"];
const sectionLabels: Record<string, string> = {
  projects: "My Work",
};

// `hover:bg-accent/70` was nearly invisible here — `--accent` is a low-
// contrast neutral gray barely different from the glass nav background,
// especially in dark mode. A brand-tinted violet reads clearly in both
// themes and against both the transparent and scrolled/glass nav states.
const inactiveLinkStyles =
  "text-muted-foreground hover:text-foreground hover:bg-primary/10";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeScreen = useActiveSession(sections);

  // The active-tab pill is a single, persistently-mounted element whose
  // position/size we measure and animate explicitly, rather than a
  // conditionally-rendered `motion.span` sharing a `layoutId` across
  // different `<Link>` parents. The latter looked fine when the active
  // section changed via a slow scroll, but a click (which jumps/animates
  // the scroll much faster) could leave Framer Motion's shared-element FLIP
  // transition in a state where the pill rendered at near-zero opacity —
  // Framer's crossfade heuristic for a layoutId moving between differently
  // sized, differently-parented elements isn't reliable enough for this.
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [desktopPill, setDesktopPill] = useState<{ x: number; width: number } | null>(null);
  const [mobilePill, setMobilePill] = useState<{ y: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const container = desktopNavRef.current;
      const el = container?.querySelector<HTMLElement>(`[data-section="${activeScreen}"]`);
      if (el && container) {
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        setDesktopPill({ x: eRect.left - cRect.left, width: eRect.width });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeScreen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      const container = mobileNavRef.current;
      const el = container?.querySelector<HTMLElement>(`[data-section="${activeScreen}"]`);
      if (el && container) {
        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();
        setMobilePill({ y: eRect.top - cRect.top, height: eRect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeScreen, isOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        className={cn(
          "relative w-full max-w-3xl flex justify-between items-center px-4 py-2.5 rounded-2xl transition-all duration-300 pointer-events-auto",
          scrolled || isOpen
            ? "glass shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            : "bg-transparent border border-transparent",
        )}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 group select-none"
          aria-label="Home"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center gap-px shadow-md group-hover:shadow-primary/40 transition-shadow select-none" style={{ background: "var(--btn-gradient)" }}>
            <span className="text-white/60 font-mono font-bold text-[6px] leading-none">&lt;</span>
            <span className="text-white font-bold text-[13px] leading-none tracking-tight">A</span>
            <span className="text-white/60 font-mono font-bold text-[6px] leading-none">/&gt;</span>
          </div>
          <span className="hidden sm:block font-bold text-sm leading-tight">
            Ayyappa
          </span>
        </Link>

        {/* ── Desktop links ── */}
        <div ref={desktopNavRef} className="hidden md:flex items-center gap-0.5 relative">
          {desktopPill && (
            // No negative z-index here: a negative z-index child of an
            // element with `backdrop-filter` (the nav's `.glass` state,
            // active once scrolled) gets swept into that backdrop's own
            // blur/saturate sampling in some browsers, which is what was
            // washing out this pill's color everywhere except Home — Home
            // is normally seen at scroll 0, before `.glass` kicks in, so it
            // never showed the bug. Painting order alone (this renders
            // before the links below, in the same stacking context, with no
            // z-index at all) already keeps it behind the link text.
            <motion.div
              className="absolute top-0 left-0 h-full pointer-events-none"
              style={{ borderRadius: "999px", background: "var(--btn-gradient)" }}
              animate={{ x: desktopPill.x, width: desktopPill.width }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          {sections.map((section) => (
            <Link
              href={`#${section}`}
              key={section}
              data-section={section}
              className={cn(
                "btn-click relative capitalize px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 rounded-full",
                activeScreen === section ? "text-white" : inactiveLinkStyles,
              )}
            >
              {sectionLabels[section] ?? section}
            </Link>
          ))}
        </div>

        {/* ── Right cluster (desktop) ── */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggleButton />
          <PWAInstallButton />
          <a
            href="#contact"
            className="btn-primary btn-click ml-1 px-4 py-1.5 text-sm inline-flex items-center rounded-full"
          >
            Hire me
          </a>
        </div>

        {/* ── Hamburger (mobile) ── */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-foreground btn-click"
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* ── Mobile dropdown ── */}
        <div
          className={cn(
            "absolute top-[calc(100%+0.5rem)] left-0 w-full rounded-2xl glass md:hidden transition-all duration-300 overflow-hidden",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none border-transparent",
          )}
        >
          <div ref={mobileNavRef} className="relative flex flex-col gap-1 p-3">
            {mobilePill && (
              // See the desktop pill above: no negative z-index, since this
              // dropdown also carries `.glass` (backdrop-filter) and a
              // negative-z-index child gets swept into that blur/saturate.
              <motion.div
                className="absolute top-0 left-3 right-3 pointer-events-none"
                style={{ borderRadius: "12px", background: "var(--btn-gradient)" }}
                animate={{ y: mobilePill.y, height: mobilePill.height }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {sections.map((section) => (
              <Link
                href={`#${section}`}
                key={section}
                data-section={section}
                onClick={closeMenu}
                className={cn(
                  "btn-click relative capitalize px-4 py-2.5 rounded-xl font-semibold text-sm text-center transition-colors duration-200",
                  activeScreen === section
                    ? "text-white"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                )}
              >
                {sectionLabels[section] ?? section}
              </Link>
            ))}
            <div className="pt-2 pb-1 border-t border-border mt-1 flex items-center gap-2">
              <ThemeToggleButton />
              <PWAInstallButton />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
