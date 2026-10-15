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
/**
 * Dev-only date override for checking the schedule: open http://localhost:5173/?date=2026-10-15#/ in `pnpm dev`.
 * Production builds ignore it.
 */
export function dateOverride() {
  if (!import.meta.env.DEV || typeof window === "undefined") return undefined;
  const value = new URLSearchParams(window.location.search).get("date");
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

/** Today's date in the viewer's own time zone, as YYYY-MM-DD. */
export function localToday(now = new Date()) {
  const override = dateOverride();
  if (override) return override;
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
    const strip = (task = "") => task.replace(/^\*\*Hour \d\.\*\* /, "");
    return [
      [
        s("Setup hour 1: start downloads, build the Python side", [t[0], t[1], t[2]].map(strip).join(" "), "setup"),
        s("Setup hour 2: finish, verify and start the notebook", [t[3], t[4], t[5]].map(strip).join(" ") + " " + (t[6] ?? ""), "setup"),
      ],
    ];
  }

  if (week.n === 1) {
    const st = (title: string, detail: string) => s(title, detail, "structures", "structures");
    const nx = (title: string, detail: string) => s(title, detail, "cad", "cad");
    const py = (title: string, detail: string) => s(title, detail, "code", "code");
    return [
      [
        st("Loads on a vertical stage", "Free body diagram, load factor $n$, axial force at a station (Lesson 1 §1, Practice 4)."),
        nx("NX: interface tour and first part", "SolidWorks → NX vocabulary map, then a first part: sketch, extrude, and the Boolean choice inside the Extrude dialog."),
      ],
      [
        st("Running loads and bending", "$\\sigma = P/(2\\pi R t)$ and $\\sigma_b = M/(\\pi R^2 t)$, then running load $N_x$ and equivalent axial load $P_\\text{eq}$ (Lesson 1 §1b)."),
        py("Python: environment, git and margin_of_safety()", "Environment check, git workflow, and `margin_of_safety()` plus its first pytest test, pushed to the repo."),
      ],
      [
        st("Stress, strain and Mohr's circle (review speed)", "Biaxial Hooke's law, strain gauges, Mohr's circle and principal stresses (Lesson 1 §2–3)."),
        st("Worked problems by hand", "Lesson 1 Practice 3 and 5, worked by hand in the notebook."),
      ],
      [
        st("Von Mises, margins, limit vs. ultimate", "Von Mises; FS vs. MS; limit vs. ultimate load; pairing the yield and ultimate FS with the right allowable; how margins are reported (Lesson 1 §4–5)."),
        nx("NX: Hole, Pattern Feature, Revolve", "Build the bolted flange ring."),
      ],
      [
        st("Worked problems: margins and running loads", "Lesson 1 Practice 1, 2 and 6, plus the running-load problems."),
        py("Python: mos.py load-case table", "A load-case table (list of dicts or pandas) with yield and ultimate margins, flagging the minimum margin, with a plot."),
      ],
      [
        st("Units drill", "Redo three of the week's examples in US customary units: ksi, lbf/in, in·lbf. Use the US toggle on the Calculators page to check."),
        nx("NX: Expressions and the first drawing", "Expressions for a parametric bolt count and diameter, Part Navigator hygiene, and the first drawing of the flange."),
      ],
      [
        s("Self-checks and flashcards", "Week 1 self-checks with no notes, then flashcards. Fix anything you missed.", "review"),
        py("Python: running_load() and equivalent_axial_load()", "Write both with pytest tests, then vectorize over stations with numpy."),
      ],
      [
        st("Head start on Week 2: hoop and axial stress", "Lesson 2 §1–2: the hoop and axial derivations, and spheres."),
        nx("Head start on Week 2: NX tank revolve", "Revolve a tank: barrel plus two domes."),
      ],
      [
        s("Deliverable: flange ring model and drawing", "Finish the NX flange ring model and drawing and push them to the repo.", "deliverable"),
        s("Deliverable: mos.py with tests", "`mos.py` and `test_mos.py` passing, with a README, pushed to the repo.", "deliverable"),
      ],
      [
        s("Starship context: V3, Booster 18, Flight 12", join(week.context), "context"),
        s("Flashcards, self-check, plan Week 2", "Flashcards and the self-check, then plan Week 2 in the notebook.", "review"),
      ],
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
      [s("Review and consolidate: margins and pressure vessels", fc + "Start `booster_calcs.py`: move in your margin, running-load and pressure-vessel functions with their tests.", "review", "code")],
      [s("Review and consolidate: thermal and stiffeners", fc + "Move in the thermal-stress and section-property functions, and fill test gaps from the Week 2–4 worked examples.", "review", "code")],
      [s("Review and consolidate: buckling", fc + "Move in the column and cylinder buckling functions and check their tests.", "review", "code")],
      [s("Review and consolidate: joints and fatigue", fc + "Move in the bolt, weld and Miner's-rule functions and fill any test gaps.", "review", "code")],
      [s("Read the capstone spec", fc + "Read the full capstone spec on the Capstone page.", "review")],
      [s("Sketch the capstone model plan", fc + "Sketch the NX and Ansys model plan in your notebook.", "review")],
      [s("Light review", fc + "Run the whole `booster_calcs.py` test suite once more, then rest.", "review")],
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
  // Week 1's Friday already covered Lesson 2 §1–2, so Week 2 opens on the shell discontinuity example.
  const mondayH1 =
    week.n === 2
      ? s("Structures: shell discontinuity at the dome joint", "The hoop and axial derivations were done on Fri Oct 23. Work the dome-to-barrel discontinuity example (Lesson 2 §3), then read §2–3 on domes.", "structures", "structures")
      : s(rhythm[0].h1, join(learnA), "structures", "structures");
  const cad = week.cad?.items ?? [];
  const code = week.code?.items ?? [];
  const cadLabel = `CAD / FEA (${week.cad?.tool ?? "NX"})`;
  const codeLabel = `Code (${week.code?.tool ?? "Python"})`;
  return [
    [mondayH1, s(cadLabel, cad[0] ?? "", "cad", "cad")],
    [s(rhythm[1].h1, "Rework the lesson's worked examples, then practice problems 1–3.", "structures", "structures"), s(codeLabel, code[0] ?? "", "code", "code")],
    [s(rhythm[2].h1, join(learnB.length ? learnB : learnA), "structures", "structures"), s(cadLabel, cad[1] ?? cad[0] ?? "", "cad", "cad")],
    [s(rhythm[3].h1, "Finish the practice problems and answer the self-checks without notes.", "structures", "structures"), s(codeLabel, code[1] ?? code[0] ?? "", "code", "code")],
    [s(cadLabel, "Finish this week's CAD / FEA work.", "cad", "cad"), s("Code: turn this week's hand calc into a script", code[code.length - 1] ?? "", "code", "code")],
    [s(rhythm[5].h1, week.deliverable, "deliverable"), s(rhythm[5].h2, week.deliverable, "deliverable")],
    [
      s(rhythm[6].h1, `${join(week.context)} Then this week's flashcards.`, "context"),
      s(rhythm[6].h2, "Redo this week's hardest worked problem with no notes and check it against the lesson. Then plan next week in the notebook.", "review"),
    ],
  ];
}

function buildSessions(week: Week): Session[][] {
  const plan = planWeek(week);
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
