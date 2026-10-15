// Shared, static resume content — the dynamic bits (experience durations)
// are computed at request time in the /api/resume route from src/lib/experience.ts
// so the PDF a recruiter downloads always reflects the current month, not a
// number baked in whenever this file was last edited.
//
// Keep this in sync with resume/resume.html (the design-reference/offline
// copy) and src/app/components/About.tsx when either changes — they should
// all tell the same story about skills and experience.

export const RESUME_CONTACT = {
  name: "AYYAPPA SWAMY ANGADI",
  title: "Senior Frontend Engineer — React · Next.js · TypeScript · AI-Assisted Development",
  location: "Bengaluru, Karnataka, India",
  phone: "+91 87925 94229",
  email: "ayyappaswamy50@gmail.com",
  portfolio: "https://www.ayyappa.dev",
  linkedin: "https://linkedin.com/in/ayyappaswamyangadi",
  github: "https://github.com/ayyappaswamyangadi",
};

export type ResumeSegment = { text: string; bold?: boolean };

// Shared by both PDF renderers so the summary can't drift between them.
// Leads with engineering experience and shipped products; AI-assisted
// development is the closing advantage, not the headline.
export function resumeSummary(
  totalExperienceLabel: string,
  reviseDurationLabel: string,
): ResumeSegment[] {
  return [
    { text: "Senior Frontend Engineer with " },
    { text: `${totalExperienceLabel} of experience`, bold: true },
    { text: " (" },
    { text: `${reviseDurationLabel} at Revise`, bold: true },
    {
      text: ") building production web and mobile products with React, Next.js and TypeScript — from ",
    },
    { text: "real-time trading and streaming AI interfaces", bold: true },
    { text: " to " },
    { text: "learning platforms and business websites", bold: true },
    {
      text: ". Owns features end to end, from architecture and API contracts to polished UI, and ships fast, maintainable code. Uses AI-assisted development (Claude Code) to deliver faster while reviewing every change. Open to on-site, hybrid and remote roles.",
    },
  ];
}

// Strongest skills first — what I'd be hired for leads.
export const RESUME_SKILLS: { label: string; items: string }[] = [
  {
    label: "Frontend",
    items: "React.js, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3",
  },
  {
    label: "Styling & UI",
    items:
      "Tailwind CSS, Styled-Components, Framer Motion, Responsive Design",
  },
  {
    label: "State & Data",
    items:
      "Redux Toolkit, React Query, Context API, React Hook Form, Zod, REST APIs, WebSockets, Server-Sent Events",
  },
  {
    label: "Performance",
    items:
      "Code Splitting, Lazy Loading, Memoization, Bundle Optimization, Core Web Vitals",
  },
  {
    label: "Tooling & Deployment",
    items: "Git & GitHub, Vite, Webpack, npm, Vercel",
  },
  {
    label: "AI-Assisted Development",
    items: "Claude Code, Agentic Workflows, AI Code Review, Prompt Engineering",
  },
  {
    label: "Testing (beginner)",
    items: "Vitest, React Testing Library",
  },
  {
    label: "Backend (beginner)",
    items: "Node.js, Express.js",
  },
];

// Each bullet: product + proof point, what I built, the hard part.
export const RESUME_EXPERIENCE: {
  role: string;
  org: string;
  dateLabel: string;
  bullets: string[];
}[] = [
  {
    role: "Frontend Engineer",
    org: "Revise — Mumbai, India (Remote)",
    dateLabel: "May 2022 – Present",
    bullets: [
      "Grass: Code Agent Computer (live on the App Store) — Built the app for running and steering Claude Code and OpenCode sessions from a phone: resumable streaming chat that survives backgrounding and dropped networks, a tool-approval queue with push notifications, and one-tap switching between machines. First project built with AI-assisted development (Claude Code).",
      "10X Trade — Built the trading interface for leveraged crypto futures in a Telegram Mini App: live WebSocket market data driving real-time profit-and-loss and charts, with orders signed on the user's device.",
      "TaxAI (launched on Product Hunt) — Built the research interface for chartered accountants: answers stream in beside the source Act, and each citation jumps to and highlights the exact section or proviso.",
      "Convo (launched on Product Hunt) — Built the developer dashboard for an LLM-memory SDK: magic-link sign-in, an infinite-scroll thread explorer and API key management.",
      "Own frontend architecture and API contracts with backend engineers, and review code across the team.",
    ],
  },
  {
    role: "Software Developer",
    org: "Chools Consultancy Services — Bengaluru, India (Onsite)",
    dateLabel: "Oct 2020 – Jan 2022",
    bullets: [
      "Built and maintained chools.in, the company's WordPress learning and consulting platform — course catalog, programme pages, learner accounts and course checkout.",
      "Customised WordPress themes and plugins for client-specific e-learning requirements.",
      "Delivered responsive, cross-browser websites in HTML, CSS and JavaScript from client wireframes.",
    ],
  },
];

// Personal and client projects only — professional products live under
// Experience above, so nothing here repeats them.
export const RESUME_PROJECTS: { name: string; tech: string; desc: string }[] = [
  {
    name: "Resume Builder",
    tech: "Next.js, React, Tailwind CSS, Firebase, Zustand.",
    desc: "Built solo, end to end: 50+ ATS-friendly templates, live preview, AI writing help, PDF export and autosave.",
  },
  {
    name: "URL Shortener",
    tech: "React, Node.js, Express, REST API.",
    desc: "Built solo, end to end: React frontend, Node.js/Express API and database, with searchable link history.",
  },
  {
    name: "Bilingual Registration Form (client)",
    tech: "React, Google Drive API, jsPDF.",
    desc: "Built solo for a client, requirements to launch: English/Kannada intake form with PDF/image export and Google Drive saving.",
  },
];

export const RESUME_EDUCATION = {
  degree: "Bachelor of Engineering — Electronics and Communication Engineering",
  school: "Visvesvaraya Technological University, 2019",
  cgpa: "CGPA: 6.0 / 10",
};
