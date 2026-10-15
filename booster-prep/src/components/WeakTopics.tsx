import { Link } from "react-router-dom";
import { useProgress } from "../lib/store";
import { weakTopics } from "../lib/weak";

/** The three weakest topics, each with a button straight into practice. */
export function WeakTopicsCard() {
  const progress = useProgress();
  const weak = weakTopics(progress);
  return (
    <section className="card" aria-labelledby="weak-h" data-testid="weak-topics">
      <div className="card-title">
        <h2 id="weak-h">Weak topics</h2>
        <Link to="/practice" className="eyebrow">
          Practice
        </Link>
      </div>
      {weak.length === 0 ? (
        <p className="hint">Answer at least 3 practice problems in a topic, or grade 3 self-checks in a week, and the weakest show up here.</p>
      ) : (
        <ul className="catchup-list">
          {weak.map((w) => (
            <li key={w.key} className="row" style={{ justifyContent: "space-between" }}>
              <span>
                <strong>{w.title}</strong>
                <span className="check-meta">
                  {Math.round(w.accuracy * 100)}% over {w.attempts} {w.kind === "practice" ? "tries" : "graded"}
                </span>
              </span>
              <Link className="btn small" to={w.to}>
                {w.action}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
