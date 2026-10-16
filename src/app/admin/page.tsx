import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/adminAuth";
import { GaSetupError, RANGES, getDashboardData, parseRange, type DashboardData } from "@/lib/gaData";
import { Dashboard, RangeTabs, SetupGuide } from "./Dashboard";
import { TRACKED_EVENTS } from "./eventLabels";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const range = parseRange((await searchParams).range);
  let data: DashboardData | null = null;
  let problem: string | undefined;
  let notConfigured = false;
  try {
    data = await getDashboardData(range, TRACKED_EVENTS);
  } catch (err) {
    if (err instanceof GaSetupError && err.message === "not-configured") notConfigured = true;
    else problem = err instanceof Error ? err.message : "Couldn't load Google Analytics data.";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Site analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {RANGES[range].label} · from Google Analytics · today&apos;s numbers can lag a few hours
          </p>
          {data?.activeNow != null && (
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              {data.activeNow} {data.activeNow === 1 ? "person" : "people"} on the site right now
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Full navigation on purpose — see RangeTabs. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-accent">
            View site
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-accent cursor-pointer">
              Log out
            </button>
          </form>
        </div>
      </header>

      {!notConfigured && <RangeTabs range={range} />}

      {data ? <Dashboard data={data} range={range} /> : <SetupGuide problem={notConfigured ? undefined : problem} />}
    </div>
  );
}
