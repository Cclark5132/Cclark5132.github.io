import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Formula } from "../components/Formula";
import { Rich } from "../components/Tex";
import { weeks } from "../data/plan";
import { deck, schedule, type Card } from "../lib/cards";
import { addDays, localToday } from "../lib/schedule";
import { setCard, useProgress } from "../lib/store";

type TrackFilter = "all" | Card["track"];
const trackOptions: [TrackFilter, string][] = [
  ["all", "All tracks"],
  ["structures", "Structures"],
  ["cad", "CAD / FEA"],
  ["context", "Starship"],
];

export function Flashcards() {
  const progress = useProgress();
  const [params, setParams] = useSearchParams();
  const weekFilter = params.get("week") ?? "all";
  const [track, setTrack] = useState<TrackFilter>("all");
  const [mode, setMode] = useState<"due" | "all">("due");
  const [flipped, setFlipped] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const today = localToday();

  const filtered = useMemo(
    () => deck.filter((c) => (weekFilter === "all" || String(c.week) === weekFilter) && (track === "all" || c.track === track)),
    [weekFilter, track],
  );
  const isDue = (c: Card) => {
    const state = progress.cards[c.id];
    return !state || state.due <= today;
  };
  const queue = filtered.filter((c) => (mode === "all" || isDue(c)) && !skipped.includes(c.id));
  const card = queue[0];
  const dueCount = filtered.filter(isDue).length;
  const newCount = filtered.filter((c) => !progress.cards[c.id]).length;

  const grade = (g: "again" | "good" | "easy") => {
    if (!card) return;
    const next = schedule(progress.cards[card.id], g);
    setCard(card.id, { ...next, due: addDays(today, next.interval) });
    // "Again" stays due today; move it to the back of this session's queue.
    if (g === "again" || mode === "all") setSkipped((s) => [...s, card.id]);
    setFlipped(false);
  };

  return (
    <div className="content narrow">
      <header className="page-head">
        <span className="eyebrow">Flashcards</span>
        <h1>Formulas, definitions and self-checks</h1>
        <p className="lede">
          {deck.length} cards with simple spaced repetition. <strong>Again</strong> brings a card back today, <strong>Good</strong> doubles its interval and{" "}
          <strong>Easy</strong> triples it.
        </p>
      </header>

      <div className="stack" style={{ marginBottom: 18 }}>
        <div className="row">
          <label className="field" style={{ width: 180 }}>
            <span>Week</span>
            <select
              className="select"
              value={weekFilter}
              onChange={(e) => {
                setSkipped([]);
                setParams(e.target.value === "all" ? {} : { week: e.target.value }, { replace: true });
              }}
            >
              <option value="all">All weeks</option>
              {weeks.map((w) => (
                <option key={w.n} value={w.n}>
                  Week {w.n}: {w.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field" style={{ width: 160 }}>
            <span>Track</span>
            <select
              className="select"
              value={track}
              onChange={(e) => {
                setSkipped([]);
                setTrack(e.target.value as TrackFilter);
              }}
            >
              {trackOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="seg" role="group" aria-label="Which cards" style={{ alignSelf: "flex-end" }}>
            <button type="button" aria-pressed={mode === "due"} onClick={() => (setMode("due"), setSkipped([]))}>
              Due ({dueCount})
            </button>
            <button type="button" aria-pressed={mode === "all"} onClick={() => (setMode("all"), setSkipped([]))}>
              Cram all ({filtered.length})
            </button>
          </div>
        </div>
        <p className="hint">
          {filtered.length} cards in this filter · {newCount} new · {queue.length} left in this session
        </p>
      </div>

      {!card ? (
        <section className="card" style={{ textAlign: "center", padding: 40 }}>
          <h2>Nothing due here.</h2>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>Come back tomorrow, change the filter, or cram all cards.</p>
          {skipped.length > 0 && (
            <button type="button" className="btn" style={{ marginTop: 16 }} onClick={() => setSkipped([])}>
              Review the {skipped.length} card{skipped.length === 1 ? "" : "s"} from this session again
            </button>
          )}
        </section>
      ) : (
        <section className="card flashcard" aria-live="polite">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="eyebrow">
              {card.kind === "formula" ? "Formula" : card.kind === "definition" ? "Definition" : "Self-check"} · Week {card.week}
            </span>
            {progress.cards[card.id] ? <span className="tag">seen {progress.cards[card.id].reps}×</span> : <span className="tag accent">new</span>}
          </div>
          <div className="flash-front">
            <Rich text={card.front} />
          </div>
          {flipped ? (
            <>
              <div className="flash-back">
                {card.tex ? <Formula tex={card.tex} vars={card.vars} /> : <Rich text={card.back} />}
              </div>
              <div className="grade-row">
                <button type="button" className="btn grade-again" onClick={() => grade("again")}>
                  Again
                </button>
                <button type="button" className="btn grade-good" onClick={() => grade("good")}>
                  Good
                </button>
                <button type="button" className="btn grade-easy" onClick={() => grade("easy")}>
                  Easy
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn primary" onClick={() => setFlipped(true)} style={{ alignSelf: "center" }}>
              Show answer
            </button>
          )}
        </section>
      )}
    </div>
  );
}
