import type { Metadata } from "next";
import { AdminBrowserSetup } from "./AdminBrowserSetup";

export const metadata: Metadata = {
  title: "Admin · Site analytics",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <AdminBrowserSetup />
      {children}
    </div>
  );
}
