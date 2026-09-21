// Single source of truth for project content: the client-side grid/carousel in
// Projects.tsx and the server-rendered JSON-LD in StructuredData.tsx both read
// this, so crawlers see every project even though the grid paginates.
export const projects = [
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
    highlights: [
      "Home feed + category chips",
      "Notifications & Shorts rail",
      "Dark-theme, fully responsive",
    ],
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
    highlights: [
      "Priority & due-date tagging",
      "Search + status filters",
      "Persistent local storage",
    ],
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
    // No public repo link — github.com/.../wedding-invitation 404s (repo is
    // private or renamed). Live demo still works; re-add if it goes public.
    githubUrl: "",
    highlights: [
      "Multi-event ceremony timeline",
      "Photo gallery + guest wishes wall",
      "Embedded maps & background music",
    ],
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
    highlights: [
      "Live backend link generation",
      "Searchable recent-URLs history",
      "Copy-to-clipboard sharing",
    ],
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
    // No public repo link — github.com/.../matrimony-registration-form
    // 404s (repo is private or renamed). Live demo still works.
    githubUrl: "",
    highlights: [
      "English / Kannada language toggle",
      "Export as image or PDF",
      "Google Drive auto-save",
    ],
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
    highlights: [
      "Quantity + price tracking",
      "Running total in ₹",
      "Add / remove items instantly",
    ],
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
    highlights: [
      "Sign-up + login UI",
      "Real OTP email verification",
      "Faithful layout & styling",
    ],
  },
  {
    id: 8,
    title: "Resume Builder",
    description:
      "A free resume builder with 50+ professionally designed, ATS-friendly templates and a real-time live preview. Deep customization of fonts, colors, spacing, and section order, AI-assisted writing for summaries and bullet points, and pixel-perfect PDF export — with autosave to a user account so nothing is lost mid-edit.",
    tech: ["Next.js", "React", "Tailwind CSS", "Firebase", "Zustand"],
    category: "Productivity",
    featured: true,
    image: "/projects/resume-builder.png",
    liveUrl: "https://resume-builder-nextjs-alpha.vercel.app/",
    githubUrl: "https://github.com/ayyappaswamyangadi/resume-builder-nextjs",
    highlights: [
      "50+ ATS-friendly templates",
      "Live preview + pixel-perfect PDF export",
      "AI writing assist for bullets & summaries",
    ],
  },
];
