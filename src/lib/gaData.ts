import { createSign } from "crypto";
import type { AnalyticsEvent } from "@/lib/gtag";

// Server-only reader for the GA4 Data API, used by the /admin dashboard.
// Auth is a Google Cloud service account that has "Viewer" access on the GA
// property. Its key file is pasted whole into GA_SERVICE_ACCOUNT_JSON; the
// numeric property ID goes in GA_PROPERTY_ID. No SDK: a self-signed JWT is
// exchanged for an access token, then plain REST calls.

export const RANGES = {
  today: { label: "Today", days: 1 },
  "7d": { label: "Last 7 days", days: 7 },
  "28d": { label: "Last 28 days", days: 28 },
  "90d": { label: "Last 90 days", days: 90 },
} as const;
export type RangeKey = keyof typeof RANGES;

export function parseRange(value: string | undefined): RangeKey {
  return value && value in RANGES ? (value as RangeKey) : "28d";
}

// GA reports days in the property's time zone; the property is set to India.
const PROPERTY_TZ = "Asia/Kolkata";

export type DashboardData = {
  totals: {
    visitors: number;
    newVisitors: number;
    pageViews: number;
    avgEngagementSec: number;
    countries: number;
  };
  daily: { date: string; visitors: number; pageViews: number }[];
  events: Partial<Record<AnalyticsEvent, { count: number; people: number }>>;
  countries: { name: string; code: string; visitors: number }[];
  sources: { source: string; channel: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  // null when the "project" custom dimension isn't registered in GA yet.
  projects: { project: string; clicks: number }[] | null;
  activeNow: number | null;
};

type ServiceAccount = { client_email: string; private_key: string };

export class GaSetupError extends Error {}

export function readGaConfig(): { propertyId: string; account: ServiceAccount } | null {
  const propertyId = process.env.GA_PROPERTY_ID?.trim();
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON;
  if (!propertyId || !raw) return null;
  let account: ServiceAccount;
  try {
    account = JSON.parse(raw);
  } catch {
    throw new GaSetupError("GA_SERVICE_ACCOUNT_JSON is not valid JSON — paste the whole key file.");
  }
  if (!account.client_email || !account.private_key) {
    throw new GaSetupError("GA_SERVICE_ACCOUNT_JSON is missing client_email or private_key.");
  }
  // Some env editors store the key's newlines as literal "\n".
  account.private_key = account.private_key.replace(/\\n/g, "\n");
  return { propertyId, account };
}

let cachedToken: { token: string; expires: number; email: string } | null = null;

async function getAccessToken(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.email === account.client_email && cachedToken.expires - 60 > now) {
    return cachedToken.token;
  }
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(account.private_key, "base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok) {
    throw new GaSetupError(
      `Google rejected the service account key (${body.error_description ?? body.error ?? res.status}).`,
    );
  }
  cachedToken = { token: body.access_token, expires: now + body.expires_in, email: account.client_email };
  return cachedToken.token;
}

type ReportRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
type Report = { rows?: ReportRow[]; rowCount?: number };

function friendlyApiError(status: number, message: string) {
  if (/has not been used|is disabled/i.test(message)) {
    return "The Google Analytics Data API isn't turned on for the service account's Google Cloud project. Enable it, wait a minute, and refresh.";
  }
  if (status === 403) {
    return "The service account can't see this GA property. In GA → Admin → Property access management, add its email as a Viewer.";
  }
  if (status === 404) return "GA_PROPERTY_ID doesn't match a GA property. Use the numeric Property ID from GA → Admin → Property details.";
  return `Google Analytics returned an error: ${message}`;
}

async function gaPost<T>(path: string, body: object, token: string): Promise<T> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new GaSetupError(friendlyApiError(res.status, json.error?.message ?? String(res.status)));
  return json as T;
}

const num = (v: string | undefined) => Number(v ?? 0) || 0;

function dateKey(d: Date) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: PROPERTY_TZ }).format(d);
}

export function lastNDates(days: number, now = new Date()) {
  return Array.from({ length: days }, (_, i) =>
    dateKey(new Date(now.getTime() - (days - 1 - i) * 86_400_000)),
  );
}

export async function getDashboardData(
  range: RangeKey,
  trackedEvents: readonly AnalyticsEvent[],
): Promise<DashboardData> {
  const config = readGaConfig();
  if (!config) throw new GaSetupError("not-configured");
  const token = await getAccessToken(config.account);
  const property = `properties/${config.propertyId}`;
  const { days } = RANGES[range];
  const dateRanges = [{ startDate: days === 1 ? "today" : `${days - 1}daysAgo`, endDate: "today" }];

  const metric = (name: string) => ({ name });
  const dim = (name: string) => ({ name });
  const byMetricDesc = (name: string) => [{ metric: { metricName: name }, desc: true }];

  const batch = gaPost<{ reports: Report[] }>(
    `${property}:batchRunReports`,
    {
      requests: [
        {
          dateRanges,
          metrics: ["totalUsers", "newUsers", "screenPageViews", "userEngagementDuration", "activeUsers"].map(metric),
        },
        { dateRanges, dimensions: [dim("date")], metrics: ["totalUsers", "screenPageViews"].map(metric) },
        {
          dateRanges,
          dimensions: [dim("eventName")],
          metrics: ["eventCount", "totalUsers"].map(metric),
          dimensionFilter: {
            filter: { fieldName: "eventName", inListFilter: { values: [...trackedEvents] } },
          },
        },
        {
          dateRanges,
          dimensions: [dim("country"), dim("countryId")],
          metrics: [metric("totalUsers")],
          orderBys: byMetricDesc("totalUsers"),
          limit: 10,
        },
        {
          dateRanges,
          dimensions: [dim("sessionSource"), dim("sessionDefaultChannelGroup")],
          metrics: [metric("totalUsers")],
          orderBys: byMetricDesc("totalUsers"),
          limit: 8,
        },
      ],
    },
    token,
  );

  const devices = gaPost<Report>(
    `${property}:runReport`,
    { dateRanges, dimensions: [dim("deviceCategory")], metrics: [metric("totalUsers")], orderBys: byMetricDesc("totalUsers") },
    token,
  );

  // Needs "project" registered as a custom dimension in GA; null otherwise.
  const projects = gaPost<Report>(
    `${property}:runReport`,
    {
      dateRanges,
      dimensions: [dim("customEvent:project")],
      metrics: [metric("eventCount")],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "project_link_click" } } },
      orderBys: byMetricDesc("eventCount"),
      limit: 10,
    },
    token,
  ).catch(() => null);

  const realtime = gaPost<Report>(`${property}:runRealtimeReport`, { metrics: [metric("activeUsers")] }, token).catch(
    () => null,
  );

  const [{ reports }, deviceReport, projectReport, realtimeReport] = await Promise.all([
    batch,
    devices,
    projects,
    realtime,
  ]);
  const [totalsR, dailyR, eventsR, countriesR, sourcesR] = reports;

  const t = totalsR.rows?.[0]?.metricValues ?? [];
  const activeUsers = num(t[4]?.value);

  const dailyMap = new Map<string, { visitors: number; pageViews: number }>();
  for (const row of dailyR.rows ?? []) {
    const d = row.dimensionValues?.[0]?.value ?? "";
    dailyMap.set(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, {
      visitors: num(row.metricValues?.[0]?.value),
      pageViews: num(row.metricValues?.[1]?.value),
    });
  }

  const events: DashboardData["events"] = {};
  for (const row of eventsR.rows ?? []) {
    events[row.dimensionValues?.[0]?.value as AnalyticsEvent] = {
      count: num(row.metricValues?.[0]?.value),
      people: num(row.metricValues?.[1]?.value),
    };
  }

  return {
    totals: {
      visitors: num(t[0]?.value),
      newVisitors: num(t[1]?.value),
      pageViews: num(t[2]?.value),
      avgEngagementSec: activeUsers ? num(t[3]?.value) / activeUsers : 0,
      countries: countriesR.rowCount ?? countriesR.rows?.length ?? 0,
    },
    daily: lastNDates(days).map((date) => ({ date, ...(dailyMap.get(date) ?? { visitors: 0, pageViews: 0 }) })),
    events,
    countries: (countriesR.rows ?? []).map((r) => ({
      name: r.dimensionValues?.[0]?.value ?? "",
      code: r.dimensionValues?.[1]?.value ?? "",
      visitors: num(r.metricValues?.[0]?.value),
    })),
    sources: (sourcesR.rows ?? []).map((r) => ({
      source: r.dimensionValues?.[0]?.value ?? "",
      channel: r.dimensionValues?.[1]?.value ?? "",
      visitors: num(r.metricValues?.[0]?.value),
    })),
    devices: (deviceReport.rows ?? []).map((r) => ({
      device: r.dimensionValues?.[0]?.value ?? "",
      visitors: num(r.metricValues?.[0]?.value),
    })),
    projects: projectReport
      ? (projectReport.rows ?? [])
          .map((r) => ({ project: r.dimensionValues?.[0]?.value ?? "", clicks: num(r.metricValues?.[0]?.value) }))
          .filter((p) => p.project && p.project !== "(not set)")
      : null,
    activeNow: realtimeReport ? num(realtimeReport.rows?.[0]?.metricValues?.[0]?.value) : null,
  };
}
