"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ExternalLink, Star, ChevronLeft, ChevronRight, Clock, ImageOff } from "lucide-react";
import { gaEvent } from "@/lib/gtag";

// ─── Project data ─────────────────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    title: "YouTube Clone",
    description:
      "A pixel-close clone of YouTube's web UI — home feed, sidebar navigation, category chips, notifications panel, and a Shorts rail. Focused on nailing YouTube's layout, dark theme, and micro-interactions.",
    tech: ["React", "Tailwind CSS", "React Router"],
    category: "UI Clone",
    featured: true,
    image: "/projects/youtube-clone.jpg",
    liveUrl: "https://youtube-clone-plum-nine.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/youtube-clone",
    highlights: ["Home feed + category chips", "Notifications & Shorts rail", "Dark-theme, fully responsive"],
  },
  {
    id: 2,
    title: "TaskFlow — Todo App",
    description:
      "A clean task manager with priority levels, due dates, live search, status filters (All/Active/Completed) and a progress bar that tracks completion in real time.",
    tech: ["React", "Tailwind CSS", "Local Storage"],
    category: "Productivity",
    featured: false,
    image: "/projects/taskflow.jpg",
    liveUrl: "https://todo-list-gamma-two-83.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/todo-list",
    highlights: ["Priority & due-date tagging", "Search + status filters", "Persistent local storage"],
  },
  {
    id: 3,
    title: "Ayyappa & Nayana — Wedding Invitation",
    description:
      "A fully animated digital wedding invitation — countdown, couple's story, multi-event timeline, photo gallery with lightbox, embedded venue maps, and a guest wishes wall people can post to live.",
    tech: ["React", "Tailwind CSS", "Framer Motion"],
    category: "Personal",
    featured: true,
    image: "/projects/wedding-invitation.jpg",
    liveUrl: "https://wedding-invitation-five-pi.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/wedding-invitation",
    highlights: ["Multi-event ceremony timeline", "Photo gallery + guest wishes wall", "Embedded maps & background music"],
  },
  {
    id: 4,
    title: "URL Shortener",
    description:
      "A full-stack link shortener — paste a long URL and get an instant short link backed by a real API and database, with a searchable history of everything you've shortened. The React frontend and the Node/Express backend are deployed and hosted independently of each other.",
    tech: ["React", "Node.js", "Express", "REST API"],
    category: "Full Stack",
    featured: true,
    image: "/projects/url-shortener.jpg",
    liveUrl: "https://url-shortener-pi-mauve.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/url-shortener",
    highlights: ["Live backend link generation", "Searchable recent-URLs history", "Copy-to-clipboard sharing"],
  },
  {
    id: 5,
    title: "Sarvadharma Marriage Bureau — Registration Form",
    description:
      "A bilingual (English/Kannada) digital registration form built for a real matrimony bureau client, replacing their paper intake process. Exports each submission as an image or PDF and saves it straight to Drive.",
    tech: ["React", "html2canvas", "jsPDF", "Google Drive API"],
    category: "Client Work",
    featured: false,
    image: "/projects/matrimony-form.jpg",
    liveUrl: "https://matrimony-registration-form.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/matrimony-registration-form",
    highlights: ["English / Kannada language toggle", "Export as image or PDF", "Google Drive auto-save"],
  },
  {
    id: 6,
    title: "Personal Shopping List",
    description:
      "A no-friction grocery list app for tracking items, quantities, and prices with a running total in rupees — built for quick day-to-day use rather than heavyweight project management.",
    tech: ["React", "React Router", "Tailwind CSS"],
    category: "Utility",
    featured: false,
    image: "/projects/shopping-list.jpg",
    liveUrl: "https://personal-product-list.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/personal-product-list",
    highlights: ["Quantity + price tracking", "Running total in ₹", "Add / remove items instantly"],
  },
  {
    id: 7,
    title: "Facebook Clone",
    description:
      "A recreation of Facebook's sign-up and authentication flow, including a real OTP-based email verification step — built to practice matching a large, familiar product's UI and auth UX exactly. A Node.js backend generates, emails, and validates each OTP server-side, so the signup flow works end to end.",
    tech: ["React", "Tailwind CSS", "Node.js", "OTP Verification"],
    category: "Full Stack",
    featured: false,
    image: "/projects/facebook-clone.jpg",
    liveUrl: "https://facebook-clone-chi-coral.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/facebook-clone",
    highlights: ["Sign-up + login UI", "Real OTP email verification", "Faithful layout & styling"],
  },
];

const categories = ["All", "UI Clone", "Full Stack", "Productivity", "Utility", "Personal", "Client Work"];
const featuredProjects = projects.filter((p) => p.featured);
const PROJECTS_PER_PAGE = 2;

// ─── Motion variants ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
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

// ─── Flip Project Card ────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  const [flipped, setFlipped] = useState(false);
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">("loading");

  // Hover drives the flip on desktop; on touch devices (no hover) tap toggles it instead.
  const handleTap = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) return;
    setFlipped((f) => !f);
  };

  return (
    <div
      className="group h-[420px]"
      style={{ perspective: "1400px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={handleTap}
    >
      <motion.div
        variants={cardItem}
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── Front: landing screenshot ── */}
        <div
          className="project-card shimmer-card flex flex-col"
          style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}
        >
          <div className="relative flex-1 w-full overflow-hidden">
            {imgStatus !== "error" && (
              <Image
                src={project.image}
                alt={`${project.title} landing screen`}
                fill
                sizes="(max-width: 640px) 92vw, 340px"
                className={`object-cover object-top transition-opacity duration-300 ${
                  imgStatus === "loaded" ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImgStatus("loaded")}
                onError={() => setImgStatus("error")}
              />
            )}

            {/* Skeleton while the screenshot is still loading (slow network) */}
            {imgStatus === "loading" && (
              <div className="absolute inset-0 skeleton-pulse" aria-hidden="true" />
            )}

            {/* Fallback if the screenshot fails to load */}
            {imgStatus === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-accent text-muted-foreground">
                <ImageOff size={22} />
                <span className="text-xs">Preview unavailable</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            {project.featured && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-amber-300 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
                <Star size={11} className="fill-current" />
                Featured
              </span>
            )}
            <span className="absolute top-3 left-3 text-xs font-medium text-white/90 bg-black/50 backdrop-blur px-2.5 py-0.5 rounded-full border border-white/10">
              {project.category}
            </span>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-base text-white leading-snug drop-shadow">
                {project.title}
              </h3>
              <p className="text-xs text-white/70 mt-1">Hover to see details</p>
            </div>
          </div>
        </div>

        {/* ── Back: details ── */}
        <div
          className="project-card project-card-back flex flex-col p-6"
          onWheel={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-muted-foreground bg-accent px-2.5 py-0.5 rounded-full border border-border">
              {project.category}
            </span>
            <div className="flex gap-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  onClick={(e) => {
                    e.stopPropagation();
                    gaEvent({ action: "click", category: "project_link", label: `github_${project.title}` });
                  }}
                  className="icon-github btn-click p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                >
                  <GithubIcon size={14} />
                </a>
              )}
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Live Demo"
                onClick={(e) => {
                  e.stopPropagation();
                  gaEvent({ action: "click", category: "project_link", label: `live_demo_icon_${project.title}` });
                }}
                className="btn-click p-1.5 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-colors"
              >
                <ExternalLink size={14} className="text-muted-foreground" />
              </a>
            </div>
          </div>

          <h3 className="font-bold text-base mb-2 leading-snug">{project.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {project.description}
          </p>

          <ul className="space-y-1 mb-4">
            {project.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/15 font-medium"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-border">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
              <Clock size={11} className="flex-shrink-0" />
              First load may be a little slow — hosted on free-tier services.
            </p>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                gaEvent({ action: "click", category: "project_link", label: `view_live_demo_${project.title}` });
              }}
              className="btn-click w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-[#1a1000]"
              style={{
                background: "linear-gradient(180deg, #FFC25F 0%, #FF9E00 53.12%, #F99900 100%)",
              }}
            >
              <ExternalLink size={14} />
              View Live Demo
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Featured Carousel ────────────────────────────────────────────────────────
function FeaturedCarousel() {
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const updateState = () => {
    const el = scrollRef;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
    const firstCard = el.querySelector<HTMLElement>(".featured-card");
    if (firstCard) {
      const cardW = firstCard.offsetWidth + 20;
      setActiveIdx(Math.round(el.scrollLeft / cardW));
    }
  };

  const scroll = (dir: number) => {
    const el = scrollRef;
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
        ref={setScrollRef}
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
              const el = scrollRef;
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
            Real, deployed projects — from UI clones and a client&apos;s matrimony intake form to a
            full-stack URL shortener. Hover any card to flip it and see the details.
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
            onClick={() =>
              gaEvent({ action: "click", category: "social", label: "github_profile_projects_cta" })
            }
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
