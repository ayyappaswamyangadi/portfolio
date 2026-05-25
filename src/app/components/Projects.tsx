"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants, useMotionValue, useSpring } from "framer-motion";
import { ExternalLink, Star, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Project data ─────────────────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    title: "NovaMart — E-Commerce Platform",
    description:
      "A full-featured e-commerce web app with product discovery, cart management, checkout flow, and order tracking. Supports server-side rendering for SEO and real-time inventory updates.",
    tech: ["Next.js", "TypeScript", "Redux Toolkit", "Tailwind CSS", "Node.js", "MongoDB"],
    category: "Full Stack",
    featured: true,
    gradient: "from-blue-500/20 to-cyan-500/20",
    liveUrl: "#",
    githubUrl: "#",
    highlights: ["SSR/SSG for SEO", "Real-time stock updates", "Stripe payment integration"],
  },
  {
    id: 2,
    title: "Pulse — Real-time Chat App",
    description:
      "A modern chat application featuring real-time messaging, typing indicators, read receipts, room-based conversations, and media sharing. Optimised for low-latency communication.",
    tech: ["React", "TypeScript", "Socket.io", "Express.js", "Redux", "Firebase"],
    category: "Real-time",
    featured: true,
    gradient: "from-purple-500/20 to-pink-500/20",
    liveUrl: "#",
    githubUrl: "#",
    highlights: ["WebSocket real-time messaging", "Typing indicators", "File sharing"],
  },
  {
    id: 3,
    title: "InsightBoard — Analytics Dashboard",
    description:
      "An interactive data analytics dashboard with dynamic charts, filterable data tables, date-range comparison, and exportable reports. Built for performance with large datasets.",
    tech: ["React", "TypeScript", "Recharts", "React Query", "Tailwind CSS", "REST API"],
    category: "Dashboard",
    featured: false,
    gradient: "from-green-500/20 to-emerald-500/20",
    liveUrl: "#",
    githubUrl: "#",
    highlights: ["Interactive Recharts visualisations", "Date-range filters", "PDF/CSV export"],
  },
  {
    id: 4,
    title: "Taskflow — Project Management Tool",
    description:
      "A Kanban-style task management app with drag-and-drop boards, team collaboration, deadline tracking, notifications, and role-based access control for teams.",
    tech: ["React", "TypeScript", "Redux", "React DnD", "Node.js", "PostgreSQL"],
    category: "Productivity",
    featured: false,
    gradient: "from-orange-500/20 to-amber-500/20",
    liveUrl: "#",
    githubUrl: "#",
    highlights: ["Drag-and-drop Kanban", "RBAC permissions", "Email notifications"],
  },
  {
    id: 5,
    title: "SkyWatch — Weather Forecast App",
    description:
      "A beautiful weather app with 7-day forecasts, hourly breakdowns, interactive maps, severe weather alerts, and location auto-detection. Fully responsive with PWA support.",
    tech: ["Next.js", "TypeScript", "OpenWeatherMap API", "Tailwind CSS", "Leaflet.js"],
    category: "PWA",
    featured: false,
    gradient: "from-sky-500/20 to-indigo-500/20",
    liveUrl: "#",
    githubUrl: "#",
    highlights: ["7-day forecast", "Interactive maps", "PWA offline support"],
  },
  {
    id: 6,
    title: "Folio — Portfolio Builder",
    description:
      "A drag-and-drop portfolio builder that lets developers create and deploy stunning portfolios in minutes. Supports custom themes, live preview, and one-click Vercel deployment.",
    tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS", "Vercel API"],
    category: "SaaS",
    featured: true,
    gradient: "from-rose-500/20 to-pink-500/20",
    liveUrl: "#",
    githubUrl: "#",
    highlights: ["Drag-and-drop builder", "Live preview", "One-click deploy"],
  },
];

const categories = ["All", "Full Stack", "Real-time", "Dashboard", "Productivity", "PWA", "SaaS"];
const featuredProjects = projects.filter((p) => p.featured);
const PROJECTS_PER_PAGE = 2;

// ─── Motion variants ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const cardGrid: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ─── GitHub SVG ───────────────────────────────────────────────────────────────
function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Folder SVG ───────────────────────────────────────────────────────────────
function FolderIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── Project Card (with 3-D tilt) ────────────────────────────────────────────
function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 200, damping: 22 });
  const springY = useSpring(rotY, { stiffness: 200, damping: 22 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    rotY.set(x * 10);
    rotX.set(-y * 10);
  };
  const onMouseLeave = () => { rotX.set(0); rotY.set(0); };

  return (
    <motion.div
      ref={cardRef}
      variants={cardItem}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="project-card shimmer-card group flex flex-col h-full"
    >
      {/* Gradient preview banner */}
      <div className={`relative h-20 w-full bg-gradient-to-br ${project.gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
        <span className="text-4xl opacity-30 select-none pointer-events-none">
          {project.category === "Full Stack" ? "⚡" :
           project.category === "Real-time"  ? "💬" :
           project.category === "Dashboard"  ? "📊" :
           project.category === "Productivity" ? "📋" :
           project.category === "PWA"         ? "🌤" : "🛠"}
        </span>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="icon-folder text-primary flex-shrink-0">
              <FolderIcon size={20} />
            </span>
            <span className="text-xs font-medium text-muted-foreground bg-accent px-2.5 py-0.5 rounded-full border border-border">
              {project.category}
            </span>
            {project.featured && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Star size={11} className="fill-current" />
                Featured
              </span>
            )}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              className="icon-github btn-click p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <GithubIcon size={14} />
            </a>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Live Demo"
              className="btn-click p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <ExternalLink size={14} className="text-muted-foreground" />
            </a>
          </div>
        </div>

        <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors leading-snug">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
          {project.description}
        </p>

        <ul className="space-y-1 mb-4">
          {project.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/15 font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Featured Carousel ────────────────────────────────────────────────────────
function FeaturedCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
    const firstCard = el.querySelector<HTMLElement>(".featured-card");
    if (firstCard) {
      const cardW = firstCard.offsetWidth + 20;
      setActiveIdx(Math.round(el.scrollLeft / cardW));
    }
  }, []);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(".featured-card");
    const cardW = (firstCard?.offsetWidth ?? 340) + 20;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  };

  return (
    /* Extra horizontal padding keeps arrow buttons inside overflow-hidden section */
    <div className="relative px-10 -mx-2">
      {!atStart && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous project"
          className="btn-click absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateState}
        className="carousel-scroll py-3 px-1"
      >
        {featuredProjects.map((project) => (
          <div
            key={project.id}
            className="featured-card carousel-snap-item"
            style={{ width: "min(340px, calc(92vw - 3rem))" }}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {!atEnd && (
        <button
          onClick={() => scroll(1)}
          aria-label="Next project"
          className="btn-click absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {featuredProjects.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              const el = scrollRef.current;
              const firstCard = el?.querySelector<HTMLElement>(".featured-card");
              if (el && firstCard) {
                el.scrollTo({ left: i * (firstCard.offsetWidth + 20), behavior: "smooth" });
              }
            }}
            className={`rounded-full transition-all duration-300 ${
              activeIdx === i
                ? "w-6 h-2"
                : "w-2 h-2 bg-border hover:bg-muted-foreground"
            }`}
            style={
              activeIdx === i
                ? { background: "linear-gradient(90deg, #FFC25F, #F99900)" }
                : undefined
            }
            aria-label={`Go to project ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Projects Section ─────────────────────────────────────────────────────────
export function Projects() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);

  const filtered =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / PROJECTS_PER_PAGE);
  const visibleProjects = filtered.slice(
    currentPage * PROJECTS_PER_PAGE,
    (currentPage + 1) * PROJECTS_PER_PAGE,
  );

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(0);
  };

  return (
    <section id="projects" className="relative py-24 px-4 overflow-hidden dot-grid">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-2">
            My work
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold section-heading center mb-6">
            Featured Projects
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A selection of things I&apos;ve built — from SaaS products and real-time apps to
            dashboards and PWAs. Each project reflects production-grade thinking.
          </p>
        </motion.div>

        {/* ── Featured carousel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <FeaturedCarousel />
        </motion.div>

        {/* ── All projects with filter ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold mb-6 text-center">All Projects</h3>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`btn-click px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "text-[#1a1000]"
                    : "text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground rounded-full"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        borderRadius: "5px",
                        border: "2px solid #EAA22F",
                        background:
                          "linear-gradient(180deg, #FFC25F 0%, #FF9E00 53.12%, #F99900 100%)",
                      }
                    : undefined
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Project grid — 2 per page */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${currentPage}`}
            variants={cardGrid}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              aria-label="Previous page"
              className="btn-click w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                aria-label={`Page ${i + 1}`}
                className="btn-click rounded-full transition-all duration-300 font-semibold text-xs"
                style={
                  currentPage === i
                    ? {
                        width: "2rem",
                        height: "2rem",
                        background: "linear-gradient(180deg, #FFC25F 0%, #F99900 100%)",
                        border: "2px solid #EAA22F",
                        color: "#1a1000",
                      }
                    : {
                        width: "2rem",
                        height: "2rem",
                        background: "transparent",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--muted-foreground))",
                      }
                }
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              aria-label="Next page"
              className="btn-click w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Page info ── */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          Showing {currentPage * PROJECTS_PER_PAGE + 1}–
          {Math.min((currentPage + 1) * PROJECTS_PER_PAGE, filtered.length)} of {filtered.length} projects
        </p>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Want to see more? Check out my GitHub for all projects.
          </p>
          <a
            href="https://github.com/ayyappaswamyangadi"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-github btn-orange-outline btn-click inline-flex items-center gap-2 px-6 py-3 text-sm"
          >
            <GithubIcon size={16} />
            View GitHub Profile
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
}
