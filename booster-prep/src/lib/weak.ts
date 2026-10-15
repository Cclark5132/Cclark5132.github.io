import { weeks } from "../data/plan";
import { practiceAccuracy, topicById } from "./practice";
import type { Progress } from "./progressDoc";
import { selfCheckScore } from "./selfcheck";

export interface WeakTopic {
  key: string;
  kind: "practice" | "selfcheck";
  title: string;
  accuracy: number; // 0–1
  attempts: number;
  to: string;
  action: string;
}

/**
 * The three weakest areas from Practice accuracy and self-check grades together: practice topics with at
 * least 3 attempts, and weeks with at least 3 graded self-checks (Got it 1, Shaky ½, Missed 0).
 */
export function weakTopics(progress: Progress, limit = 3, minAttempts = 3): WeakTopic[] {
  const out: WeakTopic[] = [];
  for (const [topic, a] of practiceAccuracy(progress.practice)) {
    if (a.attempts < minAttempts) continue;
    out.push({ key: topic, kind: "practice", title: topicById.get(topic)!.title, accuracy: a.correct / a.attempts, attempts: a.attempts, to: `/practice?topic=${topic}`, action: "Practice this" });
  }
  for (const week of weeks) {
    const s = selfCheckScore(progress.grades, week.n, week.selfChecks.length);
    if (s.graded < minAttempts) continue;
    out.push({ key: `w${week.n}`, kind: "selfcheck", title: `Week ${week.n} self-checks`, accuracy: s.points / s.graded, attempts: s.graded, to: `/week/${week.n}?section=self-check`, action: "Review these" });
  }
  return out.sort((x, y) => x.accuracy - y.accuracy || y.attempts - x.attempts).slice(0, limit);
}
