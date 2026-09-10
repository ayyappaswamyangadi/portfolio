"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download } from "lucide-react";
import { gaEvent } from "@/lib/gtag";
import { useIOSInstall } from "../hooks/useIOSInstall";
import { usePwaPromptDismissed } from "../hooks/usePwaPromptDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const TIP_WIDTH = 192;

interface PWAInstallButtonProps {
  // The mobile nav's own Install entry is a second install affordance
  // alongside the auto-shown bottom banner (PWAInstallPrompt) — surfacing
  // both at once reads as redundant. Passing this keeps it hidden until
  // that banner has actually been dismissed (or declined) at least once,
  // at which point it's the way back in that banner's own follow-up toast
  // points to. The desktop instance of this button has no banner to defer
  // to, so it's left out of this gating.
  revealAfterPromptDismiss?: boolean;
}

export function PWAInstallButton({ revealAfterPromptDismiss = false }: PWAInstallButtonProps = {}) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const { isIOS, isStandalone } = useIOSInstall();
  const promptDismissed = usePwaPromptDismissed();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // The mobile menu clips overflow to animate its open/close height, which
  // would cut off a tooltip anchored below this button — portal it to
  // <body> instead and position it from the button's own screen rect.
  useLayoutEffect(() => {
    if (!showIOSTip || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setTipPos({
      top: rect.bottom + 8,
      left: Math.max(12, Math.min(rect.right - TIP_WIDTH, window.innerWidth - TIP_WIDTH - 12)),
    });
  }, [showIOSTip]);

  useEffect(() => {
    if (!showIOSTip) return;
    const close = (e: Event) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || tipRef.current?.contains(target)) return;
      setShowIOSTip(false);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [showIOSTip]);

  // iOS never fires `beforeinstallprompt` — there's no programmatic install
  // trigger there, so fall back to showing manual instructions on tap.
  if (!prompt && !(isIOS && !isStandalone)) return null;
  if (revealAfterPromptDismiss && !promptDismissed) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSTip((v) => !v);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    gaEvent({ action: "pwa_install", category: "engagement", label: outcome });
    if (outcome === "accepted") setPrompt(null);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleInstall}
        className="btn-primary btn-click ml-2 px-4 py-1.5 text-sm inline-flex items-center gap-1.5"
        aria-label="Install app"
        aria-expanded={isIOS ? showIOSTip : undefined}
      >
        <Download size={14} />
        Install
      </button>
      {isIOS &&
        showIOSTip &&
        tipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{ position: "fixed", top: tipPos.top, left: tipPos.left, width: TIP_WIDTH }}
            className="z-[70] rounded-xl glass px-3 py-2.5 text-xs text-foreground shadow-lg"
          >
            Tap <strong>Share</strong>, then <strong>&ldquo;Add to Home Screen&rdquo;</strong>
          </div>,
          document.body,
        )}
    </>
  );
}
