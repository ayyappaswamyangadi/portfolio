// @vitest-environment node
import { generateKeyPairSync } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const KEY_JSON = JSON.stringify({
  client_email: "dash@proj.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
});

const row = (dims: string[], metrics: (string | number)[]) => ({
  dimensionValues: dims.map((value) => ({ value })),
  metricValues: metrics.map((v) => ({ value: String(v) })),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function load() {
  vi.resetModules();
  return import("./gaData");
}

describe("gaData", () => {
  beforeEach(() => {
    vi.stubEnv("GA_PROPERTY_ID", "123456");
    vi.stubEnv("GA_SERVICE_ACCOUNT_JSON", KEY_JSON);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("parseRange falls back to 28 days for unknown values", async () => {
    const { parseRange } = await load();
    expect(parseRange("7d")).toBe("7d");
    expect(parseRange("forever")).toBe("28d");
    expect(parseRange(undefined)).toBe("28d");
  });

  it("reports not-configured when env vars are missing", async () => {
    vi.stubEnv("GA_PROPERTY_ID", "");
    const { getDashboardData } = await load();
    await expect(getDashboardData("7d", ["download_cv"])).rejects.toThrow("not-configured");
  });

  it("explains a bad key file in plain words", async () => {
    vi.stubEnv("GA_SERVICE_ACCOUNT_JSON", "{not json");
    const { readGaConfig } = await load();
    expect(() => readGaConfig()).toThrow(/not valid JSON/);
  });

  it("turns GA reports into dashboard numbers, filling empty days with zero", async () => {
    const { getDashboardData, lastNDates } = await load();
    const days = lastNDates(7);
    const ymd = (iso: string) => iso.replaceAll("-", "");
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("oauth2")) return json({ access_token: "tok", expires_in: 3600 });
      expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok");
      expect(url).toContain("properties/123456");
      if (url.endsWith(":batchRunReports")) {
        return json({
          reports: [
            { rows: [row([], [40, 30, 90, 1200, 40])] },
            { rows: [row([ymd(days[6])], [25, 60]), row([ymd(days[2])], [15, 30])] },
            { rows: [row(["download_cv"], [7, 5]), row(["message_sent"], [2, 2])] },
            { rows: [row(["India", "IN"], [30]), row(["United States", "US"], [10])], rowCount: 4 },
            { rows: [row(["linkedin.com", "Organic Social"], [22])] },
          ],
        });
      }
      if (url.endsWith(":runRealtimeReport")) return json({ rows: [row([], [3])] });
      const body = JSON.parse(String(init?.body));
      if (body.dimensions[0].name === "deviceCategory") return json({ rows: [row(["mobile"], [28])] });
      // project custom dimension not registered
      return json({ error: { message: "Field customEvent:project is not a valid dimension" } }, 400);
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await getDashboardData("7d", ["download_cv", "message_sent", "github_click"]);

    expect(data.totals).toEqual({ visitors: 40, newVisitors: 30, pageViews: 90, avgEngagementSec: 30, countries: 4 });
    expect(data.daily).toHaveLength(7);
    expect(data.daily[6]).toEqual({ date: days[6], visitors: 25, pageViews: 60 });
    expect(data.daily[0]).toEqual({ date: days[0], visitors: 0, pageViews: 0 });
    expect(data.events.download_cv).toEqual({ count: 7, people: 5 });
    expect(data.events.github_click).toBeUndefined();
    expect(data.countries[0]).toEqual({ name: "India", code: "IN", visitors: 30 });
    expect(data.sources[0]).toEqual({ source: "linkedin.com", channel: "Organic Social", visitors: 22 });
    expect(data.devices).toEqual([{ device: "mobile", visitors: 28 }]);
    expect(data.projects).toBeNull();
    expect(data.activeNow).toBe(3);

    const batchCall = fetchMock.mock.calls.find(([u]) => String(u).endsWith(":batchRunReports"))!;
    const { requests } = JSON.parse(String(batchCall[1]!.body));
    expect(requests[0].dateRanges).toEqual([{ startDate: "6daysAgo", endDate: "today" }]);
    expect(requests[2].dimensionFilter.filter.inListFilter.values).toEqual([
      "download_cv",
      "message_sent",
      "github_click",
    ]);
  });

  it("explains a permission error in plain words", async () => {
    const { getDashboardData } = await load();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("oauth2")
          ? json({ access_token: "tok", expires_in: 3600 })
          : json({ error: { message: "User does not have sufficient permissions" } }, 403),
      ),
    );
    await expect(getDashboardData("28d", ["download_cv"])).rejects.toThrow(/Property access management/);
  });
});
