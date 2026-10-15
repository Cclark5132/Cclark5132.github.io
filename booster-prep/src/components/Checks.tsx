import type { ReactNode } from "react";
import type { Session } from "../lib/schedule";
import { localToday } from "../lib/schedule";
import { setCheck, setSession, toggleSession, useProgress } from "../lib/store";
import { Rich } from "./Tex";
import { showToast } from "./Toast";

/** Checks or unchecks a session, with a 5-second Undo. */
export function toggleWithUndo(id: string, title: string) {
  const previous = toggleSession(id, localToday());
  showToast(previous ? `Unchecked: ${title}` : `Checked off: ${title}`, { label: "Undo", run: () => setSession(id, previous) });
}

const kindLabel: Record<Session["kind"], string> = {
  structures: "Structures",
  cad: "CAD / FEA",
  code: "Code",
  deliverable: "Deliverable",
  context: "Starship context",
  review: "Review",
  setup: "Setup",
  capstone: "Capstone",
  launch: "Launch prep",
};

export function SessionCheck({ session, showDate = false }: { session: Session; showDate?: boolean }) {
  const progress = useProgress();
  const done = Boolean(progress.sessions[session.id]);
  return (
    <label className={`check${done ? " done" : ""}`}>
      <input type="checkbox" checked={done} onChange={() => toggleWithUndo(session.id, session.title)} />
      <span className="check-text">
        <span className="check-meta">
          {showDate ? `${session.dayName} · ` : ""}Hour {session.slot} · {kindLabel[session.kind]}
        </span>
        <strong style={{ fontWeight: 600 }}>{session.title}</strong>
        {session.detail && (
          <span style={{ display: "block", color: "var(--muted)", fontSize: "0.9rem" }}>
            <Rich text={session.detail} />
          </span>
        )}
      </span>
    </label>
  );
}

/** A persistent checkbox for any checklist item (setup tasks, capstone steps, launch prep). */
export function CheckItem({ id, children }: { id: string; children: ReactNode }) {
  const progress = useProgress();
  const done = Boolean(progress.checks[id]);
  return (
    <label className={`check${done ? " done" : ""}`}>
      <input type="checkbox" checked={done} onChange={(event) => setCheck(id, event.target.checked)} />
      <span className="check-text">{children}</span>
    </label>
  );
}
