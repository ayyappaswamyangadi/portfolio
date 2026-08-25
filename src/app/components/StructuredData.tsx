const siteUrl = "https://www.ayyappa.dev";

// A JSON-LD @graph combining Person + WebSite — pulled directly from the
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
