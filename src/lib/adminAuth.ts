import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;

// scrypt.<log2 N>.<salt>.<key> — no `$`, which Next expands in .env files.
const DEFAULT_LOG_N = 17;
const KEY_LEN = 32;

function scryptAsync(password: string, salt: Buffer, logN: number) {
  const N = 2 ** logN;
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEY_LEN, { N, r: 8, p: 1, maxmem: 256 * N * 8 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string, logN = DEFAULT_LOG_N) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, logN);
  return `scrypt.${logN}.${salt.toString("base64url")}.${key.toString("base64url")}`;
}

function parseHash(stored: string | undefined) {
  const [scheme, logN, salt, key] = (stored ?? "").split(".");
  if (scheme !== "scrypt" || !/^\d+$/.test(logN ?? "") || !salt || !key) return null;
  const n = Number(logN);
  if (n < 14 || n > 20) return null;
  return { logN: n, salt: Buffer.from(salt, "base64url"), key: Buffer.from(key, "base64url") };
}

function totpKey(): Buffer | null {
  const key = base32Decode(process.env.ADMIN_TOTP_SECRET ?? "");
  return key && key.length >= 16 ? key : null;
}

function signingKey(): string | null {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const totp = process.env.ADMIN_TOTP_SECRET;
  if (!secret || !parseHash(hash) || !totpKey()) return null;
  return createHash("sha256").update(`${secret}:${hash}:${totp}`).digest("hex");
}

export function isAdminConfigured() {
  return signingKey() !== null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function checkPassword(input: string) {
  const parsed = parseHash(process.env.ADMIN_PASSWORD_HASH);
  if (!parsed || !signingKey() || parsed.key.length !== KEY_LEN) return false;
  const key = await scryptAsync(input, parsed.salt, parsed.logN);
  return timingSafeEqual(key, parsed.key);
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Buffer | null {
  const clean = input.replace(/[\s=]/g, "").toUpperCase();
  if (!clean || /[^A-Z2-7]/.test(clean)) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

const TOTP_STEP_S = 30;

function hotp(key: Buffer, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac("sha1", key).update(msg).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const code = (mac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

export function totpCode(secret: string, now = Date.now()) {
  const key = base32Decode(secret);
  if (!key) throw new Error("Invalid TOTP secret");
  return hotp(key, Math.floor(now / 1000 / TOTP_STEP_S));
}

// Matched time step (±1 for drift) or null.
export function matchTotp(input: string, now = Date.now()): number | null {
  const key = totpKey();
  const code = input.replace(/\s/g, "");
  if (!key || !/^\d{6}$/.test(code)) return null;
  const step = Math.floor(now / 1000 / TOTP_STEP_S);
  let matched: number | null = null;
  for (const s of [step - 1, step, step + 1]) {
    if (timingSafeEqual(Buffer.from(hotp(key, s)), Buffer.from(code))) matched = s;
  }
  return matched;
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

export const MAX_ATTEMPTS = 3;

function fingerprint(): string | null {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!signingKey()) return null;
  return createHash("sha256").update(`lockout:${secret}:${hash}`).digest("hex").slice(0, 32);
}

function lockKey(): string | null {
  const fp = fingerprint();
  return fp ? `admin:failed-logins:${fp}` : null;
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export function isLockoutStoreConfigured() {
  return redisConfig() !== null || process.env.NODE_ENV !== "production";
}

const memory = new Map<string, number>();

async function redis(command: (string | number)[]): Promise<string | number | null> {
  const config = redisConfig();
  if (!config) throw new Error("Lockout store is not configured");
  const res = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Lockout store error: ${res.status}`);
  const { result } = (await res.json()) as { result: string | number | null };
  return result;
}

async function store(op: "get" | "incr" | "del" | "claim", key: string): Promise<number> {
  if (redisConfig()) {
    if (op === "claim") return (await redis(["SET", key, 1, "NX", "EX", 300])) === "OK" ? 1 : 0;
    const command = { get: ["GET", key], incr: ["INCR", key], del: ["DEL", key] }[op];
    return Number((await redis(command)) ?? 0);
  }
  if (!isLockoutStoreConfigured()) throw new Error("Lockout store is not configured");
  if (op === "get") return memory.get(key) ?? 0;
  if (op === "del") return Number(memory.delete(key));
  if (op === "claim") {
    if (memory.has(key)) return 0;
    memory.set(key, 1);
    return 1;
  }
  const next = (memory.get(key) ?? 0) + 1;
  memory.set(key, next);
  return next;
}

export async function failedAttempts() {
  const key = lockKey();
  return key ? store("get", key) : 0;
}

export async function isLoginLocked() {
  return (await failedAttempts()) >= MAX_ATTEMPTS;
}

export async function reserveAttempt() {
  const key = lockKey();
  if (!key) return false;
  return (await store("incr", key)) <= MAX_ATTEMPTS;
}

export async function claimTotpStep(step: number) {
  const fp = fingerprint();
  if (!fp) return false;
  return (await store("claim", `admin:totp-used:${fp}:${step}`)) === 1;
}

export async function resetAttempts() {
  const key = lockKey();
  if (key) await store("del", key);
}
