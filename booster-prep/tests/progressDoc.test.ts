import { describe, expect, it } from "vitest";
import { addSnapshot, daysSince } from "../src/lib/backup";
import { emptyDoc, mergeDocs, migrateV1toV2, parseProgressFile, replaceDoc, setEntry, toView } from "../src/lib/progressDoc";

const T0 = "2026-10-20T12:00:00.000Z";
const T1 = "2026-10-21T12:00:00.000Z";
const T2 = "2026-10-22T12:00:00.000Z";

const v1 = {
  version: 1,
  sessions: { "w1-d1-s1": "2026-10-16", "w1-d1-s2": "2026-10-16" },
  deliverables: { "1": { done: true, link: "https://github.com/x" } },
  notes: { "1": "Running load $N_x$" },
  checks: { "setup-0": true },
  cards: { "f-a": { due: "2026-10-20", interval: 2, reps: 1 } },
  capstone: { tmin: "11.9" },
};

describe("migrateV1toV2", () => {
  it("keeps every v1 item and stamps it with the migration time", () => {
    const doc = migrateV1toV2(v1, T0);
    expect(doc.version).toBe(2);
    expect(doc.sessions["w1-d1-s1"]).toEqual({ value: "2026-10-16", updatedAt: T0 });
    expect(doc.cards["f-a"].updatedAt).toBe(T0);
    const view = toView(doc);
    expect(view.sessions).toEqual(v1.sessions);
    expect(view.deliverables).toEqual(v1.deliverables);
    expect(view.notes).toEqual(v1.notes);
    expect(view.checks).toEqual(v1.checks);
    expect(view.cards).toEqual(v1.cards);
    expect(view.capstone).toEqual(v1.capstone);
  });

  it("still imports v1 files, stamped with their export time", () => {
    const doc = parseProgressFile(JSON.stringify({ ...v1, exportedAt: T1 }), T2);
    expect(doc.sessions["w1-d1-s1"].updatedAt).toBe(T1);
    expect(() => parseProgressFile("{}", T2)).toThrow(/progress file/);
    expect(() => parseProgressFile("not json", T2)).toThrow(/progress file/);
  });
});

describe("tombstones", () => {
  it("an unchecked item stays as a tombstone and drops out of the view", () => {
    let doc = setEntry(emptyDoc(), "checks", "a", true, T0);
    doc = setEntry(doc, "checks", "a", false, T1);
    doc = setEntry(doc, "sessions", "w1-d1-s1", null, T1);
    expect(doc.checks.a).toEqual({ value: false, updatedAt: T1 });
    expect(doc.sessions["w1-d1-s1"]).toEqual({ value: null, updatedAt: T1 });
    expect(toView(doc).checks).toEqual({});
    expect(toView(doc).sessions).toEqual({});
  });
});

describe("mergeDocs: newest wins per item", () => {
  it("the same item changed on two devices keeps the newer change", () => {
    const laptop = setEntry(emptyDoc(), "notes", "3", "laptop text", T1);
    const phone = setEntry(emptyDoc(), "notes", "3", "phone text", T2);
    expect(toView(mergeDocs(laptop, phone).doc).notes["3"]).toBe("phone text");
    expect(toView(mergeDocs(phone, laptop).doc).notes["3"]).toBe("phone text");
  });

  it("a newer tombstone beats an older check, and a newer check beats an older tombstone", () => {
    const checked = setEntry(emptyDoc(), "sessions", "s", "2026-10-20", T0);
    const cleared = setEntry(emptyDoc(), "sessions", "s", null, T1);
    expect(toView(mergeDocs(checked, cleared).doc).sessions.s).toBeUndefined();
    const rechecked = setEntry(emptyDoc(), "sessions", "s", "2026-10-22", T2);
    expect(toView(mergeDocs(cleared, rechecked).doc).sessions.s).toBe("2026-10-22");
  });

  it("counts newer and older items for the import summary", () => {
    let local = setEntry(emptyDoc(), "checks", "a", true, T2);
    local = setEntry(local, "checks", "b", true, T0);
    let file = setEntry(emptyDoc(), "checks", "a", false, T1); // older: skipped
    file = setEntry(file, "checks", "b", false, T1); // newer: taken
    file = setEntry(file, "checks", "c", true, T0); // new here: taken
    const { doc, newer, older } = mergeDocs(local, file);
    expect({ newer, older }).toEqual({ newer: 2, older: 1 });
    expect(toView(doc).checks).toEqual({ a: true, c: true });
  });

  it("ties break the same way on every device, and identical items aren't counted", () => {
    const a = setEntry(emptyDoc(), "capstone", "tmin", "11.8", T1);
    const b = setEntry(emptyDoc(), "capstone", "tmin", "11.9", T1);
    expect(toView(mergeDocs(a, b).doc).capstone.tmin).toBe(toView(mergeDocs(b, a).doc).capstone.tmin);
    expect(mergeDocs(a, a)).toMatchObject({ newer: 0, older: 0 });
  });
});

describe("replaceDoc", () => {
  it("restamps the incoming copy and tombstones items it doesn't have", () => {
    let current = setEntry(emptyDoc(), "checks", "x", true, T2);
    current = setEntry(current, "sessions", "s", "2026-10-22", T2);
    const incoming = setEntry(emptyDoc(), "notes", "1", "kept", T0);
    const doc = replaceDoc(current, incoming, "2026-10-23T00:00:00.000Z");
    expect(toView(doc)).toMatchObject({ checks: {}, sessions: {}, notes: { "1": "kept" } });
    expect(doc.checks.x).toEqual({ value: false, updatedAt: "2026-10-23T00:00:00.000Z" });
    // A later merge with the old copy can't bring the cleared items back.
    expect(toView(mergeDocs(doc, current).doc).checks).toEqual({});
  });
});

describe("daily backups", () => {
  it("keeps one snapshot per day and only the last 7 days", () => {
    const doc = setEntry(emptyDoc(), "checks", "a", true, T0);
    let list = addSnapshot([], doc, "2026-10-20", T0);
    expect(addSnapshot(list, doc, "2026-10-20", T1)).toBe(list);
    for (let d = 21; d <= 29; d++) list = addSnapshot(list, doc, `2026-10-${d}`, T0);
    expect(list.map((b) => b.date)).toEqual(["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29"]);
    expect(addSnapshot([], emptyDoc(), "2026-10-20", T0)).toEqual([]);
  });

  it("days since the last export", () => {
    expect(daysSince(undefined)).toBeUndefined();
    expect(daysSince("2026-10-11T12:00:00Z", Date.parse("2026-10-20T13:00:00Z"))).toBe(9);
  });
});
