import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SessionCheck } from "../components/Checks";
import { CatchUpCard, HoursVsPlanCard } from "../components/CatchUp";
import { Icon } from "../components/Icon";
import { downloadProgress } from "../components/ProgressIO";
import { ProgressRing } from "../components/ProgressRing";
import { phaseColor, START_DATE, weeks } from "../data/plan";
import { stats, validSessions } from "../lib/progress";
import { addDays, formatDate, locate, localToday, plannedHoursThrough, scheduleByWeek } from "../lib/schedule";
import { daysSince, lastExport } from "../lib/backup";
import { actualHours, movedTo } from "../lib/catchup";
import { studyStreak, useProgress } from "../lib/store";
import { readSettings, useSyncStatus } from "../lib/sync";
import { StorageLine } from "./Backup";

// First day at Starbase, midnight Central Standard Time (UTC−6).
const LAUNCH = Date.parse(`${START_DATE}T06:00:00Z`);

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown() {
  const now = useNow();
  const left = Math.max(0, LAUNCH - now);
  const parts = [
    ["days", Math.floor(left / 86_400_000)],
    ["hrs", Math.floor(left / 3_600_000) % 24],
    ["min", Math.floor(left / 60_000) % 60],
    ["sec", Math.floor(left / 1000) % 60],
  ] as const;
  return (
    <section className="card countdown" aria-label="Countdown to January 11, 2027">
      <div className="eyebrow">T-minus to Starbase · Mon, Jan 11, 2027</div>
      {left === 0 ? (
        <p className="countdown-done">Go for launch. Have a great first day.</p>
      ) : (
        <div className="countdown-grid" role="timer" aria-live="off">
          {parts.map(([unit, value]) => (
            <div key={unit}>
              <span className="num countdown-num">{String(value).padStart(unit === "days" ? 2 : 2, "0")}</span>
              <span className="eyebrow">{unit}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TodayCard({ today }: { today: string }) {
  const progress = useProgress();
  const where = locate(today);
  if (where.status === "before") {
    return (
      <section className="card">
        <div className="card-title">
          <h2>Today</h2>
        </div>
        <p style={{ color: "var(--ink-soft)" }}>
          The plan starts on {formatDate(weeks[0].start, { weekday: "long", month: "long", day: "numeric" })} with Week 0 setup.{" "}
          <Link to="/week/0">Preview Week 0</Link>.
        </p>
      </section>
    );
  }
  if (where.status === "after") {
    return (
      <section className="card">
        <div className="card-title">
          <h2>Today</h2>
        </div>
        <p style={{ color: "var(--ink-soft)" }}>The prep plan is complete. You're at Starbase. Keep using the calculators and flashcards.</p>
      </section>
    );
  }
  const { week, dayIndex } = where;
  const sessions = scheduleByWeek[week.n][dayIndex] ?? [];
  const moved = movedTo(progress, today);
  const tomorrow = addDays(today, 1);
  return (
    <section className="card">
      <div className="card-title">
        <div>
          <div className="eyebrow">
            Week {week.n} · Day {dayIndex + 1} of {week.days} · {week.title} · {formatDate(today, { weekday: "long", month: "short", day: "numeric" })}
          </div>
          <h2 style={{ marginTop: 4 }}>Today: {week.title}</h2>
        </div>
        <span className="tag" style={{ color: phaseColor[week.phase], borderColor: "currentColor" }}>
          {week.phase}
          {week.light ? " · light" : ""}
        </span>
      </div>
      <div className="stack" style={{ gap: 4 }}>
        {sessions.map((session) => (
          <SessionCheck key={session.id} session={session} />
        ))}
      </div>
      {moved.length > 0 && (
        <div className="stack" style={{ gap: 4, marginTop: 10 }}>
          <div className="eyebrow">Moved here from catch-up</div>
          {moved.map((session) => (
            <SessionCheck key={session.id} session={session} showDate />
          ))}
        </div>
      )}
      <div className="row" style={{ marginTop: 14 }}>
        <Link className="btn" to={`/week/${week.n}`}>
          Open Week {week.n}
        </Link>
        {week.lesson && (
          <Link className="btn ghost" to={`/lessons/${week.lesson}`}>
            This week's lesson
          </Link>
        )}
        <span className="eyebrow" style={{ marginLeft: "auto" }}>
          Tomorrow: {formatDate(tomorrow, { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>
    </section>
  );
}

/** One-click export, a nudge when the last export is old, and the sync state. */
function BackupCard() {
  useProgress();
  const sync = useSyncStatus();
  const [exportedAt, setExportedAt] = useState(lastExport);
  const syncing = Boolean(readSettings()?.token);
  const days = daysSince(exportedAt);
  const stale = !syncing && (days === undefined || days >= 7);
  return (
    <section className={`card${stale ? " nudge" : ""}`} aria-labelledby="dash-backup-h">
      <div className="card-title">
        <h2 id="dash-backup-h">Back up your progress</h2>
        <Link to="/backup" className="eyebrow">
          Backup &amp; sync
        </Link>
      </div>
      <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: 10 }}>
        {days === undefined ? "Last export: never." : `Last export: ${days === 0 ? "today" : `${days} ${days === 1 ? "day" : "days"} ago`}.`}
        {stale ? " Export now." : ""}
        {syncing && ` Sync: ${sync.error ? sync.error : sync.lastSync ? `last synced ${new Date(sync.lastSync).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : "waiting"}.`}
      </p>
      <div className="row">
        <button
          type="button"
          className="btn small"
          onClick={() => {
            downloadProgress();
            setExportedAt(lastExport());
          }}
        >
          <Icon name="download" /> Export progress
        </button>
      </div>
      <StorageLine />
    </section>
  );
}

export function Dashboard() {
  const progress = useProgress();
  const today = localToday(new Date(useNow(60_000)));
  const s = stats(progress);
  const streak = studyStreak(validSessions(progress.sessions), today, addDays);
  const onPlan = plannedHoursThrough(today);
  const actual = actualHours(progress);
  const trackRows = [
    ["Structures", s.tracks.structures, "var(--phase-foundations)"],
    ["CAD / FEA", s.tracks.cad, "var(--phase-core)"],
    ["Code", s.tracks.code, "var(--phase-review)"],
  ] as const;

  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Mission Dashboard</span>
        <h1>Booster structures prep</h1>
        <p className="lede">Two hours a day, twelve weeks, one goal: walk into the Super Heavy structures team on January 11 ready to contribute.</p>
      </header>

      <div className="dash-grid">
        <Countdown />
        <section className="card stat-card">
          <ProgressRing value={s.done / s.total} label="Overall progress" />
          <div className="stack" style={{ gap: 10 }}>
            <div>
              <div className="eyebrow">Hours logged</div>
              <div className="stat-pair">
                <div>
                  <div className="num stat-big">
                    {s.loggedHours} <span className="stat-sub">/ {s.plannedHours} hrs</span>
                  </div>
                  <div className="eyebrow" style={{ textTransform: "none", letterSpacing: 0 }}>
                    planned sessions done
                  </div>
                </div>
                <div>
                  <div className="num stat-big">
                    {actual} <span className="stat-sub">hrs</span>
                  </div>
                  <div className="eyebrow" style={{ textTransform: "none", letterSpacing: 0 }}>
                    actual hours studied (timer)
                  </div>
                </div>
              </div>
              <div className="eyebrow" style={{ textTransform: "none", letterSpacing: 0 }}>
                {onPlan} {onPlan === 1 ? "hr" : "hrs"} scheduled through today
              </div>
            </div>
            <div>
              <div className="eyebrow">Study streak</div>
              <div className="num stat-big">
                {streak} <span className="stat-sub">{streak === 1 ? "day" : "days"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="dash-grid wide-left" style={{ marginTop: 16 }}>
        <TodayCard today={today} />
        <div className="stack">
          <section className="card">
            <div className="card-title">
              <h2>Tracks</h2>
              <span className="eyebrow">sessions done</span>
            </div>
            <div className="stack" style={{ gap: 14 }}>
              {trackRows.map(([label, t, color]) => (
                <div key={label}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                    <span>{label}</span>
                    <span className="num" style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                      {t.done} / {t.total}
                    </span>
                  </div>
                  <div className="bar" role="progressbar" aria-label={`${label} progress`} aria-valuemin={0} aria-valuemax={t.total} aria-valuenow={t.done}>
                    <span style={{ width: `${(t.done / Math.max(1, t.total)) * 100}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <BackupCard />
        </div>
      </div>

      <div className="dash-grid wide-left" style={{ marginTop: 16 }}>
        <HoursVsPlanCard today={today} />
        <CatchUpCard today={today} />
      </div>
    </div>
  );
}
