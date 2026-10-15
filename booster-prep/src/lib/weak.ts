import type { Progress } from "./progressDoc";
import { practiceAccuracy, topicById, type TopicId } from "./practice";

export interface WeakTopic {
  topic: TopicId;
  title: string;
  accuracy: number; // 0–1
  attempts: number;
}

/** The three lowest-accuracy practice topics with at least 3 attempts. */
export function weakTopics(progress: Progress, limit = 3, minAttempts = 3): WeakTopic[] {
  const out: WeakTopic[] = [];
  for (const [topic, a] of practiceAccuracy(progress.practice)) {
    if (a.attempts < minAttempts) continue;
    out.push({ topic, title: topicById.get(topic)!.title, accuracy: a.correct / a.attempts, attempts: a.attempts });
  }
  return out.sort((x, y) => x.accuracy - y.accuracy || y.attempts - x.attempts).slice(0, limit);
}
