// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

async function load() {
  vi.resetModules();
  return import("./adminAuth");
}

describe("adminAuth", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery");
    vi.stubEnv("ADMIN_SESSION_SECRET", "s3cret");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("accepts only the exact password", async () => {
    const { checkPassword } = await load();
    expect(checkPassword("correct horse battery")).toBe(true);
    expect(checkPassword("correct horse batter")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });

  it("rejects every password when the secret is missing", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    const { checkPassword, isAdminConfigured } = await load();
    expect(isAdminConfigured()).toBe(false);
    expect(checkPassword("correct horse battery")).toBe(false);
  });

  it("verifies its own session token until it expires", async () => {
    const { createSessionToken, verifySessionToken, SESSION_MAX_AGE_S } = await load();
    const now = 1_700_000_000_000;
    const token = createSessionToken(now);
    expect(verifySessionToken(token, now + 1000)).toBe(true);
    expect(verifySessionToken(token, now + SESSION_MAX_AGE_S * 1000 + 1)).toBe(false);
  });

  it("rejects tampered, malformed or missing tokens", async () => {
    const { createSessionToken, verifySessionToken } = await load();
    const now = Date.now();
    const [expires, sig] = createSessionToken(now).split(".");
    // Pushing the expiry out invalidates the signature.
    expect(verifySessionToken(`${Number(expires) + 1e9}.${sig}`, now)).toBe(false);
    expect(verifySessionToken(`${expires}.AAAA`, now)).toBe(false);
    expect(verifySessionToken("garbage", now)).toBe(false);
    expect(verifySessionToken(undefined, now)).toBe(false);
  });

  it("logs everyone out when the password changes", async () => {
    const first = await load();
    const token = first.createSessionToken();
    vi.stubEnv("ADMIN_PASSWORD", "a new password");
    const second = await load();
    expect(second.verifySessionToken(token)).toBe(false);
  });

  it("locks an IP out after 5 failures, for 15 minutes", async () => {
    const { isLockedOut, recordFailure, clearFailures } = await load();
    const t = 1_000_000;
    for (let i = 0; i < 4; i++) recordFailure("1.2.3.4", t);
    expect(isLockedOut("1.2.3.4", t)).toBe(false);
    recordFailure("1.2.3.4", t);
    expect(isLockedOut("1.2.3.4", t)).toBe(true);
    expect(isLockedOut("5.6.7.8", t)).toBe(false);
    expect(isLockedOut("1.2.3.4", t + 15 * 60 * 1000 + 1)).toBe(false);
    recordFailure("9.9.9.9", t);
    clearFailures("9.9.9.9");
    expect(isLockedOut("9.9.9.9", t)).toBe(false);
  });
});
