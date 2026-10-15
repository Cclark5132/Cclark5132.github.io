import { Link } from "react-router-dom";
import { behindQueue, dayOfPlan, hoursVsPlan, nextLightSlot } from "../lib/catchup";
import { formatDate } from "../lib/schedule";
import { setOverride, setSkipped, useProgress } from "../lib/store";
import { LineChart } from "./Chart";

const SHOW = 6;

/** Unchecked sessions from past days, oldest first, with Do it now / Push to next light slot / Skip. */
export function CatchUpCard({ today }: { today: string }) {
  const progress = useProgress();
  const queue = behindQueue(progress, today);
  const missed = Object.keys(progress.skipped).length;
  if (!queue.length && !missed) return null;
  const slot = nextLightSlot(today, progress.overrides);
  return (
    <section className="card" aria-labelledby="catchup-h" data-testid="catchup">
      <div className="card-title">
        <h2 id="catchup-h">Catch up</h2>
        <span className="eyebrow">
          {queue.length} behind{missed ? ` · ${missed} skipped (counted as missed)` : ""}
        </span>
      </div>
      {queue.length === 0 ? (
        <p className="hint">Nothing waiting. Nice.</p>
      ) : (
        <ul className="catchup-list">
          {queue.slice(0, SHOW).map((s) => (
            <li key={s.id}>
              <div>
                <span className="check-meta">
                  {formatDate(progress.overrides[s.id] ?? s.date, { weekday: "short", month: "short", day: "numeric" })} · Week {s.week} · Hour {s.slot}
                  {progress.overrides[s.id] ? " · moved" : ""}
                </span>
                <strong>{s.title}</strong>
              </div>
              <div className="row catchup-actions">
                <Link className="btn small" to={`/focus/${s.id}`}>
                  Do it now
                </Link>
                <button type="button" className="btn small ghost" disabled={!slot} title={slot ? undefined : "No light slot left before January"} onClick={() => slot && setOverride(s.id, slot)}>
                  {slot ? `Push to ${formatDate(slot, { weekday: "short", month: "short", day: "numeric" })}` : "No light slot left"}
                </button>
                <button type="button" className="btn small ghost" onClick={() => setSkipped(s.id, true)}>
                  Skip
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {queue.length > SHOW && <p className="hint">and {queue.length - SHOW} more. Work through the oldest first.</p>}
    </section>
  );
}

/** Cumulative planned hours vs. hours checked off, Oct 15 to Jan 10, with today marked. */
export function HoursVsPlanCard({ today }: { today: string }) {
  const progress = useProgress();
  const h = hoursVsPlan(progress, today);
  const x = dayOfPlan(today);
  const inRange = x >= 0 && x <= h.planned[h.planned.length - 1][0];
  const label = h.behind > 0 ? `${h.behind} ${h.behind === 1 ? "hour" : "hours"} behind` : "On track";
  return (
    <section className="card" aria-labelledby="hours-h">
      <div className="card-title">
        <h2 id="hours-h">Hours vs. plan</h2>
        <span className={`tag ${h.behind > 0 ? "neg-text" : "pos-text"}`} style={{ borderColor: "currentColor" }} data-testid="on-track">
          {label}
          {h.ahead > 0 ? ` · ${h.ahead} ahead` : ""}
        </span>
      </div>
      <LineChart
        title="Cumulative planned hours and hours checked off"
        xLabel="Days from Oct 15"
        yLabel="Hours"
        height={220}
        series={[
          { name: "Planned", color: "var(--muted)", points: h.planned, dashed: true },
          { name: "Checked off", color: "var(--accent)", points: h.done },
        ]}
        markers={inRange ? [{ x, y: h.done[h.done.length - 1]?.[1] ?? 0, label: "Today" }] : []}
      />
      <p className="hint">Planned hours count through yesterday, so today's sessions don't count against you until tomorrow.</p>
    </section>
  );
}
