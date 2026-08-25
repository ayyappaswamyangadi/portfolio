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

function detectStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useIOSInstall() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(detectIOS());
    setIsStandalone(detectStandalone());
  }, []);

  return { isIOS, isStandalone };
}
