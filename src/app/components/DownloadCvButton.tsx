"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Download, LoaderCircle } from "lucide-react";
import { gaEvent } from "@/lib/gtag";
import { cn } from "@/lib/utils";

// A plain `<a href="/api/resume" download>` has no way to know the request
// failed — it just saves whatever bytes (or none) came back under the given
// filename regardless of HTTP status, which is exactly how an /api/resume
// server error turned into a 0-byte "PDF" some browsers couldn't even open.
// Fetching first lets us check the response is actually a real PDF before
// ever triggering a save, and show a real error state instead.
//
// The spinner swap during the fetch (previously just a fixed delay to mask
// `<a download>`'s silent save-dialog prep) is now also doing real work:
// masking the network round-trip itself.
const ERROR_DISPLAY_MS = 3500;
const RESUME_FILENAME = "Ayyappa_Swamy_Angadi_Resume.pdf";

type Status = "idle" | "downloading" | "error";

export function DownloadCvButton({
  className,
  gaLabel,
  iconSize = 14,
}: {
  className: string;
  gaLabel: string;
  iconSize?: number;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleClick = async () => {
    gaEvent({ action: "download_cv", category: "engagement", label: gaLabel });
    if (status === "downloading") return;
    setStatus("downloading");

    try {
      const res = await fetch("/api/resume", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`/api/resume responded with ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        throw new Error("/api/resume returned an empty file");
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const link = document.createElement("a");
      link.href = url;
      link.download = RESUME_FILENAME;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatus("idle");
    } catch (error) {
      console.error("[DownloadCvButton] resume download failed:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), ERROR_DISPLAY_MS);
    }
  };

  const label =
    status === "downloading"
      ? "Downloading…"
      : status === "error"
        ? "Download failed — retry"
        : "Download CV";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-busy={status === "downloading"}
      className={cn(className, status === "idle" && "btn-cv-pulse")}
    >
      {status === "downloading" ? (
        <LoaderCircle size={iconSize} className="animate-spin" />
      ) : status === "error" ? (
        <AlertCircle size={iconSize} />
      ) : (
        <Download size={iconSize} className="cv-download-icon" />
      )}
      {label}
    </button>
  );
}
