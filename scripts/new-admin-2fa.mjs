import { randomBytes } from "node:crypto";
import QRCode from "qrcode";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32(bytes) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

const secret = base32(randomBytes(20));
const uri = `otpauth://totp/ayyappa.dev:admin?secret=${secret}&issuer=ayyappa.dev&algorithm=SHA1&digits=6&period=30`;

console.log("Scan this with your authenticator app:\n");
console.log(await QRCode.toString(uri, { type: "terminal", small: true }));
console.log(`Can't scan? Add it manually with this key:\n  ${secret}\n`);
console.log(`ADMIN_TOTP_SECRET=${secret}`);
