import { rhythm, type SessionKind, type Track, type Week, weeks } from "../data/plan";

export interface Session {
  id: string;
  week: number;
  date: string; // YYYY-MM-DD
  dayName: string;
  slot: number; // 1 or 2
  title: string;
  detail: string;
  kind: SessionKind;
  track?: Track; // which progress bar it counts toward
  hours: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Dates are handled as UTC midnights so time zones and daylight saving never shift a day. */
export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export function toIso(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}
export function addDays(iso: string, days: number) {
  return toIso(parseDate(iso) + days * 86_400_000);
}
export function dayName(iso: string) {
  return DAY_NAMES[new Date(parseDate(iso)).getUTCDay()];
}
/** Today's date in the viewer's own time zone, as YYYY-MM-DD. */
export function localToday(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
export function weekEnd(week: Week) {
  return addDays(week.start, week.days - 1);
}
export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(parseDate(iso)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

type Plan = [title: string, detail: string, kind: SessionKind, track?: Track][];

const half = <T,>(items: T[]) => {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)] as const;
};
const join = (items: string[]) => items.join(" ");

/** Builds the per-day sessions for one week from the weekly rhythm (or the week's own plan). */
function planWeek(week: Week): Plan[] {
  const s = (title: string, detail: string, kind: SessionKind, track?: Track): Plan[number] => [title, detail, kind, track];

  if (week.n === 0) {
    const t = week.tasks ?? [];
    return [
      [s("Install Ansys Student and Python", join([t[0], t[3]]), "setup")],
      [s("Get NX access and install MATLAB", join([t[1], t[2]]), "setup")],
      [s("Create the booster-prep repo and portfolio folder", t[4], "setup")],
      [s("Start your engineering notebook", `${t[5]} Then walk through this site's Roadmap and Week 1.`, "setup")],
    ];
  }

  if (week.n === 6) {
    const [learn, more] = half(week.structures);
    return [
      [s("Structures: learn the topic", join(learn), "structures", "structures")],
      [s("Structures: worked problems", "Work the SP-8007 example by hand, then the lesson's practice problems.", "structures", "structures")],
      [s("Structures: learn the topic", join(more), "structures", "structures")],
      [s("Code: cylinder_buckling()", week.code!.items[0], "code", "code")],
      [s("Code: test it", "Check your function against the worked example: σ_cr ≈ 103.8 MPa, γ ≈ 0.21, σ_design ≈ 21.8 MPa.", "code", "code")],
      [s("Deliverable build", week.deliverable, "deliverable")],
      [s("Starship context and flashcards", join(week.context), "context")],
    ];
  }

  if (week.n === 9) {
    const fc = "Flashcards and self-checks from Weeks 1–8 (30 min). ";
    return [
      [s("Review: margins and pressure vessels", fc + "Start `booster_calcs.py`: margin and pressure-vessel functions.", "review", "code")],
      [s("Review: materials and stiffeners", fc + "Add tests using the Week 1–2 worked examples.", "review", "code")],
      [s("Review: buckling", fc + "Add the column and cylinder buckling functions and their tests.", "review", "code")],
      [s("Review: joints and fatigue", fc + "Add thermal, bolt and Miner's-rule functions and tests.", "review", "code")],
      [s("Read the capstone spec", fc + "Read the full capstone spec on the Capstone page.", "review")],
      [s("Sketch the capstone model plan", fc + "Sketch the NX and Ansys model plan in your notebook.", "review")],
      [s("Light review and rest", fc + "Then rest.", "review")],
    ];
  }

  if (week.n === 10) {
    return [
      [s("Hand calcs: hoop and axial stress", "All three load cases, in Python.", "capstone", "structures"), s("Hand calcs: flight case", "Hydrostatic head at 3 g at the bottom of the section, plus 0.35 MPa ullage.", "capstone", "structures")],
      [s("Hand calcs: buckling with knockdown", "SP-8007 knockdown for the flight and handling cases.", "capstone", "structures"), s("Hand calcs: margins and minimum thickness", "Margins table for every load case; find the minimum t with MS ≥ 0 everywhere.", "capstone", "structures")],
      [s("NX: barrel midsurface", "Midsurface at R = 4.5 m, 6 m long, for shell meshing.", "capstone", "cad"), s("NX: ring frames", "3 internal ring frames, evenly spaced.", "capstone", "cad")],
      [s("NX: drawing", "Views, sections and dimensions.", "capstone", "cad"), s("Ansys: set up shells and symmetry", "Import the midsurface, assign shell thickness, and use symmetry to stay under the student limit.", "capstone", "cad")],
      [s("Ansys static: proof case", "0.45 MPa internal pressure.", "capstone", "cad"), s("Ansys static: flight case", "Ullage plus hydrostatic head, plus 30 MN axial compression.", "capstone", "cad")],
      [s("Mesh convergence study", "Refine until peak stress changes by less than about 5%.", "capstone", "cad"), s("Mesh convergence plot", "Plot peak stress vs. element count and record it in your notebook.", "capstone", "cad")],
      [s("Write down assumptions", "Every assumption, unit and source so far.", "capstone"), s("Review and rest", "Flashcards, then rest.", "review")],
    ];
  }

  if (week.n === 11) {
    return [
      [s("Ansys buckling: handling case", "Linear buckling with 2 MN axial compression.", "capstone", "cad"), s("Ansys buckling: handling case", "Check mode shapes and compare the load factor with your hand calc.", "capstone", "cad")],
      [s("Ansys buckling: flight case", "Prestressed buckling with pressure applied first.", "capstone", "cad"), s("Ansys buckling: flight case", "Compare with the unpressurized result.", "capstone", "cad")],
      [s("Compare FEA to hand calcs", "Explain the gap between FEA and SP-8007.", "capstone", "structures"), s("Trade study: thickness", "Plot mass and minimum margin vs. wall thickness.", "capstone", "code")],
      [s("Trade study: ring frames", "Plot mass and minimum margin vs. number of ring frames.", "capstone", "code"), s("Recommend a design", "Pick t and frame count and justify it.", "capstone", "structures")],
      [s("Report: Summary, Assumptions, Hand Calcs", "4 pages max in total.", "capstone"), s("Report: FEA and Comparison", "Every number has a unit and a source.", "capstone")],
      [s("Report: Trade Study and Recommendation", "Finish the report draft.", "capstone"), s("5-slide deck", "Summary, model, results, trade study, recommendation.", "capstone")],
      [s("Proofread the report", "Could a reviewer follow your assumptions without asking you?", "capstone"), s("Rest", "Rest.", "review")],
    ];
  }

  if (week.n === 12) {
    return [
      [s("Anatomy: tanks, common dome, downcomer", "Use the Anatomy page. What loads does each carry?", "launch"), s("Anatomy: thrust section and engine mounts", "33 Raptors and the thrust structure.", "launch")],
      [s("Anatomy: hot-staging ring, grid fins, chines, catch hardpoints", "What loads does each carry?", "launch"), s("Anatomy flashcards", "Filter the deck to Week 12.", "launch")],
      [s("Flight test footage", "Rewatch recent flights. Note one structures detail per flight.", "launch"), s("SpaceX flight summaries", "Read the official summaries for the same flights.", "launch")],
      [s("First week plan", "Draft the one-page first week plan.", "launch"), s("Questions for your manager", "Review and personalize the questions on the Launch Prep page.", "launch")],
      [s("Portfolio cleanup", "Make the booster-prep repo and deliverables ready to show.", "deliverable"), s("Portfolio cleanup", "README, figures and the capstone report.", "deliverable")],
      [s("Logistics checklist", "Housing, car, insurance, PPE, paperwork.", "launch"), s("Pack and plan travel", "Steel-toe boots, notebook, ID and documents.", "launch")],
      [s("Final review", "Flashcards: due cards only.", "review"), s("Rest before Monday", "You're ready.", "review")],
    ];
  }

  // Normal weeks follow the weekly rhythm table.
  const [learnA, learnB] = half(week.structures);
  const cad = week.cad?.items ?? [];
  const code = week.code?.items ?? [];
  const cadLabel = `CAD / FEA (${week.cad?.tool ?? "NX"})`;
  const codeLabel = `Code (${week.code?.tool ?? "Python"})`;
  return [
    [s(rhythm[0].h1, join(learnA), "structures", "structures"), s(cadLabel, cad[0] ?? "", "cad", "cad")],
    [s(rhythm[1].h1, "Rework the lesson's worked examples, then practice problems 1–3.", "structures", "structures"), s(codeLabel, code[0] ?? "", "code", "code")],
    [s(rhythm[2].h1, join(learnB.length ? learnB : learnA), "structures", "structures"), s(cadLabel, cad[1] ?? cad[0] ?? "", "cad", "cad")],
    [s(rhythm[3].h1, "Finish the practice problems and answer the self-checks without notes.", "structures", "structures"), s(codeLabel, code[1] ?? code[0] ?? "", "code", "code")],
    [s(cadLabel, "Finish this week's CAD / FEA work.", "cad", "cad"), s("Code: turn this week's hand calc into a script", code[code.length - 1] ?? "", "code", "code")],
    [s(rhythm[5].h1, week.deliverable, "deliverable"), s(rhythm[5].h2, week.deliverable, "deliverable")],
    [s(rhythm[6].h1, join(week.context), "context"), s(rhythm[6].h2, "Flashcards for this week, then the self-check questions.", "review")],
  ];
}

function buildSessions(week: Week): Session[][] {
  const plan = planWeek(week);
  // Every session is a one-hour block (Sunday's two half-hour items share one block each).
  return plan.map((day, i) => {
    const date = addDays(week.start, i);
    return day.map(([title, detail, kind, track], slot) => ({
      id: `w${week.n}-d${i}-s${slot + 1}`,
      week: week.n,
      date,
      dayName: dayName(date),
      slot: slot + 1,
      title,
      detail,
      kind,
      track,
      hours: 1,
    }));
  });
}

export const scheduleByWeek: Record<number, Session[][]> = Object.fromEntries(weeks.map((week) => [week.n, buildSessions(week)]));
export const allSessions: Session[] = weeks.flatMap((week) => scheduleByWeek[week.n].flat());
export const sessionById = new Map(allSessions.map((session) => [session.id, session]));
export const plannedHours = allSessions.reduce((sum, session) => sum + session.hours, 0);

/** Where a date falls in the plan. */
export function locate(iso: string): { status: "before" } | { status: "after" } | { status: "during"; week: Week; dayIndex: number } {
  if (iso < weeks[0].start) return { status: "before" };
  for (const week of weeks) {
    if (iso >= week.start && iso <= weekEnd(week)) {
      return { status: "during", week, dayIndex: Math.round((parseDate(iso) - parseDate(week.start)) / 86_400_000) };
    }
  }
  return { status: "after" };
}

/** Planned hours scheduled on or before a given date (what "on track" means today). */
export function plannedHoursThrough(iso: string) {
  return allSessions.filter((session) => session.date <= iso).reduce((sum, session) => sum + session.hours, 0);
}
