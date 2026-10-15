import { useSyncExternalStore } from "react";
import { canonical, mergeDocs, normalizeDoc, type ProgressDoc } from "./progressDoc";

/*
 * Opt-in sync through a private GitHub Gist. Progress is encrypted with AES-GCM before upload, so
 * GitHub only ever holds ciphertext. The key comes from the unlock key the password gate remembers
 * (`booster-prep:key`, via HKDF), or from a sync passphrase when no key is remembered.
 * The token, passphrase and Gist id live only in this browser's localStorage.
 */

export const GATE_KEY = "booster-prep:key";
export const SETTINGS_KEY = "booster-prep:sync";
export const STATUS_KEY = "booster-prep:sync:status";
export const GIST_FILE = "booster-prep-sync.json";
const API = "https://api.github.com";
const HKDF_INFO = "booster-prep progress sync v1";
const PBKDF2_ITERATIONS = 310_000;

export interface SyncSettings {
  token: string;
  gistId?: string;
  /** "site": key from the remembered unlock key. "passphrase": key from a passphrase typed on each device. */
  mode: "site" | "passphrase";
  passphrase?: string;
}

export interface SyncStatus {
  lastSync?: string;
  error?: string;
  busy?: boolean;
}

export interface Payload {
  format: "booster-prep-sync";
  v: 1;
  kdf: "hkdf-site-key" | "pbkdf2-passphrase";
  salt: string;
  iv: string;
  data: string;
}

export type KeySource = { kind: "site"; raw: Uint8Array } | { kind: "passphrase"; passphrase: string };

const subtle = () => globalThis.crypto.subtle;
const toB64 = (bytes: Uint8Array) => btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
const fromB64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export async function deriveSyncKey(source: KeySource, salt: Uint8Array) {
  if (source.kind === "site") {
    const base = await subtle().importKey("raw", source.raw as BufferSource, "HKDF", false, ["deriveKey"]);
    return subtle().deriveKey({ name: "HKDF", hash: "SHA-256", salt: salt as BufferSource, info: new TextEncoder().encode(HKDF_INFO) }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  const base = await subtle().importKey("raw", new TextEncoder().encode(source.passphrase), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptDoc(doc: ProgressDoc, source: KeySource): Promise<Payload> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveSyncKey(source, salt);
  const data = await subtle().encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(doc)));
  return { format: "booster-prep-sync", v: 1, kdf: source.kind === "site" ? "hkdf-site-key" : "pbkdf2-passphrase", salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(data)) };
}

export async function decryptDoc(payload: Payload, source: KeySource): Promise<ProgressDoc> {
  const wanted = source.kind === "site" ? "hkdf-site-key" : "pbkdf2-passphrase";
  if (payload.kdf !== wanted)
    throw new SyncError(
      payload.kdf === "hkdf-site-key"
        ? "The synced copy was encrypted with the site password. On this device, unlock with “Remember on this device” checked and pick “Site password” in sync settings."
        : "The synced copy was encrypted with a sync passphrase. Pick “Sync passphrase” in sync settings and enter the same passphrase.",
    );
  try {
    const key = await deriveSyncKey(source, fromB64(payload.salt));
    const plain = await subtle().decrypt({ name: "AES-GCM", iv: fromB64(payload.iv) as BufferSource }, key, fromB64(payload.data) as BufferSource);
    return normalizeDoc(JSON.parse(new TextDecoder().decode(plain)));
  } catch {
    throw new SyncError("Couldn't decrypt the synced copy. Every device must use the same site password, or the same sync passphrase.");
  }
}

export class SyncError extends Error {}

type Fetch = typeof fetch;

async function github(fetcher: Fetch, token: string, path: string, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetcher(`${API}${path}`, {
      ...init,
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", ...(init.body ? { "Content-Type": "application/json" } : {}) },
    });
  } catch {
    throw new SyncError("Couldn't reach GitHub. You may be offline; sync will try again.");
  }
  if (response.status === 401) throw new SyncError("GitHub rejected the token. Check that it hasn't expired and has Gists read and write access.");
  if (response.status === 403 || response.status === 429) throw new SyncError("GitHub refused the request (rate limit or token permissions). Sync will try again later.");
  if (response.status === 404) throw Object.assign(new SyncError("The sync Gist wasn't found."), { notFound: true });
  if (!response.ok) throw new SyncError(`GitHub answered ${response.status}. Sync will try again.`);
  return response.json() as Promise<Record<string, unknown>>;
}

interface GistFiles {
  files?: Record<string, { content?: string; truncated?: boolean } | null>;
}

/** Finds an existing sync Gist by its file name, so a second device joins the first one's Gist. */
export async function findGist(fetcher: Fetch, token: string) {
  const list = (await github(fetcher, token, "/gists?per_page=100")) as unknown as ({ id: string } & GistFiles)[];
  return Array.isArray(list) ? list.find((g) => g.files && GIST_FILE in g.files)?.id : undefined;
}

export async function readGist(fetcher: Fetch, token: string, id: string): Promise<Payload | undefined> {
  const gist = (await github(fetcher, token, `/gists/${encodeURIComponent(id)}`)) as GistFiles;
  const file = gist.files?.[GIST_FILE];
  if (!file?.content) return undefined;
  if (file.truncated) throw new SyncError("The synced file is too large for GitHub to return in one piece.");
  const payload = JSON.parse(file.content) as Payload;
  return payload.format === "booster-prep-sync" ? payload : undefined;
}

export async function writeGist(fetcher: Fetch, token: string, id: string | undefined, payload: Payload) {
  const body = JSON.stringify({ description: "Booster Prep progress (encrypted)", ...(id ? {} : { public: false }), files: { [GIST_FILE]: { content: JSON.stringify(payload) } } });
  const gist = await github(fetcher, token, id ? `/gists/${encodeURIComponent(id)}` : "/gists", { method: id ? "PATCH" : "POST", body });
  return String(gist.id ?? id);
}

/**
 * One round: pull, decrypt, merge newest-wins with this device, then push if the Gist is behind.
 * Returns the merged document (to apply locally) and the Gist id.
 */
export async function syncOnce(opts: { fetcher: Fetch; settings: SyncSettings; source: KeySource; local: ProgressDoc }) {
  const { fetcher, settings, source, local } = opts;
  let gistId = settings.gistId ?? (await findGist(fetcher, settings.token));
  let remote: ProgressDoc | undefined;
  if (gistId) {
    try {
      const payload = await readGist(fetcher, settings.token, gistId);
      if (payload) remote = await decryptDoc(payload, source);
    } catch (error) {
      if (!(error as { notFound?: boolean }).notFound) throw error;
      gistId = undefined; // Deleted on GitHub: start a new one.
    }
  }
  const merged = remote ? mergeDocs(local, remote).doc : local;
  const pushed = !remote || canonical(merged) !== canonical(remote);
  if (pushed) gistId = await writeGist(fetcher, settings.token, gistId, await encryptDoc(merged, source));
  return { doc: merged, gistId: gistId!, pushed, changedLocal: canonical(merged) !== canonical(local) };
}

// ----- Device settings and status (localStorage only) -----

function readJson<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Blocked storage: sync settings won't persist.
  }
}

export const readSettings = () => readJson<SyncSettings>(SETTINGS_KEY);
export const saveSettings = (settings: SyncSettings | undefined) => writeJson(SETTINGS_KEY, settings);

export function rememberedSiteKey(): Uint8Array | undefined {
  try {
    const saved = localStorage.getItem(GATE_KEY);
    return saved ? fromB64(saved) : undefined;
  } catch {
    return undefined;
  }
}

/** The key source for the chosen mode, or a plain-words reason it's missing. */
export function keySource(settings: SyncSettings): KeySource | string {
  if (settings.mode === "passphrase") return settings.passphrase ? { kind: "passphrase", passphrase: settings.passphrase } : "Enter a sync passphrase.";
  const raw = rememberedSiteKey();
  return raw ? { kind: "site", raw } : "This device doesn't remember the site password. Lock, then unlock with “Remember on this device” checked, or use a sync passphrase.";
}

let status: SyncStatus = (typeof window !== "undefined" && readJson<SyncStatus>(STATUS_KEY)) || {};
const statusListeners = new Set<() => void>();
export function setStatus(next: SyncStatus) {
  status = next;
  writeJson(STATUS_KEY, { lastSync: next.lastSync, error: next.error });
  statusListeners.forEach((listener) => listener());
}
export const getStatus = () => status;
export function useSyncStatus() {
  return useSyncExternalStore(
    (listener) => {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    () => status,
    () => status,
  );
}
