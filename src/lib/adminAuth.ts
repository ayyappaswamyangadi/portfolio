import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Single-admin auth for /admin: one password (ADMIN_PASSWORD) and a signed,
// HttpOnly session cookie. The cookie value is `<expiry>.<hmac>` signed with
// ADMIN_SESSION_SECRET, so it can't be forged or extended without the secret.
// Changing ADMIN_PASSWORD also logs every existing session out, because the
// password is folded into the signing key.

export const ADMIN_COOKIE = "admin_session";
export const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;

function signingKey(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return null;
  return createHash("sha256").update(`${secret}:${password}`).digest("hex");
}

export function isAdminConfigured() {
  return signingKey() !== null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash both sides first so the comparison is constant-time even when the
  // lengths differ.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !signingKey()) return false;
  return safeEqual(input, password);
}

export function createSessionToken(now = Date.now()) {
  const key = signingKey();
  if (!key) throw new Error("Admin auth is not configured");
  const expires = String(now + SESSION_MAX_AGE_S * 1000);
  return `${expires}.${sign(expires, key)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()) {
  const key = signingKey();
  if (!key || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) <= now) return false;
  return safeEqual(signature, sign(expires, key));
}

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

// Best-effort brute-force brake. In-memory, so per server instance — enough
// to make guessing slow without adding a database.
const MAX_FAILURES = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

export function isLockedOut(ip: string, now = Date.now()) {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (now - entry.first > LOCK_WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(ip: string, now = Date.now()) {
  const entry = failures.get(ip);
  if (!entry || now - entry.first > LOCK_WINDOW_MS) {
    failures.set(ip, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

export function clearFailures(ip: string) {
  failures.delete(ip);
}
