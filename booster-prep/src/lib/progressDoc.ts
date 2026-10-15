/**
 * Progress schema v2: every item carries its own `updatedAt`, so two copies (this browser, an
 * import file, the sync Gist) can be merged item by item with the newest change winning.
 *
 * A cleared item is kept as a tombstone (`value: false` for checks, `null` for everything else)
 * rather than deleted, so a merge can tell "unchecked on purpose" from "never touched".
 * Pure functions only: no storage, no React.
 */

/** Spaced-repetition state for one flashcard. `due` is a YYYY-MM-DD date. */
export interface CardState {
  due: string;
  interval: number; // days
  reps: number;
  /** Date the card was first graded, for the daily new-card limit. */
  added?: string;
}

export type Grade = "got" | "shaky" | "missed";

/** What the pages read: plain values, tombstones dropped. */
export interface Progress {
  /** Session id → date it was checked off (YYYY-MM-DD). */
  sessions: Record<string, string>;
  /** Week number → deliverable state. */
  deliverables: Record<string, { done: boolean; link: string }>;
  /** Week number → notes (Markdown). */
  notes: Record<string, string>;
  /** Any other checklist item (setup tasks, capstone steps, launch prep) → checked. */
  checks: Record<string, boolean>;
  cards: Record<string, CardState>;
  /** Capstone answer-check entries (your own minimum thickness and margins), as typed. */
  capstone: Record<string, string>;
  /** Session id → date it was moved to by the catch-up queue (the plan itself is unchanged). */
  overrides: Record<string, string>;
  /** Session id → skipped from the catch-up queue (still counts as missed). */
  skipped: Record<string, boolean>;
  /** Session id → minutes actually studied, from the focus timer. */
  minutes: Record<string, number>;
  /** Self-check id → last grade. */
  grades: Record<string, Grade>;
  /** `${topic}|${device}` → practice attempts and correct answers. Per device, so merges add up instead of overwriting. */
  practice: Record<string, { attempts: number; correct: number }>;
}

export type Section = keyof Progress;
export const SECTIONS: Section[] = ["sessions", "deliverables", "notes", "checks", "cards", "capstone", "overrides", "skipped", "minutes", "grades", "practice"];

export interface Entry<T> {
  value: T | null | false;
  updatedAt: string; // ISO timestamp
}

export type ProgressDoc = { version: 2 } & { [K in Section]: Record<string, Entry<Progress[K][string]>> };

export const emptyView = (): Progress => ({ sessions: {}, deliverables: {}, notes: {}, checks: {}, cards: {}, capstone: {}, overrides: {}, skipped: {}, minutes: {}, grades: {}, practice: {} });

export function emptyDoc(): ProgressDoc {
  const doc = { version: 2 } as ProgressDoc;
  for (const section of SECTIONS) (doc as unknown as Record<string, unknown>)[section] = {};
  return doc;
}

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** v1 stored plain values. Keep every one of them, stamped with `stamp` (the time of the migration). */
export function migrateV1toV2(v1: unknown, stamp: string): ProgressDoc {
  const doc = emptyDoc();
  if (!isObject(v1)) return doc;
  for (const section of SECTIONS) {
    const values = v1[section];
    if (!isObject(values)) continue;
    const out: Record<string, Entry<unknown>> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) continue;
      out[key] = { value: value as never, updatedAt: stamp };
    }
    (doc as unknown as Record<string, unknown>)[section] = out;
  }
  return doc;
}

/** Accepts a v2 document (from storage, a file or the Gist) and drops anything malformed. */
export function normalizeDoc(value: unknown): ProgressDoc {
  const doc = emptyDoc();
  if (!isObject(value)) return doc;
  for (const section of SECTIONS) {
    const entries = value[section];
    if (!isObject(entries)) continue;
    const out: Record<string, Entry<unknown>> = {};
    for (const [key, entry] of Object.entries(entries)) {
      if (isObject(entry) && typeof entry.updatedAt === "string" && "value" in entry) out[key] = { value: entry.value as never, updatedAt: entry.updatedAt };
    }
    (doc as unknown as Record<string, unknown>)[section] = out;
  }
  return doc;
}

/** Reads any progress file: v2 as is, v1 migrated (stamped with its export time when it has one). */
export function parseProgressFile(json: string, now: string): ProgressDoc {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("This doesn't look like a Booster Prep progress file.");
  }
  if (isObject(parsed) && parsed.version === 2) return normalizeDoc(parsed);
  if (isObject(parsed) && parsed.version === 1) return migrateV1toV2(parsed, typeof parsed.exportedAt === "string" ? parsed.exportedAt : now);
  throw new Error("This doesn't look like a Booster Prep progress file.");
}

const isTombstone = (entry: Entry<unknown>) => entry.value === null || entry.value === false;

export function toView(doc: ProgressDoc): Progress {
  const view = emptyView();
  for (const section of SECTIONS) {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(doc[section] as Record<string, Entry<unknown>>)) {
      if (!isTombstone(entry)) out[key] = entry.value;
    }
    (view as unknown as Record<string, unknown>)[section] = out;
  }
  return view;
}

/** Sets one item. Pass `null` (or `false` for a check) to clear it; the tombstone keeps the time. */
export function setEntry<K extends Section>(doc: ProgressDoc, section: K, key: string, value: Progress[K][string] | null | false, now: string): ProgressDoc {
  const entries = doc[section] as Record<string, Entry<unknown>>;
  return { ...doc, [section]: { ...entries, [key]: { value, updatedAt: now } } };
}

/** Stable JSON, so equal documents compare equal no matter the key order. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (isObject(value))
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

/** True when `a` should win over `b`: the newer time, and on a tie a fixed order, so every device agrees. */
function wins(a: Entry<unknown>, b: Entry<unknown>) {
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt;
  return canonical(a.value) > canonical(b.value);
}

export interface MergeResult {
  doc: ProgressDoc;
  /** Incoming items that were newer (or new here) and were taken. */
  newer: number;
  /** Incoming items that were older than what's here and were skipped. */
  older: number;
}

/** Per-item merge: the newest `updatedAt` wins. Neither input is changed. */
export function mergeDocs(local: ProgressDoc, incoming: ProgressDoc): MergeResult {
  const doc = emptyDoc();
  let newer = 0;
  let older = 0;
  for (const section of SECTIONS) {
    const a = local[section] as Record<string, Entry<unknown>>;
    const b = incoming[section] as Record<string, Entry<unknown>>;
    const out: Record<string, Entry<unknown>> = { ...a };
    for (const [key, theirs] of Object.entries(b)) {
      const ours = a[key];
      if (!ours) {
        out[key] = theirs;
        newer += 1;
      } else if (canonical(ours) === canonical(theirs)) {
        continue;
      } else if (wins(theirs, ours)) {
        out[key] = theirs;
        newer += 1;
      } else {
        older += 1;
      }
    }
    (doc as unknown as Record<string, unknown>)[section] = out;
  }
  return { doc, newer, older };
}

/**
 * "Replace everything": the incoming copy becomes the truth. Every item is restamped `now`, and
 * items that exist here but not there become tombstones, so a later sync can't bring them back.
 */
export function replaceDoc(current: ProgressDoc, incoming: ProgressDoc, now: string): ProgressDoc {
  const doc = emptyDoc();
  for (const section of SECTIONS) {
    const a = current[section] as Record<string, Entry<unknown>>;
    const b = incoming[section] as Record<string, Entry<unknown>>;
    const out: Record<string, Entry<unknown>> = {};
    for (const key of Object.keys(a)) out[key] = { value: section === "checks" ? false : null, updatedAt: now };
    for (const [key, entry] of Object.entries(b)) out[key] = { value: entry.value, updatedAt: now };
    (doc as unknown as Record<string, unknown>)[section] = out;
  }
  return doc;
}

/** Number of live (non-tombstone) items, for summaries. */
export function countItems(doc: ProgressDoc) {
  let n = 0;
  for (const section of SECTIONS) for (const entry of Object.values(doc[section] as Record<string, Entry<unknown>>)) if (!isTombstone(entry)) n += 1;
  return n;
}
