"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { gaEvent } from "@/lib/gtag";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt) return null;

  const handleInstall = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    gaEvent({ action: "pwa_install", category: "engagement", label: outcome });
    if (outcome === "accepted") setPrompt(null);
  };

  return (
    <button
      onClick={handleInstall}
      className="btn-primary btn-click ml-2 px-4 py-1.5 text-sm inline-flex items-center gap-1.5"
      aria-label="Install app"
    >
      <Download size={14} />
      Install
    </button>
  );
}
