"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type CSSProperties,
} from "react";
import Image from "next/image";
import {
  motion,
  type Variants,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Code2,
  Layers,
  Terminal,
  GitBranch,
  Box,
  Zap,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
const skillGroups = [
  {
    label: "Core Languages",
    icon: <Code2 size={16} />,
    skills: ["JavaScript (ES2022+)", "TypeScript", "HTML5", "CSS3"],
  },
  {
    label: "Frameworks & Libraries",
    icon: <Layers size={16} />,
    skills: [
      "React.js",
      "Next.js",
      "Redux Toolkit",
      "React Query",
      "Styled-Components",
      "Tailwind CSS",
    ],
  },
  {
    label: "State Management",
    icon: <Box size={16} />,
    skills: ["Redux", "Context API", "React Hook Form"],
  },
  {
    label: "Tools & DevOps",
    icon: <GitBranch size={16} />,
    skills: ["Git", "GitHub Actions", "Webpack", "Vite", "Vercel"],
  },
  {
    label: "Performance",
    icon: <Zap size={16} />,
    skills: [
      "Lighthouse audits",
      "Code splitting",
      "Lazy loading",
      "Web Vitals",
    ],
  },
  {
    label: "Backend & APIs (Beginner)",
    icon: <Terminal size={16} />,
    skills: ["Node.js", "Express.js", "REST APIs"],
  },
  {
    label: "AI-Augmented Development",
    icon: <Sparkles size={16} />,
    skills: [
      "Claude Code",
      "AI Pair Programming",
      "Prompt Engineering",
      "Agentic Dev Workflows",
      "AI Code Review",
    ],
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
const experience = [
  {
    company: "Chools Consultancy Services",
    role: "Software Developer",
    duration: `Oct 2020 – Jan 2022  ·  ${formatDuration(CHOOLS_PERIOD.start, CHOOLS_PERIOD.end)}`,
    location: "Bengaluru, India · Onsite",
    type: "Full-time",
    period: "2020 – 2022",
    highlights: [
      "Developed and maintained Learning Management System (LMS) websites on WordPress, enabling structured course delivery, learner progress tracking, and administrative management.",
      "Built and customised WordPress themes and plugins to meet client-specific requirements for e-learning platforms.",
      "Delivered multiple production websites using pure HTML, CSS, and JavaScript — building responsive, cross-browser-compatible interfaces from scratch.",
      "Collaborated with clients and design teams to translate wireframes and requirements into polished, functional web pages.",
    ],
    tech: ["WordPress", "HTML5", "CSS3", "JavaScript"],
    color: "from-blue-500 to-cyan-400",
    dotColor: "bg-blue-500",
  },
  {
    company: "Revise",
    role: "Frontend Engineer",
    duration: `May 2022 – Present  ·  ${formatDuration(REVISE_START)}`,
    location: "Mumbai, India · Remote",
    type: "Current",
    period: "2022 – Present",
    highlights: [
      "Built 10X Trade, a Telegram Mini App perpetual-futures trading terminal on the dYdX v4 protocol — a live WebSocket engine streams order-book, fill, and price data into real-time PnL and custom Chart.js charts, with non-custodial Cosmos/Ethereum wallet signing for leveraged order execution.",
      "Built AskFinance, a RAG-based AI chat app for querying financial and SEC documents in natural language — WebSocket-streamed responses with auto-reconnect, and citation chips that deep-link a synchronised PDF viewer to the exact source page.",
      "Architecting GRASS, a React Native/Expo mobile app that lets developers remotely drive AI coding agents (Claude Code, OpenCode) on a cloud sandbox or their own machine — hand-rolled SSE streaming, QR-code device pairing, and a real-time tool-use permission approval system for safe autonomous agent actions.",
      "Built the admin dashboard for Convo, an LLM-agent memory/persistence API — magic-link authentication, infinite-scroll conversation-thread browsing, and full API-key lifecycle management with usage tracking.",
      "Delivered multiple Next.js applications with server-side rendering, performance optimisation, and scalable frontend architecture.",
      "Collaborating within a fully remote, cross-functional team to consistently ship production-grade features across several product lines.",
    ],
    tech: [
      "React",
      "Next.js",
      "TypeScript",
      "React Native / Expo",
      "WebSockets",
      "Tailwind CSS",
    ],
    color: "from-purple-500 to-pink-400",
    dotColor: "bg-purple-500",
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

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

// ─── Developer Avatar ─────────────────────────────────────────────────────────
function DeveloperAvatar() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 20 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="relative flex-shrink-0 w-full max-w-xs sm:max-w-sm md:w-56 lg:w-64 mx-auto md:mx-0 self-center md:self-start"
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
        <div className="bg-gradient-to-b from-[#0d1117] to-[#161b22] p-6 flex flex-col items-center gap-4">
          {/* Profile photo */}
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full p-[2px] shadow-lg shadow-primary/30"
              style={{ background: "var(--btn-gradient)" }}
            >
              <Image
                src="/assets/images/avatar-headshot.jpg"
                alt="Ayyappa Swamy, Frontend Engineer"
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
            <p className="font-bold text-sm text-[#e6edf3]">Ayyappa</p>
            <p className="text-[11px] font-mono text-[#7ee787] mt-0.5">
              {"// Frontend Engineer"}
            </p>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {["React", "Next.js", "TS", "Redux"].map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-[#79c0ff] border border-primary/25 font-mono"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="w-full grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2 text-center">
              <div className="text-base font-bold text-[#ffa657]">5+</div>
              <div className="text-[9px] text-[#8b949e] leading-tight">
                Yrs Exp.
              </div>
            </div>
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2 text-center">
              <div className="text-base font-bold text-[#7ee787]">10+</div>
              <div className="text-[9px] text-[#8b949e] leading-tight">
                Projects
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skills Carousel ─────────────────────────────────────────────────────────
function SkillsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(".skill-carousel-card");
    const cardW = (firstCard?.offsetWidth ?? 288) + 20;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  };

  return (
    /* Outer wrapper has extra horizontal padding so arrow buttons
       stay inside the section's overflow-hidden boundary.       */
    <div className="relative px-10 -mx-2">
      {/* Prev arrow */}
      {!atStart && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous skills"
          className="btn-click absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="carousel-scroll px-1 py-2"
      >
        {skillGroups.map((group) => (
          <div
            key={group.label}
            className="skill-carousel-card carousel-snap-item project-card shimmer-card p-5 group"
            style={{ width: "min(288px, calc(85vw - 3rem))" }}
          >
            <div className="flex items-center gap-2 text-primary mb-3 font-semibold text-sm">
              {group.icon}
              {group.label}
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-1.5"
            >
              {group.skills.map((skill) => (
                <motion.span
                  key={skill}
                  variants={staggerItem}
                  className="skill-pill text-xs"
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Next arrow */}
      {!atEnd && (
        <button
          onClick={() => scroll(1)}
          aria-label="Next skills"
          className="btn-click absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Scroll hint dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {skillGroups.map((g) => (
          <span key={g.label} className="w-1.5 h-1.5 rounded-full bg-border" />
        ))}
      </div>
    </div>
  );
}

// ─── Animated stat counter ───────────────────────────────────────────────────
function AnimatedStat({ label, value }: { label: string; value: string }) {
  const num = parseInt(value.replace(/\D/g, ""), 10) || 0;
  const suffix = value.replace(/\d/g, "");
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 55, damping: 16 });
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          count.set(num);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, num, started]);

  useEffect(
    () => spring.on("change", (v) => setDisplay(Math.round(v).toString())),
    [spring],
  );

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.04, y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="project-card p-5 text-center shimmer-card cursor-default"
    >
      <div className="text-3xl font-bold gradient-text mb-1">
        {display}
        {suffix}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
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
      <div className="marquee-track gap-3 py-2">
        {marqueeLogos.map(({ name, Icon, hex }, i) => (
          <motion.div
            key={`${name}-${i}`}
            aria-hidden={i >= techLogos.length}
            whileHover={{ scale: 1.08, y: -3 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="tech-logo-tile flex flex-col items-center gap-1.5 w-[78px] flex-shrink-0 rounded-xl border border-black/5 bg-white/95 dark:bg-white shadow-sm px-2 py-3 cursor-default"
          >
            <Icon size={26} color={`#${hex}`} aria-hidden="true" />
            <span className="text-[9.5px] font-medium text-gray-600 text-center leading-tight">
              {name}
            </span>
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
                  I&apos;m a passionate Frontend Engineer with{" "}
                  <span className="gradient-text font-semibold">
                    {totalExperienceLabel} of professional experience
                  </span>{" "}
                  building production-grade web applications — from
                  WordPress-driven LMS platforms and static sites to real-time
                  trading dashboards and AI-powered tools.
                </p>
                <p className="mt-4 text-muted-foreground dark:text-white leading-relaxed max-md:text-justify">
                  I began my career at{" "}
                  <span className="font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    Chools Consultancy Services
                  </span>{" "}
                  in Bengaluru, where I built and maintained Learning Management
                  System (LMS) websites on WordPress and delivered static web
                  projects using pure HTML, CSS, and JavaScript. I then joined{" "}
                  <span className="font-semibold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">
                    Revise
                  </span>{" "}
                  in May 2022, where I work as a Frontend Engineer — building
                  products like 10X Trade (a Telegram Mini App trading terminal
                  on the dYdX protocol), AskFinance (a RAG AI chat app over
                  financial documents), and the dashboard for Convo, an
                  LLM-agent memory API. I&apos;m currently architecting GRASS, a
                  mobile app that lets developers remotely drive AI coding
                  agents like Claude Code and OpenCode from their phone.
                </p>
                <p className="mt-4 text-muted-foreground dark:text-white leading-relaxed max-md:text-justify">
                  I care deeply about{" "}
                  <span className="text-primary font-semibold">
                    clean, maintainable code
                  </span>
                  ,{" "}
                  <span className="text-primary font-semibold">
                    intuitive user experiences
                  </span>
                  , and{" "}
                  <span className="text-primary font-semibold">
                    performance
                  </span>
                  . Whether architecting a feature-rich dashboard or building an
                  AI-driven interface, I bring the same commitment to quality
                  and craft to every project.
                </p>
                <p className="mt-4 text-muted-foreground dark:text-white leading-relaxed max-md:text-justify">
                  Since{" "}
                  <span className="text-primary font-semibold">
                    April 2026
                  </span>
                  , I&apos;ve also built AI pair-programming with{" "}
                  <span className="text-primary font-semibold">
                    Claude Code
                  </span>{" "}
                  into my daily workflow — using it to move faster on
                  scaffolding, refactors, tests, and debugging, while I stay
                  the one making every architecture, design, and
                  code-quality call. It&apos;s a modern, agentic way of
                  shipping software, and I&apos;m comfortable directing it on
                  real production codebases.
                </p>
              </div>

              {/* Key highlights */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                {[
                  {
                    icon: "🎓",
                    label: "LMS Platform Development",
                    sub: "Chools — WordPress & e-learning",
                  },
                  {
                    icon: "📈",
                    label: "Crypto Trading Terminal",
                    sub: "10X Trade — Telegram Mini App on dYdX",
                  },
                  {
                    icon: "💬",
                    label: "AI Document Q&A",
                    sub: "AskFinance — RAG chat over financial docs",
                  },
                  {
                    icon: "📱",
                    label: "Remote AI Dev Agent",
                    sub: "GRASS — Claude Code & OpenCode, on mobile",
                  },
                  {
                    icon: "🔑",
                    label: "LLM Memory Dashboard",
                    sub: "Convo — API keys & conversation threads",
                    full: true,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.03, y: -2 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className={`rounded-xl border border-border bg-card/60 p-3 flex items-start gap-2 shimmer-card cursor-default ${
                      item.full ? "col-span-2" : ""
                    }`}
                  >
                    <span className="text-lg leading-none mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.sub}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Skills carousel ── */}
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
              className="absolute w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent"
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
                          {job.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {job.location}
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
                        Next role
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Stats bar — animated counters ── */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Years Experience", value: "5+" },
            { label: "Projects Delivered", value: "10+" },
            { label: "Companies Worked", value: "2" },
            { label: "Tech Stack", value: "15+" },
          ].map((stat) => (
            <AnimatedStat
              key={stat.label}
              label={stat.label}
              value={stat.value}
            />
          ))}
        </div>

        {/* ── Tech stack logo grid ── */}
        <div className="mt-12">
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
