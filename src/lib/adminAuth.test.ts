// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

async function usePassword(password: string) {
  const { hashPassword } = await import("@/lib/adminAuth");
  vi.stubEnv("ADMIN_PASSWORD_HASH", password ? await hashPassword(password, 14) : "");
}

async function load() {
  vi.resetModules();
  return import("./adminAuth");
}

describe("adminAuth", () => {
  beforeEach(async () => {
    await usePassword("correct horse battery");
    vi.stubEnv("ADMIN_SESSION_SECRET", "s3cret");
    vi.stubEnv("ADMIN_TOTP_SECRET", "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("accepts only the exact password", async () => {
    const { checkPassword } = await load();
    expect(await checkPassword("correct horse battery")).toBe(true);
    expect(await checkPassword("correct horse batter")).toBe(false);
    expect(await checkPassword("")).toBe(false);
  });

  it("stores only a salted hash, never the password", async () => {
    const { hashPassword } = await load();
    const a = await hashPassword("correct horse battery", 14);
    const b = await hashPassword("correct horse battery", 14);
    expect(a).toMatch(/^scrypt\.14\.[\w-]+\.[\w-]+$/);
    expect(a).not.toContain("correct");
    expect(a).not.toBe(b); // random salt
  });

  it("accepts the password printed by `npm run admin:password`", async () => {
    const { execFileSync } = await import("child_process");
    const out = execFileSync("node", ["scripts/new-admin-password.mjs"], { encoding: "utf8" });
    const password = out.match(/login\):\n {2}(\S+)/)![1];
    const hash = out.match(/^ADMIN_PASSWORD_HASH=(\S+)$/m)![1];
    vi.stubEnv("ADMIN_PASSWORD_HASH", hash);
    const { checkPassword } = await load();
    expect(await checkPassword(password)).toBe(true);
    expect(await checkPassword(password + "x")).toBe(false);
  });

  it("rejects a malformed hash", async () => {
    vi.stubEnv("ADMIN_PASSWORD_HASH", "correct horse battery");
    const { checkPassword, isAdminConfigured } = await load();
    expect(isAdminConfigured()).toBe(false);
    expect(await checkPassword("correct horse battery")).toBe(false);
  });

  it("generates RFC 6238 authenticator codes", async () => {
    const { totpCode } = await load();
    // RFC 6238 appendix B, SHA-1 seed "12345678901234567890", last 6 digits.
    const seed = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(totpCode(seed, 59_000)).toBe("287082");
    expect(totpCode(seed, 1_111_111_109_000)).toBe("081804");
    expect(totpCode(seed, 2_000_000_000_000)).toBe("279037");
  });

  it("accepts the current code with ±30s of clock drift, nothing older", async () => {
    const { totpCode, matchTotp } = await load();
    const secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
    const now = 1_700_000_000_000;
    expect(matchTotp(totpCode(secret, now), now)).not.toBeNull();
    expect(matchTotp(totpCode(secret, now - 30_000), now)).not.toBeNull();
    expect(matchTotp(totpCode(secret, now + 30_000), now)).not.toBeNull();
    expect(matchTotp(totpCode(secret, now - 90_000), now)).toBeNull();
    expect(matchTotp("12345", now)).toBeNull();
  });

  it("works with the secret printed by `npm run admin:2fa`", async () => {
    const { execFileSync } = await import("child_process");
    const out = execFileSync("node", ["scripts/new-admin-2fa.mjs"], { encoding: "utf8" });
    const secret = out.match(/^ADMIN_TOTP_SECRET=([A-Z2-7]{32})$/m)![1];
    vi.stubEnv("ADMIN_TOTP_SECRET", secret);
    const { totpCode, matchTotp, isAdminConfigured } = await load();
    expect(isAdminConfigured()).toBe(true);
    expect(matchTotp(totpCode(secret))).not.toBeNull();
  });

  it("refuses to run without the 2FA secret", async () => {
    vi.stubEnv("ADMIN_TOTP_SECRET", "");
    const { isAdminConfigured } = await load();
    expect(isAdminConfigured()).toBe(false);
  });

  it("rejects every password when the secret is missing", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    const { checkPassword, isAdminConfigured } = await load();
    expect(isAdminConfigured()).toBe(false);
    expect(await checkPassword("correct horse battery")).toBe(false);
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
    await usePassword("a new password");
    const second = await load();
    expect(second.verifySessionToken(token)).toBe(false);
  });

  it("locks login for everyone after 3 reserved attempts, until the password changes", async () => {
    const first = await load();
    for (let i = 0; i < 3; i++) expect(await first.reserveAttempt()).toBe(true);
    expect(await first.isLoginLocked()).toBe(true);
    expect(await first.reserveAttempt()).toBe(false);
    // A new password gets a fresh counter.
    await usePassword("a new password");
    expect(await first.isLoginLocked()).toBe(false);
    expect(await first.reserveAttempt()).toBe(true);
  });

  it("gives attempts back after a successful login", async () => {
    const { reserveAttempt, resetAttempts, failedAttempts } = await load();
    await reserveAttempt();
    await reserveAttempt();
    await resetAttempts();
    expect(await failedAttempts()).toBe(0);
  });

  it("uses Upstash Redis when configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
    const fetchMock = vi.fn(async () => Response.json({ result: 4 }));
    vi.stubGlobal("fetch", fetchMock);
    const { reserveAttempt } = await load();
    expect(await reserveAttempt()).toBe(false);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://redis.example");
    expect(init.headers).toEqual({ Authorization: "Bearer tok" });
    expect(JSON.parse(String(init.body))).toEqual(["INCR", expect.stringMatching(/^admin:failed-logins:[0-9a-f]{32}$/)]);
    vi.unstubAllGlobals();
  });

  it("fails closed in production without a lockout store", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { isLockoutStoreConfigured, reserveAttempt } = await load();
    expect(isLockoutStoreConfigured()).toBe(false);
    await expect(reserveAttempt()).rejects.toThrow();
  });
});
