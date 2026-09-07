// ─── Experience duration helpers ──────────────────────────────────────────────
// Shared by Home.tsx and About.tsx so the hero banner and the experience
// timeline always agree, and so figures are computed from the actual start
// dates instead of a hardcoded "5+ years" that goes stale every few months.
export type YearMonth = { year: number; month: number };

export const REVISE_START: YearMonth = { year: 2022, month: 5 };
export const CHOOLS_PERIOD: { start: YearMonth; end: YearMonth } = {
  start: { year: 2020, month: 10 },
  end: { year: 2022, month: 1 },
};

export function nowYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthsToLabel(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;
  const yearPart = years > 0 ? `${years} yr${years !== 1 ? "s" : ""}` : "";
  const monthPart =
    remMonths > 0 ? `${remMonths} month${remMonths !== 1 ? "s" : ""}` : "";
  return [yearPart, monthPart].filter(Boolean).join(" ") || "0 months";
}

export function formatDuration(
  start: YearMonth,
  end: YearMonth = nowYearMonth(),
) {
  const months = (end.year - start.year) * 12 + (end.month - start.month);
  return monthsToLabel(months);
}

// Total professional experience = both roles summed, excluding the ~3-month
// gap between the Chools end date (Jan 2022) and the Revise start (May 2022).
export function getTotalExperienceLabel(): string {
  const now = nowYearMonth();
  const choolsMonths =
    (CHOOLS_PERIOD.end.year - CHOOLS_PERIOD.start.year) * 12 +
    (CHOOLS_PERIOD.end.month - CHOOLS_PERIOD.start.month);
  const reviseMonths =
    (now.year - REVISE_START.year) * 12 + (now.month - REVISE_START.month);
  return monthsToLabel(choolsMonths + reviseMonths);
}
