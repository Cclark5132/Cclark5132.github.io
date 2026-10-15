import { countItems, normalizeDoc, type ProgressDoc } from "./progressDoc";

/** Rolling daily snapshots of progress, kept in a second localStorage key. */
export interface Backup {
  date: string; // YYYY-MM-DD
  savedAt: string; // ISO timestamp
  doc: ProgressDoc;
}

export const BACKUP_KEY = "booster-prep:backups";
export const LAST_EXPORT_KEY = "booster-prep:last-export";
export const KEEP_DAYS = 7;

/** Adds a snapshot for `date` unless one exists, and keeps the newest `keep` days. Pure. */
export function addSnapshot(list: Backup[], doc: ProgressDoc, date: string, savedAt: string, keep = KEEP_DAYS): Backup[] {
  if (list.some((b) => b.date === date) || countItems(doc) === 0) return list;
  return [...list, { date, savedAt, doc }].sort((a, b) => a.date.localeCompare(b.date)).slice(-keep);
}

export function readBackups(): Backup[] {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(list)) return [];
    return list
      .filter((b) => b && typeof b.date === "string" && typeof b.savedAt === "string")
      .map((b) => ({ date: b.date, savedAt: b.savedAt, doc: normalizeDoc(b.doc) }));
  } catch {
    return [];
  }
}

function writeBackups(list: Backup[]) {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(list));
  } catch {
    // Storage full or blocked; the main copy still saves.
  }
}

/** The state at the start of each day you study: taken before that day's first change. */
export function snapshotDaily(doc: ProgressDoc, date: string, savedAt = new Date().toISOString()) {
  const list = readBackups();
  const next = addSnapshot(list, doc, date, savedAt);
  if (next !== list) writeBackups(next);
}

export function lastExport(): string | undefined {
  try {
    return localStorage.getItem(LAST_EXPORT_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function markExported(at = new Date().toISOString()) {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, at);
  } catch {
    // Nudge will just keep showing.
  }
}

/** Whole days between an ISO timestamp and now, or undefined if never. */
export function daysSince(iso: string | undefined, now = Date.now()) {
  if (!iso) return undefined;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, Math.floor((now - t) / 86_400_000)) : undefined;
}
