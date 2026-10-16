// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function loginRequest(password: string, ip = "10.0.0.1") {
  const body = new URLSearchParams({ password });
  return new NextRequest("https://www.ayyappa.dev/api/admin/login", {
    method: "POST",
    body,
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip },
  });
}

async function load() {
  vi.resetModules();
  return import("./route");
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    vi.stubEnv("ADMIN_PASSWORD", "right-password");
    vi.stubEnv("ADMIN_SESSION_SECRET", "secret");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  async function post(POST: (r: NextRequest) => Promise<Response>, req: NextRequest) {
    const pending = POST(req);
    await vi.runAllTimersAsync();
    return pending;
  }

  it("sets an HttpOnly session cookie and goes to the dashboard on the right password", async () => {
    const { POST } = await load();
    const res = await post(POST, loginRequest("right-password"));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://www.ayyappa.dev/admin");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^admin_session=\d+\./);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=strict/i);
  });

  it("sends a wrong password back to login with no cookie", async () => {
    const { POST } = await load();
    const res = await post(POST, loginRequest("nope"));
    expect(res.headers.get("location")).toBe("https://www.ayyappa.dev/admin/login?error=wrong");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("locks out after 5 wrong attempts, even if the 6th is right", async () => {
    const { POST } = await load();
    for (let i = 0; i < 5; i++) await post(POST, loginRequest("nope", "7.7.7.7"));
    const res = await post(POST, loginRequest("right-password", "7.7.7.7"));
    expect(res.headers.get("location")).toContain("error=locked");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("refuses logins when admin isn't configured", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const { POST } = await load();
    const res = await post(POST, loginRequest(""));
    expect(res.headers.get("location")).toContain("error=setup");
  });
});
