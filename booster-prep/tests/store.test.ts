// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("progress store", () => {
  it("migrates existing v1 progress on first load and keeps the v1 copy", async () => {
    const v1 = { version: 1, sessions: { "w1-d1-s1": "2026-10-16" }, deliverables: {}, notes: { "1": "hi" }, checks: { "setup-0": true }, cards: {}, capstone: {} };
    localStorage.setItem("booster-prep:progress:v1", JSON.stringify(v1));
    const store = await import("../src/lib/store");
    expect(store.getProgress().sessions).toEqual({ "w1-d1-s1": "2026-10-16" });
    expect(store.getProgress().notes["1"]).toBe("hi");
    expect(JSON.parse(localStorage.getItem("booster-prep:progress:v2")!).version).toBe(2);
    expect(localStorage.getItem("booster-prep:progress:v1")).toBe(JSON.stringify(v1));
  });

  it("toggling returns the previous value so Undo can restore it", async () => {
    const store = await import("../src/lib/store");
    expect(store.toggleSession("w2-d1-s1", "2026-10-26")).toBeNull();
    expect(store.getProgress().sessions["w2-d1-s1"]).toBe("2026-10-26");
    const previous = store.toggleSession("w2-d1-s1", "2026-10-27");
    expect(previous).toBe("2026-10-26");
    expect(store.getProgress().sessions["w2-d1-s1"]).toBeUndefined();
    expect(store.getDoc().sessions["w2-d1-s1"].value).toBeNull(); // tombstone
    store.setSession("w2-d1-s1", previous);
    expect(store.getProgress().sessions["w2-d1-s1"]).toBe("2026-10-26");
  });

  it("import merges and reports a summary; replace asks for nothing but overwrites", async () => {
    const store = await import("../src/lib/store");
    store.setCheck("a", true);
    const file = JSON.stringify({ version: 1, exportedAt: "2020-01-01T00:00:00Z", checks: { a: false, b: true } });
    expect(store.importProgress(file)).toEqual({ newer: 1, older: 1 });
    expect(store.getProgress().checks).toEqual({ a: true, b: true });
    store.importProgress(JSON.stringify({ version: 1, checks: { z: true } }), "replace");
    expect(store.getProgress().checks).toEqual({ z: true });
  });

  it("saves a daily backup before the first change of the day and can restore it", async () => {
    const store = await import("../src/lib/store");
    store.setCheck("a", true);
    store.setCheck("b", true); // first snapshot holds {a}
    const backups = (await import("../src/lib/backup")).readBackups();
    expect(backups).toHaveLength(1);
    store.setCheck("a", false);
    store.restoreBackup(backups[0].date);
    expect(store.getProgress().checks).toEqual({ a: true });
  });

  it("asks for persistent storage and reports the answer", async () => {
    const { requestPersistentStorage } = await import("../src/lib/persist");
    const yes = { persisted: async () => false, persist: async () => true } as unknown as StorageManager;
    const no = { persisted: async () => false, persist: async () => false } as unknown as StorageManager;
    expect(await requestPersistentStorage(yes)).toBe("protected");
    expect(await requestPersistentStorage(no)).toBe("not protected");
    expect(await requestPersistentStorage({} as StorageManager)).toBe("unsupported");
  });
});
