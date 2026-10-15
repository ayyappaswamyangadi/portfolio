"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { DotSeparated } from "./DotSeparated";
import {
  Code2,
  Layers,
  GitBranch,
  Zap,
  Gauge,
  Building2,
  Calendar,
  Sparkles,
  Smartphone,
  Palette,
  Server,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Scale,
  Database,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss,
  SiReact,
  SiNextdotjs,
  SiRedux,
  SiReactquery,
  SiStyledcomponents,
  SiTailwindcss,
  SiReacthookform,
  SiGit,
  SiGithub,
  SiWebpack,
  SiVite,
  SiVercel,
  SiNodedotjs,
  SiExpress,
  SiClaudecode,
} from "react-icons/si";
import type { IconType } from "react-icons";
import {
  CHOOLS_PERIOD,
  REVISE_START,
  formatDuration,
  getTotalExperienceLabel,
} from "@/lib/experience";

// ─── Skills data ─────────────────────────────────────────────────────────────
// Strongest first. Testing and backend are listed honestly as beginner skills.
const skillGroups: {
  label: string;
  icon: ReactNode;
  skills: string[];
  level?: string;
}[] = [
  {
    label: "Frontend",
    icon: <Layers size={16} />,
    skills: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3"],
  },
  {
    label: "Styling & UI",
    icon: <Palette size={16} />,
    skills: ["Tailwind CSS", "Styled-Components", "Framer Motion", "Responsive Design"],
  },
  {
    label: "State & Data",
    icon: <Zap size={16} />,
    skills: ["Redux Toolkit", "React Query", "Context API", "React Hook Form", "Zod", "REST APIs", "WebSockets", "Server-Sent Events"],
  },
  {
    label: "Performance",
    icon: <Gauge size={16} />,
    skills: ["Code splitting", "Lazy loading", "Memoization", "Bundle optimization", "Core Web Vitals"],
  },
  {
    label: "Tooling & Deployment",
    icon: <GitBranch size={16} />,
    skills: ["Git & GitHub", "Vite", "Webpack", "npm", "Vercel"],
  },
  {
    label: "AI-Assisted Development",
    icon: <Sparkles size={16} />,
    skills: ["Claude Code", "Agentic Workflows", "AI Code Review", "Prompt Engineering"],
  },
  {
    label: "Testing",
    icon: <FlaskConical size={16} />,
    skills: ["Vitest", "React Testing Library"],
    level: "Beginner",
  },
  {
    label: "Backend",
    icon: <Server size={16} />,
    skills: ["Node.js", "Express.js"],
    level: "Beginner",
  },
];

// ─── Tech stack logos ────────────────────────────────────────────────────────
const techLogos: { name: string; Icon: IconType; hex: string }[] = [
  { name: "JavaScript", Icon: SiJavascript, hex: "F7DF1E" },
  { name: "TypeScript", Icon: SiTypescript, hex: "3178C6" },
  { name: "HTML5", Icon: SiHtml5, hex: "E34F26" },
  { name: "CSS3", Icon: SiCss, hex: "663399" },
  { name: "React", Icon: SiReact, hex: "61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs, hex: "000000" },
  { name: "Redux", Icon: SiRedux, hex: "764ABC" },
  { name: "React Query", Icon: SiReactquery, hex: "FF4154" },
  { name: "Styled-Components", Icon: SiStyledcomponents, hex: "DB7093" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, hex: "06B6D4" },
  { name: "React Hook Form", Icon: SiReacthookform, hex: "EC5990" },
  { name: "Git", Icon: SiGit, hex: "F05032" },
  { name: "GitHub", Icon: SiGithub, hex: "181717" },
  { name: "Webpack", Icon: SiWebpack, hex: "8DD6F9" },
  { name: "Vite", Icon: SiVite, hex: "9135FF" },
  { name: "Vercel", Icon: SiVercel, hex: "000000" },
  { name: "Node.js", Icon: SiNodedotjs, hex: "5FA04E" },
  { name: "Express.js", Icon: SiExpress, hex: "0A0A0A" },
  { name: "Claude Code", Icon: SiClaudecode, hex: "D97757" },
];

const totalExperienceLabel = getTotalExperienceLabel();

// ─── Experience timeline ─────────────────────────────────────────────────────
// Newest first, so the current role is the first thing visitors see.
const experience = [
  {
    company: "Revise",
    role: "Frontend Engineer",
    duration: `May 2022 – Present  ·  ${formatDuration(REVISE_START)}`,
    location: "Mumbai, India · Remote",
    type: "Current",
    period: "2022 – Present",
    highlights: [
      "Grass: Code Agent Computer (live on the App Store) — built the app that lets developers run and steer Claude Code and OpenCode sessions from their phone: resumable streaming chat that survives backgrounding and dropped networks, a queue for approving agent tool calls with push notifications, and one-tap switching between machines. My first project built with AI-assisted development (Claude Code).",
      "10X Trade — built the trading interface for leveraged crypto futures inside a Telegram Mini App: live WebSocket market data driving real-time profit-and-loss and charts, and orders signed on the user's device.",
      "TaxAI (launched on Product Hunt) — built the research interface for chartered accountants: answers stream in beside the source Act, and every citation jumps to the exact section or proviso and highlights it, so answers can be verified instead of trusted blindly.",
      "Convo (launched on Product Hunt) — built the developer dashboard for an LLM-memory SDK: magic-link sign-in, an infinite-scroll thread explorer with expandable messages and metadata, and API key management.",
      "Own frontend architecture and API contracts with backend engineers, and review code across the team.",
    ],
    tech: [
      "React",
      "Next.js",
      "TypeScript",
      "WebSockets / SSE",
      "Tailwind CSS",
      "Styled-Components",
    ],
    color: "from-purple-500 to-pink-400",
    dotColor: "bg-purple-500",
  },
  {
    company: "Chools Consultancy Services",
    role: "Software Developer",
    duration: `Oct 2020 – Jan 2022  ·  ${formatDuration(CHOOLS_PERIOD.start, CHOOLS_PERIOD.end)}`,
    location: "Bengaluru, India · Onsite",
    type: "Full-time",
    period: "2020 – 2022",
    highlights: [
      "Built and maintained chools.in, the company's WordPress learning and consulting platform — course catalog, consulting programme pages, learner registration and login, and course checkout.",
      "Customised WordPress themes and plugins to fit client-specific e-learning requirements.",
      "Delivered responsive, cross-browser websites in HTML, CSS and JavaScript from client wireframes.",
    ],
    tech: ["WordPress", "HTML5", "CSS3", "JavaScript"],
    color: "from-blue-500 to-cyan-400",
    dotColor: "bg-blue-500",
  },
];

// ─── Motion variants ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Developer Avatar ─────────────────────────────────────────────────────────
function DeveloperAvatar() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="relative flex-shrink-0 w-full max-w-xs sm:max-w-sm md:w-64 lg:w-72 mx-auto md:mx-0 self-center md:self-start"
    >
      {/* Glow */}
      <div
        className="absolute -inset-3 rounded-2xl blur-2xl pointer-events-none opacity-25"
        style={{ background: "var(--btn-gradient)" }}
      />

      {/* Card */}
      <div className="relative rounded-2xl border border-primary/20 glass-card overflow-hidden shadow-xl">
        {/* Mac-style title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#161b22]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-auto text-[10px] font-mono text-[#8b949e]">
            ayyappa.png
          </span>
        </div>

        {/* Avatar area */}
        <div className="bg-gradient-to-b from-[#0d1117] to-[#161b22] p-5 flex flex-col items-center gap-4 text-left">
          {/* Profile photo */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full p-[2px] shadow-lg shadow-primary/30"
              style={{ background: "var(--btn-gradient)" }}
            >
              <Image
                src="/assets/images/avatar-headshot.jpg"
                alt="Ayyappa Swamy Angadi, Senior Frontend Engineer"
                width={200}
                height={200}
                className="w-full h-full rounded-full object-cover border-2 border-[#0d1117]"
                priority
              />
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0d1117] pulse-badge" />
          </div>

          {/* Name + role */}
          <div className="text-center">
            <p className="font-bold text-base text-[#e6edf3]">
              Ayyappa Swamy Angadi
            </p>
            <p className="text-xs font-semibold text-[#7ee787] mt-0.5">
              Senior Frontend Engineer
            </p>
            <p className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-[#8b949e]">
              <MapPin size={11} aria-hidden="true" />
              Bengaluru, India
            </p>
          </div>

          {/* Stats row */}
          <div className="w-full grid grid-cols-3 gap-2">
            {[
              { value: "5+", label: "Years", color: "text-[#ffa657]" },
              { value: "10+", label: "Projects", color: "text-[#7ee787]" },
              { value: "2", label: "Companies", color: "text-[#79c0ff]" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2 text-center"
              >
                <div className={`text-base font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-[#8b949e] leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Core stack */}
          <div className="w-full">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">
              Core stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["React", "Next.js", "TypeScript", "Tailwind", "Redux"].map((s) => (
                <span
                  key={s}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/15 text-[#79c0ff] border border-primary/25"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* What a team gets */}
          <div className="w-full">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">
              What I bring
            </p>
            <ul className="space-y-1.5">
              {[
                "End-to-end ownership, from architecture to release",
                "Real-time, streaming and AI-powered interfaces",
                "Fast, responsive, maintainable UI code",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-[11.5px] leading-snug text-[#c9d1d9]"
                >
                  <CheckCircle2
                    size={12}
                    className="mt-[2px] flex-shrink-0 text-[#7ee787]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Availability */}
          <div className="w-full rounded-lg border border-[#3fb950]/30 bg-[#3fb950]/10 px-3 py-2 text-center">
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] font-semibold text-[#7ee787]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] pulse-badge" />
              Available for work
            </p>
            <p className="text-[10.5px] text-[#8b949e] mt-0.5">
              On-site, hybrid or remote
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skills carousel ─────────────────────────────────────────────────────────
// Horizontally scrollable cards that auto-advance one card at a time and loop
// back to the start. Autoplay pauses while the pointer, keyboard focus or a
// finger is on the carousel, so it never moves under someone reading it. The
// dots track real scroll positions (one per reachable position), so the last
// dot lights up at the end.
const SKILL_GAP_PX = 20;
const SKILL_AUTOPLAY_MS = 3000;

function SkillsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(1);
  const [index, setIndex] = useState(0);
  const positions = Math.max(1, skillGroups.length - perView + 1);
  const current = Math.min(index, positions - 1);

  const step = useCallback(() => {
    const card = scrollRef.current?.querySelector<HTMLElement>(".skill-card");
    return (card?.offsetWidth ?? 0) + SKILL_GAP_PX;
  }, []);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const s = step();
    if (s <= SKILL_GAP_PX) return;
    setPerView(Math.max(1, Math.floor((el.clientWidth + SKILL_GAP_PX) / s)));
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
    setIndex(atEnd ? Number.MAX_SAFE_INTEGER : Math.round(el.scrollLeft / s));
  }, [step]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goTo = useCallback(
    (i: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const target = Math.min(Math.max(i, 0), positions - 1);
      el.scrollTo({ left: target * step(), behavior: "smooth" });
      setIndex(target);
    },
    [positions, step],
  );

  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || positions <= 1) return;
    const id = setInterval(() => {
      goTo(current >= positions - 1 ? 0 : current + 1);
    }, SKILL_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, positions, current, goTo]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Technical skills"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Outer padding keeps the arrow buttons inside the section's
          overflow-hidden boundary. */}
      <div className="relative -mx-2 px-10">
        <button
          type="button"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          aria-label="Previous skills"
          className="btn-click absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:border-primary/50 hover:bg-accent disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          onScroll={measure}
          className="carousel-scroll !gap-5 px-1 py-2"
        >
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="skill-card carousel-snap-item project-card shimmer-card p-5"
              style={{ width: "min(288px, calc(85vw - 3rem))" }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary">
                  {group.icon}
                  {group.label}
                </h4>
                {group.level && (
                  <span className="rounded-full border border-border bg-accent px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {group.level}
                  </span>
                )}
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <li key={skill} className="skill-pill text-xs">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(current + 1)}
          disabled={current >= positions - 1}
          aria-label="Next skills"
          className="btn-click absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:border-primary/50 hover:bg-accent disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {positions > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: positions }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to skills slide ${i + 1} of ${positions}`}
              aria-current={current === i ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === i ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tech logo marquee ─────────────────────────────────────────────────────────
// Duplicated once so the CSS marquee's -50% translate is exactly one full
// set wide, making the loop seamless. The second copy is aria-hidden so
// screen readers/tab order only ever see each logo once.
const marqueeLogos = [...techLogos, ...techLogos];

function TechLogoGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="marquee-wrapper"
      style={{ "--marquee-duration": "36s" } as CSSProperties}
    >
      {/* Spacing is a per-tile margin rather than a flex `gap`: with gap the
          track is one gap short of two full sets, so the -50% keyframe landed
          half a gap off and the loop visibly jumped each cycle. */}
      <div className="marquee-track py-2">
        {marqueeLogos.map(({ name, Icon, hex }, i) => (
          <motion.div
            key={`${name}-${i}`}
            aria-hidden={i >= techLogos.length}
            whileHover={{ scale: 1.08, y: -3 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="tech-logo-tile flex flex-col items-center gap-1.5 w-[78px] mr-3 flex-shrink-0 rounded-xl border border-black/5 bg-white/95 dark:bg-white shadow-sm px-2 py-3 cursor-default"
          >
            <Icon size={26} color={`#${hex}`} aria-hidden="true" />
            {/* The loop's second copy draws its label with CSS content, so the
                tech list appears once (not twice) in the page's text — what
                crawlers, link previews and AI page readers extract. */}
            {i < techLogos.length ? (
              <span className="text-[9.5px] font-medium text-gray-600 text-center leading-tight">
                {name}
              </span>
            ) : (
              <span
                data-label={name}
                className="marquee-dup-label text-[9.5px] font-medium text-gray-600 text-center leading-tight"
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── About Section ───────────────────────────────────────────────────────────
export function About() {
  return (
    <section id="about" className="relative py-24 px-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* ── Section header with avatar ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          {/* Shared title above both columns */}
          <div className="mb-8 text-center">
            <p className="section-eyebrow">01 · About</p>
            <h2 className="text-3xl sm:text-4xl font-bold section-heading center">
              About Me
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start">
            {/* Developer avatar */}
            <DeveloperAvatar />

            {/* Text content */}
            <div className="flex-1 min-w-0 w-full text-center md:text-left">
              <div className="relative pl-5 border-l-2 border-primary/30">
                <span
                  className="absolute -top-4 -left-2 text-6xl font-serif text-primary/15 select-none pointer-events-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>

                <p className="mt-0 text-muted-foreground dark:text-white leading-relaxed max-md:text-justify">
                  I&apos;m a Senior Frontend Engineer with{" "}
                  <span className="gradient-text font-semibold">
                    {totalExperienceLabel} of professional experience
                  </span>{" "}
                  shipping production web products with React, Next.js and
                  TypeScript. At{" "}
                  <span className="font-semibold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">
                    Revise
                  </span>{" "}
                  I&apos;ve built Grass: Code Agent Computer, an App Store app
                  for steering AI coding agents from your phone; the AI
                  products TaxAI and Convo; and 10X Trade, leveraged crypto
                  trading inside Telegram.
                </p>
                <p className="mt-4 text-muted-foreground dark:text-white leading-relaxed max-md:text-justify">
                  My strength is the hard part of the frontend: real-time
                  data over WebSockets and Server-Sent Events, streaming AI
                  interfaces, and keeping complex state fast and predictable.
                  I started my career at{" "}
                  <span className="font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    Chools Consultancy Services
                  </span>
                  , where I built their WordPress learning platform.
                </p>
                <p className="mt-4 text-muted-foreground dark:text-white leading-relaxed max-md:text-justify">
                  I also work with{" "}
                  <span className="text-primary font-semibold">
                    AI-assisted development
                  </span>{" "}
                  tools such as Claude Code to deliver faster, while holding
                  every change to the same standard: I design the
                  architecture, review each line and take full ownership of
                  what ships.
                </p>
              </div>

              {/* Key highlights */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  {
                    Icon: Smartphone,
                    label: "Grass: Code Agent Computer",
                    sub: "Live on the App Store",
                  },
                  {
                    Icon: Scale,
                    label: "TaxAI",
                    sub: "AI tax research with cited sources",
                  },
                  {
                    Icon: Database,
                    label: "Convo",
                    sub: "Developer dashboard for LLM memory",
                  },
                  {
                    Icon: TrendingUp,
                    label: "10X Trade",
                    sub: "Crypto futures trading in Telegram",
                  },
                ].map(({ Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card/60 p-3 flex items-center gap-3"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Skills ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mb-20"
        >
          <h3 className="text-xl font-bold mb-8 flex items-center justify-center gap-2">
            <Code2 size={20} className="text-primary" />
            Technical Skills
          </h3>
          <SkillsCarousel />
        </motion.div>

        {/* ── Experience timeline ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <h3 className="text-xl font-bold mb-10 flex items-center justify-center gap-2">
            <Building2 size={20} className="text-primary" />
            Work Experience
          </h3>

          <div className="relative">
            {/* Vertical connecting line — precisely centered on the 40px dot */}
            <div
              className="absolute w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-transparent"
              style={{ left: "19px", top: "40px", bottom: "2.5rem" }}
            />

            <div className="space-y-0">
              {experience.map((job, idx) => (
                <div key={job.company}>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 }}
                    viewport={{ once: true }}
                    className="relative flex gap-6"
                  >
                    {/* Timeline dot — fixed width so line stays centered */}
                    <div className="relative z-10 flex-shrink-0 w-10 flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${job.color} flex items-center justify-center shadow-lg ring-4 ring-background`}
                      >
                        <Building2 size={16} className="text-white" />
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 project-card p-6 pb-7 mb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-bold text-lg leading-tight">
                            {job.role}
                          </h4>
                          <p
                            className={`font-bold bg-gradient-to-r ${job.color} bg-clip-text text-transparent`}
                          >
                            {job.company}
                          </p>
                        </div>
                        {job.type === "Current" && (
                          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-badge" />
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          <DotSeparated text={job.duration.replace(/\s+·\s+/g, " · ")} />
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          <DotSeparated text={job.location} />
                        </span>
                      </div>

                      <ul className="space-y-2 mb-5">
                        {job.highlights.map((h) => (
                          <li
                            key={h}
                            className="flex gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-1.5">
                        {job.tech.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Connector between jobs — centered under the dot */}
                  {idx < experience.length - 1 && (
                    <div className="flex items-center gap-6 py-4">
                      {/* Same w-10 column as the timeline dot above, so the
                          arrow stays centered on the connecting line. */}
                      <div className="flex-shrink-0 w-10 flex flex-col items-center gap-1">
                        <div className="w-px h-2 bg-border" />
                        <svg
                          width="12"
                          height="10"
                          viewBox="0 0 12 10"
                          className="text-muted-foreground"
                          fill="currentColor"
                        >
                          <path d="M6 10L0 0h12z" />
                        </svg>
                        <div className="w-px h-2 bg-border" />
                      </div>
                      <span className="text-xs text-muted-foreground italic">
                        Previous role
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Tech stack logo grid ── */}
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-6 flex items-center justify-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Tech I Work With
          </h3>
          <TechLogoGrid />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
