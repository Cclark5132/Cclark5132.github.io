import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { shouldRegister } from "../src/lib/offline";

const swSource = readFileSync(resolve(__dirname, "../../public/booster-prep/sw.js"), "utf8");
const manifest = JSON.parse(readFileSync(resolve(__dirname, "../../public/booster-prep/manifest.webmanifest"), "utf8"));

/** Runs sw.js against a fake worker global with an in-memory cache and a scripted network. */
function loadWorker(network: (url: string) => Promise<Response>) {
  const store = new Map<string, Response>();
  const cache = {
    addAll: async (urls: string[]) => {
      for (const url of urls) store.set(url, await network(url));
    },
    put: async (key: string, response: Response) => void store.set(key, response),
    match: async (key: string) => store.get(key)?.clone(),
  };
  const listeners: Record<string, (event: unknown) => void> = {};
  const self = {
    location: { origin: "https://charlesclark.me" },
    addEventListener: (type: string, fn: (event: unknown) => void) => (listeners[type] = fn),
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
  };
  const caches = { open: async () => cache, keys: async () => ["booster-prep-v0", "booster-prep-v1", "other"], delete: vi.fn() };
  const fetcher = (request: Request | string) => network(typeof request === "string" ? request : request.url);
  new Function("self", "caches", "fetch", "Response", swSource)(self, caches, fetcher, Response);
  async function request(url: string, method = "GET") {
    let answer: Promise<Response> | undefined;
    const pending: Promise<unknown>[] = [];
    listeners.fetch({ request: new Request(url, { method }), respondWith: (p: Promise<Response>) => (answer = p), waitUntil: (p: Promise<unknown>) => pending.push(p) });
    const response = answer && (await answer);
    await Promise.all(pending);
    return response;
  }
  async function install() {
    const pending: Promise<unknown>[] = [];
    listeners.install({ waitUntil: (p: Promise<unknown>) => pending.push(p) });
    await Promise.all(pending);
  }
  async function activate() {
    const pending: Promise<unknown>[] = [];
    listeners.activate({ waitUntil: (p: Promise<unknown>) => pending.push(p) });
    await Promise.all(pending);
  }
  return { store, request, install, activate, caches };
}

const page = (body: string) => {
  const response = new Response(body, { status: 200 });
  Object.defineProperty(response, "type", { value: "basic" });
  return response;
};

describe("offline service worker", () => {
  it("precaches only the encrypted page, the manifest and the icon", async () => {
    const w = loadWorker(async (url) => page(`net:${url}`));
    await w.install();
    expect([...w.store.keys()].sort()).toEqual(["/booster-prep/", "/booster-prep/icon.svg", "/booster-prep/manifest.webmanifest"]);
    await w.activate();
    expect(w.caches.delete).toHaveBeenCalledWith("booster-prep-v0");
    expect(w.caches.delete).toHaveBeenCalledTimes(1);
  });

  it("serves the page from the network when online and from the cache when offline", async () => {
    let online = true;
    const w = loadWorker(async (url) => {
      if (!online) throw new TypeError("offline");
      return page(`ciphertext v2 for ${new URL(url, "https://charlesclark.me").pathname}`);
    });
    expect(await (await w.request("https://charlesclark.me/booster-prep/"))!.text()).toBe("ciphertext v2 for /booster-prep/");
    online = false;
    expect(await (await w.request("https://charlesclark.me/booster-prep/index.html"))!.text()).toBe("ciphertext v2 for /booster-prep/");
  });

  it("leaves everything else alone: other pages, other origins, Gist sync, non-GET", async () => {
    const w = loadWorker(async () => page("x"));
    expect(await w.request("https://charlesclark.me/")).toBeUndefined();
    expect(await w.request("https://charlesclark.me/booster-prep/other.js")).toBeUndefined();
    expect(await w.request("https://api.github.com/gists")).toBeUndefined();
    expect(await w.request("https://charlesclark.me/booster-prep/", "POST")).toBeUndefined();
    expect(w.store.size).toBe(0);
  });

  it("manifest is scoped to /booster-prep/ and only the published site registers the worker", () => {
    expect(manifest.start_url).toBe("/booster-prep/");
    expect(manifest.scope).toBe("/booster-prep/");
    const nav = { serviceWorker: {} } as unknown as Navigator;
    expect(shouldRegister({ pathname: "/booster-prep/" }, nav, true)).toBe(true);
    expect(shouldRegister({ pathname: "/booster-prep/" }, nav, false)).toBe(false);
    expect(shouldRegister({ pathname: "/" }, nav, true)).toBe(false);
    expect(shouldRegister({ pathname: "/home/x/dist/index.html" }, nav, true)).toBe(false);
    expect(shouldRegister({ pathname: "/booster-prep/" }, {} as Navigator, true)).toBe(false);
  });
});
