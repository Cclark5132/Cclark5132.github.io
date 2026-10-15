import { describe, expect, it } from "vitest";
import { emptyDoc, setEntry, toView, type ProgressDoc } from "../src/lib/progressDoc";
import { decryptDoc, encryptDoc, GIST_FILE, syncOnce, type KeySource, type SyncSettings } from "../src/lib/sync";

const siteKey: KeySource = { kind: "site", raw: new Uint8Array(32).fill(7) };
const doc = setEntry(setEntry(emptyDoc(), "notes", "2", "Hoop stress $pR/t$", "2026-10-26T10:00:00.000Z"), "sessions", "w2-d1-s1", "2026-10-26", "2026-10-26T10:00:00.000Z");

describe("sync encryption", () => {
  it("round-trips with the site key", async () => {
    const payload = await encryptDoc(doc, siteKey);
    expect(payload.kdf).toBe("hkdf-site-key");
    expect(JSON.stringify(payload)).not.toContain("Hoop stress");
    expect(await decryptDoc(payload, siteKey)).toEqual(doc);
  });

  it("round-trips with a passphrase", async () => {
    const source: KeySource = { kind: "passphrase", passphrase: "correct horse" };
    expect(await decryptDoc(await encryptDoc(doc, source), source)).toEqual(doc);
  });

  it("fails in plain words with the wrong key", async () => {
    const payload = await encryptDoc(doc, siteKey);
    await expect(decryptDoc(payload, { kind: "site", raw: new Uint8Array(32).fill(8) })).rejects.toThrow(/Couldn't decrypt/);
    await expect(decryptDoc(payload, { kind: "passphrase", passphrase: "x" })).rejects.toThrow(/site password/);
  });
});

/** A fake api.github.com that stores Gists in memory and records every request. */
function fakeGitHub() {
  const gists = new Map<string, Record<string, { content: string }>>();
  const calls: { method: string; url: string; body?: string; auth?: string }[] = [];
  let n = 0;
  const fetcher = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    const method = init.method ?? "GET";
    const auth = (init.headers as Record<string, string>).Authorization;
    calls.push({ method, url, body: init.body as string | undefined, auth });
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
    if (auth !== "Bearer tok") return json(401, {});
    if (!url.startsWith("https://api.github.com/")) throw new Error("unexpected host");
    if (method === "GET" && url.includes("/gists?")) return json(200, [...gists].map(([id, files]) => ({ id, files })));
    const id = url.split("/gists/")[1];
    if (method === "POST") {
      const newId = `g${++n}`;
      gists.set(newId, JSON.parse(init.body as string).files);
      return json(201, { id: newId });
    }
    if (!gists.has(id)) return json(404, {});
    if (method === "PATCH") gists.set(id, { ...gists.get(id), ...JSON.parse(init.body as string).files });
    return json(200, { id, files: gists.get(id) });
  }) as typeof fetch;
  return { fetcher, gists, calls };
}

describe("syncOnce against a mocked Gist API", () => {
  const settings: SyncSettings = { token: "tok", mode: "site" };

  it("creates a private Gist holding only ciphertext, then a second device merges with it", async () => {
    const gh = fakeGitHub();
    const laptop = await syncOnce({ fetcher: gh.fetcher, settings, source: siteKey, local: doc });
    expect(laptop.pushed).toBe(true);
    const post = gh.calls.find((c) => c.method === "POST")!;
    expect(JSON.parse(post.body!).public).toBe(false);
    const stored = gh.gists.get(laptop.gistId)![GIST_FILE].content;
    expect(stored).not.toContain("Hoop stress");
    expect(stored).not.toContain("w2-d1-s1");

    // The phone has its own newer change and no Gist id yet: it finds the Gist by file name.
    const phoneLocal: ProgressDoc = setEntry(emptyDoc(), "sessions", "w2-d1-s2", "2026-10-26", "2026-10-26T11:00:00.000Z");
    const phone = await syncOnce({ fetcher: gh.fetcher, settings, source: siteKey, local: phoneLocal });
    expect(phone.gistId).toBe(laptop.gistId);
    expect(Object.keys(toView(phone.doc).sessions).sort()).toEqual(["w2-d1-s1", "w2-d1-s2"]);
    expect(phone.pushed).toBe(true);

    // Back on the laptop: pulls the phone's change, nothing new to push.
    const again = await syncOnce({ fetcher: gh.fetcher, settings: { ...settings, gistId: laptop.gistId }, source: siteKey, local: laptop.doc });
    expect(again.changedLocal).toBe(true);
    expect(again.pushed).toBe(false);
    expect(toView(again.doc).notes["2"]).toBe("Hoop stress $pR/t$");
  });

  it("a tombstone on one device beats an older check on the other", async () => {
    const gh = fakeGitHub();
    const a = await syncOnce({ fetcher: gh.fetcher, settings, source: siteKey, local: doc });
    const cleared = setEntry(doc, "sessions", "w2-d1-s1", null, "2026-10-27T09:00:00.000Z");
    await syncOnce({ fetcher: gh.fetcher, settings: { ...settings, gistId: a.gistId }, source: siteKey, local: cleared });
    const back = await syncOnce({ fetcher: gh.fetcher, settings: { ...settings, gistId: a.gistId }, source: siteKey, local: doc });
    expect(toView(back.doc).sessions["w2-d1-s1"]).toBeUndefined();
  });

  it("explains a bad token and makes a new Gist if the old one was deleted", async () => {
    const gh = fakeGitHub();
    await expect(syncOnce({ fetcher: gh.fetcher, settings: { token: "bad", mode: "site" }, source: siteKey, local: doc })).rejects.toThrow(/rejected the token/);
    const result = await syncOnce({ fetcher: gh.fetcher, settings: { ...settings, gistId: "gone" }, source: siteKey, local: doc });
    expect(result.gistId).not.toBe("gone");
    expect(gh.calls.every((c) => c.url.startsWith("https://api.github.com/"))).toBe(true);
  });
});
