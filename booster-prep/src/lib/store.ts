import { useSyncExternalStore } from "react";

/** Spaced-repetition state for one flashcard. `due` is a YYYY-MM-DD date. */
export interface CardState {
  due: string;
  interval: number; // days
  reps: number;
}

export interface Progress {
  version: 1;
  /** Session id → date it was checked off (YYYY-MM-DD). */
  sessions: Record<string, string>;
  /** Week number → deliverable state. */
  deliverables: Record<string, { done: boolean; link: string }>;
  /** Week number → notes. */
  notes: Record<string, string>;
  /** Any other checklist item (setup tasks, capstone steps, launch prep) → checked. */
  checks: Record<string, boolean>;
  cards: Record<string, CardState>;
  /** Capstone answer-check entries (your own minimum thickness and margins), as typed. */
  capstone: Record<string, string>;
}

const KEY = "booster-prep:progress:v1";
const empty = (): Progress => ({ version: 1, sessions: {}, deliverables: {}, notes: {}, checks: {}, cards: {}, capstone: {} });

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return normalize(JSON.parse(raw));
  } catch {
    return empty();
  }
}

function normalize(value: unknown): Progress {
  const base = empty();
  if (!value || typeof value !== "object") return base;
  const v = value as Partial<Progress>;
  return {
    version: 1,
    sessions: { ...base.sessions, ...(v.sessions ?? {}) },
    deliverables: { ...base.deliverables, ...(v.deliverables ?? {}) },
    notes: { ...base.notes, ...(v.notes ?? {}) },
    checks: { ...base.checks, ...(v.checks ?? {}) },
    cards: { ...base.cards, ...(v.cards ?? {}) },
    capstone: { ...base.capstone, ...(v.capstone ?? {}) },
  };
}

let state: Progress = typeof window === "undefined" ? empty() : load();
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be full or blocked (private mode). Progress still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function update(fn: (draft: Progress) => Progress) {
  state = fn(state);
  emit();
}

export function getProgress() {
  return state;
}

export function useProgress() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}

// Keep tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) {
      state = load();
      listeners.forEach((listener) => listener());
    }
  });
}

export function toggleSession(id: string, today: string) {
  update((p) => {
    const sessions = { ...p.sessions };
    if (sessions[id]) delete sessions[id];
    else sessions[id] = today;
    return { ...p, sessions };
  });
}

export function setCheck(id: string, value: boolean) {
  update((p) => ({ ...p, checks: { ...p.checks, [id]: value } }));
}

export function setNote(week: number, text: string) {
  update((p) => ({ ...p, notes: { ...p.notes, [week]: text } }));
}

export function setDeliverable(week: number, value: { done: boolean; link: string }) {
  update((p) => ({ ...p, deliverables: { ...p.deliverables, [week]: value } }));
}

export function setCard(id: string, card: CardState) {
  update((p) => ({ ...p, cards: { ...p.cards, [id]: card } }));
}

export function setCapstoneEntry(id: string, value: string) {
  update((p) => ({ ...p, capstone: { ...p.capstone, [id]: value } }));
}

export function exportProgress() {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importProgress(json: string) {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== "object" || parsed.version !== 1) throw new Error("This doesn't look like a Booster Prep progress file.");
  state = normalize(parsed);
  emit();
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
