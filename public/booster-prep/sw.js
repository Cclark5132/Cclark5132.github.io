/*
 * Booster Prep offline support. Caches only the encrypted gate page and the manifest, so the site
 * opens offline after one online visit. The page is ciphertext until it is unlocked in the browser,
 * and the decrypted app never goes over the network, so nothing decrypted is ever cached.
 * Network first: a new deploy shows up as soon as the phone is online.
 */
const CACHE = "booster-prep-v1";
const PAGE = "/booster-prep/";
const SHELL = [PAGE, "/booster-prep/manifest.webmanifest", "/booster-prep/icon.svg"];

/** The cache key for a request this worker handles, or null to leave it to the browser. */
function shellKey(request) {
  if (request.method !== "GET") return null;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return null;
  const path = url.pathname === "/booster-prep/index.html" || url.pathname === "/booster-prep" ? PAGE : url.pathname;
  return SHELL.includes(path) ? path : null;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("booster-prep-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const key = shellKey(event.request);
  if (!key) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(key, copy)));
        }
        return response;
      })
      .catch(() => caches.open(CACHE).then((cache) => cache.match(key)).then((hit) => hit || Response.error())),
  );
});
