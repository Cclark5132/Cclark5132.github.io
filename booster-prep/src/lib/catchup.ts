import { PREP_START, weeks } from "../data/plan";
import type { Progress } from "./progressDoc";
import { addDays, allSessions, dayName, parseDate, plannedHoursThrough, sessionById, weekEnd, type Session } from "./schedule";

/** The date a session is due: its catch-up override if it was moved, otherwise the plan's date. */
export const dueDate = (session: Session, progress: Pick<Progress, "overrides">) => progress.overrides[session.id] ?? session.date;

/** Unchecked, unskipped sessions due before today, oldest first. */
export function behindQueue(progress: Progress, today: string) {
  return allSessions
    .filter((s) => !progress.sessions[s.id] && !progress.skipped[s.id] && dueDate(s, progress) < today)
    .sort((a, b) => dueDate(a, progress).localeCompare(dueDate(b, progress)) || a.date.localeCompare(b.date) || a.slot - b.slot);
}

/** Sessions moved onto `date` by the catch-up queue. */
export const movedTo = (progress: Progress, date: string) =>
  Object.entries(progress.overrides)
    .filter(([id, d]) => d === date && sessionById.has(id))
    .map(([id]) => sessionById.get(id)!);

/**
 * Days with a free hour: every Sunday (hour 2 is review, so it can take one catch-up hour instead) and
 * every day of a light week (one planned hour a day). In plan order.
 */
export const lightSlots: string[] = (() => {
  const out = new Set<string>();
  for (const week of weeks) {
    for (let d = week.start; d <= weekEnd(week); d = addDays(d, 1)) {
      if (week.light || (dayName(d) === "Sun" && week.n >= 2)) out.add(d);
    }
  }
  return [...out].sort();
})();

/** The next light slot after `today` that doesn't already hold a moved session. */
export function nextLightSlot(today: string, overrides: Record<string, string>) {
  const taken = new Set(Object.values(overrides));
  return lightSlots.find((d) => d > today && !taken.has(d));
}

/** Whole days from Oct 15 (day 0) to `iso`. */
export const dayOfPlan = (iso: string) => Math.round((parseDate(iso) - parseDate(PREP_START)) / 86_400_000);

/**
 * Cumulative planned hours vs. hours checked off, one point per day from Oct 15 to the last plan day.
 * "Behind" counts through yesterday, so today's own sessions don't count against you until tomorrow.
 */
export function hoursVsPlan(progress: Progress, today: string) {
  const last = allSessions[allSessions.length - 1].date;
  const doneBy = new Map<string, number>();
  for (const s of allSessions) {
    const at = progress.sessions[s.id];
    if (at) doneBy.set(at, (doneBy.get(at) ?? 0) + s.hours);
  }
  const planned: [number, number][] = [];
  const done: [number, number][] = [];
  let p = 0;
  let c = 0;
  const plannedByDate = new Map<string, number>();
  for (const s of allSessions) plannedByDate.set(s.date, (plannedByDate.get(s.date) ?? 0) + s.hours);
  // Check-offs dated before Oct 15 (early work) count from day 0.
  for (const [at, h] of doneBy) if (at < PREP_START) c += h;
  for (let d = PREP_START; d <= last; d = addDays(d, 1)) {
    p += plannedByDate.get(d) ?? 0;
    c += doneBy.get(d) ?? 0;
    planned.push([dayOfPlan(d), p]);
    if (d <= today) done.push([dayOfPlan(d), c]);
  }
  const logged = allSessions.filter((s) => progress.sessions[s.id]).reduce((sum, s) => sum + s.hours, 0);
  const due = plannedHoursThrough(addDays(today, -1));
  return { planned, done, logged, due, behind: Math.max(0, due - logged), ahead: Math.max(0, logged - due) };
}

/** Minutes logged with the focus timer, as hours with one decimal. */
export const actualHours = (progress: Progress) => Math.round((Object.values(progress.minutes).reduce((sum, m) => sum + (Number(m) || 0), 0) / 60) * 10) / 10;
