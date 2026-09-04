// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { ScrollProgress } from "@/app/components/ScrollProgress";
import { CursorGlow } from "@/app/components/CursorGlow";
import { FaviconThemeSync } from "@/app/components/FaviconThemeSync";
import { NetworkStatus } from "@/app/components/NetworkStatus";
import { PWAInstallPrompt } from "@/app/components/PWAInstallPrompt";
import { GoogleAnalytics } from "@/app/components/GoogleAnalytics";
import { WebVitals } from "@/app/components/WebVitals";
import { SectionViewTracker } from "@/app/components/SectionViewTracker";
import { StructuredData } from "@/app/components/StructuredData";
import type { Metadata, Viewport } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = "https://www.ayyappa.dev";
// Title kept under ~65 chars (Google's typical SERP truncation width) with
// the exact phrases recruiters/search actually use — "Frontend Developer",
// "React.js", "Next.js", "Web Developer" — up front rather than buried.
const siteTitle =
  "Ayyappa | Frontend Developer, React.js & Next.js Web Developer";
// Description kept under ~160 chars so it doesn't get cut mid-sentence in
// search results, with the highest-value keywords front-loaded.
const siteDescription =
  "Ayyappa Swamy Angadi — Frontend Developer & Web Developer with 5+ years building fast, scalable web apps using React.js, Next.js, TypeScript & JavaScript.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Ayyappa",
  },
  description: siteDescription,
  // Google itself no longer uses the keywords meta tag for ranking, but a
  // handful of other search/indexing tools and internal-search crawlers
  // still read it — kept comprehensive and pulled directly from the resume's
  // actual skill set rather than generic frontend buzzwords.
  keywords: [
    // Roles / titles
    "Frontend Developer", "Frontend Engineer", "Web Developer",
    "React Developer", "React.js Developer", "Next.js Developer",
    "JavaScript Developer", "TypeScript Developer",
    // Core stack
    "React.js", "Next.js", "JavaScript ES6+", "TypeScript",
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
    "Webpack", "Vite", "Babel", "Git", "GitHub", "CI/CD", "Agile", "Scrum",
    // Notable project domains
    "Web3.js", "Ethers.js", "MetaMask Integration",
    "Enterprise Dashboards", "Real-Time Trading Platforms", "AI-Powered Applications",
    // Brand / location
    "Scalable Web Applications", "Portfolio", "Ayyappa",
    "Ayyappa Swamy Angadi", "Bengaluru", "Remote Frontend Engineer",
  ],
  authors: [{ name: "Ayyappa Swamy Angadi", url: siteUrl }],
  creator: "Ayyappa Swamy Angadi",
  publisher: "Ayyappa Swamy Angadi",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS Safari does not render SVG apple-touch-icons — it silently falls
    // back to a screenshot of the page — so the PNG must be listed (and
    // listed first; Safari uses the first entry it recognizes).
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ayyappa Portfolio",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "en_US",
    title: siteTitle,
    description: siteDescription,
    siteName: "Ayyappa Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    // Twitter/X does fall back to og:image when this is unset, but leaving
    // it implicit is fragile — set it explicitly to the same generated
    // opengraph-image so the card preview is guaranteed.
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D8B6FF" },
    { media: "(prefers-color-scheme: dark)", color: "#060D18" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable}`}>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <StructuredData />
        <GoogleAnalytics />
        <WebVitals />
        <SectionViewTracker />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <FaviconThemeSync />
          <CursorGlow />
          <NetworkStatus />
          <header className="sticky top-0 z-50">
            <Navbar />
            <ScrollProgress />
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
