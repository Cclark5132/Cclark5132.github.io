import type { Grade } from "./progressDoc";

export const selfCheckId = (week: number, i: number) => `s-w${week}-${i + 1}`;

/** Points per grade for scores: Got it 1, Shaky ½, Missed 0. */
export const gradePoints: Record<Grade, number> = { got: 1, shaky: 0.5, missed: 0 };

/** Self-check score for a week: graded count and points. */
export function selfCheckScore(grades: Record<string, Grade>, week: number, count: number) {
  let graded = 0;
  let points = 0;
  const tally: Record<Grade, number> = { got: 0, shaky: 0, missed: 0 };
  for (let i = 0; i < count; i++) {
    const g = grades[selfCheckId(week, i)];
    if (!g) continue;
    graded += 1;
    points += gradePoints[g];
    tally[g] += 1;
  }
  return { graded, points, tally, total: count };
}

