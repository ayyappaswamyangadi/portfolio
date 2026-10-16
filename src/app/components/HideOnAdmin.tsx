"use client";

import { usePathname } from "next/navigation";

// The /admin dashboard shares the root layout but none of the portfolio's
// chrome (navbar, footer, install prompt) — and must not be tracked by GA.
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
