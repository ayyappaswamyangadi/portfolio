// Single source of truth for project content: the client-side grid/carousel in
// Projects.tsx and the server-rendered JSON-LD in StructuredData.tsx both read
// this, so crawlers see every project even though the grid paginates.
//
// Order matters — it's the order recruiters see. Shipped professional
// products first, then client work, then personal projects.

export type ProjectKind = "Professional" | "Client Work" | "Personal";

export type Project = {
  id: number;
  title: string;
  /** One-line product pitch shown on the card front and in JSON-LD. */
  tagline: string;
  /** The problem and what the product does about it. */
  description: string;
  /** What I personally built — the part a hiring manager is reading for.
   *  For solo client/personal projects these are the product's key features,
   *  since the whole app is mine. */
  highlights: string[];
  /** Solo projects: every part of the build I owned, e.g. design, backend. */
  ownership?: string[];
  tech: string[];
  kind: ProjectKind;
  /** e.g. "Frontend Engineer · Revise", or how a personal project was built. */
  role?: string;
  /** Short proof point, e.g. "Live on the App Store". */
  status?: string;
  featured: boolean;
  image: string;
  /** Logos/artwork are letterboxed on `imageBg` instead of cropped. */
  imageFit?: "cover" | "contain";
  imageBg?: string;
  imagePosition?: string;
  liveUrl?: string;
  liveLabel?: string;
  appStoreUrl?: string;
  productHuntUrl?: string;
  githubUrl?: string;
  /** Personal projects on free hosting tiers can cold-start slowly. */
  freeTierHosting?: boolean;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "Grass: Code Agent Computer",
    tagline: "Run and steer Claude Code and OpenCode sessions from your phone",
    description:
      "AI coding agents stall when the laptop sleeps or a tool call needs approval. Grass runs them on an always-on cloud VM or the developer's own machine and puts the whole session — chat, approvals and code diffs — in an iPhone app.",
    highlights: [
      "Resumable streaming chat over Server-Sent Events that reconnects and replays missed events after the app is backgrounded or the network drops",
      "A permission queue to approve or deny agent tool calls across every session, with push notifications",
      "One-tap switching between the cloud VM, laptops paired by QR code and remote servers",
      "Repo browser, per-file diff review, GitHub repo cloning and image attachments",
      "Built with AI-assisted development — Claude Code as a pair programmer, with every change reviewed by me",
    ],
    tech: ["React Native", "Expo", "TypeScript", "Server-Sent Events", "Claude Code (AI-assisted)"],
    kind: "Professional",
    role: "Frontend Engineer · Revise",
    status: "Live on the App Store · Android waitlist",
    featured: true,
    image: "/projects/grass.jpg",
    imagePosition: "65% center",
    liveUrl: "https://codeongrass.com/",
    liveLabel: "Visit Website",
    appStoreUrl: "https://apps.apple.com/in/app/grass-code-agent-computer/id6761881356",
    productHuntUrl:
      "https://www.producthunt.com/products/grass-claude-code-from-your-phone?launch=grass-2-0",
  },
  {
    id: 2,
    title: "TaxAI — AI Research Assistant for CAs",
    tagline: "Source-cited answers from India's Income Tax Act",
    description:
      "Chartered accountants can't rely on chatbots that invent case law or skip provisos. TaxAI answers questions from India's Income Tax Act (as amended in 2025) and shows the exact section or proviso behind every answer.",
    highlights: [
      "Split-screen research view: the answer streams in on one side while the source Act opens on the other",
      "Citations that jump to the exact clause and highlight it in the document viewer",
      "In-document search and page navigation, so professionals can verify an answer in seconds",
    ],
    tech: ["React", "TypeScript", "Streaming UI", "Document Viewer"],
    kind: "Professional",
    role: "Frontend Engineer · Revise",
    status: "Launched on Product Hunt",
    featured: true,
    image: "/projects/taxai.jpg",
    imagePosition: "left top",
    productHuntUrl: "https://www.producthunt.com/products/taxai",
  },
  {
    id: 3,
    title: "Convo — LLM Memory Dashboard",
    tagline: "Developer dashboard for a memory and observability SDK for AI agents",
    description:
      "Teams building LangGraph agents had to run their own database just to save conversation state. Convo replaces that with one line of code and logs every conversation. I built the developer dashboard where teams inspect threads and manage API keys.",
    highlights: [
      "Passwordless magic-link sign-in with protected routes and automatic sign-out on expired sessions",
      "Thread explorer with infinite scroll, thread search, and expandable messages and metadata",
      "API key management: create, copy, rename and revoke keys, with usage per key",
    ],
    tech: ["React", "TypeScript", "Vite", "React Router", "Styled-Components", "Axios"],
    kind: "Professional",
    role: "Frontend Engineer · Revise",
    status: "Launched on Product Hunt",
    featured: true,
    image: "/projects/convo.jpg",
    imagePosition: "left top",
    productHuntUrl:
      "https://www.producthunt.com/products/convo-5?launch=convo-3efc563d-7493-45dd-bd12-b1f6e1862fb2",
  },
  {
    id: 4,
    title: "10X Trade — Futures Trading in Telegram",
    tagline: "Leveraged crypto futures trading inside a Telegram Mini App",
    description:
      "Crypto futures trading usually means a desktop exchange and a seed phrase. 10X Trade brought leveraged trading on the dYdX v4 protocol into Telegram as a Mini App, with a wallet created and PIN-protected on the user's device.",
    highlights: [
      "Live market data over WebSockets driving real-time profit-and-loss and interactive price charts",
      "One-tap orders with 1x–10x leverage, signed in the browser — keys never leave the device",
      "USDC deposits and withdrawals with on-chain transaction tracking",
      "AI market insights, referrals, rewards and shareable profit cards",
    ],
    tech: ["React", "TypeScript", "WebSockets", "Chart.js", "Ethers.js", "Styled-Components"],
    kind: "Professional",
    role: "Frontend Engineer · Revise",
    status: "Shipped to production · Since retired",
    featured: true,
    image: "/projects/10x-trade.png",
    imageFit: "contain",
    imageBg: "#000000",
  },
  {
    id: 5,
    title: "Chools — Learning & Consulting Platform",
    tagline: "Course catalog, learner accounts and checkout for a training company",
    description:
      "Chools sells professional courses and consulting programmes to working professionals and companies. I built and maintained its WordPress platform: the course catalog, programme pages, learner accounts and checkout.",
    highlights: [
      "Course catalog and programme pages for Lean Six Sigma, PMP, data, cloud and more",
      "Learner registration, login, course cart and checkout",
      "Custom theme and plugin work, plus responsive pages built from client wireframes",
    ],
    tech: ["WordPress", "HTML5", "CSS3", "JavaScript"],
    kind: "Professional",
    role: "Software Developer · Chools",
    status: "Live",
    featured: false,
    image: "/projects/chools.jpg",
    liveUrl: "https://chools.in/",
    liveLabel: "Visit Website",
  },
  {
    id: 6,
    title: "Sarvadharma Marriage Bureau — Registration Form",
    tagline: "Bilingual digital intake form that replaced a client's paper process",
    description:
      "I took this client project from requirements to launch on my own: a bilingual (English and Kannada) registration form that replaced a matrimony bureau's paper intake process. Each submission can be exported as an image or PDF and is saved straight to Google Drive.",
    highlights: [
      "English / Kannada language toggle",
      "Export to image or PDF",
      "Automatic save to Google Drive",
    ],
    tech: ["React", "html2canvas", "jsPDF", "Google Drive API"],
    ownership: ["Requirements", "UI design", "Frontend", "Google Drive integration", "Deployment"],
    kind: "Client Work",
    role: "Client project · designed and built end to end",
    featured: false,
    image: "/projects/matrimony-form.jpg",
    liveUrl: "https://matrimony-registration-form.vercel.app/",
    liveLabel: "View Live Demo",
    freeTierHosting: true,
  },
  {
    id: 7,
    title: "Resume Builder",
    tagline: "ATS-friendly resume builder with live preview and PDF export",
    description:
      "A free resume builder I designed, built and deployed on my own, with 50+ ATS-friendly templates and a real-time preview. Users can customise fonts, colours, spacing and section order, get AI help writing summaries and bullet points, and export a pixel-perfect PDF — with autosave to their account.",
    highlights: [
      "50+ ATS-friendly templates",
      "Live preview and pixel-perfect PDF export",
      "AI writing help for summaries and bullet points",
      "Account sign-in with autosave",
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "Firebase", "Zustand"],
    ownership: ["Product design", "Frontend", "Auth & data (Firebase)", "PDF export", "Deployment"],
    kind: "Personal",
    role: "Personal project · designed and built end to end",
    featured: false,
    image: "/projects/resume-builder.png",
    liveUrl: "https://resume-builder-nextjs-alpha.vercel.app/",
    liveLabel: "View Live Demo",
    githubUrl: "https://github.com/ayyappaswamyangadi/resume-builder-nextjs",
    freeTierHosting: true,
  },
  {
    id: 8,
    title: "URL Shortener",
    tagline: "Full-stack link shortener with a searchable history",
    description:
      "A full-stack link shortener I built solo: paste a long URL and get a short link instantly, with a searchable history of everything you've shortened. I wrote both the React frontend and the Node.js/Express API and database layer, and deployed each separately.",
    highlights: [
      "Short-link generation through a live backend API",
      "Searchable history of recent links",
      "One-click copy to clipboard",
    ],
    tech: ["React", "Node.js", "Express", "REST API"],
    ownership: ["UI design", "React frontend", "Node.js API", "Database", "Deployment"],
    kind: "Personal",
    role: "Personal project · designed and built end to end",
    featured: false,
    image: "/projects/url-shortener.jpg",
    liveUrl: "https://url-shortener-pi-mauve.vercel.app/",
    liveLabel: "View Live Demo",
    githubUrl: "https://github.com/ayyappaswamyangadi/url-shortener",
    freeTierHosting: true,
  },
  {
    id: 9,
    title: "Facebook Clone",
    tagline: "Sign-up and login flow with real email OTP verification",
    description:
      "My full-stack recreation of Facebook's sign-up and login flow with real email verification. I built both the React frontend and the Node.js backend that generates, emails and checks a one-time password, so the whole sign-up flow works end to end.",
    highlights: [
      "Sign-up and login screens matching the original",
      "Email OTP verification handled by a Node.js backend",
      "Responsive layout and styling",
    ],
    tech: ["React", "Tailwind CSS", "Node.js", "OTP Verification"],
    ownership: ["UI", "React frontend", "Node.js OTP backend", "Deployment"],
    kind: "Personal",
    role: "Personal project · designed and built end to end",
    featured: false,
    image: "/projects/facebook-clone.jpg",
    liveUrl: "https://facebook-clone-chi-coral.vercel.app/",
    liveLabel: "View Live Demo",
    githubUrl: "https://github.com/ayyappaswamyangadi/facebook-clone",
    freeTierHosting: true,
  },
];

/** The best public link for a project, for the card CTA and JSON-LD. */
export function primaryLink(p: Project): { url: string; label: string } | null {
  if (p.liveUrl) return { url: p.liveUrl, label: p.liveLabel ?? "View Live" };
  if (p.appStoreUrl) return { url: p.appStoreUrl, label: "App Store" };
  if (p.productHuntUrl) return { url: p.productHuntUrl, label: "View on Product Hunt" };
  if (p.githubUrl) return { url: p.githubUrl, label: "View Source" };
  return null;
}
