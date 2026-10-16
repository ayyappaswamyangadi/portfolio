import { useEffect, useState } from "react";
import { detectPwaPlatform, type PwaPlatform } from "@/lib/pwaPlatform";
import { detectStandalone } from "./useIOSInstall";

export function usePwaInstallStatus() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<PwaPlatform>("other");

  useEffect(() => {
    setIsStandalone(detectStandalone());
    setPlatform(detectPwaPlatform());
  }, []);

  return { isStandalone, platform };
}
