// app/layout.tsx
import "./globals.css";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { ScrollProgress } from "@/app/components/ScrollProgress";
import { FaviconThemeSync } from "@/app/components/FaviconThemeSync";
import { CursorGlow } from "@/app/components/CursorGlow";
import { NetworkStatus } from "@/app/components/NetworkStatus";
import { PWAInstallPrompt } from "@/app/components/PWAInstallPrompt";
import { SplashScreen } from "@/app/components/SplashScreen";
import {
  ServiceWorkerUpdater,
  UPDATE_VIEW_KEY,
} from "@/app/components/ServiceWorkerUpdater";
import { GoogleAnalytics } from "@/app/components/GoogleAnalytics";
import { HideOnAdmin } from "@/app/components/HideOnAdmin";
import { StructuredData } from "@/app/components/StructuredData";
import type { Metadata, Viewport } from "next";

// Runs before hydration so a standalone (home-screen-installed) launch gets
// the `pwa-splash` class on <html> before the browser paints anything — a
// regular browser tab visit never touches this, so it never sees a splash
// flash. SplashScreen.tsx removes the class once it's done fading itself out.
// Also skipped when this load is ServiceWorkerUpdater swapping in a new build
// mid-session — that reload should look like nothing happened.
const detectPwaLaunchScript = `
(function () {
  try {
    var isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    var isUpdateSwap = !!sessionStorage.getItem("${UPDATE_VIEW_KEY}");
    if (isStandalone && !isUpdateSwap) {
      document.documentElement.classList.add("pwa-splash");
    }
  } catch (e) {}
})();
`;

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
  "Ayyappa | Senior Frontend Engineer — React, Next.js, TypeScript";
// Description kept under ~160 chars so it doesn't get cut mid-sentence in
// search results, with the highest-value keywords front-loaded.
const siteDescription =
  "Ayyappa Swamy Angadi — Senior Frontend Engineer with 5+ years building React, Next.js and TypeScript products, including an App Store app and AI tools.";

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
    "Senior Frontend Engineer", "Frontend Developer", "Frontend Engineer",
    "Web Developer",
    "React Developer", "React.js Developer", "Next.js Developer",
    "JavaScript Developer", "TypeScript Developer",
    // Core stack
    "React.js", "Next.js", "JavaScript ES6+", "TypeScript",
    "React Hooks", "Context API", "Functional Components",
    // State & forms
    "Redux", "Redux Toolkit", "React Hook Form", "Zod",
    // UI & styling
    "Tailwind CSS", "Bootstrap", "Styled-Components",
    "Framer Motion", "Responsive Web Design", "Cross-Browser Compatibility",
    // Data, real-time & APIs
    "WebSockets", "Server-Sent Events", "RESTful APIs", "React Query",
    // Performance
    "Performance Optimization", "Code Splitting", "Lazy Loading", "Web Vitals",
    // Tooling & workflow
    "Webpack", "Vite", "Babel", "Git", "GitHub", "CI/CD", "Agile", "Scrum",
    // Notable project domains
    "Real-Time Trading Platforms", "dYdX", "Telegram Mini Apps", "Ethers.js",
    "AI Product Interfaces", "Streaming AI UX", "AI-Assisted Development",
    "Claude Code",
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
    // PNG only. iOS can't use an SVG home-screen icon, and when several
    // apple-touch-icons are listed it doesn't reliably pick the PNG — a
    // size-less SVG entry can win, and iOS then draws a plain letter tile
    // ("A" from the app title) instead of the icon.
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
        <Script
          id="detect-pwa-launch"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: detectPwaLaunchScript }}
        />
        <SplashScreen />
        <ServiceWorkerUpdater />
        <StructuredData />
        <HideOnAdmin>
          <GoogleAnalytics />
        </HideOnAdmin>
        <SpeedInsights />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <FaviconThemeSync />
          <NetworkStatus />
          <HideOnAdmin>
            <CursorGlow />
            <header className="sticky top-0 z-50">
              <Navbar />
              <ScrollProgress />
            </header>
          </HideOnAdmin>
          <main className="flex-1">{children}</main>
          <HideOnAdmin>
            <Footer />
            <PWAInstallPrompt />
          </HideOnAdmin>
        </ThemeProvider>
      </body>
    </html>
  );
}
