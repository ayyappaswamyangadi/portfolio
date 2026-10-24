// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { totpCode } from "@/lib/adminAuth";

const TOTP_SECRET = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
const code = (offsetS = 0) => totpCode(TOTP_SECRET, Date.now() + offsetS * 1000);

function loginRequest(password: string, ip = "10.0.0.1", otp = code()) {
  const body = new URLSearchParams({ password, code: otp });
  return new NextRequest("https://www.ayyappa.dev/api/admin/login", {
    method: "POST",
    body,
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": ip },
  });
}

async function usePassword(password: string) {
  const { hashPassword } = await import("@/lib/adminAuth");
  vi.stubEnv("ADMIN_PASSWORD_HASH", password ? await hashPassword(password, 14) : "");
}

async function load() {
  vi.resetModules();
  return import("./route");
}

describe("POST /api/admin/login", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    await usePassword("right-password");
    vi.stubEnv("ADMIN_SESSION_SECRET", "secret");
    vi.stubEnv("ADMIN_TOTP_SECRET", TOTP_SECRET);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  async function post(POST: (r: NextRequest) => Promise<Response>, req: NextRequest) {
    // scrypt runs on the thread pool, so keep ticking the fake clock until the
    // request settles instead of flushing timers once.
    let done = false;
    const pending = POST(req).finally(() => (done = true));
    while (!done) {
      await vi.advanceTimersByTimeAsync(1000);
      await new Promise((r) => setImmediate(r));
    }
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

  it("locks out after 3 wrong attempts from anywhere, even if the 4th is right", async () => {
    const { POST } = await load();
    for (const ip of ["1.1.1.1", "2.2.2.2", "3.3.3.3"]) {
      const res = await post(POST, loginRequest("nope", ip));
      expect(res.headers.get("location")).toContain("error=wrong");
    }
    const res = await post(POST, loginRequest("right-password", "4.4.4.4"));
    expect(res.headers.get("location")).toContain("error=locked");
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("unlocks only once the owner sets a new password; the old one stays dead", async () => {
    const { POST } = await load();
    for (let i = 0; i < 3; i++) await post(POST, loginRequest("nope"));
    await usePassword("brand-new-password");
    const old = await post(POST, loginRequest("right-password"));
    expect(old.headers.get("location")).toContain("error=wrong");
    const res = await post(POST, loginRequest("brand-new-password"));
    expect(res.headers.get("location")).toBe("https://www.ayyappa.dev/admin");
  });

  it("needs the authenticator code too: the right password alone fails", async () => {
    const { POST } = await load();
    const wrongCode = String((Number(code()) + 1) % 1_000_000).padStart(6, "0");
    for (const otp of ["", "abcdef", wrongCode]) {
      const res = await post(POST, loginRequest("right-password", "10.0.0.1", otp));
      expect(res.headers.get("location")).toContain("error=wrong");
      expect(res.headers.get("set-cookie")).toBeNull();
    }
    // ...and those count toward the lockout.
    const res = await post(POST, loginRequest("right-password"));
    expect(res.headers.get("location")).toContain("error=locked");
  });

  it("accepts each code only once", async () => {
    const { POST } = await load();
    const otp = code();
    const first = await post(POST, loginRequest("right-password", "10.0.0.1", otp));
    expect(first.headers.get("location")).toBe("https://www.ayyappa.dev/admin");
    const replay = await post(POST, loginRequest("right-password", "10.0.0.1", otp));
    expect(replay.headers.get("location")).toContain("error=wrong");
  });

  it("resets the count after a successful login", async () => {
    const { POST } = await load();
    for (let i = 0; i < 2; i++) await post(POST, loginRequest("nope"));
    await post(POST, loginRequest("right-password", "10.0.0.1", code(-30)));
    for (let i = 0; i < 2; i++) await post(POST, loginRequest("nope"));
    const res = await post(POST, loginRequest("right-password", "10.0.0.1", code(0)));
    expect(res.headers.get("location")).toBe("https://www.ayyappa.dev/admin");
  });

  it("refuses logins when admin isn't configured", async () => {
    await usePassword("");
    const { POST } = await load();
    const res = await post(POST, loginRequest(""));
    expect(res.headers.get("location")).toContain("error=setup");
  });
});
