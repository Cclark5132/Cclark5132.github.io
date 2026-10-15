import { Link } from "react-router-dom";
import { phaseColor, weeks, type Phase } from "../data/plan";
import { weekProgress } from "../lib/progress";
import { formatDate, locate, localToday, plannedHours, weekEnd } from "../lib/schedule";
import { useProgress } from "../lib/store";

const phases: Phase[] = ["Setup", "Foundations", "Core structures", "Review", "Capstone", "Launch prep"];

export function Roadmap() {
  const progress = useProgress();
  const where = locate(localToday());
  const current = where.status === "during" ? where.week.n : -1;

  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Roadmap</span>
        <h1>12 weeks to Starbase</h1>
        <p className="lede">
          October 15, 2026 to January 10, 2027. Week 0 is one 2-hour setup day, Week 1 runs 10 days (20 hours), normal weeks are 14 hours and light weeks
          (Thanksgiving and finals) are 7. Total {plannedHours} hours.
        </p>
      </header>

      <div className="legend" aria-label="Phases">
        {phases.map((phase) => (
          <span key={phase} className="row" style={{ gap: 6 }}>
            <span className="swatch" style={{ background: phaseColor[phase] }} />
            {phase}
          </span>
        ))}
        <span className="row" style={{ gap: 6 }}>
          <span className="swatch light" />
          Light week
        </span>
      </div>

      <div className="strip" role="img" aria-label="Timeline: each block's width is proportional to the week's planned hours">
        {weeks.map((week) => (
          <Link
            key={week.n}
            to={`/week/${week.n}`}
            className={`strip-cell${week.light ? " light" : ""}${week.n === current ? " current" : ""}`}
            style={{ flexGrow: week.hours, background: phaseColor[week.phase] }}
            aria-label={`Week ${week.n}: ${week.title}`}
          >
            <span>{week.n}</span>
          </Link>
        ))}
      </div>

      <ol className="timeline">
        {weeks.map((week) => {
          const wp = weekProgress(progress, week.n);
          return (
            <li key={week.n} className={week.n === current ? "current" : undefined} style={{ ["--phase" as string]: phaseColor[week.phase] }}>
              <Link to={`/week/${week.n}`} className="timeline-card">
                <div className="timeline-head">
                  <span className="num timeline-n">W{String(week.n).padStart(2, "0")}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="eyebrow">
                      {formatDate(week.start)} – {formatDate(weekEnd(week))} · {week.phase}
                    </div>
                    <h2 className="timeline-title">{week.title}</h2>
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  {week.n === current && <span className="tag accent">This week</span>}
                  {week.light && <span className="tag">Light week</span>}
                  <span className="tag">~{week.hours} hrs</span>
                  <span className="num" style={{ marginLeft: "auto", fontSize: "0.82rem", color: "var(--muted)" }}>
                    {wp.done}/{wp.total}
                  </span>
                </div>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${(wp.done / Math.max(1, wp.total)) * 100}%`, background: "var(--phase)" }} />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
