"use client";

import { useState, useEffect } from "react";
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeScreen = useActiveSession(sections);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const hasBg = scrolled || isOpen;

  return (
    <nav
      className={cn(
        "w-full flex justify-between items-center px-5 py-3 sticky top-0 z-50 transition-all duration-300",
        hasBg
          ? "border-b border-white/30 dark:border-white/10 bg-white/60 dark:bg-[#1D2838]/70 backdrop-blur-2xl shadow-sm dark:shadow-none"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/* ── Logo ── */}
      <Link
        href="/"
        onClick={closeMenu}
        className="flex items-center gap-2 group select-none"
        aria-label="Home"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center gap-px shadow-md group-hover:shadow-primary/40 transition-shadow select-none">
          <span className="text-white/60 font-mono font-bold text-[7px] leading-none">&lt;</span>
          <span className="text-white font-bold text-[14px] leading-none tracking-tight">A</span>
          <span className="text-white/60 font-mono font-bold text-[7px] leading-none">/&gt;</span>
        </div>
        <span className="hidden sm:block font-bold text-sm leading-tight">
          Ayyappa<br />
          <span className="text-muted-foreground font-normal text-xs">Frontend Engineer</span>
        </span>
      </Link>

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
          "absolute top-full left-0 w-full border-b border-white/30 dark:border-white/10 md:hidden transition-all duration-300 overflow-hidden",
          "bg-white/60 dark:bg-[#1D2838]/70 backdrop-blur-2xl",
          isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex flex-col gap-1 p-4">
          {sections.map((section) => (
            <Link
              href={`#${section}`}
              key={section}
              onClick={closeMenu}
              className={cn(
                "relative capitalize px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200",
                activeScreen === section
                  ? "text-[#1a1000]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {activeScreen === section && (
                <motion.span
                  layoutId="nav-pill-mobile"
                  className="absolute inset-0 -z-10"
                  style={{
                    borderRadius: "5px",
                    border: "2px solid #EAA22F",
                    background:
                      "linear-gradient(180deg, #FFC25F 0%, #FF9E00 53.12%, #F99900 100%)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {sectionLabels[section] ?? section}
            </Link>
          ))}
          <div className="pt-2 pb-1 border-t border-border mt-1 flex items-center gap-2">
            <ThemeToggleButton />
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* ── Desktop links ── */}
      <div className="hidden md:flex items-center gap-1">
        {sections.map((section) => (
          <Link
            href={`#${section}`}
            key={section}
            className={cn(
              "relative capitalize px-4 py-1.5 text-sm font-semibold transition-colors duration-200",
              activeScreen === section
                ? "text-[#1a1000]"
                : "text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg",
            )}
          >
            {activeScreen === section && (
              <motion.span
                layoutId="nav-pill-desktop"
                className="absolute inset-0 -z-10"
                style={{
                  borderRadius: "5px",
                  border: "2px solid #EAA22F",
                  background:
                    "linear-gradient(180deg, #FFC25F 0%, #FF9E00 53.12%, #F99900 100%)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {sectionLabels[section] ?? section}
          </Link>
        ))}

        <div className="w-px h-5 bg-border mx-2" />

        <ThemeToggleButton />

        <PWAInstallButton />

        <a
          href="#contact"
          className="btn-orange btn-click ml-2 px-4 py-1.5 text-sm inline-flex items-center"
        >
          Hire me
        </a>
      </div>
    </nav>
  );
}
