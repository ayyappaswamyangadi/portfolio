"use client";

import { useState } from "react";

type Day = { date: string; visitors: number; pageViews: number };

const W = 640;
const H = 180;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// Visitors per day — one series, so no legend; the section title names it.
export function DailyChart({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.visitors));
  const slot = W / days.length;
  const gap = Math.min(2, slot * 0.2);
  const barW = Math.max(1, slot - gap);
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const active = hover === null ? null : days[hover];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Visitors per day, peaking at ${max}`}
        onMouseLeave={() => setHover(null)}
      >
        <line x1={0} x2={W} y1={PAD_TOP} y2={PAD_TOP} className="stroke-border" strokeDasharray="3 4" />
        <text x={W} y={PAD_TOP - 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {max}
        </text>
        <line x1={0} x2={W} y1={H - PAD_BOTTOM} y2={H - PAD_BOTTOM} className="stroke-border" />
        {days.map((d, i) => {
          const h = (d.visitors / max) * plotH;
          const x = i * slot + gap / 2;
          const y = H - PAD_BOTTOM - h;
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              {/* Full-height hit target, wider than the bar itself. */}
              <rect x={i * slot} y={0} width={slot} height={H - PAD_BOTTOM} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${H - PAD_BOTTOM} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${H - PAD_BOTTOM} Z`}
                  className="fill-primary"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
            </g>
          );
        })}
        <text x={0} y={H - 6} className="fill-muted-foreground text-[10px]">
          {shortDate(days[0].date)}
        </text>
        <text x={W} y={H - 6} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {shortDate(days[days.length - 1].date)}
        </text>
      </svg>
      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg whitespace-nowrap"
          style={{ left: `${Math.min(88, Math.max(12, ((hover + 0.5) / days.length) * 100))}%` }}
        >
          <div className="font-semibold">{shortDate(active.date)}</div>
          <div>
            {active.visitors} visitor{active.visitors === 1 ? "" : "s"} · {active.pageViews} page view
            {active.pageViews === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
