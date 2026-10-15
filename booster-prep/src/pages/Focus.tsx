import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Rich } from "../components/Tex";
import { showToast } from "../components/Toast";
import { formatDate, localToday, sessionById, sessionLink } from "../lib/schedule";
import { addMinutes, setSession, useProgress } from "../lib/store";
import { clock, readTimer, startTimer, timerView, writeTimer, type TimerMode, type TimerState } from "../lib/timer";
import { NotFound } from "./NotFound";

function useTick(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const onShow = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [active]);
  return now;
}

/** One session, full screen: what to do, a link to the exact material, a timer, and Done. */
export function Focus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const progress = useProgress();
  const session = sessionById.get(id ?? "");
  const [timer, setTimer] = useState<TimerState | undefined>(() => {
    const t = readTimer();
    return t && t.sessionId === id ? t : undefined;
  });
  const [mode, setMode] = useState<TimerMode>(timer?.mode ?? "60");
  const now = useTick(Boolean(timer));
  const [minutesText, setMinutesText] = useState("");
  if (!session) return <NotFound />;

  const other = readTimer();
  const view = timer ? timerView(timer, now) : undefined;
  const link = sessionLink(session);
  const done = Boolean(progress.sessions[session.id]);
  const logged = progress.minutes[session.id] ?? 0;
  const toLog = minutesText === "" ? (view?.focusMinutes ?? 0) : Math.max(0, Math.min(600, Number(minutesText) || 0));

  const start = () => {
    setTimer(startTimer(session.id, mode));
  };
  const stop = () => {
    writeTimer(undefined);
    setTimer(undefined);
  };
  const finish = () => {
    if (!done) setSession(session.id, localToday());
    if (toLog > 0) addMinutes(session.id, toLog);
    stop();
    showToast(toLog > 0 ? `Done. Logged ${toLog} min.` : "Done.");
    // Back to where Start was pressed, or home if the focus page was opened directly.
    if (((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="content narrow focus">
      <header className="page-head">
        <div className="row">
          <Link to={`/week/${session.week}`} className="eyebrow">
            Week {session.week}
          </Link>
          <span className="eyebrow">
            · {formatDate(progress.overrides[session.id] ?? session.date, { weekday: "long", month: "short", day: "numeric" })} · Hour {session.slot}
          </span>
        </div>
        <h1>{session.title}</h1>
        {session.detail && (
          <p className="lede">
            <Rich text={session.detail} />
          </p>
        )}
        <Link className="btn primary" to={link.to}>
          Open: {link.label} <Icon name="arrow" />
        </Link>
      </header>

      <section className="card focus-timer" aria-labelledby="timer-h">
        <div className="card-title">
          <h2 id="timer-h">Timer</h2>
          {!timer && (
            <div className="row" role="radiogroup" aria-label="Timer mode">
              {(["60", "25/5"] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} className={`btn small${mode === m ? "" : " ghost"}`} onClick={() => setMode(m)}>
                  {m === "60" ? "60 min" : "25 / 5"}
                </button>
              ))}
            </div>
          )}
        </div>
        {view ? (
          <>
            <div className="num timer-big" role="timer" aria-live="off">
              {view.phase === "done" ? "Time's up" : clock(view.remainingSec)}
            </div>
            <p className="hint">
              {view.phase === "break" ? "Break: stand up, look away from the screen." : view.phase === "done" ? "The hour is up. Log it below." : timer!.mode === "25/5" ? "Focus block (25 min), then a 5-minute break." : "Focus."}{" "}
              {view.focusMinutes} min of focus so far.
            </p>
          </>
        ) : (
          <p className="hint">{other && other.sessionId !== session.id ? "Another session's timer is running; starting here replaces it." : "The timer keeps running if you switch tabs or lock your phone."}</p>
        )}
        <div className="row" style={{ marginTop: 12 }}>
          {timer ? (
            <button type="button" className="btn ghost" onClick={stop}>
              Stop timer
            </button>
          ) : (
            <button type="button" className="btn" onClick={start}>
              Start timer
            </button>
          )}
        </div>
      </section>

      <section className="card" aria-labelledby="done-h">
        <div className="card-title">
          <h2 id="done-h">Finish</h2>
          {done && <span className="tag accent">Checked off</span>}
        </div>
        <div className="row">
          <label className="field" style={{ maxWidth: 180 }}>
            <span>Minutes to log</span>
            <input className="input" inputMode="numeric" value={minutesText === "" ? String(view?.focusMinutes ?? 0) : minutesText} onChange={(event) => setMinutesText(event.target.value.replace(/[^\d]/g, ""))} />
          </label>
          <button type="button" className="btn primary" style={{ alignSelf: "end" }} onClick={finish}>
            Done
          </button>
        </div>
        <p className="hint">
          Done checks the session off and adds the minutes to "actual hours studied."{logged ? ` Already logged here: ${logged} min.` : ""}
        </p>
      </section>
    </div>
  );
}
