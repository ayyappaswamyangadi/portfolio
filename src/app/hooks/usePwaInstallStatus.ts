import { useEffect, useState } from "react";
import { gaEvent } from "@/lib/gtag";
import { detectPwaPlatform, type PwaPlatform } from "@/lib/pwaPlatform";
import { detectStandalone } from "./useIOSInstall";

// Fired at most once per tab session so remounts (e.g. the same badge
// rendered in both the desktop and mobile nav clusters) don't double-count
// a single app launch in analytics.
const SESSION_LOGGED_KEY = "pwa_standalone_launch_logged";

export function usePwaInstallStatus() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<PwaPlatform>("other");

  useEffect(() => {
    const standalone = detectStandalone();
    const detectedPlatform = detectPwaPlatform();
    setIsStandalone(standalone);
    setPlatform(detectedPlatform);

    if (!standalone) return;
    if (sessionStorage.getItem(SESSION_LOGGED_KEY)) return;

    sessionStorage.setItem(SESSION_LOGGED_KEY, "1");
    gaEvent({ action: "pwa_launch_standalone", category: "engagement", label: detectedPlatform });
  }, []);

  return { isStandalone, platform };
}
