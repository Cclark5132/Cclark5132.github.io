/**
 * Encrypts the single-file build (dist/index.html) behind a password gate.
 *
 *   BOOSTER_PREP_PASSWORD=... node scripts/encrypt.mjs [output path]
 *
 * The page is gzipped, then encrypted with AES-256-GCM using a key derived from the password with
 * PBKDF2-SHA256 (600,000 iterations). Only the ciphertext ships; without the password the content
 * can't be read, even from the page source. The browser derives the same key with WebCrypto,
 * decrypts, decompresses and swaps the page in.
 */
import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const password = process.env.BOOSTER_PREP_PASSWORD ?? "";
const out = resolve(process.argv[2] ?? resolve(root, "dist-encrypted/index.html"));
const ITERATIONS = 600_000;

if (password.length < 8) {
  console.error("encrypt: set BOOSTER_PREP_PASSWORD (at least 8 characters).");
  process.exit(1);
}

// A fixed, public salt keeps "remember me" working across deploys. The salt doesn't need to be secret.
const { salt } = JSON.parse(readFileSync(resolve(root, "gate.config.json"), "utf8"));
const html = readFileSync(resolve(root, "dist/index.html"));
const key = pbkdf2Sync(password, Buffer.from(salt, "base64"), ITERATIONS, 32, "sha256");
const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const body = Buffer.concat([cipher.update(gzipSync(html, { level: 9 })), cipher.final(), cipher.getAuthTag()]);

const payload = { v: 1, iter: ITERATIONS, salt, iv: iv.toString("base64"), data: body.toString("base64") };
const template = readFileSync(resolve(root, "scripts/gate.html"), "utf8");
if (!template.includes("__PAYLOAD__")) throw new Error("gate.html is missing the __PAYLOAD__ marker");
const page = template.replace("__PAYLOAD__", () => JSON.stringify(payload));

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`encrypt: wrote ${out} (${(page.length / 1024).toFixed(0)} KB, from ${(html.length / 1024).toFixed(0)} KB)`);
