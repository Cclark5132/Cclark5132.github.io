import type { Track } from "../data/plan";
import { allSessions, plannedHours, sessionById, type Session } from "./schedule";
import type { Progress } from "./store";

/**
 * Session check-offs for sessions that exist in the current plan. Old IDs (for example Week 0's former
 * w0-d1-s1 … w0-d3-s1, from before Week 0 became one day) stay in storage but never count.
 */
export function validSessions(sessions: Progress["sessions"]) {
  const out: Record<string, string> = {};
  for (const [id, date] of Object.entries(sessions ?? {})) {
    if (sessionById.has(id) && typeof date === "string" && date) out[id] = date;
  }
  return out;
}

export function stats(progress: Progress) {
  const done = (s: Session) => Boolean(progress.sessions[s.id]);
  const loggedHours = allSessions.filter(done).reduce((sum, s) => sum + s.hours, 0);
  const byTrack = (track: Track) => {
    const list = allSessions.filter((s) => s.track === track);
    return { done: list.filter(done).length, total: list.length };
  };
  return {
    done: allSessions.filter(done).length,
    total: allSessions.length,
    loggedHours,
    plannedHours,
    tracks: { structures: byTrack("structures"), cad: byTrack("cad"), code: byTrack("code") },
  };
}

export function weekProgress(progress: Progress, week: number) {
  const list = allSessions.filter((s) => s.week === week);
  return { done: list.filter((s) => progress.sessions[s.id]).length, total: list.length };
}
