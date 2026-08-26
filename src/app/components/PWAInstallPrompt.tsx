"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { gaEvent } from "@/lib/gtag";
import { useIOSInstall } from "../hooks/useIOSInstall";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DAYS = 14;

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const { isIOS, isStandalone } = useIOSInstall();

  useEffect(() => {
    if (isStandalone) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
      return;
    }

    // iOS never fires `beforeinstallprompt` — there's no programmatic
    // install trigger there, so just show the instructional copy directly.
    if (isIOS) {
      setVisible(true);
      gaEvent({ action: "pwa_prompt_shown", category: "engagement", label: "ios" });
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
      gaEvent({ action: "pwa_prompt_shown", category: "engagement", label: "android" });
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIOS, isStandalone]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    gaEvent({ action: "pwa_prompt_dismissed", category: "engagement", label: isIOS ? "ios" : "android" });
  };

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    gaEvent({ action: "pwa_install", category: "engagement", label: outcome });
    setVisible(false);
    if (outcome !== "accepted") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } else {
      setPrompt(null);
    }
  };

  return (
    <AnimatePresence>
      {visible && (prompt || isIOS) && (
        <motion.div
          key="pwa-install"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Install app"
          className="pwa-install-banner md:hidden"
        >
          <div className="pwa-install-icon">
            {isIOS ? <Share size={18} /> : <Download size={18} />}
          </div>
          <div className="pwa-install-text">
            <span className="pwa-install-title">Install this app</span>
            <span className="pwa-install-subtitle">
              {isIOS ? "Tap Share, then “Add to Home Screen”" : "Add to your home screen for quick access"}
            </span>
          </div>
          {!isIOS && (
            <button onClick={handleInstall} className="pwa-install-cta btn-click">
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="pwa-install-close btn-click"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
