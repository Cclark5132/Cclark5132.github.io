import type { SelfCheck } from "../data/plan";
import { localToday } from "../lib/schedule";
import { setCard, setGrade, useProgress, type Grade } from "../lib/store";
import { selfCheckId } from "../lib/selfcheck";
import { Rich } from "./Tex";

/** A self-check question. After "Show answer", grade yourself; Shaky and Missed put its flashcard due today. */
const labels: [Grade, string][] = [
  ["got", "Got it"],
  ["shaky", "Shaky"],
  ["missed", "Missed"],
];

export function SelfCheckItem({ week, index, check }: { week: number; index: number; check: SelfCheck }) {
  const progress = useProgress();
  const id = selfCheckId(week, index);
  const grade = progress.grades[id];
  const choose = (g: Grade) => {
    setGrade(id, g);
    if (g !== "got") {
      const prev = progress.cards[id];
      setCard(id, { ...(prev ?? { reps: 0 }), interval: 0, due: localToday() });
    }
  };
  return (
    <li>
      <p>
        <Rich text={check.q} />
      </p>
      <details className="reveal">
        <summary>Show answer</summary>
        <div className="reveal-body">
          <div>
            <Rich text={check.a} />
          </div>
          <div className="row grade-self" role="group" aria-label="How did you do?">
            {labels.map(([g, label]) => (
              <button key={g} type="button" className={`btn small${grade === g ? ` grade-${g}` : " ghost"}`} aria-pressed={grade === g} onClick={() => choose(g)}>
                {label}
              </button>
            ))}
            {grade && grade !== "got" && <span className="hint">Its flashcard is due today.</span>}
          </div>
        </div>
      </details>
    </li>
  );
}
