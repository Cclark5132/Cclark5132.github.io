/**
 * Installable and offline. The published page lives at /booster-prep/ as the encrypted gate; once it
 * is unlocked this app adds the manifest link and registers /booster-prep/sw.js, which caches only
 * that encrypted page and the manifest (see public/booster-prep/sw.js in the portfolio). Nothing
 * happens in dev, over plain http, or from a file:// copy.
 */
export const OFFLINE_SCOPE = "/booster-prep/";

export function shouldRegister(loc: Pick<Location, "pathname">, nav: Navigator, secure: boolean) {
  return secure && loc.pathname.startsWith(OFFLINE_SCOPE) && "serviceWorker" in nav;
}

export function installOffline(win: Window = window) {
  if (!import.meta.env.PROD || !shouldRegister(win.location, win.navigator, win.isSecureContext)) return;
  const doc = win.document;
  if (!doc.querySelector('link[rel="manifest"]')) {
    const link = doc.createElement("link");
    link.rel = "manifest";
    link.href = `${OFFLINE_SCOPE}manifest.webmanifest`;
    doc.head.append(link);
  }
  win.navigator.serviceWorker.register(`${OFFLINE_SCOPE}sw.js`, { scope: OFFLINE_SCOPE }).catch(() => {
    // Offline support is a nice-to-have; the site works the same without it.
  });
}
