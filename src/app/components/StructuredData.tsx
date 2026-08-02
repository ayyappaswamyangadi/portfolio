const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ayyappa Swamy Angadi",
  alternateName: "Ayyappa",
  url: "https://www.ayyappa.dev",
  image: "https://www.ayyappa.dev/opengraph-image",
  jobTitle: "Frontend Developer",
  description:
    "Frontend Developer & Web Developer with 5+ years of experience building scalable, high-performance web applications with React, Next.js, JavaScript and TypeScript.",
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
  knowsAbout: [
    "Frontend Development",
    "Web Development",
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Redux",
    "Web Performance Optimisation",
    "Scalable Web Applications",
    "Problem Solving",
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
    />
  );
}
