// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { ScrollProgress } from "@/app/components/ScrollProgress";
import { CursorGlow } from "@/app/components/CursorGlow";
import { NetworkStatus } from "@/app/components/NetworkStatus";
import type { Metadata, Viewport } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ayyappa | Frontend Developer",
  description:
    "Portfolio of Ayyappa — React, Next.js, TypeScript & JavaScript Frontend Developer with 5+ years of experience.",
  keywords: [
    "Frontend Developer", "React Developer", "Next.js", "TypeScript",
    "JavaScript", "Redux", "Portfolio", "Ayyappa", "Hyderabad",
  ],
  authors: [{ name: "Ayyappa" }],
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
    locale: "en_US",
    title: "Ayyappa | Frontend Developer",
    description:
      "React & Next.js Frontend Developer with 5+ years of experience building scalable, performant web applications.",
    siteName: "Ayyappa Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayyappa | Frontend Developer",
    description:
      "React & Next.js Frontend Developer with 5+ years of experience.",
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
