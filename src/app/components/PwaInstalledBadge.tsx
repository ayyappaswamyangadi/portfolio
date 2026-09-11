"use client";

import { CheckCircle2 } from "lucide-react";
import { usePwaInstallStatus } from "../hooks/usePwaInstallStatus";
import { PWA_PLATFORM_LABELS } from "@/lib/pwaPlatform";

export function PwaInstalledBadge() {
  const { isStandalone, platform } = usePwaInstallStatus();
  if (!isStandalone) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
      title={`Installed on ${PWA_PLATFORM_LABELS[platform]}`}
    >
      <CheckCircle2 size={14} />
      Installed
    </span>
  );
}
