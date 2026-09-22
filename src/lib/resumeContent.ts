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
  title: "Frontend Engineer — React.js / Next.js / TypeScript",
  location: "Bengaluru, Karnataka, India",
  phone: "+91 87925 94229",
  email: "ayyappaswamy50@gmail.com",
  portfolio: "https://www.ayyappa.dev",
  linkedin: "https://linkedin.com/in/ayyappaswamyangadi",
  github: "https://github.com/ayyappaswamyangadi",
};

export const RESUME_SKILLS: { label: string; items: string }[] = [
  {
    label: "Frontend Development",
    items:
      "React.js, Next.js, JavaScript (ES6+), TypeScript, React Hooks, Context API, Performance Optimization (Code Splitting, Lazy Loading, Web Vitals)",
  },
  {
    label: "UI & Styling",
    items:
      "Tailwind CSS, Styled-Components, Material UI, Bootstrap, Framer Motion, Responsive Design",
  },
  {
    label: "State & Forms",
    items: "Redux, Redux Toolkit, React Hook Form, Zod (schema validation)",
  },
  {
    label: "AI-Augmented Development",
    items:
      "Claude Code, AI Pair Programming, Prompt Engineering, Agentic Dev Workflows, AI Code Review",
  },
  {
    label: "Backend & APIs (working knowledge)",
    items: "Node.js, Express.js, RESTful APIs, Axios",
  },
  {
    label: "Tools & Workflow",
    items: "Git, GitHub, CI/CD Pipelines, Webpack, Vite, ESLint, Agile / Scrum",
  },
];

export const RESUME_EXPERIENCE: {
  role: string;
  org: string;
  dateLabel: string;
  bullets: string[];
}[] = [
  {
    role: "Frontend Developer / Engineer",
    org: "Revise — Mumbai, India (Remote)",
    dateLabel: "May 2022 – Present",
    bullets: [
      "Built 10X Trade, a Telegram Mini App perp-futures trading terminal on the dYdX v4 protocol — a live WebSocket engine drives real-time PnL and Chart.js price charts, with non-custodial Cosmos/Ethereum wallet signing for leveraged order execution.",
      "Built AskFinance, a RAG-based AI chat app for querying financial/SEC documents — WebSocket-streamed responses with auto-reconnect, and citation chips that deep-link a synchronized PDF viewer to the exact source page.",
      "Architecting GRASS, a React Native/Expo app for remotely driving AI coding agents (Claude Code, OpenCode) — hand-rolled SSE streaming, QR-code device pairing, and real-time tool-use permission approvals.",
      "Built the dashboard for Convo, an LLM-agent memory/persistence API — magic-link authentication, infinite-scroll thread browsing, and full API-key lifecycle management.",
      "Drive frontend architecture decisions and REST API integration with backend teams; mentor junior developers and run code reviews — shipped multiple production releases with zero critical defects.",
    ],
  },
  {
    role: "Software Developer",
    org: "Chools Consultancy Services — Bengaluru, India (Onsite)",
    dateLabel: "Oct 2020 – Jan 2022",
    bullets: [
      "Built and maintained WordPress-based LMS websites — course delivery, learner progress tracking, and administrative management.",
      "Customized WordPress themes and plugins to client-specific e-learning requirements.",
      "Delivered responsive, cross-browser static sites in pure HTML/CSS/JavaScript, translating client wireframes into polished, production pages.",
    ],
  },
];

export const RESUME_PROJECTS: { name: string; tech: string; desc: string }[] = [
  {
    name: "Web3 Trading Dashboard",
    tech: "React.js, Web3.js, Ethers.js, MetaMask, REST APIs.",
    desc: "Built a MetaMask-integrated dashboard for wallet authentication, transaction signing, and real-time trade execution, with secure network-switching and gas-fee handling.",
  },
  {
    name: "API Key Management Dashboard",
    tech: "React.js, REST APIs, Axios.",
    desc: "Built a full-CRUD API key management tool with role-based access control, real-time usage metrics, and robust client-side validation.",
  },
  {
    name: "Business Portfolio & Admin Dashboard",
    tech: "React.js, Responsive Design.",
    desc: "Delivered a fully responsive portfolio and admin dashboard for a photography studio client, with optimized images and load performance across devices.",
  },
];

export const RESUME_EDUCATION = {
  degree: "Bachelor of Engineering — Electronics and Communication Engineering",
  school: "Visvesvaraya Technological University, 2019",
  cgpa: "CGPA: 6.0 / 10",
};
