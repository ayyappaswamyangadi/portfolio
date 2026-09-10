"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Info, Share, X } from "lucide-react";
import { gaEvent } from "@/lib/gtag";
import { useIOSInstall } from "../hooks/useIOSInstall";
import { PWA_PROMPT_DISMISS_KEY, PWA_PROMPT_DISMISSED_EVENT } from "../hooks/usePwaPromptDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = PWA_PROMPT_DISMISS_KEY;
const DISMISS_DAYS = 14;
const FOLLOWUP_MS = 5000;

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);
  const followupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isIOS, isStandalone } = useIOSInstall();

  useEffect(() => {
    return () => {
      if (followupTimeoutRef.current) clearTimeout(followupTimeoutRef.current);
    };
  }, []);

  // Called whenever the banner goes away without an install happening —
  // the manual X close, or a native/iOS decline. Marks the banner as
  // dismissed (so it stays away for DISMISS_DAYS and the navbar's Install
  // button can reveal itself) and shows a short follow-up note in its place
  // pointing at that alternate way to install later.
  const markDismissed = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    window.dispatchEvent(new Event(PWA_PROMPT_DISMISSED_EVENT));
    setShowFollowup(true);
    if (followupTimeoutRef.current) clearTimeout(followupTimeoutRef.current);
    followupTimeoutRef.current = setTimeout(() => setShowFollowup(false), FOLLOWUP_MS);
  };

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
    markDismissed();
    gaEvent({ action: "pwa_prompt_dismissed", category: "engagement", label: isIOS ? "ios" : "android" });
  };

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    gaEvent({ action: "pwa_install", category: "engagement", label: outcome });
    setVisible(false);
    if (outcome !== "accepted") {
      markDismissed();
    } else {
      setPrompt(null);
    }
  };

  return (
    <>
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

      {/* Brief follow-up note where the banner just was, pointing at the
          Install option now revealed in the menu — so declining isn't a
          dead end, without permanently occupying screen space like the
          banner it replaces. */}
      <AnimatePresence>
        {!visible && showFollowup && (
          <motion.div
            key="pwa-install-followup"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            aria-live="polite"
            className="pwa-install-banner md:hidden"
          >
            <div className="pwa-install-icon">
              <Info size={18} />
            </div>
            <div className="pwa-install-text">
              <span className="pwa-install-title">No worries</span>
              <span className="pwa-install-subtitle">You can install anytime from the menu</span>
            </div>
            <button
              onClick={() => setShowFollowup(false)}
              aria-label="Dismiss notification"
              className="pwa-install-close btn-click"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
