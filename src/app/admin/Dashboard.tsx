import type { DashboardData, RangeKey } from "@/lib/gaData";
import { RANGES } from "@/lib/gaData";
import { DailyChart } from "./DailyChart";
import {
  EVENT_GROUPS,
  EVENT_LABELS,
  TRACKING_SINCE,
  countryFlag,
  describeDevice,
  describeSource,
  formatDuration,
} from "./eventLabels";

const fmt = (n: number) => n.toLocaleString("en-IN");

function Section({ title, explain, children }: { title: string; explain: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{explain}</p>
      {children}
    </section>
  );
}

function Stat({ label, value, explain }: { label: string; value: string; explain: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{explain}</div>
    </div>
  );
}

// A labelled row with a thin magnitude bar behind the number.
function BarRow({ label, sub, value, max, suffix }: { label: React.ReactNode; sub?: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <li className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{label}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`shrink-0 tabular-nums font-semibold ${value === 0 ? "text-muted-foreground" : ""}`}>
          {fmt(value)}
          {suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
        </div>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-border/40" aria-hidden="true">
        {value > 0 && <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(pct, 2)}%` }} />}
      </div>
    </li>
  );
}

export function RangeTabs({ range }: { range: RangeKey }) {
  return (
    <nav aria-label="Date range" className="flex flex-wrap gap-2">
      {(Object.keys(RANGES) as RangeKey[]).map((key) => (
        // Plain <a>, not next/link: full navigations keep the dashboard out
        // of the PWA's front-end-nav page cache.
        <a
          key={key}
          href={`/admin?range=${key}`}
          aria-current={key === range ? "page" : undefined}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            key === range
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary/50 hover:bg-accent"
          }`}
        >
          {RANGES[key].label}
        </a>
      ))}
    </nav>
  );
}

export function Dashboard({ data, range }: { data: DashboardData; range: RangeKey }) {
  const { totals } = data;
  const maxCountry = Math.max(0, ...data.countries.map((c) => c.visitors));
  const maxSource = Math.max(0, ...data.sources.map((s) => s.visitors));
  const maxDevice = Math.max(0, ...data.devices.map((d) => d.visitors));
  const deviceTotal = data.devices.reduce((sum, d) => sum + d.visitors, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Visitors"
          value={fmt(totals.visitors)}
          explain={`Different people who opened your site. ${fmt(totals.newVisitors)} were first-timers.`}
        />
        <Stat label="Page views" value={fmt(totals.pageViews)} explain="Times a page was opened, counting repeat visits." />
        <Stat label="Countries" value={fmt(totals.countries)} explain="Countries your visitors came from." />
        <Stat
          label="Time spent"
          value={formatDuration(totals.avgEngagementSec)}
          explain="Average time a visitor actively spent on the site."
        />
      </div>

      {range !== "today" && (
        <Section title="Visitors per day" explain="How many different people visited each day. Hover a bar for the exact numbers.">
          <DailyChart days={data.daily} />
        </Section>
      )}

      <Section
        title="What people clicked"
        explain={`"Clicks" is how many times it was clicked; "people" is how many different visitors clicked it. Counting started on ${TRACKING_SINCE}.`}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {EVENT_GROUPS.map((group) => {
            const max = Math.max(0, ...group.events.map((e) => data.events[e]?.count ?? 0));
            return (
              <div key={group.title}>
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h3>
                <ul className="divide-y divide-border/50">
                  {group.events.map((e) => {
                    const stat = data.events[e];
                    const people = stat?.people ?? 0;
                    return (
                      <BarRow
                        key={e}
                        label={EVENT_LABELS[e].label}
                        sub={`${EVENT_LABELS[e].hint}${stat ? ` · by ${fmt(people)} ${people === 1 ? "person" : "people"}` : ""}`}
                        value={stat?.count ?? 0}
                        max={max}
                        suffix="clicks"
                      />
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {data.projects && data.projects.length > 0 && (
        <Section title="Which projects people opened" explain="Clicks on a project's live site, store page or code, per project.">
          <ul className="divide-y divide-border/50">
            {data.projects.map((p) => (
              <BarRow key={p.project} label={p.project} value={p.clicks} max={data.projects![0].clicks} suffix="clicks" />
            ))}
          </ul>
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Where visitors are from" explain="Top countries by number of visitors.">
          {data.countries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitors in this period yet.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {data.countries.map((c) => (
                <BarRow
                  key={c.code || c.name}
                  label={
                    <>
                      <span aria-hidden="true" className="mr-2">
                        {countryFlag(c.code)}
                      </span>
                      {c.name === "(not set)" ? "Unknown" : c.name}
                    </>
                  }
                  value={c.visitors}
                  max={maxCountry}
                  suffix="visitors"
                />
              ))}
            </ul>
          )}
        </Section>

        <Section title="How they found you" explain="The website or app that sent each visitor to you.">
          {data.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No visitors in this period yet.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {data.sources.map((s) => {
                const { name, how } = describeSource(s.source, s.channel);
                return (
                  <BarRow key={`${s.source}-${s.channel}`} label={name} sub={how} value={s.visitors} max={maxSource} suffix="visitors" />
                );
              })}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Phone or computer" explain="What device visitors used.">
        <ul className="divide-y divide-border/50">
          {data.devices.map((d) => (
            <BarRow
              key={d.device}
              label={describeDevice(d.device)}
              sub={deviceTotal ? `${Math.round((d.visitors / deviceTotal) * 100)}% of visitors` : undefined}
              value={d.visitors}
              max={maxDevice}
              suffix="visitors"
            />
          ))}
        </ul>
      </Section>
    </div>
  );
}

export function SetupGuide({ problem }: { problem?: string }) {
  return (
    <section className="glass-card rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold">Connect Google Analytics</h2>
      {problem ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">{problem}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          The dashboard needs read-only access to your Google Analytics data. One-time setup, about 10 minutes:
        </p>
      )}
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>
          In <strong>Google Cloud Console</strong>, create (or pick) a project and enable the{" "}
          <strong>Google Analytics Data API</strong>.
        </li>
        <li>
          Under IAM → <strong>Service accounts</strong>, create a service account, then Keys → Add key → JSON. A key file
          downloads.
        </li>
        <li>
          In <strong>Google Analytics</strong> → Admin → <strong>Property access management</strong>, add the service
          account&apos;s email with the <strong>Viewer</strong> role.
        </li>
        <li>
          In GA → Admin → <strong>Property details</strong>, copy the numeric <strong>Property ID</strong>.
        </li>
        <li>
          In Vercel → Settings → Environment Variables, add <code>GA_PROPERTY_ID</code> (the number) and{" "}
          <code>GA_SERVICE_ACCOUNT_JSON</code> (the whole key file&apos;s contents), then redeploy.
        </li>
        <li>
          Optional: GA → Admin → <strong>Custom definitions</strong> → create an event-scoped dimension named{" "}
          <code>project</code> (parameter <code>project</code>) to see which projects people open.
        </li>
      </ol>
    </section>
  );
}
