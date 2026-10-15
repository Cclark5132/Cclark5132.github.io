import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fmt, fromSI, unitOf, type System } from "../calc/units";
import { Icon } from "../components/Icon";
import { UnitToggle, useSystem } from "../components/NumField";
import { Rich, Tex } from "../components/Tex";
import { weeks } from "../data/plan";
import { checkPractice } from "../lib/answerCheck";
import { practiceCardCheck } from "../lib/cards";
import { answerText, expected, makeProblem, mixedTopic, newSeed, practiceAccuracy, solution, topicById, topics, unitTex, unlockedTopics, type Problem, type TopicId } from "../lib/practice";
import { localToday } from "../lib/schedule";
import { recordPractice, setCard, setCheck, useProgress } from "../lib/store";

const weekStarts = new Map(weeks.map((w) => [w.n, w.start]));

function Givens({ problem, system }: { problem: Problem; system: System }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <tbody>
          {problem.givens.map((g) => (
            <tr key={g.sym + g.label}>
              <td>
                <Tex tex={g.sym} />
              </td>
              <td>{g.label}</td>
              <td className="num">
                <Tex tex={`${fmt(fromSI(g.si, g.q, system)).replace(/,/g, "{,}").replace(/ × 10\^(-?\d+)/, " \\times 10^{$1}")}${unitTex(unitOf(g.q, system))}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One problem: givens, answer boxes with units, Check, then the worked solution. */
function ProblemCard({ problem, system, onNext }: { problem: Problem; system: System; onNext: () => void }) {
  const progress = useProgress();
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [counted, setCounted] = useState(false);
  const verdicts = problem.answers.map((a) =>
    a.kind === "choice" ? (typed[a.key] ?? "") === a.choice : checkPractice(typed[a.key] ?? "", expected(a, system), a.kind === "margin" ? "margin" : "value"),
  );
  const allRight = verdicts.every(Boolean);
  const filled = problem.answers.every((a) => (typed[a.key] ?? "").trim() !== "");
  const topic = topicById.get(problem.topic)!;
  const cardAdded = Boolean(progress.checks[practiceCardCheck(problem.topic)]);

  const check = () => {
    setChecked(true);
    if (!counted) {
      recordPractice(problem.topic, allRight);
      setCounted(true);
    }
  };

  return (
    <section className="card practice-card" aria-labelledby="problem-h" data-testid="practice-problem">
      <div className="card-title">
        <h2 id="problem-h">{topic.title}</h2>
        <span className="eyebrow">
          Week {topic.week} · seed {problem.seed}
        </span>
      </div>
      <p style={{ marginBottom: 12 }}>
        <Rich text={problem.prompt} />
      </p>
      <Givens problem={problem} system={system} />
      <form
        className="stack"
        style={{ gap: 12, marginTop: 16 }}
        onSubmit={(event) => {
          event.preventDefault();
          check();
        }}
      >
        {problem.answers.map((a, i) => {
          const unit = a.kind === "value" ? unitOf(a.q, system) : "";
          const cls = checked ? (verdicts[i] ? " pos" : " neg") : "";
          return (
            <div key={a.key} className="field">
              <span>
                {a.label} (<Tex tex={a.sym} />){unit && <span className="unit"> [{unit}]</span>}
                {a.kind === "margin" && <span className="unit"> [margin, ±0.01]</span>}
              </span>
              {a.kind === "choice" ? (
                <div className="seg" role="radiogroup" aria-label={a.label}>
                  {a.choices!.map((c) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={typed[a.key] === c}
                      aria-pressed={typed[a.key] === c}
                      onClick={() => {
                        setTyped({ ...typed, [a.key]: c });
                        setChecked(false);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  className={`input num${cls}`}
                  inputMode="decimal"
                  aria-label={`${a.label}${unit ? ` in ${unit}` : ""}`}
                  value={typed[a.key] ?? ""}
                  onChange={(event) => {
                    setTyped({ ...typed, [a.key]: event.target.value });
                    setChecked(false);
                  }}
                />
              )}
              {checked && <div className={`check-verdict${verdicts[i] ? " pos" : " neg"}`}>{verdicts[i] ? "Correct." : `Not quite. Answer: ${answerText(a, system)}`}</div>}
            </div>
          );
        })}
        <div className="row">
          <button type="submit" className="btn primary" disabled={!filled}>
            Check
          </button>
          <button type="button" className="btn" onClick={onNext}>
            New problem <Icon name="arrow" />
          </button>
          {checked && !allRight && (
            <button
              type="button"
              className="btn ghost"
              disabled={cardAdded}
              onClick={() => {
                setCheck(practiceCardCheck(problem.topic), true);
                setCard(`p-${problem.topic}`, { due: localToday(), interval: 0, reps: 0 });
              }}
            >
              {cardAdded ? "In your flashcards" : "Add to flashcards"}
            </button>
          )}
        </div>
      </form>
      {checked && (
        <div className="solution" aria-label="Worked solution">
          <h3>Worked solution</h3>
          {solution(problem, system).map((step, i) =>
            step.tex ? (
              <div key={i} className="mathline">
                <Tex tex={step.tex} display />
              </div>
            ) : (
              <p key={i}>
                <Rich text={step.text ?? ""} />
              </p>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function Accuracy() {
  const progress = useProgress();
  const acc = practiceAccuracy(progress.practice);
  if (!acc.size) return null;
  return (
    <section className="card" aria-labelledby="acc-h">
      <div className="card-title">
        <h2 id="acc-h">Accuracy by topic</h2>
        <span className="eyebrow">first try on each problem</span>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Correct</th>
              <th scope="col">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {topics
              .filter((t) => acc.has(t.id))
              .map((t) => {
                const a = acc.get(t.id)!;
                return (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/practice?topic=${t.id}`}>{t.title}</Link>
                    </td>
                    <td className="num">
                      {a.correct} / {a.attempts}
                    </td>
                    <td className="num">{Math.round((100 * a.correct) / Math.max(1, a.attempts))}%</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function Practice() {
  const [system, setSystem] = useSystem();
  const [params, setParams] = useSearchParams();
  const topicParam = params.get("topic") ?? "mixed";
  const seed = Number(params.get("seed"));
  const today = localToday();
  const unlocked = useMemo(() => unlockedTopics(weekStarts, today), [today]);

  // A problem needs a seed in the URL so it can be shared and replayed. Pick one if it's missing.
  useEffect(() => {
    if (!params.get("seed")) setParams({ topic: topicParam, seed: String(newSeed()) }, { replace: true });
  }, [params, setParams, topicParam]);

  const topic: TopicId | undefined = topicParam === "mixed" ? (Number.isFinite(seed) && params.get("seed") ? mixedTopic(unlocked, seed) : undefined) : topicById.has(topicParam as TopicId) ? (topicParam as TopicId) : undefined;
  const problem = topic && params.get("seed") ? makeProblem(topic, seed) : undefined;
  const next = () => setParams({ topic: topicParam, seed: String(newSeed()) });

  return (
    <div className="content narrow">
      <header className="page-head">
        <span className="eyebrow">Practice</span>
        <h1>Infinite worked problems</h1>
        <p className="lede">
          Fresh numbers every time, checked to ±1% (margins to ±0.01), with the full working after you answer. Mixed mode draws from every topic whose week has started.
        </p>
      </header>
      <div className="row" style={{ marginBottom: 16, alignItems: "flex-end" }}>
        <label className="field" style={{ minWidth: 240 }}>
          <span>Topic</span>
          <select className="select" value={topicParam} onChange={(event) => setParams({ topic: event.target.value, seed: String(newSeed()) })}>
            <option value="mixed">Mixed: {unlocked.length} topics unlocked</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                Week {t.week}: {t.title}
              </option>
            ))}
          </select>
        </label>
        <UnitToggle system={system} onChange={setSystem} />
      </div>
      <div className="stack-lg">
        {problem ? <ProblemCard key={`${problem.topic}-${problem.seed}-${system}`} problem={problem} system={system} onNext={next} /> : <p className="hint">Loading a problem…</p>}
        <Accuracy />
      </div>
    </div>
  );
}
