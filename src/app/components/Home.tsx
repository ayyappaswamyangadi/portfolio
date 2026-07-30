"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  type Variants,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { MapPin, Briefcase, Download } from "lucide-react";
import Link from "next/link";

// ─── Roles for typing effect ────────────────────────────────────────────────
const roles = [
  "Frontend Engineer",
  "React & Next.js Developer",
  "TypeScript Specialist",
  "UI Performance Optimizer",
  "Scalable Frontend Architect",
  "Component-Driven Developer",
  "State Management Expert",
  "Web Performance Enthusiast",
];

// ─── Typing effect hook ─────────────────────────────────────────────────────
function useTypingEffect(words: string[]) {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const currentWord = words[wordIndex];
    const speed = isDeleting ? 55 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        const next = currentWord.slice(0, displayText.length + 1);
        setDisplayText(next);
        if (next === currentWord) {
          setPaused(true);
          setTimeout(() => {
            setPaused(false);
            setIsDeleting(true);
          }, 1800);
        }
      } else {
        const next = displayText.slice(0, -1);
        setDisplayText(next);
        if (next === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex, words, paused]);

  return displayText;
}

// ─── Animated stat counter ──────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 60, damping: 18 });
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
          count.set(target);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, target, started]);

  useEffect(() => {
    return spring.on("change", (v) => {
      setDisplay(Math.round(v).toString());
    });
  }, [spring]);

  return (
    <div ref={ref} className="text-xl font-bold gradient-text">
      {display}
      {suffix}
    </div>
  );
}

// ─── Floating tech icon badge ────────────────────────────────────────────────
const floatingTechs = [
  {
    name: "React",
    color: "#61DAFB",
    bg: "rgba(97,218,251,0.14)",
    cls: "float-a",
    pos: "top-[12%] left-[3%]",
  },
  {
    name: "TS",
    color: "#3178C6",
    bg: "rgba(49,120,198,0.16)",
    cls: "float-b",
    pos: "top-[6%]  right-[10%]",
  },
  {
    name: "Next",
    color: "#e2e8f0",
    bg: "rgba(226,232,240,0.09)",
    cls: "float-c",
    pos: "bottom-[32%] left-[2%]",
  },
  {
    name: "CSS",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.14)",
    cls: "float-d",
    pos: "top-[42%] right-[3%]",
  },
  {
    name: "Git",
    color: "#F05032",
    bg: "rgba(240,80,50,0.13)",
    cls: "float-e",
    pos: "bottom-[14%] right-[6%]",
  },
  {
    name: "Node",
    color: "#68A063",
    bg: "rgba(104,160,99,0.13)",
    cls: "float-f",
    pos: "top-[68%] left-[5%]",
  },
];

// ─── Mac Window Card ─────────────────────────────────────────────────────────
type TabKey = "profile" | "terminal";

function MacWindow() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [termLine, setTermLine] = useState(0);

  const terminalLines = [
    { type: "prompt", text: "~/portfolio" },
    { type: "cmd", text: "npm run dev" },
    { type: "blank", text: "" },
    { type: "info", text: "  ▲ Next.js 15.3.0" },
    { type: "info", text: "  - Local:   http://localhost:3000" },
    { type: "info", text: "  - Network: http://192.168.1.5:3000" },
    { type: "success", text: "  ✓ Ready in 812ms" },
    { type: "blank", text: "" },
    { type: "prompt", text: "~/portfolio" },
    { type: "cmd", text: "git log --oneline -3" },
    { type: "git", text: "a8f3d21 feat: add responsive mobile layout" },
    { type: "git", text: "b2e9c05 perf: optimise bundle & tree-shake" },
    { type: "git", text: "c7d1e44 fix: resolve hydration mismatch" },
    { type: "blank", text: "" },
    { type: "prompt", text: "~/portfolio" },
    { type: "cmd", text: "git status" },
    { type: "success", text: "On branch main" },
    { type: "success", text: "nothing to commit, working tree clean ✓" },
    { type: "blank", text: "" },
    { type: "cursor", text: "" },
  ];

  useEffect(() => {
    if (activeTab !== "terminal") {
      setTermLine(0);
      return;
    }
    if (termLine >= terminalLines.length) return;
    const delay = terminalLines[termLine].type === "blank" ? 80 : 60;
    const t = setTimeout(() => setTermLine((l) => l + 1), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, termLine]);

  const lineColor = (type: string) => {
    switch (type) {
      case "prompt":
        return "text-[#7ee787]";
      case "cmd":
        return "text-[#e6edf3]";
      case "info":
        return "text-[#8b949e]";
      case "success":
        return "text-[#7ee787]";
      case "git":
        return "text-[#ffa657]";
      default:
        return "text-[#8b949e]";
    }
  };

  // 3-D tilt on hover
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 180, damping: 22 });
  const springY = useSpring(rotY, { stiffness: 180, damping: 22 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotY.set(x * 10);
    rotX.set(-y * 10);
  };
  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
      }}
      className="mac-window w-full sm:w-[28rem] bg-[#0d1117] text-sm select-none shimmer-card"
    >
      {/* ── Title bar ── */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-white/[0.08]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] block" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] block" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] block" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="text-[#8b949e] text-xs font-mono tracking-wide">
            ~/portfolio — zsh
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-[#161b22] border-b border-white/[0.08]">
        {(["profile", "terminal"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-mono flex items-center gap-1.5 border-r border-white/[0.06] transition-colors ${
              activeTab === tab
                ? "bg-[#0d1117] text-[#e6edf3] border-b-2 border-b-[#2f81f7] -mb-px"
                : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2128]"
            }`}
          >
            {tab === "profile" ? (
              <>
                <span className="text-[#79c0ff] font-bold">TS</span> profile.ts
              </>
            ) : (
              <>
                <span className="text-[#7ee787]">$</span> terminal
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {activeTab === "profile" && (
        <div className="p-5 font-mono text-[13px] leading-[1.75] overflow-x-auto">
          <div className="mb-1 text-[#8b949e] text-xs">{"// — My Profile"}</div>
          <div className="mb-2">
            <span className="text-[#ff7b72]">import </span>
            <span className="text-[#79c0ff]">type </span>
            <span className="text-[#ffa657]">{"{ Developer }"}</span>
            <span className="text-[#ff7b72]"> from </span>
            <span className="text-[#a5d6ff]">&apos;./types&apos;</span>
            <span className="text-[#8b949e]">;</span>
          </div>
          <div>
            <span className="text-[#ff7b72]">const </span>
            <span className="text-[#79c0ff]">me</span>
            <span className="text-[#ff7b72]">: </span>
            <span className="text-[#ffa657]">Developer</span>
            <span className="text-[#8b949e]"> = </span>
            <span className="text-[#e6edf3]">{"{"}</span>
          </div>
          {[
            ["name", '"Ayyappa"', "str"],
            ["role", '"Frontend Developer"', "str"],
            ["location", '"Bengaluru, Karnataka, India"', "str"],
            ["experience", '"5+ Years"', "str"],
            ["stack", '["React", "Next.js", "TypeScript", "Redux"]', "arr"],
            ["openToWork", "true", "bool"],
          ].map(([key, val, type]) => (
            <div key={key} className="ml-5">
              <span className="text-[#7ee787]">{key}</span>
              <span className="text-[#8b949e]">: </span>
              {type === "str" && <span className="text-[#a5d6ff]">{val}</span>}
              {type === "bool" && <span className="text-[#ffa657]">{val}</span>}
              {type === "arr" && (
                <>
                  <span className="text-[#e6edf3]">[</span>
                  {["React", "Next.js", "TypeScript", "Redux"].map(
                    (s, i, arr) => (
                      <span key={s}>
                        <span className="text-[#a5d6ff]">&quot;{s}&quot;</span>
                        {i < arr.length - 1 && (
                          <span className="text-[#8b949e]">, </span>
                        )}
                      </span>
                    ),
                  )}
                  <span className="text-[#e6edf3]">]</span>
                </>
              )}
              <span className="text-[#8b949e]">,</span>
            </div>
          ))}
          <div>
            <span className="text-[#e6edf3]">{"}"}</span>
            <span className="text-[#8b949e]">;</span>
          </div>
          <div className="mt-3">
            <span className="text-[#ff7b72]">export default </span>
            <span className="text-[#79c0ff]">me</span>
            <span className="text-[#8b949e]">;</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#3fb950] pulse-badge flex-shrink-0" />
            <span className="text-[#8b949e]">{"// status: "}</span>
            <span className="text-[#7ee787]">available for work</span>
          </div>
        </div>
      )}

      {/* ── Terminal tab ── */}
      {activeTab === "terminal" && (
        <div className="p-4 font-mono text-[12px] leading-6 min-h-[220px]">
          {terminalLines.slice(0, termLine).map((line, i) => (
            <div key={i} className={lineColor(line.type)}>
              {line.type === "prompt" ? (
                <span>
                  <span className="text-[#7ee787] font-bold">➜</span>
                  <span className="text-[#8b949e]"> {line.text} </span>
                </span>
              ) : line.type === "cmd" ? (
                <span className="text-[#e6edf3]">{line.text}</span>
              ) : line.type === "cursor" ? (
                <span>
                  <span className="text-[#7ee787] font-bold">➜</span>
                  <span className="text-[#8b949e]"> ~/portfolio </span>
                  <span className="inline-block w-2 h-4 bg-[#e6edf3] opacity-80 animate-[blink_1s_step-end_infinite] align-middle" />
                </span>
              ) : (
                <span>{line.text}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Animation variants ─────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Main Hero Section ───────────────────────────────────────────────────────
export default function Home() {
  const typedRole = useTypingEffect(roles);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden dot-grid"
    >
      {/* ── Animated background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-blob absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-500/10 dark:bg-blue-500/8 blur-3xl" />
        <div className="animate-blob-delay-2 absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full bg-purple-500/10 dark:bg-purple-500/8 blur-3xl" />
        <div className="animate-blob-delay-4 absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/8 blur-3xl" />
      </div>

      {/* ── Floating tech icon badges (desktop only) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
        {floatingTechs.map((tech) => (
          <div key={tech.name} className={`absolute ${tech.pos} ${tech.cls}`}>
            <div
              className="tech-float-badge px-3 py-1.5 rounded-xl text-xs font-bold font-mono border border-white/10 shadow-lg backdrop-blur-sm"
              style={{
                background: tech.bg,
                color: tech.color,
                boxShadow: `0 4px 20px ${tech.bg}`,
              }}
            >
              {tech.name}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-8 items-center">
          {/* ── Left: text content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 items-center text-center"
          >
            {/* Status badge */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 w-fit"
            >
              <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 glow-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-badge" />
                Available for work
              </span>
            </motion.div>

            {/* Greeting + name */}
            <motion.div variants={itemVariants}>
              <p className="text-muted-foreground text-lg font-medium flex items-center gap-2 justify-center">
                Hi there
                <span className="inline-block animate-[wiggle_1s_ease-in-out_infinite]">
                  👋
                </span>
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mt-1 leading-tight">
                I&apos;m <span className="gradient-text">Ayyappa</span>
              </h1>
            </motion.div>

            {/* Typing role */}
            <motion.div
              variants={itemVariants}
              className="text-xl sm:text-2xl font-semibold text-muted-foreground"
            >
              <span className="text-foreground">I am a </span>
              <span className="text-primary">{typedRole}</span>
              <span className="cursor-blink text-primary" />
            </motion.div>

            {/* Short bio */}
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground leading-relaxed max-w-md"
            >
              Crafting pixel-perfect, performant web experiences with{" "}
              <span className="text-foreground font-medium">React</span>,{" "}
              <span className="text-foreground font-medium">Next.js</span> &{" "}
              <span className="text-foreground font-medium">TypeScript</span>.
              5+ years turning ideas into delightful UIs.
            </motion.p>

            {/* Meta info */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center"
            >
              <span className="icon-mappin flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                Bengaluru, Karnataka, India
              </span>
              <span className="icon-briefcase flex items-center gap-1.5">
                <Briefcase size={14} className="text-primary" />
                5+ Years Experience
              </span>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 pt-2 justify-center"
            >
              <Link
                href="#contact"
                className="btn-orange btn-click inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                Let&apos;s Connect
              </Link>
              <Link
                href="#projects"
                className="btn-orange-outline btn-click inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                View Projects
              </Link>
              <a
                href="/resume/Ayyappa_Swamy_Angadi_Resume.pdf"
                download
                className="btn-click inline-flex items-center gap-2 px-6 py-3 text-sm rounded-md border border-border bg-card/70 hover:border-primary/40 hover:bg-accent/60 transition-colors text-foreground font-semibold"
              >
                <Download size={14} />
                Download CV
              </a>
            </motion.div>

            {/* Tech stack badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2 justify-center pt-1"
            >
              {[
                "React",
                "Next.js",
                "TypeScript",
                "Redux",
                "Tailwind CSS",
                "Node.js",
              ].map((tech) => (
                <motion.span
                  key={tech}
                  whileHover={{ scale: 1.08, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium cursor-default"
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>

            {/* Quick stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-3 w-full max-w-sm pt-1"
            >
              {[
                { value: 5, suffix: "+", label: "Years Exp." },
                { value: 10, suffix: "+", label: "Projects" },
                { value: 2, suffix: "", label: "Companies" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card/60 p-3 text-center shimmer-card"
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Social links */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 pt-1 justify-center"
            >
              <a
                href="https://github.com/ayyappaswamyangadi"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-github flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/ayyappaswamyangadi"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-linkedin flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:ayyappaswamy50@gmail.com"
                className="icon-mail flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>Email</span>
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right: Mac window card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow under the card */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl pointer-events-none" />
              <MacWindow />
            </div>
          </motion.div>
        </div>

        {/* ── Scroll hint ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="flex justify-center mt-16"
        >
          <div className="bounce-y flex flex-col items-center gap-1 text-xs text-muted-foreground/60">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-border" />
            <span>scroll</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
