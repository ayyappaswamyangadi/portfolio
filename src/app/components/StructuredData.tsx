import { projects } from "@/lib/projects";

const siteUrl = "https://www.ayyappa.dev";

// A JSON-LD @graph combining Person + WebSite + ProfessionalService + a
// project ItemList — pulled directly from the
// resume's actual skills/roles/education so search engines' entity
// understanding of "Ayyappa" matches what recruiters are searching for
// (React.js, Next.js, TypeScript, frontend/web developer) rather than a
// generic placeholder list.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}#person`,
      name: "Ayyappa Swamy Angadi",
      alternateName: "Ayyappa",
      url: siteUrl,
      image: `${siteUrl}/opengraph-image`,
      jobTitle: "Frontend Developer",
      description:
        "Frontend Developer & Web Developer with 5+ years of experience, including 4+ years building production React.js and Next.js applications. Specialized in scalable, high-performance frontend architecture using React, JavaScript (ES6+) and TypeScript.",
      sameAs: [
        "https://github.com/ayyappaswamyangadi",
        "https://linkedin.com/in/ayyappaswamyangadi",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      worksFor: {
        "@type": "Organization",
        name: "Revise",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Visvesvaraya Technological University",
      },
      knowsAbout: [
        // Roles
        "Frontend Development", "Web Development", "React.js Development",
        "Next.js Development",
        // Core stack
        "React.js", "Next.js", "JavaScript (ES6+)", "TypeScript",
        "React Hooks", "Context API", "Functional Components",
        // State & forms
        "Redux", "Redux Toolkit", "React Hook Form", "Zod",
        // UI & styling
        "Tailwind CSS", "Material UI", "Bootstrap", "Styled-Components",
        "Framer Motion", "Responsive Web Design", "Cross-Browser Compatibility",
        // Data & APIs
        "RESTful APIs", "Axios", "Fetch API",
        // Performance
        "Performance Optimization", "Code Splitting", "Lazy Loading", "Web Vitals",
        // Tooling & workflow
        "Webpack", "Vite", "Babel", "Git", "GitHub",
        "CI/CD Pipelines", "Agile", "Scrum",
        // Domain experience
        "Web3.js", "Ethers.js", "MetaMask Integration",
        "Enterprise Dashboards", "Real-Time Trading Platforms",
        "AI-Powered Applications",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: "Ayyappa Portfolio",
      description:
        "Portfolio of Ayyappa Swamy Angadi — Frontend Developer & Web Developer specializing in React.js, Next.js and TypeScript.",
      inLanguage: "en-US",
      publisher: { "@id": `${siteUrl}#person` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}#service`,
      name: "Ayyappa - Frontend Web Development Services",
      url: siteUrl,
      image: `${siteUrl}/opengraph-image`,
      description:
        "Frontend and web application development — React.js, Next.js, TypeScript, HTML, CSS and JavaScript websites and web apps.",
      serviceType: [
        "Frontend Development",
        "Web Application Development",
        "React.js and Next.js Development",
        "Responsive Website Development",
      ],
      areaServed: "Worldwide",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      founder: { "@id": `${siteUrl}#person` },
      provider: { "@id": `${siteUrl}#person` },
    },
    {
      // Every project, straight from the same data the (paginated) UI uses —
      // so structured data lists all of them even though the grid shows two
      // at a time.
      "@type": "ItemList",
      "@id": `${siteUrl}#projects`,
      name: "Projects by Ayyappa Swamy Angadi",
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: p.title,
          description: p.description,
          url: p.liveUrl,
          ...(p.githubUrl && { codeRepository: p.githubUrl }),
          keywords: p.tech.join(", "),
          author: { "@id": `${siteUrl}#person` },
        },
      })),
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
