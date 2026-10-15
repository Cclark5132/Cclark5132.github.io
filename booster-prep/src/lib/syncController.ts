import { mergeDocs } from "./progressDoc";
import { applySynced, getDoc, onChange } from "./store";
import { getStatus, keySource, readSettings, saveSettings, setStatus, syncOnce } from "./sync";

const DEBOUNCE_MS = 10_000;
let running: Promise<void> | undefined;
let again = false;
let timer: number | undefined;
let started = false;

/** Runs one sync round if sync is set up. Overlapping calls coalesce into one follow-up round. */
export function runSync(): Promise<void> {
  const settings = readSettings();
  if (!settings?.token) return Promise.resolve();
  if (running) {
    again = true;
    return running;
  }
  const source = keySource(settings);
  if (typeof source === "string") {
    setStatus({ ...getStatus(), busy: false, error: source });
    return Promise.resolve();
  }
  setStatus({ ...getStatus(), busy: true });
  running = (async () => {
    try {
      const result = await syncOnce({ fetcher: (...args) => fetch(...args), settings, source, local: getDoc() });
      if (result.gistId !== settings.gistId) saveSettings({ ...settings, gistId: result.gistId });
      // Merge again with what's here now, in case something changed while the round was in flight.
      if (result.changedLocal) applySynced(mergeDocs(getDoc(), result.doc).doc);
      setStatus({ lastSync: new Date().toISOString() });
    } catch (error) {
      setStatus({ ...getStatus(), busy: false, error: error instanceof Error ? error.message : "Sync failed." });
    } finally {
      running = undefined;
      if (again) {
        again = false;
        void runSync();
      }
    }
  })();
  return running;
}

/** Sync on load, about 10 seconds after each change, and whenever the tab is hidden or shown. */
export function startSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  void runSync();
  onChange((source) => {
    if (source === "sync") return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void runSync(), DEBOUNCE_MS);
  });
  document.addEventListener("visibilitychange", () => {
    window.clearTimeout(timer);
    void runSync();
  });
}

/** Forgets the token, passphrase and Gist id on this device. The Gist itself stays on GitHub. */
export function signOutOfSync() {
  saveSettings(undefined);
  setStatus({});
}
