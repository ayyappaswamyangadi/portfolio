// Single source of truth for project content: the client-side grid/carousel in
// Projects.tsx and the server-rendered JSON-LD in StructuredData.tsx both read
// this, so crawlers see every project even though the grid paginates.
export const projects = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
