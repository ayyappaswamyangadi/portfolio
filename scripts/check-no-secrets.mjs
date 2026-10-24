// Fails the build if a server-only secret appears in browser-facing files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(root);

const SECRET_NAMES = [
  "ADMIN_PASSWORD",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
  "ADMIN_TOTP_SECRET",
  "GA_SERVICE_ACCOUNT_JSON",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_TOKEN",
];

const needles = [];
for (const name of SECRET_NAMES) {
  needles.push({ label: `name ${name}`, text: name });
  const value = process.env[name];
  if (value && value.length >= 8) needles.push({ label: `value of ${name}`, text: value });
}
const key = process.env.GA_SERVICE_ACCOUNT_JSON?.match(/"private_key"\s*:\s*"([^"]{40})/)?.[1];
if (key) needles.push({ label: "GA private key", text: key });

function* files(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(full);
    else yield full;
  }
}

const dirs = [path.join(root, ".next", "static"), path.join(root, "public")];
let scanned = 0;
const leaks = [];
for (const dir of dirs) {
  for (const file of files(dir)) {
    const content = fs.readFileSync(file, "latin1");
    scanned++;
    for (const n of needles) {
      if (content.includes(n.text)) leaks.push(`${n.label} in ${path.relative(root, file)}`);
    }
  }
}

if (leaks.length) {
  console.error("✗ Secret found in browser-facing files — refusing to ship:\n  " + leaks.join("\n  "));
  process.exit(1);
}
const withValues = needles.filter((n) => n.label.startsWith("value")).length;
console.log(`✓ No secrets in ${scanned} browser-facing files (checked ${SECRET_NAMES.length} names, ${withValues} values).`);
