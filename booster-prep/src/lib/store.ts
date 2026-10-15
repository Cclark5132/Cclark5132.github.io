import { useSyncExternalStore } from "react";
import { markExported, readBackups, snapshotDaily } from "./backup";
import {
  emptyDoc,
  mergeDocs,
  migrateV1toV2,
  normalizeDoc,
  parseProgressFile,
  replaceDoc,
  setEntry,
  toView,
  type CardState,
  type Grade,
  type Progress,
  type ProgressDoc,
  type Section,
} from "./progressDoc";
import { localToday } from "./schedule";

export type { CardState, Grade, Progress, ProgressDoc };

const KEY_V1 = "booster-prep:progress:v1";
export const KEY = "booster-prep:progress:v2";
const nowIso = () => new Date().toISOString();

/** Loads v2, or migrates v1 once. The v1 key is left in place as the pre-upgrade copy. */
function load(): ProgressDoc {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalizeDoc(JSON.parse(raw));
  } catch {
    // Fall through to v1 or a backup.
  }
  try {
    const old = localStorage.getItem(KEY_V1);
    if (old) {
      const doc = migrateV1toV2(JSON.parse(old), nowIso());
      localStorage.setItem(KEY, JSON.stringify(doc));
      return doc;
    }
  } catch {
    // Nothing readable.
  }
  const backups = readBackups();
  return backups.length ? backups[backups.length - 1].doc : emptyDoc();
}

let doc: ProgressDoc = typeof window === "undefined" ? emptyDoc() : load();
let view: Progress = toView(doc);
const listeners = new Set<() => void>();

export type ChangeSource = "local" | "sync" | "import";
const changeListeners = new Set<(source: ChangeSource) => void>();

/** Called after every change with where it came from. Sync uses it to push local edits. */
export function onChange(listener: (source: ChangeSource) => void) {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

function commit(next: ProgressDoc, source: ChangeSource) {
  if (source !== "sync") snapshotDaily(doc, localToday());
  doc = next;
  view = toView(doc);
  try {
    localStorage.setItem(KEY, JSON.stringify(doc));
  } catch {
    // Storage can be full or blocked (private mode). Progress still works for this visit.
  }
  listeners.forEach((listener) => listener());
  changeListeners.forEach((listener) => listener(source));
}

function put<K extends Section>(section: K, key: string, value: Progress[K][string] | null | false) {
  commit(setEntry(doc, section, key, value, nowIso()), "local");
}

export function getProgress() {
  return view;
}

export function getDoc() {
  return doc;
}

/** Applies a merged copy from sync. */
export function applySynced(next: ProgressDoc) {
  commit(next, "sync");
}

export function useProgress() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => view,
    () => view,
  );
}

// Keep tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) {
      doc = load();
      view = toView(doc);
      listeners.forEach((listener) => listener());
    }
  });
}

/** Checks or unchecks a session. Returns the previous value so the change can be undone. */
export function toggleSession(id: string, today: string) {
  const previous = view.sessions[id] ?? null;
  put("sessions", id, previous ? null : today);
  return previous;
}

export function setSession(id: string, date: string | null) {
  put("sessions", id, date);
}

export function setCheck(id: string, value: boolean) {
  put("checks", id, value);
}

export function setNote(week: number, text: string) {
  put("notes", String(week), text);
}

export function setDeliverable(week: number, value: { done: boolean; link: string }) {
  put("deliverables", String(week), value);
}

export function setCard(id: string, card: CardState) {
  put("cards", id, card);
}

export function setCapstoneEntry(id: string, value: string) {
  put("capstone", id, value);
}

/** Catch-up: move a session to another day (the plan itself is unchanged), or clear the move. */
export function setOverride(id: string, date: string | null) {
  put("overrides", id, date);
}

/** Catch-up: drop a session from the queue. It still counts as missed. */
export function setSkipped(id: string, skipped: boolean) {
  put("skipped", id, skipped);
}

/** Adds minutes studied (from the focus timer) to a session. */
export function addMinutes(id: string, minutes: number) {
  if (!(minutes > 0)) return;
  put("minutes", id, Math.round((view.minutes[id] ?? 0) + minutes));
}

/** Self-check grade: Got it / Shaky / Missed. */
export function setGrade(id: string, grade: Grade) {
  put("grades", id, grade);
}

/** A random id for this browser, so practice tallies from two devices add up instead of overwriting. */
function deviceId() {
  try {
    let id = localStorage.getItem("booster-prep:device");
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      localStorage.setItem("booster-prep:device", id);
    }
    return id;
  } catch {
    return "this-device";
  }
}

/** Counts one practice attempt for a topic. */
export function recordPractice(topic: string, correct: boolean) {
  const key = `${topic}|${deviceId()}`;
  const prev = view.practice[key] ?? { attempts: 0, correct: 0 };
  put("practice", key, { attempts: prev.attempts + 1, correct: prev.correct + (correct ? 1 : 0) });
}

export function exportProgress() {
  markExported();
  return JSON.stringify({ ...doc, exportedAt: nowIso() }, null, 2);
}

/** Merges a progress file (v1 or v2) item by item, newest wins; or replaces everything. */
export function importProgress(json: string, mode: "merge" | "replace" = "merge") {
  const incoming = parseProgressFile(json, nowIso());
  if (mode === "replace") {
    commit(replaceDoc(doc, incoming, nowIso()), "import");
    return { newer: 0, older: 0 };
  }
  const { doc: merged, newer, older } = mergeDocs(doc, incoming);
  if (newer) commit(merged, "import");
  return { newer, older };
}

/** Restores one of the daily snapshots. Restamped, so sync treats it as the newest copy. */
export function restoreBackup(date: string) {
  const backup = readBackups().find((b) => b.date === date);
  if (!backup) throw new Error("That backup is gone.");
  commit(replaceDoc(doc, backup.doc, nowIso()), "import");
}

/** Consecutive days, ending today (or yesterday, so a streak survives until tonight), with any session checked. */
export function studyStreak(sessions: Record<string, string>, today: string, addDays: (iso: string, n: number) => string) {
  const days = new Set(Object.values(sessions));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
