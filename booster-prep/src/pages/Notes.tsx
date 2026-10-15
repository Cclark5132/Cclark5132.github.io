import { useState } from "react";
import { Link } from "react-router-dom";
import { Markdown } from "../components/Markdown";
import { weeks } from "../data/plan";
import { useProgress } from "../lib/store";

/** Every week's notes in one place, rendered, with a search box. */
export function Notes() {
  const progress = useProgress();
  const [query, setQuery] = useState("");
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const withNotes = weeks.filter((w) => (progress.notes[w.n] ?? "").trim());
  const shown = withNotes.filter((w) => {
    const text = `${w.title} ${progress.notes[w.n]}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
  return (
    <div className="content narrow">
      <header className="page-head">
        <span className="eyebrow">Notes</span>
        <h1>All notes</h1>
        <p className="lede">Your notes from every week page, in one place. They're part of your progress, so they export and sync with it.</p>
      </header>
      <label className="field" style={{ marginBottom: 16 }}>
        <span>Search notes</span>
        <input className="input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="hoop stress, Batdorf, question for manager…" />
      </label>
      {withNotes.length === 0 ? (
        <p className="hint">No notes yet. Write them at the bottom of each week page.</p>
      ) : shown.length === 0 ? (
        <p className="hint">No notes match “{query}”.</p>
      ) : (
        <div className="stack-lg">
          {shown.map((w) => (
            <section key={w.n} className="card" aria-labelledby={`notes-w${w.n}`}>
              <div className="card-title">
                <h2 id={`notes-w${w.n}`}>
                  Week {w.n}: {w.title}
                </h2>
                <Link to={`/week/${w.n}`} className="btn small ghost">
                  Edit
                </Link>
              </div>
              <Markdown text={progress.notes[w.n]} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
