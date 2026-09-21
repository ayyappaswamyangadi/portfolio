import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /api/resume renders a PDF in a serverless function on every hit, and
      // /~offline is the PWA's offline fallback — neither belongs in search.
      disallow: ["/api/", "/~offline"],
    },
    sitemap: "https://www.ayyappa.dev/sitemap.xml",
  };
}
