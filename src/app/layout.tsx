// app/layout.tsx
import "./globals.css";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "Ayyappa Swamy Angadi Portfolio",
  description: "Built with Next.js, Tailwind, and TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="sticky top-0 z-50">
            <Navbar />
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
