// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { ScrollProgress } from "@/app/components/ScrollProgress";
import { CursorGlow } from "@/app/components/CursorGlow";
import { NetworkStatus } from "@/app/components/NetworkStatus";
import { GoogleAnalytics } from "@/app/components/GoogleAnalytics";
import { StructuredData } from "@/app/components/StructuredData";
import type { Metadata, Viewport } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = "https://www.ayyappa.dev";
const siteTitle =
  "Ayyappa | Frontend Developer, Web Developer & React/Next.js Engineer";
const siteDescription =
  "Ayyappa Swamy Angadi — Frontend Developer & Web Developer with 5+ years building scalable, high-performance web apps using React, Next.js, JavaScript, TypeScript, HTML, CSS & Tailwind CSS. Strong on optimisation, scalability & problem solving.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Ayyappa",
  },
  description: siteDescription,
  keywords: [
    "Frontend Developer", "Web Developer", "Frontend Engineer",
    "React Developer", "Next.js Developer", "JavaScript Developer",
    "TypeScript Developer", "HTML", "CSS", "Tailwind CSS",
    "Web Performance Optimisation", "Scalable Web Applications",
    "Problem Solving", "Redux", "Portfolio", "Ayyappa",
    "Ayyappa Swamy Angadi", "Bengaluru",
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
    ],
    apple: [
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
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F4E5" },
    { media: "(prefers-color-scheme: dark)", color: "#1A375F" },
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CursorGlow />
          <NetworkStatus />
          <header className="sticky top-0 z-50">
            <Navbar />
            <ScrollProgress />
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
