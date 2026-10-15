import { describe, expect, it } from "vitest";
import { baseWeeks, FINALS_SLOTS, FINALS_WEEK_START, placeFinalsWeek, weeks } from "../src/data/plan";
import { stats, validSessions } from "../src/lib/progress";
import { addDays, allSessions, locate, plannedHours, scheduleByWeek, weekEnd } from "../src/lib/schedule";
import { studyStreak, type Progress } from "../src/lib/store";

const emptyProgress = (sessions: Record<string, string>): Progress => ({ version: 1, sessions, deliverables: {}, notes: {}, checks: {}, cards: {}, capstone: {} });

describe("schedule", () => {
  it("every date from Oct 15 to Jan 10 falls in exactly one week, with no gaps or overlaps", () => {
    let day = "2026-10-15";
    let count = 0;
    while (day <= "2027-01-10") {
      const owners = weeks.filter((w) => day >= w.start && day <= weekEnd(w));
      expect(owners.length, day).toBe(1);
      const where = locate(day);
      expect(where.status).toBe("during");
      day = addDays(day, 1);
      count += 1;
    }
    expect(count).toBe(88);
    expect(locate("2026-10-14").status).toBe("before");
    expect(locate("2027-01-11").status).toBe("after");
  });

  it("planned hours total 162, derived from the sessions", () => {
    expect(plannedHours).toBe(2 + 20 + 9 * 14 + 2 * 7);
    expect(plannedHours).toBe(162);
    expect(weeks.reduce((sum, w) => sum + w.hours, 0)).toBe(plannedHours);
    for (const week of weeks) {
      const hours = scheduleByWeek[week.n].flat().reduce((sum, s) => sum + s.hours, 0);
      expect(hours, `Week ${week.n}`).toBe(week.hours);
      expect(scheduleByWeek[week.n].length, `Week ${week.n} days`).toBe(week.days);
    }
  });

  it("Week 0 is exactly two sessions on 2026-10-15", () => {
    const w0 = allSessions.filter((s) => s.week === 0);
    expect(w0.map((s) => s.id)).toEqual(["w0-d0-s1", "w0-d0-s2"]);
    expect(w0.every((s) => s.date === "2026-10-15")).toBe(true);
    const where = locate("2026-10-15");
    expect(where.status === "during" && where.week.n === 0 && where.week.days === 1 && where.dayIndex === 0).toBe(true);
  });

  it("Week 1 is 20 sessions from 2026-10-16 to 2026-10-25, two every day", () => {
    const w1 = allSessions.filter((s) => s.week === 1);
    expect(w1.length).toBe(20);
    expect(w1[0].date).toBe("2026-10-16");
    expect(w1[w1.length - 1].date).toBe("2026-10-25");
    for (const day of scheduleByWeek[1]) expect(day.length).toBe(2);
    const where = locate("2026-10-16");
    expect(where.status === "during" && where.week.n === 1 && where.dayIndex === 0 && where.week.days === 10).toBe(true);
    const last = locate("2026-10-25");
    expect(last.status === "during" && last.week.n === 1 && last.dayIndex === 9).toBe(true);
  });

  it("Week 2 still starts Monday Oct 26 and later weeks keep their dates", () => {
    const where = locate("2026-10-26");
    expect(where.status === "during" && where.week.n === 2 && where.dayIndex === 0).toBe(true);
    expect(weeks.find((w) => w.n === 12)!.start).toBe("2027-01-04");
  });

  it("every normal Sunday is two real hours: context plus flashcards, then the hardest problem and planning", () => {
    for (const n of [2, 3, 4, 5, 7, 8]) {
      const sunday = scheduleByWeek[n][6];
      expect(sunday.map((s) => s.dayName)).toEqual(["Sun", "Sun"]);
      expect(sunday[0].detail).toContain("flashcards");
      expect(sunday[1].detail).toContain("hardest");
    }
  });

  it("Week 9 day titles match what each day covers", () => {
    const titles = scheduleByWeek[9].flat().map((s) => s.title + " " + s.detail);
    expect(titles[1]).not.toMatch(/Week 1–2 worked examples/);
    expect(scheduleByWeek[9][2][0].title).toMatch(/buckling/);
    expect(scheduleByWeek[9][2][0].detail).toMatch(/buckling/);
  });
});

describe("finals week", () => {
  it("defaults to Dec 14 – Dec 20", () => {
    expect(FINALS_SLOTS).toContain(FINALS_WEEK_START);
    expect(weeks.find((w) => w.n === 9)!.start).toBe("2026-12-14");
  });

  it("slides to another week without gaps, keeping the other weeks in order", () => {
    for (const slot of FINALS_SLOTS) {
      const list = placeFinalsWeek(baseWeeks, slot);
      expect(list.find((w) => w.n === 9)!.start).toBe(slot);
      const others = list.filter((w) => w.n >= 2 && w.n !== 9).map((w) => w.n);
      expect(others).toEqual([...others].sort((a, b) => a - b));
      for (let i = 1; i < list.length; i++) expect(list[i].start).toBe(addDays(list[i - 1].start, list[i - 1].days));
    }
  });

  it("ignores a date that isn't one of the allowed Mondays", () => {
    expect(placeFinalsWeek(baseWeeks, "2026-12-15").find((w) => w.n === 9)!.start).toBe("2026-12-14");
  });
});

describe("orphaned progress IDs", () => {
  it("never count toward hours, completion or the streak", () => {
    const sessions = { "w0-d1-s1": "2026-10-16", "w0-d2-s1": "2026-10-17", "w0-d3-s1": "2026-10-18", "w0-d0-s1": "2026-10-15", "bogus": 42 as unknown as string };
    const s = stats(emptyProgress(sessions));
    expect(s.done).toBe(1);
    expect(s.loggedHours).toBe(1);
    expect(Object.keys(validSessions(sessions))).toEqual(["w0-d0-s1"]);
    expect(studyStreak(validSessions(sessions), "2026-10-18", addDays)).toBe(0);
    expect(studyStreak(validSessions(sessions), "2026-10-15", addDays)).toBe(1);
  });
});
