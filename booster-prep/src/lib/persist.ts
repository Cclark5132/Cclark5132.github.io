import { useSyncExternalStore } from "react";

/** Whether the browser agreed not to evict this site's storage. */
export type StorageState = "checking" | "protected" | "not protected" | "unsupported";

let state: StorageState = "checking";
const listeners = new Set<() => void>();
const set = (next: StorageState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

/** Asks once per load for durable storage, so Safari and Chrome don't clear progress for an idle site. */
export async function requestPersistentStorage(storage: StorageManager | undefined = typeof navigator === "undefined" ? undefined : navigator.storage) {
  if (!storage?.persist) {
    set("unsupported");
    return state;
  }
  try {
    const already = storage.persisted ? await storage.persisted() : false;
    set(already || (await storage.persist()) ? "protected" : "not protected");
  } catch {
    set("not protected");
  }
  return state;
}

export function useStorageState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}
