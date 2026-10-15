import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckItem, SessionCheck } from "../components/Checks";
import { Formula } from "../components/Formula";
import { SelfCheckItem } from "../components/SelfCheck";
import { selfCheckScore } from "../lib/selfcheck";
import { Icon } from "../components/Icon";
import { Markdown } from "../components/Markdown";
import { Rich } from "../components/Tex";
import { phaseColor, rhythm, weekByNumber, weeks } from "../data/plan";
import { lessonBySlug } from "../lessons";
import { weekProgress } from "../lib/progress";
import { formatDate, localToday, scheduleByWeek, weekEnd, type Session } from "../lib/schedule";
import { setDeliverable, setNote, useProgress } from "../lib/store";
import { useScrollToParam } from "../lib/anchors";
import { NotFound } from "./NotFound";

function Notes({ week }: { week: number }) {
  const progress = useProgress();
  const [text, setText] = useState(progress.notes[week] ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  // Save shortly after typing stops.
  useEffect(() => {
    if (text === (progress.notes[week] ?? "")) return;
    const id = window.setTimeout(() => setNote(week, text), 400);
    return () => window.clearTimeout(id);
  }, [text, week, progress.notes]);
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="field-label">Notes for this week (Markdown and $math$; synced with your progress)</span>
        <div className="seg" role="tablist" aria-label="Notes view">
          <button type="button" role="tab" aria-selected={tab === "write"} aria-pressed={tab === "write"} onClick={() => setTab("write")}>
            Write
          </button>
          <button type="button" role="tab" aria-selected={tab === "preview"} aria-pressed={tab === "preview"} onClick={() => setTab("preview")}>
            Preview
          </button>
        </div>
      </div>
      {tab === "write" ? (
        <textarea className="textarea" aria-label={`Week ${week} notes`} value={text} onChange={(event) => setText(event.target.value)} placeholder={"What clicked, what didn't, questions to ask…\n\n- Hoop stress $\\sigma_h = pR/t$ is twice axial"} />
      ) : (
        <div className="notes-preview">{text.trim() ? <Markdown text={text} /> : <p className="hint">Nothing written yet.</p>}</div>
      )}
      <Link to="/notes" className="eyebrow">
        All notes
      </Link>
    </div>
  );
}

/** One day: progress bar, today highlighted, and past days that are fully done collapsed. */
function DayCard({ sessions, today }: { sessions: Session[]; today: string }) {
  const progress = useProgress();
  const date = sessions[0].date;
  const done = sessions.filter((s) => progress.sessions[s.id]).length;
  const complete = done === sessions.length;
  const isToday = date === today;
  const [open, setOpen] = useState(!(complete && date < today));
  return (
    <article className={`card day${isToday ? " today" : ""}${open ? "" : " collapsed"}`} id={`day-${date}`} aria-current={isToday ? "date" : undefined}>
      <button type="button" className="day-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="num">{sessions[0].dayName}</span>
        <span className="eyebrow">
          {formatDate(date)}
          {isToday ? " · today" : ""}
        </span>
        <span className="day-count num">
          {done}/{sessions.length}
        </span>
      </button>
      <div className="bar day-bar" role="progressbar" aria-label={`${sessions[0].dayName} progress`} aria-valuemin={0} aria-valuemax={sessions.length} aria-valuenow={done}>
        <span style={{ width: `${(done / sessions.length) * 100}%` }} />
      </div>
      {open && sessions.map((session) => <SessionCheck key={session.id} session={session} />)}
    </article>
  );
}

function Deliverable({ week, text }: { week: number; text: string }) {
  const progress = useProgress();
  const state = progress.deliverables[week] ?? { done: false, link: "" };
  return (
    <section className="card" id="deliverable">
      <div className="card-title">
        <h2>Deliverable</h2>
        {state.done && <span className="tag accent">Done</span>}
      </div>
      <p style={{ marginBottom: 14 }}>
        <Rich text={text} />
      </p>
      <div className="stack" style={{ gap: 10 }}>
        <label className={`check${state.done ? " done" : ""}`} style={{ paddingLeft: 0 }}>
          <input type="checkbox" checked={state.done} onChange={(event) => setDeliverable(week, { ...state, done: event.target.checked })} />
          <span className="check-text">Mark deliverable done</span>
        </label>
        <label className="field">
          <span>Link (optional), e.g. to your booster-prep repo</span>
          <input
            className="input"
            type="url"
            inputMode="url"
            placeholder="https://github.com/…"
            value={state.link}
            onChange={(event) => setDeliverable(week, { ...state, link: event.target.value })}
          />
        </label>
        {/^https?:\/\//.test(state.link) && (
          <a href={state.link} target="_blank" rel="noopener noreferrer">
            Open link
          </a>
        )}
      </div>
    </section>
  );
}

export function WeekPage() {
  const { n } = useParams();
  const progress = useProgress();
  useScrollToParam("section");
  const today = localToday();
  const [params] = useSearchParams();
  const jumpTo = params.get("section") ? undefined : `day-${today}`;
  // Scroll to today's card when it's in this week. Braces: scrollIntoView's return value must not
  // become the effect's cleanup. The timeout runs after the layout's scroll-to-top.
  useEffect(() => {
    if (!jumpTo) return;
    const id = window.setTimeout(() => {
      document.getElementById(jumpTo)?.scrollIntoView({ block: "center" });
    }, 0);
    return () => window.clearTimeout(id);
  }, [jumpTo, n]);
  const week = weekByNumber(Number(n));
  if (!week) return <NotFound />;
  const days = scheduleByWeek[week.n];
  const score = selfCheckScore(progress.grades, week.n, week.selfChecks.length);
  const lesson = week.lesson ? lessonBySlug(week.lesson) : undefined;
  const wp = weekProgress(progress, week.n);
  // Neighbors in calendar order (the finals week can be moved; see FINALS_WEEK_START).
  const at = weeks.indexOf(week);
  const prev = weeks[at - 1];
  const next = weeks[at + 1];
  const trackCards = [
    week.structures.length > 0 && { label: "Structures", cls: "structures", tool: "Hand calcs", items: week.structures },
    week.cad && { label: "CAD / FEA", cls: "cad", tool: week.cad.tool, items: week.cad.items },
    week.code && { label: "Code", cls: "code", tool: week.code.tool, items: week.code.items },
  ].filter(Boolean) as { label: string; cls: string; tool: string; items: string[] }[];

  return (
    <div className="content">
      <header className="page-head">
        <div className="row">
          <span className="eyebrow">
            Week {week.n} · {formatDate(week.start)} – {formatDate(weekEnd(week))}
          </span>
          <span className="tag" style={{ color: phaseColor[week.phase], borderColor: "currentColor" }}>
            {week.phase}
          </span>
          {week.light && <span className="tag">Light week · ~{week.hours} hrs</span>}
        </div>
        <h1>{week.title}</h1>
        {week.note && <p className="lede">{week.note}</p>}
        <div className="week-progress">
          <div className="bar" style={{ flex: "1 1 120px", maxWidth: 320 }} aria-hidden="true">
            <span style={{ width: `${(wp.done / Math.max(1, wp.total)) * 100}%` }} />
          </div>
          <span className="num" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            {wp.done} / {wp.total} sessions
          </span>
          {lesson && (
            <Link to={`/lessons/${lesson.slug}`} className="btn primary small">
              Open lesson: {lesson.title} <Icon name="arrow" />
            </Link>
          )}
        </div>
      </header>

      <div className="stack-lg">
        {trackCards.length > 0 && (
          <section aria-labelledby="tracks-h">
            <h2 id="tracks-h" className="section-h">
              Tracks
            </h2>
            <div className="grid-auto">
              {trackCards.map((track) => (
                <article key={track.label} className="card">
                  <div className="card-title">
                    <h3>{track.label}</h3>
                    <span className={`tag ${track.cls}`}>{track.tool}</span>
                  </div>
                  <ul className="bullets">
                    {track.items.map((item) => (
                      <li key={item}>
                        <Rich text={item} />
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}

        {week.tasks && (
          <section className="card" aria-labelledby="tasks-h">
            <div className="card-title">
              <h2 id="tasks-h">{week.n === 0 ? "Setup checklist" : week.phase === "Capstone" ? "Capstone steps this week" : "This week's work"}</h2>
              {week.phase === "Capstone" && (
                <Link to="/capstone" className="btn small">
                  Capstone page
                </Link>
              )}
            </div>
            {week.tasks.map((task, i) => (
              <CheckItem key={i} id={`w${week.n}-task-${i}`}>
                <Rich text={task} />
              </CheckItem>
            ))}
          </section>
        )}

        {week.formulas.length > 0 && (
          <section aria-labelledby="formulas-h">
            <h2 id="formulas-h" className="section-h">
              Key formulas
            </h2>
            <div className="grid-formulas">
              {week.formulas.map((f) => (
                <Formula key={f.label} label={f.label} tex={f.tex} vars={f.vars} />
              ))}
            </div>
          </section>
        )}

        <div className="grid-auto">
          {week.context.length > 0 && (
            <section className="card" id="context">
              <div className="card-title">
                <h2>Starship context</h2>
                {week.n === 12 && (
                  <Link to="/anatomy" className="btn small">
                    Anatomy
                  </Link>
                )}
              </div>
              <div className="stack" style={{ gap: 8, color: "var(--ink-soft)" }}>
                {week.context.map((c) => (
                  <p key={c}>
                    <Rich text={c} />
                  </p>
                ))}
              </div>
            </section>
          )}
          <Deliverable week={week.n} text={week.deliverable} />
        </div>

        <section aria-labelledby="schedule-h">
          <h2 id="schedule-h" className="section-h">
            Day-by-day schedule
          </h2>
          {week.n >= 2 && week.n <= 8 && !week.light && (
            <p className="hint">Follows the weekly rhythm: {rhythm.map((r) => r.day).join(", ")}, two 1-hour sessions a day.</p>
          )}
          <div className="days">
            {days.map((sessions) => (
              <DayCard key={sessions[0].date} sessions={sessions} today={today} />
            ))}
          </div>
        </section>

        {week.selfChecks.length > 0 && (
          <section className="card" aria-labelledby="sc-h" id="self-check">
            <div className="card-title">
              <h2 id="sc-h">Self-check</h2>
              <span className="eyebrow" data-testid="selfcheck-score">
                {score.graded ? `score ${Math.round((100 * score.points) / score.graded)}% · ${score.tally.got} got it, ${score.tally.shaky} shaky, ${score.tally.missed} missed · ${score.graded} of ${score.total} graded` : "answer without notes, then grade yourself"}
              </span>
            </div>
            <ol className="selfchecks">
              {week.selfChecks.map((check, i) => (
                <SelfCheckItem key={check.q} week={week.n} index={i} check={check} />
              ))}
            </ol>
          </section>
        )}

        <section className="card" id="notes">
          <Notes key={week.n} week={week.n} />
        </section>

        <nav className="pager" aria-label="Weeks">
          {prev ? (
            <Link to={`/week/${prev.n}`} className="btn">
              <Icon name="back" /> Week {prev.n}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/week/${next.n}`} className="btn">
              Week {next.n} <Icon name="arrow" />
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
