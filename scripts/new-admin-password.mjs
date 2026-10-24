import { randomBytes, scryptSync } from "node:crypto";

const LOG_N = 17;
const N = 2 ** LOG_N;

const password = randomBytes(18).toString("base64url");
const salt = randomBytes(16);
const key = scryptSync(password, salt, 32, { N, r: 8, p: 1, maxmem: 256 * N * 8 });
const hash = `scrypt.${LOG_N}.${salt.toString("base64url")}.${key.toString("base64url")}`;

console.log(`Password (save in your password manager, type it at /admin/login):\n  ${password}\n`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
