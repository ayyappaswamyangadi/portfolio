"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Star,
} from "lucide-react";
import { SiAppstore, SiProducthunt } from "react-icons/si";
import { gaEvent } from "@/lib/gtag";
import { useCardTouchScroll } from "@/app/hooks/useCardTouchScroll";
import {
  projects,
  primaryLink,
  type Project,
  type ProjectKind,
} from "@/lib/projects";
import { DotSeparated } from "./DotSeparated";

const featuredProjects = projects.filter((p) => p.featured);
const otherProjects = projects.filter((p) => !p.featured);

// Must match the carousel's `!gap-5` — used to work out how far one card
// step scrolls.
const CAROUSEL_GAP_PX = 20;

// ─── Motion variants ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── GitHub SVG ───────────────────────────────────────────────────────────────
function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Secondary link (icon button) ────────────────────────────────────────────
function IconLink({
  href,
  label,
  gaLabel,
  children,
}: {
  href: string;
  label: string;
  gaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        gaEvent({ action: "click", category: "project_link", label: gaLabel });
      }}
      className="btn-click inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground"
    >
      {children}
    </a>
  );
}

const kindStyles: Record<ProjectKind, string> = {
  Professional: "border-emerald-400/40 text-emerald-300",
  "Client Work": "border-sky-400/40 text-sky-300",
  Personal: "border-white/25 text-white/90",
};

// ─── Flip project card ────────────────────────────────────────────────────────
// Front: the product screenshot plus a short summary and a "see details" hint.
// Back: the full story — problem, what I built, tech and links. Hover flips it
// on desktop, tap on touch devices, and keyboard focus flips it too.
function ProjectCard({ project }: { project: Project }) {
  const [flipped, setFlipped] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const cta = primaryLink(project);
  const fit = project.imageFit ?? "cover";

  // Binding onMouseEnter/onMouseLeave on a touch device makes iOS/Android
  // treat the first tap as a hover (not a click), so a second tap would be
  // needed to flip — only attach mouse handlers when the device can hover.
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  // Touch: the back face scrolls its own content until it's at the end; the
  // next swipe past that end goes straight to the page (see hook).
  const backRef = useRef<HTMLDivElement>(null);
  useCardTouchScroll(backRef, !canHover);

  // A tap focuses the card as well as clicking it. Flipping on that focus
  // would let the click toggle it straight back, so pointer-driven focus is
  // ignored and only keyboard focus flips the card.
  const pointerFocus = useRef(false);
  const openedByFocus = useRef(false);

  // Touch taps flip on touchend rather than on click. A tap that lands while
  // the carousel is still settling after a swipe (scroll-snap / momentum)
  // only stops the scroll — mobile browsers never fire `click` for it — so
  // flipping on click needed a second tap. touchend still fires for that tap.
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastTouchFlip = useRef(0);

  const toggle = () => {
    setFlipped((f) => {
      if (!f) {
        gaEvent({ action: "expand", category: "project_card", label: project.title });
      }
      return !f;
    });
  };

  const handleTap = () => {
    pointerFocus.current = false;
    if (canHover) return;
    // Already handled on touchend — this is the click the browser synthesises
    // from that same tap (if it wasn't cancelled).
    if (Date.now() - lastTouchFlip.current < 800) return;
    toggle();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current =
      e.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: e.timeStamp } : null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const moved = Math.hypot(t.clientX - start.x, t.clientY - start.y);
    if (moved > 10 || e.timeStamp - start.t > 600) return; // a swipe or a long press
    // Links and buttons on the back face keep their normal tap behaviour.
    if ((e.target as Element).closest("a, button")) return;
    // Cancels the synthetic focus and click, so the tap is handled exactly once.
    if (e.cancelable) e.preventDefault();
    pointerFocus.current = false;
    lastTouchFlip.current = Date.now();
    toggle();
  };

  return (
    <div
      className="group h-[520px] sm:h-[560px]"
      onMouseEnter={canHover ? () => setFlipped(true) : undefined}
      onMouseLeave={canHover ? () => setFlipped(false) : undefined}
      onTouchStart={canHover ? undefined : onTouchStart}
      onTouchEnd={canHover ? undefined : onTouchEnd}
      onClick={handleTap}
      onPointerDown={() => {
        pointerFocus.current = true;
      }}
      onFocus={() => {
        if (pointerFocus.current) {
          pointerFocus.current = false;
          return;
        }
        openedByFocus.current = true;
        setFlipped(true);
      }}
      onBlur={(e) => {
        if (
          openedByFocus.current &&
          !e.currentTarget.contains(e.relatedTarget as Node | null)
        ) {
          openedByFocus.current = false;
          setFlipped(false);
        }
      }}
    >
      {/* `perspective` sits on a plain, un-animated div: a 3D context on the
          element Framer Motion is transform-animating renders as a blank box
          on some Chromium GPU paths. */}
      <div className="relative h-full w-full" style={{ perspective: "1400px" }}>
        <motion.div
          className="relative h-full w-full"
          data-flipped={flipped}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* ── Front: screenshot + summary ── */}
          <article
            tabIndex={0}
            aria-label={`${project.title} — show details`}
            className="project-card flex flex-col focus-visible:outline-2 focus-visible:outline-primary"
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              pointerEvents: flipped ? "none" : "auto",
            }}
          >
            <div
              className="relative min-h-0 flex-1 overflow-hidden border-b border-border"
              style={project.imageBg ? { background: project.imageBg } : undefined}
            >
              {/* Full opacity from the start — no fade-in tied to onLoad. An
                  image that loaded before hydration never fires onLoad, which
                  used to leave it invisible. */}
              <Image
                src={project.image}
                alt={`${project.title} — screenshot`}
                fill
                sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 480px"
                className={fit === "contain" ? "object-contain p-6" : "object-cover object-top"}
                style={
                  project.imagePosition
                    ? { objectPosition: project.imagePosition }
                    : undefined
                }
              />
              <span
                className={`absolute left-3 top-3 rounded-full border bg-black/75 px-2.5 py-0.5 text-xs font-semibold backdrop-blur ${kindStyles[project.kind]}`}
              >
                {project.kind}
              </span>
              {project.featured && (
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-0.5 text-xs font-medium text-amber-300 backdrop-blur">
                  <Star size={11} className="fill-current" aria-hidden="true" />
                  Featured
                </span>
              )}
            </div>

            <div className="flex flex-shrink-0 flex-col gap-1.5 p-5">
              {project.status && (
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck size={13} className="flex-shrink-0" aria-hidden="true" />
                  <span>
                    <DotSeparated text={project.status} />
                  </span>
                </p>
              )}
              <h3 className="text-lg font-bold leading-snug">{project.title}</h3>
              <p className="text-sm leading-snug text-muted-foreground">
                {project.tagline}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
                {canHover ? "Hover" : "Tap"} to see{" "}
                {project.ownership ? "the full build" : "what I built"}
                <ChevronRight size={13} aria-hidden="true" />
              </p>
            </div>
          </article>

          {/* ── Back: full details ── */}
          <div
            ref={backRef}
            className="project-card project-card-back flex flex-col gap-3 p-5 sm:p-6"
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              // WebKit still hit-tests a backface-hidden face, so only the
              // visible face takes pointer input.
              pointerEvents: flipped ? "auto" : "none",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="pt-1 text-xs font-medium text-muted-foreground">
                <DotSeparated text={project.role ?? project.kind} />
              </p>
              <div className="flex flex-shrink-0 gap-1.5">
                {project.appStoreUrl && cta?.url !== project.appStoreUrl && (
                  <IconLink
                    href={project.appStoreUrl}
                    label={`${project.title} on the App Store`}
                    gaLabel={`app_store_${project.title}`}
                  >
                    <SiAppstore size={14} aria-hidden="true" />
                  </IconLink>
                )}
                {project.productHuntUrl && cta?.url !== project.productHuntUrl && (
                  <IconLink
                    href={project.productHuntUrl}
                    label={`${project.title} on Product Hunt`}
                    gaLabel={`product_hunt_${project.title}`}
                  >
                    <SiProducthunt size={14} aria-hidden="true" />
                  </IconLink>
                )}
                {project.githubUrl && (
                  <IconLink
                    href={project.githubUrl}
                    label={`${project.title} source code on GitHub`}
                    gaLabel={`github_${project.title}`}
                  >
                    <GithubIcon size={14} />
                  </IconLink>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold leading-snug">{project.title}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {project.description}
            </p>

            {/* Solo projects lead with ownership: the whole app is mine, so
                the list below reads as the product's features rather than
                the slice of it I happened to build. */}
            {project.ownership && (
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <BadgeCheck size={13} className="flex-shrink-0" aria-hidden="true" />
                  Sole developer — built end to end
                </p>
                <p className="mt-1 text-[11.5px] leading-snug text-foreground/80">
                  <DotSeparated text={project.ownership.join(" · ")} />
                </p>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {project.ownership ? "Key features" : "What I built"}
              </p>
              <ul className="space-y-1.5">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-[13px] leading-snug text-foreground/85"
                  >
                    <span
                      className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
              {project.tech.map((t) => (
                <li
                  key={t}
                  className="rounded-md border border-primary/15 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-auto border-t border-border pt-4">
              {cta ? (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    gaEvent({
                      action: "click",
                      category: "project_link",
                      label: `primary_${project.title}`,
                    });
                  }}
                  className="btn-click inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "var(--btn-gradient)" }}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {cta.label}
                </a>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  This product has been retired, so no public demo is available.
                </p>
              )}
              {project.freeTierHosting && (
                <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock size={11} className="flex-shrink-0" aria-hidden="true" />
                  The first load can be slow — it&apos;s hosted on a free tier.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Featured carousel ────────────────────────────────────────────────────────
// Cards are sized to fit a whole number per view (1 on phones, 2 from md up),
// so a card is never cut in half. There's one dot per reachable scroll
// position — not one per card — so the last dot lights up at the end.
function FeaturedCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(1);
  const [index, setIndex] = useState(0);
  // Target of an arrow/dot click while its smooth scroll is still running —
  // mid-animation scroll events would otherwise drag the dot back.
  const pendingTarget = useRef<number | null>(null);

  const positions = Math.max(1, featuredProjects.length - perView + 1);

  const step = useCallback(() => {
    const card = scrollRef.current?.querySelector<HTMLElement>(".featured-card");
    return (card?.offsetWidth ?? 0) + CAROUSEL_GAP_PX;
  }, []);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const s = step();
    // offsetWidth is 0 before layout (and in jsdom) — keep the defaults.
    if (s <= CAROUSEL_GAP_PX) return;
    setPerView(Math.max(1, Math.round((el.clientWidth + CAROUSEL_GAP_PX) / s)));
    const settled = Math.round(el.scrollLeft / s);
    if (pendingTarget.current !== null) {
      if (Math.abs(el.scrollLeft - pendingTarget.current * s) > 2) return;
      pendingTarget.current = null;
    }
    setIndex(settled);
  }, [step]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goTo = (i: number, label: string) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.min(Math.max(i, 0), positions - 1);
    const s = step();
    // Only hold the dot steady while there's a real layout to scroll through.
    pendingTarget.current = s > CAROUSEL_GAP_PX ? target : null;
    el.scrollTo({ left: target * s, behavior: "smooth" });
    setIndex(target);
    gaEvent({ action: "click", category: "featured_carousel", label });
  };

  const current = Math.min(index, positions - 1);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Professional projects"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Professional work at Revise
        </h3>
        {positions > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo(current - 1, "prev")}
              disabled={current === 0}
              aria-label="Previous project"
              className="btn-click flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1, "next")}
              disabled={current >= positions - 1}
              aria-label="Next project"
              className="btn-click flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={measure}
        data-scroll-key="featured-projects"
        className="carousel-scroll !gap-5 py-3"
      >
        {featuredProjects.map((project, i) => (
          <div
            key={project.id}
            className="featured-card carousel-snap-item w-full md:w-[calc((100%-1.25rem)/2)]"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${featuredProjects.length}: ${project.title}`}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {positions > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: positions }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i, `dot_${i + 1}`)}
              aria-label={`Go to slide ${i + 1} of ${positions}`}
              aria-current={current === i ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i ? "w-6" : "w-2 bg-border hover:bg-muted-foreground"
              }`}
              style={
                current === i
                  ? {
                      background:
                        "linear-gradient(90deg, var(--brand-1), var(--brand-3))",
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── More projects: one row, paginated ───────────────────────────────────────
// Shows exactly one row — as many cards as fit (1 / 2 / 3 by breakpoint) —
// and pages through the rest instead of wrapping onto a second line.
function useCardsPerRow() {
  // 3 on the server: the per-index `hidden sm:block`/`hidden lg:block`
  // classes below already trim the row to fit on smaller screens before
  // hydration, so there's no layout jump.
  const [perRow, setPerRow] = useState(3);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const sm = window.matchMedia("(min-width: 640px)");
    const update = () => setPerRow(lg.matches ? 3 : sm.matches ? 2 : 1);
    update();
    lg.addEventListener?.("change", update);
    sm.addEventListener?.("change", update);
    return () => {
      lg.removeEventListener?.("change", update);
      sm.removeEventListener?.("change", update);
    };
  }, []);
  return perRow;
}

const visibilityByIndex = ["", "hidden sm:block", "hidden lg:block"];

const projectTabs: { label: string; kind: ProjectKind | null }[] = [
  { label: "All Projects", kind: null },
  { label: "Client", kind: "Client Work" },
  { label: "Professional", kind: "Professional" },
  { label: "Personal", kind: "Personal" },
];

function MoreProjects() {
  const perRow = useCardsPerRow();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const activeKind = projectTabs[tab].kind;
  const filtered = activeKind
    ? otherProjects.filter((p) => p.kind === activeKind)
    : otherProjects;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perRow));
  const current = Math.min(page, totalPages - 1);
  const start = current * perRow;
  const visible = filtered.slice(start, start + perRow);

  const selectTab = (i: number) => {
    setTab(i);
    setPage(0);
    gaEvent({ action: "click", category: "project_tab", label: projectTabs[i].label });
  };

  // Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + projectTabs.length) % projectTabs.length;
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const go = (p: number, label: string) => {
    setPage(Math.min(Math.max(p, 0), totalPages - 1));
    gaEvent({ action: "click", category: "project_pagination", label });
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter projects"
        // One row that scrolls sideways on narrow screens instead of
        // wrapping onto a second line; centered once all four fit (sm+).
        className="mb-8 -mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:justify-center sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {projectTabs.map((t, i) => {
          const count = t.kind
            ? otherProjects.filter((p) => p.kind === t.kind).length
            : otherProjects.length;
          const selected = tab === i;
          return (
            <button
              key={t.label}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`project-tab-${i}`}
              aria-selected={selected}
              aria-controls="project-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(i)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={`btn-click inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "border-transparent text-white shadow-md"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              style={selected ? { background: "var(--btn-gradient)" } : undefined}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 text-[11px] leading-5 ${
                  selected ? "bg-white/25" : "bg-accent"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${tab}-${perRow}-${current}`}
          id="project-tabpanel"
          role="tabpanel"
          aria-labelledby={`project-tab-${tab}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
          transition={{ duration: 0.3 }}
          // Flex rather than grid so a short filtered row (e.g. one client
          // project) sits centered instead of hugging the left edge.
          className="more-projects-row flex justify-center gap-6"
        >
          {visible.map((project, i) => (
            <div
              key={project.id}
              className={`w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] ${visibilityByIndex[i] ?? ""}`}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <nav
          aria-label="More projects pages"
          className="mt-8 flex items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => go(current - 1, "prev")}
            disabled={current === 0}
            aria-label="Previous page"
            className="btn-click flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i, `page_${i + 1}`)}
              aria-label={`Page ${i + 1}`}
              aria-current={current === i ? "page" : undefined}
              className="btn-click h-8 w-8 rounded-full text-xs font-semibold transition-all"
              style={
                current === i
                  ? {
                      background: "var(--btn-gradient)",
                      border: "1.5px solid var(--brand-2)",
                      color: "#ffffff",
                    }
                  : {
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--muted-foreground))",
                    }
              }
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => go(current + 1, "next")}
            disabled={current >= totalPages - 1}
            aria-label="Next page"
            className="btn-click flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Showing {start + 1}–{Math.min(start + perRow, filtered.length)} of{" "}
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
      </p>
    </div>
  );
}

// ─── Projects section ─────────────────────────────────────────────────────────
export function Projects() {
  return (
    <section id="projects" className="relative overflow-hidden px-4 py-24 dot-grid">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="section-eyebrow">02 · My Work</p>
          <h2 className="section-heading center mb-6 text-3xl font-bold sm:text-4xl">
            Featured Projects
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Products I&apos;ve built professionally — live on the App Store and
            launched on Product Hunt — followed by client work and personal
            projects. Hover or tap a card to see what I built.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-20"
        >
          <FeaturedCarousel />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <h3 className="mb-2 text-center text-xl font-bold">More Projects</h3>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-muted-foreground">
            My first company&apos;s platform, plus client and personal projects
            I designed and built end to end.
          </p>
          <MoreProjects />
        </motion.div>

        {/* Pagination keeps later "More Projects" pages out of the initial
            HTML, so list every project here for crawlers. */}
        <div className="sr-only">
          <h3>All projects</h3>
          <ul>
            {projects.map((p) => {
              const link = primaryLink(p);
              return (
                <li key={p.id}>
                  {link ? <a href={link.url}>{p.title}</a> : p.title} —{" "}
                  {p.tagline}.
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
