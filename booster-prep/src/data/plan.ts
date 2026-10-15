/*
 * The 12-week plan, transcribed from content/PLAN.md (the source of truth).
 * Text fields use light markup rendered by <Rich>: $inline math$, $$display math$$ and **bold**.
 */
import type { Var } from "../components/Formula";

export type Track = "structures" | "cad" | "code";
export type SessionKind = Track | "deliverable" | "context" | "review" | "setup" | "capstone" | "launch";
export type Phase = "Setup" | "Foundations" | "Core structures" | "Review" | "Capstone" | "Launch prep";

export interface FormulaDef {
  label: string;
  tex: string;
  vars: Var[];
}

export interface SelfCheck {
  q: string;
  a: string;
}

export interface Week {
  n: number;
  title: string;
  start: string; // ISO date of first day
  days: number; // number of days in the week (Week 0 has 1, Week 1 has 10)
  phase: Phase;
  light: boolean;
  hours: number;
  lesson?: string; // lesson slug
  structures: string[];
  cad?: { tool: string; items: string[] };
  code?: { tool: string; items: string[] };
  formulas: FormulaDef[];
  context: string[];
  deliverable: string;
  selfChecks: SelfCheck[];
  tasks?: string[]; // checklist-style weeks (0, 9, 10–12)
  /** MATLAB weeks keep Python as the main toolkit: Friday's script session is Python, with this task. */
  pythonScript?: string;
  note?: string;
}

export const START_DATE = "2027-01-11";
export const PREP_START = "2026-10-15";

/**
 * Monday of the calendar week that holds the light finals week (Week 9, Review). Move it to match your VT
 * exam schedule: "2026-11-30", "2026-12-07", "2026-12-14" (default) or "2026-12-21". Weeks 7–10 shift around
 * it in order; week content and progress IDs stay attached to their week numbers.
 */
export const FINALS_WEEK_START = "2026-12-14";

export const tracks: { id: Track; label: string; share: string; covers: string }[] = [
  { id: "structures", label: "Structures", share: "about 40%", covers: "The theory behind booster structures, done as hand calcs" },
  { id: "cad", label: "CAD / FEA", share: "about 35%", covers: "NX for modeling and drawings, then Ansys for analysis" },
  { id: "code", label: "Code", share: "about 25%", covers: "Python first, MATLAB second, building your own calc toolkit" },
];

export const rhythm: { day: string; h1: string; h2: string }[] = [
  { day: "Mon", h1: "Structures: learn the topic", h2: "CAD / FEA" },
  { day: "Tue", h1: "Structures: worked problems", h2: "Code" },
  { day: "Wed", h1: "Structures: learn the topic", h2: "CAD / FEA" },
  { day: "Thu", h1: "Structures: worked problems", h2: "Code" },
  { day: "Fri", h1: "CAD / FEA", h2: "Code: turn this week's hand calc into a script" },
  { day: "Sat", h1: "Deliverable build", h2: "Deliverable build" },
  { day: "Sun", h1: "Starship context (30 min), then flashcards (30 min)", h2: "Hardest problem again with no notes, then plan next week" },
];

const v = (s: string, m: string, u: string): Var => [s, m, u];

/** Weeks in their default calendar positions (finals in Dec 14 – Dec 20). */
export const baseWeeks: Week[] = [
  {
    n: 0,
    title: "Setup",
    start: "2026-10-15",
    days: 1,
    phase: "Setup",
    light: false,
    hours: 2,
    note: "One day, two hours. Setup is Day 1 only; Week 1 starts tomorrow at full intensity.",
    structures: [],
    formulas: [],
    context: [],
    deliverable: "Tools downloading or installed, a `booster-prep` GitHub repo with a passing pytest test, and a dated engineering notebook.",
    selfChecks: [],
    tasks: [
      "**Hour 1.** Start every big download in parallel: **Ansys Student 2026 R1** (free; structural problems capped at 128K nodes/elements; Windows 10/11 64-bit only; built-in license runs to Mar 31, 2027), **Siemens Designcenter Student Edition (includes NX)** (free; Windows 64-bit only), and **MATLAB** through VT's campus license.",
      "**Hour 1.** While they run, install **Python** (Miniconda or Anaconda) and **VS Code**, and create an environment with numpy, scipy, matplotlib, pandas, jupyter and pytest.",
      "**Hour 1.** Create the `booster-prep` GitHub repo with folders `calcs/`, `tests/`, `cad/`, `fea/`, `notes/` and a README. Add a trivial passing `pytest` test so testing is part of the workflow from day one.",
      "**Hour 2.** Finish the installs and launch Ansys, NX and MATLAB once each to confirm the licenses work. If NX won't work out, ask the VT ME department which labs or remote desktops carry NX.",
      "**Hour 2.** Start the dated **engineering notebook**. Page 1 is your goals and how you'll track your time. Date every page; this habit matters at SpaceX.",
      "**Hour 2.** Skim the Roadmap and Week 1 on this site.",
      "**On a Mac:** Ansys Student and the NX student edition are Windows-only. Use a VT lab or remote-desktop machine, or a Windows virtual machine. If a download is still running when the hour ends, let it finish while Week 1 starts. Don't push setup into another day.",
    ],
  },
  {
    n: 1,
    title: "Stress, loads, margins, and running loads",
    start: "2026-10-16",
    days: 10,
    phase: "Foundations",
    light: false,
    hours: 20,
    note: "Ten days, Fri Oct 16 to Sun Oct 25, at full intensity: 2 hours every day. Hour 1 is structures; Hour 2 is a tool. Fri Oct 23 gives you a head start on Week 2.",
    lesson: "stress-and-margins",
    structures: [
      "Free body diagrams for a vertical rocket stage: thrust, weight, inertia, aerodynamic bending.",
      "**Running loads:** force per unit length of circumference (N/mm or lbf/in). Axial force and bending combine into a peak running load $N_x$ and an equivalent axial load $P_\\text{eq}$.",
      "Stress and strain, biaxial Hooke's law, strain gauges, Mohr's circle, principal stresses (review speed).",
      "Von Mises equivalent stress (2D, principal stresses).",
      "Factor of safety (FS) and margin of safety (MS). A part passes when **MS ≥ 0**. Aerospace work talks in margins far more than in factors of safety.",
      "**Limit vs. ultimate load.** Limit load is the maximum expected in service; ultimate load is limit × FS. Pair the yield FS with the yield allowable and the ultimate FS with the ultimate allowable.",
      "**Units drill:** redo three examples in US customary units (ksi, lbf/in, in·lbf).",
    ],
    cad: {
      tool: "NX",
      items: [
        "NX interface tour. Map SolidWorks words to NX words (Feature Manager → Part Navigator, Sketch → Sketch, Extrude → Extrude, Mates → Assembly Constraints). First part: sketch, extrude, Boolean inside the dialog.",
        "Hole, Pattern Feature and Revolve: build the bolted flange ring.",
        "Expressions (parametric bolt count and diameter), Part Navigator hygiene, and a first drawing of the flange.",
      ],
    },
    code: {
      tool: "Python",
      items: [
        "Environment check, git workflow, and `margin_of_safety(allowable, applied, fs)` with its first pytest test.",
        "`mos.py`: a load-case table (list of dicts or pandas) with yield and ultimate margins, flagging the minimum margin, with a plot.",
        "`running_load()` and `equivalent_axial_load()` with tests, vectorized over stations with numpy.",
      ],
    },
    formulas: [
      {
        label: "Von Mises (2D, principal stresses)",
        tex: "\\sigma_{vm} = \\sqrt{\\sigma_1^2 - \\sigma_1\\sigma_2 + \\sigma_2^2}",
        vars: [v("\\sigma_{vm}", "von Mises equivalent stress", "MPa"), v("\\sigma_1, \\sigma_2", "in-plane principal stresses", "MPa")],
      },
      {
        label: "Margin of safety",
        tex: "MS = \\frac{\\sigma_\\text{allowable}}{FS \\times \\sigma_\\text{applied}} - 1",
        vars: [
          v("MS", "margin of safety (pass when MS ≥ 0)", "—"),
          v("\\sigma_\\text{allowable}", "material allowable", "MPa"),
          v("FS", "factor of safety", "—"),
          v("\\sigma_\\text{applied}", "applied (limit) stress", "MPa"),
        ],
      },
      {
        label: "Running load and equivalent axial load",
        tex: "N_x = \\frac{P}{2\\pi R} \\pm \\frac{M}{\\pi R^2}, \\qquad P_\\text{eq} = P + \\frac{2M}{R}, \\qquad \\sigma = \\frac{N_x}{t}",
        vars: [
          v("N_x", "axial running load (force per unit length of circumference)", "N/mm"),
          v("P", "axial force", "N"),
          v("M", "bending moment", "N·mm"),
          v("R", "mean radius", "mm"),
          v("t", "wall thickness", "mm"),
          v("P_\\text{eq}", "uniform axial load giving the same peak running load as P plus M", "N"),
        ],
      },
    ],
    context: [
      "The full stack: Super Heavy booster below, Starship upper stage on top. Both are stainless steel, about 9 m in diameter, and burn liquid methane and liquid oxygen.",
    ],
    deliverable: "An NX model and drawing of a bolted flange ring, plus `mos.py` and `test_mos.py` in the repo, running the load-case margins table with yield and ultimate checks.",
    selfChecks: [
      {
        q: "Why do aerospace engineers report margins instead of just factors of safety?",
        a: "A margin already includes the required factor of safety, and zero is always the pass line. That lets you compare yield, ultimate, buckling and joint checks with different factors of safety in one table, and the smallest margin tells you immediately what governs and how much reserve is left.",
      },
      {
        q: "A part with $\\sigma_\\text{allowable} = 300$ MPa, $\\sigma_\\text{applied} = 200$ MPa, and $FS = 1.4$. What's the margin?",
        a: "$$MS = \\frac{300}{1.4 \\times 200} - 1 = \\frac{300}{280} - 1 = +0.07$$",
      },
      {
        q: "What does a negative margin mean, and what are the three ways to fix one?",
        a: "The applied stress times the factor of safety exceeds the allowable, so the part doesn't meet the requirement (it may not physically fail, but it can't be signed off). Fixes: **reduce the applied stress** (more material, better load path, lower load), **raise the allowable** (stronger material or processing, backed by data), or **refine the analysis** to remove conservatism (better loads, better model, test data).",
      },
    ],
  },
  {
    n: 2,
    title: "Thin-walled pressure vessels",
    start: "2026-10-26",
    days: 7,
    phase: "Foundations",
    light: false,
    hours: 14,
    lesson: "pressure-vessels",
    structures: [
      "Thin-wall cylinder, radius $R$ and wall thickness $t$, internal pressure $p$: hoop and axial stress.",
      "Spherical or hemispherical dome stress.",
      "Ellipsoidal domes and why dome shape matters at the joint with the barrel.",
      "**Shell discontinuity** at the dome-to-barrel joint: for a hemisphere on a cylinder of equal thickness the peak meridional stress is about **1.29 ×** $pR/(2t)$ (254.3 MPa vs. 196.9 MPa in the worked example). Week 8's FEA checks it.",
      "Hydrostatic head: liquid at the bottom of a tank sees extra pressure, and it grows with vehicle acceleration ($n$, in g's). Example: LOX ($\\rho \\approx 1141$ kg/m³), $h = 20$ m, at 1 g gives about **0.22 MPa**; at 3 g it triples to about **0.67 MPa**.",
      "Total wall pressure = ullage (gas) pressure + hydrostatic head.",
    ],
    cad: { tool: "NX", items: ["Revolve, shell, and thicken. Model a tank: cylindrical barrel plus two domes.", "Measure mass and volume with NX's measure tools."] },
    code: { tool: "Python", items: ["numpy arrays; plot hoop stress vs. wall thickness for several pressures."] },
    formulas: [
      {
        label: "Thin-wall cylinder",
        tex: "\\sigma_\\text{hoop} = \\frac{pR}{t}, \\qquad \\sigma_\\text{axial} = \\frac{pR}{2t}",
        vars: [
          v("\\sigma_\\text{hoop}", "circumferential (hoop) stress", "MPa"),
          v("\\sigma_\\text{axial}", "longitudinal stress", "MPa"),
          v("p", "internal pressure", "MPa"),
          v("R", "radius", "mm"),
          v("t", "wall thickness", "mm"),
        ],
      },
      {
        label: "Spherical or hemispherical dome",
        tex: "\\sigma = \\frac{pR}{2t}",
        vars: [v("\\sigma", "membrane stress (same in every direction)", "MPa"), v("p", "internal pressure", "MPa"), v("R", "dome radius", "mm"), v("t", "dome thickness", "mm")],
      },
      {
        label: "Hydrostatic head",
        tex: "p_\\text{hydro} = \\rho\\, n\\, g\\, h",
        vars: [
          v("p_\\text{hydro}", "extra pressure from the liquid column", "Pa"),
          v("\\rho", "liquid density (LOX ≈ 1141)", "kg/m³"),
          v("n", "axial load factor", "g's"),
          v("g", "9.81", "m/s²"),
          v("h", "liquid height above the point", "m"),
        ],
      },
      {
        label: "Required wall thickness",
        tex: "t = \\frac{FS \\times p \\times R}{\\sigma_\\text{allow}}",
        vars: [v("t", "minimum wall thickness", "mm"), v("FS", "factor of safety", "—"), v("p", "design pressure", "MPa"), v("R", "radius", "mm"), v("\\sigma_\\text{allow}", "allowable stress", "MPa")],
      },
    ],
    context: [
      "Booster tank layout: the methane tank sits above the liquid oxygen tank, separated by a common dome. A downcomer pipe carries methane down through the LOX tank to the engines.",
    ],
    deliverable: "`tank_stress.py` that takes R, t, ullage pressure, fill height, and acceleration, then plots wall stress from top to bottom of the tank.",
    selfChecks: [
      {
        q: "Why is hoop stress twice axial stress?",
        a: "Cut the cylinder lengthwise: pressure acts on a projected area $2RL$ and is resisted by two walls of area $tL$, so $\\sigma_h = pR/t$. Cut it crosswise: pressure acts on the end area $\\pi R^2$ and is resisted by a ring of area $2\\pi R t$, so $\\sigma_a = pR/(2t)$. The hoop cut carries twice the pressure force per unit of wall area.",
      },
      {
        q: "Where in a full tank under acceleration is wall pressure highest?",
        a: "At the bottom of the tank (the lowest point of the liquid column, the aft dome), where the head $h$ is largest. Over a flight, the worst moment is when $n \\times h$ is largest: acceleration rises as propellant burns, but the liquid height falls, so you check the whole trajectory.",
      },
      {
        q: "Size the wall: $R = 4.5$ m, $p = 0.35$ MPa, $FS = 1.25$, allowable = 500 MPa (a made-up practice value).",
        a: "$$t = \\frac{FS \\times p \\times R}{\\sigma_\\text{allow}} = \\frac{1.25 \\times 0.35 \\times 4500}{500} \\approx 3.94 \\text{ mm}$$",
      },
    ],
  },
  {
    n: 3,
    title: "Materials, stainless steel, and thermal stress",
    start: "2026-11-02",
    days: 7,
    phase: "Foundations",
    light: false,
    hours: 14,
    lesson: "stainless-and-thermal-stress",
    structures: [
      "Austenitic stainless steel (300 series, such as 304L). Its strength rises at cryogenic temperature and it stays ductile, because its crystal structure has no ductile-to-brittle transition.",
      "Cold work and work hardening; why yield strength depends on how the sheet was processed.",
      "Design allowables: A-basis and B-basis values, and the **MMPDS** handbook where they come from.",
      "Thermal stress in a fully constrained part. Cryogenic propellant on one side of a joint and ambient air on the other creates exactly this.",
    ],
    cad: { tool: "NX", items: ["Assemblies and constraints.", "Drafting: create a drawing with views, sections, and dimensions."] },
    code: { tool: "MATLAB", items: ["Finish **MATLAB Onramp** (free from MathWorks).", "Practice matrices and plotting."] },
    pythonScript: "Python: add `thermal_stress()` (uniaxial and biaxial) to your toolkit with pytest tests from the Lesson 3 worked examples.",
    formulas: [
      {
        label: "Thermal stress, fully constrained",
        tex: "\\sigma_\\text{thermal} = E\\, \\alpha\\, \\Delta T",
        vars: [
          v("\\sigma_\\text{thermal}", "stress from blocked thermal strain", "MPa"),
          v("E", "Young's modulus", "MPa"),
          v("\\alpha", "coefficient of thermal expansion", "1/°C"),
          v("\\Delta T", "temperature change", "°C"),
        ],
      },
    ],
    context: [
      "Why stainless instead of carbon fiber or aluminum-lithium: low cost, strong at cryogenic temperatures, handles reentry heat, and is easy to weld and repair.",
    ],
    deliverable: "NX drawing of a barrel ring segment, plus a MATLAB plot of yield strength vs. temperature from published data.",
    selfChecks: [
      {
        q: "Why doesn't 304L get brittle in liquid oxygen when carbon steel would?",
        a: "304L is austenitic, with a face-centered cubic (FCC) crystal structure. FCC metals keep many active slip systems at low temperature, so they have no ductile-to-brittle transition. Plain carbon steel is body-centered cubic (BCC), whose yield strength rises steeply as it cools until cleavage fracture wins over plastic flow, so it turns brittle.",
      },
      {
        q: "A constrained steel part cools by 200 °C. With $E = 193$ GPa and $\\alpha = 17 \\times 10^{-6}$ /°C, what's the thermal stress?",
        a: "$$\\sigma = 193{,}000 \\times 17 \\times 10^{-6} \\times 200 \\approx 656 \\text{ MPa}$$ That's above typical annealed yield, which is why parts are rarely fully constrained.",
      },
      {
        q: "What's the difference between A-basis and B-basis allowables?",
        a: "**A-basis:** at least 99% of the material population is expected to meet or exceed the value, with 95% confidence. **B-basis:** at least 90%, with 95% confidence. A-basis is used where a single member failure would cause loss of the structure (single load path); B-basis is used for redundant (fail-safe) structure.",
      },
    ],
  },
  {
    n: 4,
    title: "Stiffeners, stress concentrations, GD&T, and first FEA",
    start: "2026-11-09",
    days: 7,
    phase: "Foundations",
    light: false,
    hours: 14,
    lesson: "stiffeners-kt-gdt",
    structures: [
      "Ring frames and stringers: what each one stiffens and why.",
      "Bending of beams and thin walls; section properties ($I$, $Q$, centroid) of stiffener cross-sections.",
      "Stress concentrations ($K_t$) around holes and cutouts. A small hole in a wide plate under tension has **$K_t \\approx 3$**. Peterson's *Stress Concentration Factors* is the reference.",
      "**GD&T** basics from ASME Y14.5: datums, flatness, profile, position. Booster rings are large and thin, so profile and roundness tolerances matter.",
    ],
    cad: {
      tool: "Ansys",
      items: [
        "Ansys Workbench workflow: geometry, material, mesh, loads, supports, solve, results.",
        "First model: a plate with a center hole in tension. Check that max stress ≈ 3 × nominal.",
      ],
    },
    code: { tool: "Python", items: ["pandas: load a CSV of fake strain-gauge data, convert strain to stress ($\\sigma = E \\varepsilon$), and plot it."] },
    formulas: [
      {
        label: "Stress concentration",
        tex: "\\sigma_\\text{max} = K_t\\, \\sigma_\\text{nom}",
        vars: [v("\\sigma_\\text{max}", "peak stress at the hole or notch", "MPa"), v("K_t", "elastic stress concentration factor (≈ 3 for a small hole in a wide plate)", "—"), v("\\sigma_\\text{nom}", "nominal stress away from the notch", "MPa")],
      },
      {
        label: "Beam bending stress",
        tex: "\\sigma = \\frac{M\\, y}{I}",
        vars: [v("\\sigma", "bending stress", "MPa"), v("M", "bending moment", "N·mm"), v("y", "distance from the neutral axis", "mm"), v("I", "second moment of area", "mm⁴")],
      },
    ],
    context: [
      "How a booster is built: flat stainless sheet is rolled into rings, rings are welded and stacked into barrel sections, and sections are stacked into the full booster.",
    ],
    deliverable: "Ansys plate-with-hole study with a short write-up comparing FEA to the $K_t$ hand calc.",
    selfChecks: [
      {
        q: "Why can't you trust the peak stress at a sharp corner in FEA?",
        a: "A perfectly sharp re-entrant corner is a stress singularity in linear elasticity: the theoretical stress is infinite, so the reported peak keeps rising every time you refine the mesh and never converges. Model the real fillet radius, or read stress a small distance away and use the appropriate method (e.g. linearized or nominal stress with a $K_t$).",
      },
      {
        q: "What does a datum reference frame do on a drawing?",
        a: "It defines the coordinate system that features are located and measured from: usually three mutually perpendicular datum planes (primary, secondary, tertiary) taken from real features, in an order of precedence that also says how the part is fixtured for inspection. Every position and profile tolerance is measured relative to it.",
      },
      {
        q: "Stringers or ring frames: which one mainly helps against axial buckling?",
        a: "**Stringers.** They run along the axis, carry axial load and stiffen the skin against axial compression. Ring frames mainly keep the shell round, control general instability, and set the unsupported length of the stringers.",
      },
    ],
  },
  {
    n: 5,
    title: "Buckling I, columns and plates",
    start: "2026-11-16",
    days: 7,
    phase: "Core structures",
    light: false,
    hours: 14,
    lesson: "column-and-plate-buckling",
    structures: [
      "Euler column buckling. $K$ is the end-condition factor (1.0 pinned-pinned, 0.5 fixed-fixed, 2.0 fixed-free).",
      "Johnson parabola for short columns, where yielding and buckling interact.",
      "Flat-plate buckling and the idea of effective width.",
    ],
    cad: { tool: "Ansys", items: ["Eigenvalue (linear) buckling: run a static case first, then the buckling case.", "Compare a column's first buckling load to Euler."] },
    code: { tool: "Python", items: ["Plot the combined Euler/Johnson curve: critical stress vs. slenderness ratio ($KL/r$)."] },
    formulas: [
      {
        label: "Euler column buckling",
        tex: "P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}",
        vars: [
          v("P_{cr}", "critical buckling load", "N"),
          v("E", "Young's modulus", "MPa"),
          v("I", "smallest second moment of area", "mm⁴"),
          v("K", "end-condition factor", "—"),
          v("L", "column length", "mm"),
        ],
      },
      {
        label: "Johnson parabola (short columns)",
        tex: "\\sigma_{cr} = \\sigma_y - \\frac{\\sigma_y^2}{4\\pi^2 E}\\left(\\frac{KL}{r}\\right)^2",
        vars: [v("\\sigma_{cr}", "critical stress", "MPa"), v("\\sigma_y", "yield strength", "MPa"), v("E", "Young's modulus", "MPa"), v("KL/r", "slenderness ratio", "—"), v("r", "radius of gyration, √(I/A)", "mm")],
      },
    ],
    context: [
      "Booster axial loads: engine thrust pushing up from the bottom, propellant weight, aerodynamic bending near max-Q, and the loads from being caught by the tower's chopstick arms.",
    ],
    deliverable: "Euler/Johnson plot, plus an Ansys column buckling check within a few percent of Euler.",
    selfChecks: [
      {
        q: "Why do you have to run a static analysis before a linear buckling analysis in Ansys?",
        a: "Linear (eigenvalue) buckling needs the stress state to build the stress-stiffness matrix. The static solution supplies that prestress, and the buckling solve then finds the load multiplier that makes the total stiffness singular. The result is a factor on the loads applied in the static case.",
      },
      {
        q: "Doubling a column's length changes $P_{cr}$ by what factor?",
        a: "$P_{cr} \\propto 1/L^2$, so doubling $L$ gives $1/2^2$ = **¼**.",
      },
      {
        q: "When does Johnson apply instead of Euler?",
        a: "For short and intermediate columns, where the slenderness ratio is below the transition value $$\\left(\\frac{KL}{r}\\right)_c = \\sqrt{\\frac{2\\pi^2 E}{\\sigma_y}}$$ There the Euler stress would exceed half the yield strength, and inelastic behavior lowers the real buckling stress.",
      },
    ],
  },
  {
    n: 6,
    title: "Buckling II, thin cylinders",
    start: "2026-11-23",
    days: 7,
    phase: "Core structures",
    light: true,
    hours: 7,
    lesson: "cylinder-buckling",
    note: "Thanksgiving week. About 1 hour a day.",
    structures: [
      "Classical buckling stress of a thin cylinder under axial compression.",
      "Real cylinders buckle far below this because of tiny shape imperfections. NASA SP-8007 (free online) gives a **knockdown factor γ**.",
      "Worked example: $R = 4500$ mm, $t = 4$ mm, $E = 193$ GPa gives $\\sigma_{cr} \\approx$ **103.8 MPa**, $\\phi \\approx 2.10$, $\\gamma \\approx$ **0.21**, $\\sigma_\\text{design} \\approx$ **21.8 MPa**. An unpressurized, unstiffened barrel loses almost 80% of its theoretical strength. That's why tanks are pressurized during loads and why stringers and frames exist.",
      "**Pressure stabilization:** internal pressure puts the wall in tension and raises the buckling load. The buckling FS goes on the applied load only; the relieving pressure is taken at its minimum, unfactored.",
      "**FEA vs. SP-8007:** linear buckling of a perfect cylinder lands near the classical value; a nonlinear run with a seeded imperfection (Week 11 stretch) collapses between SP-8007 and classical.",
    ],
    code: { tool: "Python", items: ["Add `cylinder_buckling(R, t, E)` to your toolkit, returning σ_cr, γ, and σ_design."] },
    formulas: [
      {
        label: "Classical cylinder buckling (axial compression)",
        tex: "\\sigma_{cr} = 0.605\\, \\frac{E\\, t}{R}",
        vars: [v("\\sigma_{cr}", "classical buckling stress", "MPa"), v("E", "Young's modulus", "MPa"), v("t", "wall thickness", "mm"), v("R", "radius", "mm")],
      },
      {
        label: "NASA SP-8007 knockdown",
        tex: "\\phi = \\frac{1}{16}\\sqrt{\\frac{R}{t}}, \\qquad \\gamma = 1 - 0.901\\left(1 - e^{-\\phi}\\right), \\qquad \\sigma_\\text{design} = \\gamma\\, \\sigma_{cr}",
        vars: [v("\\phi", "SP-8007 parameter", "—"), v("\\gamma", "knockdown factor", "—"), v("\\sigma_\\text{design}", "design buckling stress", "MPa"), v("R/t", "radius-to-thickness ratio", "—")],
      },
    ],
    context: ["Watch a launch and note the moments of highest axial load: liftoff, max-Q, and just before engine cutoff."],
    deliverable: "Buckling function plus a one-page note explaining knockdown factors in your own words.",
    selfChecks: [
      {
        q: "Why do imperfections hurt thin cylinders so much more than columns?",
        a: "A thin cylinder's post-buckling path is unstable: right after bifurcation the load it can carry drops sharply, so tiny initial dents (on the order of the wall thickness) trigger collapse far below the classical load. A column's post-buckling path is neutral or stable, so imperfections only add bending and the load approaches $P_{cr}$ gradually.",
      },
      {
        q: "How does internal pressure help with buckling?",
        a: "Pressure puts the wall in hoop and axial tension. The pressure end load $p \\pi R^2$ directly cancels part of the applied compression, and the hoop tension pushes out and stiffens the inward dimples that start buckling, so the effective knockdown is less severe (SP-8007 gives an added $\\Delta\\gamma$ from pressure).",
      },
    ],
  },
  {
    n: 7,
    title: "Welds, bolted joints, and mesh convergence",
    start: "2026-11-30",
    days: 7,
    phase: "Core structures",
    light: false,
    hours: 14,
    lesson: "welds-and-bolted-joints",
    structures: [
      "Weld types: butt and fillet. Weld joint efficiency, and why the heat-affected zone (HAZ) can be weaker than the parent metal.",
      "Weld defects: porosity, lack of fusion, undercut, cracks. Inspection (NDT): X-ray, dye penetrant, ultrasonic.",
      "**AWS D17.1** is the aerospace fusion welding spec. Your welding experience is a real advantage here; connect what you saw in the booth to these terms.",
      "Bolted joints: torque to preload ($K \\approx 0.2$ for dry steel). Also learn joint stiffness, separation, and shear vs. tension. Reference: NASA-STD-5020.",
    ],
    cad: {
      tool: "Ansys",
      items: ["Contacts and a simple bolted-joint model.", "**Mesh convergence study:** refine the mesh until peak stress changes by less than about 5%. Plot it. Do this on every model from now on."],
    },
    code: { tool: "Python", items: ["`bolt_preload.py`: torque ↔ preload, plus bolt and joint margins."] },
    formulas: [
      {
        label: "Torque to preload",
        tex: "T = K\\, F\\, d",
        vars: [v("T", "installation torque", "N·m"), v("K", "nut factor (≈ 0.2 dry steel)", "—"), v("F", "bolt preload", "N"), v("d", "nominal bolt diameter", "m")],
      },
    ],
    context: ["Booster sections are joined by long circumferential welds. Think about how weld quality and inspection would scale to a vehicle this size."],
    deliverable: "Mesh convergence plot plus the bolt calc tool.",
    selfChecks: [
      {
        q: "Why is weld strength often lower than parent metal strength?",
        a: "Welding heat changes the metal. In cold-worked austenitic stainless, the heat-affected zone and the fusion zone lose their work hardening and drop toward annealed strength. Welds can also carry defects (porosity, lack of fusion, undercut), residual stresses and geometric stress raisers like mismatch and reinforcement, which is why designs apply a weld joint efficiency.",
      },
      {
        q: "A ½-inch (12.7 mm) bolt torqued to 100 N·m with $K = 0.2$. What's the preload?",
        a: "$$F = \\frac{T}{K d} = \\frac{100}{0.2 \\times 0.0127} \\approx 39{,}400 \\text{ N}$$",
      },
      {
        q: "What does a mesh convergence study prove?",
        a: "That the result you care about (usually peak stress at a location) has stopped changing meaningfully as the mesh is refined, so discretization error is small. It does **not** prove the model is right: wrong loads, boundary conditions or material data converge just as nicely.",
      },
    ],
  },
  {
    n: 8,
    title: "Fatigue, fracture, and proof testing",
    start: "2026-12-07",
    days: 7,
    phase: "Core structures",
    light: false,
    hours: 14,
    lesson: "fatigue-fracture-proof",
    structures: [
      "S-N curves, endurance limit, the Goodman diagram for mean stress.",
      "Miner's rule for cumulative damage: failure predicted when **D ≥ 1**.",
      "Fracture mechanics intro: stress intensity and crack growth (Paris law).",
      "Leak-before-burst, and how a **proof test** at pressure above flight levels screens out flaws.",
    ],
    cad: {
      tool: "Ansys",
      items: ["Pressurized tank model with domes using shell elements.", "Compare barrel hoop stress to $pR/t$. Look at the stress jump at the dome-to-barrel joint."],
    },
    code: { tool: "MATLAB", items: ["Miner's-rule calculator for a made-up flight load spectrum (liftoff, max-Q, catch, repeated over many flights)."] },
    pythonScript: "Python: port the Miner's-rule calculation and add Goodman and critical-crack-size functions to your toolkit, with pytest tests from the Lesson 8 worked examples.",
    formulas: [
      {
        label: "Miner's rule",
        tex: "D = \\sum_i \\frac{n_i}{N_i}",
        vars: [v("D", "cumulative damage (failure predicted at D ≥ 1)", "—"), v("n_i", "cycles applied at stress level i", "cycles"), v("N_i", "cycles to failure at stress level i (from the S-N curve)", "cycles")],
      },
      {
        label: "Stress intensity factor",
        tex: "K = Y\\, \\sigma \\sqrt{\\pi a}",
        vars: [v("K", "stress intensity factor", "MPa·√m"), v("Y", "geometry factor", "—"), v("\\sigma", "far-field stress", "MPa"), v("a", "crack length (depth)", "m")],
      },
      {
        label: "Paris law (crack growth)",
        tex: "\\frac{da}{dN} = C\\, (\\Delta K)^m",
        vars: [v("da/dN", "crack growth per cycle", "m/cycle"), v("C, m", "material constants", "—"), v("\\Delta K", "stress intensity range per cycle", "MPa·√m")],
      },
    ],
    context: [
      "A reusable booster flies many times, so fatigue matters far more than on an expendable stage. Read about cryogenic proof testing of test tanks at Starbase.",
    ],
    deliverable: "Tank FEA vs. hand calc comparison, plus the Miner's-rule script.",
    selfChecks: [
      {
        q: "Why does reusability change how you think about structures?",
        a: "Every flight adds pressure, thermal, liftoff, max-Q and catch cycles to the same hardware, so fatigue damage and crack growth accumulate across flights. You have to design for a life (number of flights times a scatter factor), plan inspections, and use damage tolerance, instead of only checking one flight's peak loads.",
      },
      {
        q: "A part sees 1,000 cycles where $N = 10{,}000$ and 50 cycles where $N = 500$. Damage?",
        a: "$$D = \\frac{1000}{10{,}000} + \\frac{50}{500} = 0.1 + 0.1 = 0.2$$",
      },
      {
        q: "Why does a successful proof test give confidence about cracks?",
        a: "Surviving proof pressure proves no crack is as large as the critical size at proof stress. Flight stress is lower, so the critical crack size in flight is larger. Any crack that survived proof must grow from below the proof critical size to the flight critical size before failure, and crack-growth analysis turns that gap into a guaranteed number of cycles.",
      },
    ],
  },
  {
    n: 9,
    title: "Review",
    start: "2026-12-14",
    days: 7,
    phase: "Review",
    light: true,
    hours: 7,
    note: "Finals week. About 1 hour a day. If your exams land in a different week, change `FINALS_WEEK_START` in `src/data/plan.ts` and this week moves there.",
    structures: [],
    formulas: [],
    context: [],
    deliverable: "`booster_calcs.py`: one consolidated module with any test gaps filled, plus a sketched capstone model plan.",
    selfChecks: [],
    tasks: [
      "30 minutes a day of flashcards and self-check questions from Weeks 1–8.",
      "Consolidate your Python toolkit into one module, `booster_calcs.py`, and fill any test gaps using the worked examples in this plan (you've written tests since Week 1).",
      "Read the capstone spec and sketch your model plan.",
    ],
  },
  {
    n: 10,
    title: "Capstone, part 1",
    start: "2026-12-21",
    days: 7,
    phase: "Capstone",
    light: false,
    hours: 14,
    structures: [],
    formulas: [],
    context: [],
    deliverable: "Hand calcs, NX model and drawing, and the Ansys static results with a mesh convergence study.",
    selfChecks: [],
    tasks: [
      "**Hand calcs (Python):** hoop and axial stress, buckling with knockdown, and margins for every load case. Find the minimum wall thickness that gives MS ≥ 0 everywhere.",
      "**NX model:** barrel plus ring frames, built as a midsurface for shell meshing. Make a drawing.",
      "**Ansys static:** pressure cases, using shell elements and symmetry to stay under the student limit. Run a mesh convergence study.",
    ],
  },
  {
    n: 11,
    title: "Capstone, part 2",
    start: "2026-12-28",
    days: 7,
    phase: "Capstone",
    light: false,
    hours: 14,
    structures: [],
    formulas: [],
    context: [],
    deliverable: "A 4-page report and a 5-slide deck.",
    selfChecks: [],
    tasks: [
      "**Ansys buckling:** linear buckling for the handling case, then the flight case with pressure applied first (prestressed buckling), with 0, 3 and 6 ring frames. Compare to your hand calcs and explain the gap.",
      "**Trade study:** plot mass and minimum margin vs. wall thickness. Hand calc: mass vs. frame count, and why unstiffened buckling ignores frame spacing at this Batdorf Z. FEA: buckling load factors for 0, 3 and 6 frames. Stretch: stringers. Recommend a design.",
      "**Report:** 4 pages max (Summary, Assumptions, Hand Calcs, FEA, Comparison, Trade Study, Recommendation), plus a 5-slide deck.",
    ],
  },
  {
    n: 12,
    title: "Launch prep",
    start: "2027-01-04",
    days: 7,
    phase: "Launch prep",
    light: false,
    hours: 14,
    structures: [],
    formulas: [],
    context: [
      "Learn the main parts and what loads each one carries: methane and LOX tanks, common dome, downcomer, thrust section and engine mounts (33 Raptors), hot-staging ring, grid fins, chines, and the hardpoints used for the tower catch.",
      "Rewatch recent flight test footage and SpaceX's flight summaries. For each flight, note one thing that would interest a structures engineer.",
    ],
    deliverable: "One-page \"first week plan\" and your portfolio cleaned up and ready to show.",
    selfChecks: [],
    tasks: [
      "Booster anatomy deep dive (see the Anatomy page).",
      "Rewatch flight test footage and summaries; note one structures detail per flight.",
      "Write the one-page first week plan.",
      "Clean up the portfolio so it's ready to show.",
    ],
  },
];

/**
 * Places the light finals week (Week 9) on the calendar week named by FINALS_WEEK_START. Weeks 2–12 occupy
 * consecutive 7-day slots from Oct 26; Week 9 takes the chosen slot and the other weeks keep their order.
 * Returns the weeks in calendar order.
 */
export const FINALS_SLOTS = ["2026-11-30", "2026-12-07", "2026-12-14", "2026-12-21"];
export function placeFinalsWeek(list: Week[], finalsStart: string): Week[] {
  const fixed = list.filter((w) => w.n <= 1);
  const slotted = list.filter((w) => w.n >= 2).sort((a, b) => a.n - b.n);
  const slots = slotted.map((w) => w.start);
  const index = FINALS_SLOTS.includes(finalsStart) ? slots.indexOf(finalsStart) : -1;
  if (index < 0) return [...fixed, ...slotted];
  const order = slotted.filter((w) => w.n !== 9);
  order.splice(index, 0, slotted.find((w) => w.n === 9)!);
  return [...fixed, ...order.map((w, i) => ({ ...w, start: slots[i] }))];
}

export const weeks: Week[] = placeFinalsWeek(baseWeeks, FINALS_WEEK_START);

export const weekByNumber = (n: number) => weeks.find((week) => week.n === n);

export const phaseColor: Record<Phase, string> = {
  Setup: "var(--phase-setup)",
  Foundations: "var(--phase-foundations)",
  "Core structures": "var(--phase-core)",
  Review: "var(--phase-review)",
  Capstone: "var(--phase-capstone)",
  "Launch prep": "var(--phase-launch)",
};

/* ---------- Capstone spec ---------- */

export const capstoneSpec = {
  title: "Sizing a booster-style LOX tank barrel section",
  intro:
    "You'll analyze a simplified stainless steel barrel section the way a structures engineer would: hand calcs first, then CAD, then FEA, then a comparison, then a short report.",
  warning: "All loads and allowables below are made-up practice values, not SpaceX data. Write every assumption down.",
  geometry: ["Diameter 9 m (R = 4.5 m), barrel length 6 m", "Wall thickness t is a design variable; start at 4 mm", "3 internal ring frames, evenly spaced (stretch goal: add stringers)"],
  materials: ["304L-like stainless steel: E = 193 GPa, ν = 0.29, density 8000 kg/m³", "Practice allowables: yield 500 MPa, ultimate 700 MPa"],
  loadCases: [
    "**Proof pressure:** proof factor 1.25 × MEOP. MEOP (maximum expected operating pressure) at the bottom of the section is the flight wall pressure, $0.35 + 0.672 \\approx 1.022$ MPa, so proof is $\\approx 1.277$ MPa. Check **no yield at proof** (FS 1.0 on yield), using von Mises of the hoop stress and $pR/(2t)$.",
    "**Flight, pressurized:** 0.35 MPa ullage pressure + LOX hydrostatic head at 3 g (assume 20 m of LOX above the bottom of the section) + axial compression of 30 MN (limit load)",
    "**Unpressurized handling:** axial compression of 2 MN only (limit load, no pressure help)",
  ],
  proofNote:
    "A proof test pressurizes the real tank above anything it will see in service, so surviving it screens out flaws. The proof pressure already contains the proof factor, so it is checked for no yield (FS 1.0), not with the flight factors of safety on top.",
  limitNote:
    "**Limit load** is the maximum load expected in service. **Ultimate load** is limit load × FS. The 30 MN and 2 MN axial loads are limit loads.",
  factors: "1.25 on yield, 1.4 on ultimate, 1.4 on buckling (applied to the destabilizing load only; relieving pressure at its minimum guaranteed value, unfactored), 1.0 on yield at proof (practice values)",
  steps: [
    {
      title: "Hand calcs (Python)",
      body: "Hoop and axial stress, buckling with knockdown, and margins for every load case. Find the minimum wall thickness that gives MS ≥ 0 everywhere.",
      checklist: [
        "Hoop and axial stress for each load case",
        "Hydrostatic head at 3 g at the bottom of the section; MEOP and proof pressure",
        "Buckling with SP-8007 knockdown (FS on the load only, minimum pressure unfactored)",
        "Margins table for every load case",
        "Minimum wall thickness with MS ≥ 0 everywhere",
        "Enter your answers in the answer check on the Capstone page",
      ],
    },
    {
      title: "NX model",
      body: "Barrel plus ring frames, built as a midsurface for shell meshing. Make a drawing.",
      checklist: ["Barrel midsurface at R = 4.5 m, 6 m long", "3 ring frames evenly spaced", "Drawing with views, sections and dimensions"],
    },
    {
      title: "Ansys static",
      body: "Pressure cases, using shell elements and symmetry to stay under the student limit. Run a mesh convergence study.",
      checklist: ["Shell elements with thickness t", "Symmetry to stay under the node limit", "Proof (1.25 × MEOP ≈ 1.277 MPa) and flight pressure cases", "Mesh convergence study (peak changes less than about 5%)"],
    },
    {
      title: "Ansys buckling",
      body: "Linear buckling for the handling case, then the flight case with pressure applied first (prestressed buckling). Compare eigenvalue mode shapes and load factors for 0, 3 and 6 ring frames. Compare to your hand calcs and explain the gap.",
      checklist: [
        "Linear buckling, handling case",
        "Prestressed buckling, flight case with pressure first",
        "Mode shapes and load factors for 0, 3 and 6 ring frames",
        "Compare with hand calcs and explain the gap",
        "Stretch: nonlinear buckling with a seeded imperfection (w0 = 0.5t and 1.0t)",
      ],
    },
    {
      title: "Trade study",
      body:
        "Plot mass and minimum margin vs. wall thickness. Hand calc: mass vs. frame count, and a statement that unstiffened axial buckling is insensitive to frame spacing at this Batdorf Z. FEA: the 0, 3 and 6 frame buckling runs. Stretch: add stringers, check skin panels between stringers with the Lesson 5 plate formula and stringers as columns between frames (Euler/Johnson with effective width); that's where frame count changes the margin. Recommend a design.",
      checklist: [
        "Mass and minimum margin vs. thickness",
        "Mass vs. frame count, and why unstiffened buckling ignores frame spacing here",
        "FEA buckling load factors for 0, 3 and 6 frames",
        "Stretch: stringers, skin panels and stringer columns vs. frame count",
        "Recommended design",
      ],
    },
    {
      title: "Report",
      body: "4 pages max (Summary, Assumptions, Hand Calcs, FEA, Comparison, Trade Study, Recommendation), plus a 5-slide deck.",
      checklist: ["4-page report", "5-slide deck"],
    },
  ],
  goodLooksLike: [
    "Hand calcs and FEA agree within about 10% where they should, and you can explain where they don't.",
    "Every number has a unit and a source.",
    "A reviewer can follow your assumptions without asking you.",
  ],
};

/* ---------- Launch prep ---------- */

export const launchPrep = {
  habits: [
    "Keep your engineering notebook from day one.",
    "Ask good questions: say what you tried, what you expected, and what happened.",
    "Learn the shop floor and safety rules quickly; booster structures sits close to production.",
    "Write things down so the next person doesn't have to ask.",
  ],
  questions: [
    "What does a typical task for an intern on this team look like?",
    "Which tools and internal systems should I learn first?",
    "Who should I shadow on the production floor?",
    "What does \"done\" look like for my first project?",
    "How do you like to receive updates?",
  ],
  logistics: [
    "Housing near Starbase or Brownsville confirmed",
    "Car, insurance, steel-toe boots, and any PPE they ask for",
    "Offer paperwork, ID, and any export-control (ITAR) documents complete",
  ],
};
