import { useEffect, useState } from "react";

// iOS never fires `beforeinstallprompt` (Apple has no install-banner API),
// and iPadOS 13+ reports its UA as a Mac, so UA sniffing alone misses it —
// touch support is what actually distinguishes an iPad from a real Mac.
function detectIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOSUA = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIOSUA || isIPadOS;
}

export function detectStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// Chrome doesn't reliably keep suppressing `beforeinstallprompt` on every
// later visit — it can still fire in a plain browser tab even after the app
// was installed (e.g. installed via Chrome's own omnibox icon rather than
// our button, or reopened well after installing). `appinstalled` is the one
// signal guaranteed to fire exactly when an install completes, so it's used
// here to persist an "installed" flag that survives past this page load —
// that way a later visit in a normal tab still knows this device already
// has the app, instead of trusting a possibly-stale `beforeinstallprompt`.
const INSTALLED_KEY = "pwa-installed";

function readPersistedInstalled() {
  return localStorage.getItem(INSTALLED_KEY) === "1";
}

export function useIOSInstall() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsIOS(detectIOS());

    const standalone = detectStandalone();
    setIsStandalone(standalone);

    const persisted = readPersistedInstalled();
    if (standalone && !persisted) localStorage.setItem(INSTALLED_KEY, "1");
    setIsInstalled(standalone || persisted);

    const handleInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setIsInstalled(true);
    };
    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, []);

  return { isIOS, isStandalone, isInstalled };
}
