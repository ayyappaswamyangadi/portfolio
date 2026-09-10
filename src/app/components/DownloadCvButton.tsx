"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { gaEvent } from "@/lib/gtag";

// A native `<a download>` gives zero feedback while the browser prepares its
// save dialog — on a slow disk, first-load fetch, or just OS overhead, a
// click can feel dead for a moment before anything visibly happens. This
// swaps the icon/label to a spinner for a short window after every click so
// the click always reads as acknowledged, mirroring the same pattern
// Contact.tsx already uses for its submit button (spinner + label swap).
const DOWNLOAD_FEEDBACK_MS = 1400;

export function DownloadCvButton({
  className,
  gaLabel,
  iconSize = 14,
}: {
  className: string;
  gaLabel: string;
  iconSize?: number;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleClick = () => {
    gaEvent({ action: "download_cv", category: "engagement", label: gaLabel });
    if (downloading) return;
    setDownloading(true);
    setTimeout(() => setDownloading(false), DOWNLOAD_FEEDBACK_MS);
  };

  return (
    <a
      href="/api/resume"
      download="Ayyappa_Swamy_Angadi_Resume.pdf"
      onClick={handleClick}
      aria-busy={downloading}
      className={className}
    >
      {downloading ? (
        <LoaderCircle size={iconSize} className="animate-spin" />
      ) : (
        <Download size={iconSize} />
      )}
      {downloading ? "Downloading…" : "Download CV"}
    </a>
  );
}
