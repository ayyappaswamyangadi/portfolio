"use client";

import { useReportWebVitals } from "next/web-vitals";
import { gaEvent } from "@/lib/gtag";

// CLS has no unit (a small decimal like 0.05) while the other Core Web
// Vitals are milliseconds — scale CLS up so it survives gtag's integer
// `value` param without rounding away all its precision.
export function WebVitals() {
  useReportWebVitals((metric) => {
    gaEvent({
      action: metric.name,
      category: "web_vitals",
      label: metric.rating,
      value: metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value),
    });
  });

  return null;
}
