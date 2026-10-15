import type { Track } from "../data/plan";
import { allSessions, plannedHours, type Session } from "./schedule";
import type { Progress } from "./store";

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
