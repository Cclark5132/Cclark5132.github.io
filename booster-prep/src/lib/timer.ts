/*
 * Focus timer. It stores when it started, not a running count, so it keeps time through tab
 * switches, sleep and reloads. One timer per device (localStorage, not synced).
 */

export type TimerMode = "60" | "25/5";

export interface TimerState {
  sessionId: string;
  mode: TimerMode;
  startedAt: number; // ms since epoch
}

export const TIMER_KEY = "booster-prep:timer";
export const SESSION_MINUTES = 60;
/** A forgotten timer can't log more than this. */
export const MAX_LOG_MINUTES = 180;

export interface TimerView {
  elapsedSec: number;
  /** Seconds left in the current phase (focus block or break); 0 once the hour is up. */
  remainingSec: number;
  phase: "focus" | "break" | "done";
  /** Minutes of focus time so far (breaks excluded in 25/5 mode), capped at MAX_LOG_MINUTES. */
  focusMinutes: number;
}

/** Pure timer math from the start time and now. */
export function timerView(state: Pick<TimerState, "mode" | "startedAt">, now: number): TimerView {
  const elapsedSec = Math.max(0, Math.floor((now - state.startedAt) / 1000));
  const total = SESSION_MINUTES * 60;
  let phase: TimerView["phase"] = "focus";
  let remainingSec = Math.max(0, total - elapsedSec);
  let focusSec = elapsedSec;
  if (state.mode === "25/5") {
    // Two 30-minute cycles: 25 focus, 5 break.
    const inCycle = elapsedSec % 1800;
    const cycles = Math.floor(elapsedSec / 1800);
    focusSec = cycles * 1500 + Math.min(inCycle, 1500);
    phase = inCycle < 1500 ? "focus" : "break";
    remainingSec = phase === "focus" ? 1500 - inCycle : 1800 - inCycle;
  }
  if (elapsedSec >= total) {
    phase = "done";
    remainingSec = 0;
  }
  return { elapsedSec, remainingSec, phase, focusMinutes: Math.min(MAX_LOG_MINUTES, Math.round(focusSec / 60)) };
}

export const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

/** Starts a timer for a session now and saves it. */
export function startTimer(sessionId: string, mode: TimerMode, now = Date.now()): TimerState {
  const state = { sessionId, mode, startedAt: now };
  writeTimer(state);
  return state;
}

export function readTimer(): TimerState | undefined {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    const t = raw ? (JSON.parse(raw) as TimerState) : undefined;
    return t && typeof t.startedAt === "number" && typeof t.sessionId === "string" ? t : undefined;
  } catch {
    return undefined;
  }
}

export function writeTimer(state: TimerState | undefined) {
  try {
    if (state) localStorage.setItem(TIMER_KEY, JSON.stringify(state));
    else localStorage.removeItem(TIMER_KEY);
  } catch {
    // Timer still runs for this page view.
  }
}
