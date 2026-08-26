"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  type Variants,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gaEvent } from "@/lib/gtag";
import { DownloadCvButton } from "./DownloadCvButton";

// WebGL scene needs the browser's canvas/GL context — load client-only.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

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
            onClick={() => {
              setActiveTab(tab);
              gaEvent({ action: "click", category: "hero_mac_window", label: `${tab}_tab` });
            }}
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
            ["role", '"Frontend Engineer"', "str"],
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
      className="relative min-h-dvh flex items-center justify-center px-4 py-20 overflow-hidden dot-grid"
    >
      {/* ── Animated background blobs ──
          Previously hardcoded indigo/violet/cyan in both themes — an
          unrelated color trio that never matched dark mode's navy & gold
          palette. These now use the theme's own --primary hue (violet in
          light, gold in dark) at varying opacity instead. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-blob absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "hsl(var(--primary) / 0.12)" }}
        />
        <div
          className="animate-blob-delay-2 absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: "hsl(var(--primary) / 0.08)" }}
        />
        <div
          className="animate-blob-delay-4 absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full blur-3xl"
          style={{ background: "hsl(var(--primary) / 0.10)" }}
        />
      </div>

      {/* ── WebGL "AI core" — distorted blob + orbit rings + sparkles ──
          Desktop only: on mobile the layout stacks to one column, so a
          full-bleed canvas here would render directly behind (and wash
          out) the stacked hero text instead of sitting in its own column.
          The wrapper itself is hard-capped to the right half of the
          section (not just masked) so the glow can never bleed past the
          midline into the text column — a mask alone isn't enough here
          because CSS radial-gradient ellipse sizes are radii, not
          diameters, so it's easy to under-shrink the visible falloff. */}
      <div
        className="absolute inset-y-0 right-0 w-full lg:w-1/2 pointer-events-none hidden lg:block overflow-hidden"
        aria-hidden="true"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 75% at 62% 46%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 75% at 62% 46%, black 25%, transparent 85%)",
        }}
      >
        <HeroScene />
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
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mt-1 leading-[1.05]">
                I&apos;m <span className="gradient-text">Ayyappa</span>
                <span className="sr-only">
                  {" "}— Frontend Developer, Web Developer &amp; React/Next.js
                  Engineer
                </span>
              </h1>
            </motion.div>

            {/* Typing role */}
            <motion.div
              variants={itemVariants}
              className="text-xl sm:text-2xl font-semibold text-muted-foreground"
            >
              <span className="text-foreground">I am a </span>
              <span className="text-primary" aria-hidden="true">
                {typedRole}
              </span>
              <span className="cursor-blink text-primary" aria-hidden="true" />
              <span className="sr-only">
                Frontend Engineer, React &amp; Next.js Developer, TypeScript
                Specialist, UI Performance Optimizer, Scalable Frontend
                Architect
              </span>
            </motion.div>

            {/* Short bio */}
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground leading-relaxed max-w-md"
            >
              I&apos;m a{" "}
              <span className="text-foreground font-medium">
                Frontend Engineer
              </span>{" "}
              and{" "}
              <span className="text-foreground font-medium">
                Web Developer
              </span>{" "}
              crafting pixel-perfect, performant web experiences with{" "}
              <span className="text-foreground font-medium">React</span>,{" "}
              <span className="text-foreground font-medium">Next.js</span>,{" "}
              <span className="text-foreground font-medium">JavaScript</span>{" "}
              &amp;{" "}
              <span className="text-foreground font-medium">TypeScript</span>.
              5+ years turning ideas into scalable, optimised, delightful UIs
              with strong problem-solving.
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
                onClick={() =>
                  gaEvent({ action: "click", category: "hero_cta", label: "lets_connect" })
                }
                className="btn-primary btn-click inline-flex items-center gap-2 px-6 py-3 text-sm"
              >
                Let&apos;s Connect
              </Link>
              <DownloadCvButton
                gaLabel="hero_download_cv"
                className="btn-click inline-flex items-center gap-2 px-6 py-3 text-sm rounded-md border border-border bg-card/70 hover:border-primary/40 hover:bg-accent/60 transition-colors text-foreground font-semibold"
              />
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
              <div
                className="absolute -inset-4 rounded-2xl blur-2xl pointer-events-none opacity-20"
                style={{ background: "var(--btn-gradient)" }}
              />
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
