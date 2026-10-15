/*
 * Practice problem generators. Each one draws realistic, seeded inputs, computes the answer with the
 * tested functions in calc/structures.ts, and writes a step-by-step solution like the lessons:
 * formula, substituted numbers, result. All math runs in SI-mm (MPa, mm, N); the page converts the
 * givens and answers for the US toggle and adds the conversion steps to the solution.
 */
import {
  boltJoint,
  columnBuckling,
  criticalCrackSize,
  cylinderBuckling,
  effectiveWidth,
  endConditionK,
  equivalentAxialLoad,
  filletWeld,
  G,
  goodman,
  hydrostaticHead,
  marginOfSafety,
  minersDamage,
  netAxialCompressionFactored,
  plateBuckling,
  preloadFromTorque,
  principalStresses,
  requiredThickness,
  runningLoad,
  sectionProperties,
  thermalStress,
  thermalStressBiaxial,
  thermalStressSpring,
  thinWall,
  bucklingMargin,
  vonMises,
  type EndCondition,
} from "../calc/structures";
import { fmt, fromSI, tex as texNum, unitOf, type Quantity, type System } from "../calc/units";

export type TopicId = "margin" | "mohr" | "running" | "pressure" | "head" | "thermal" | "section" | "column" | "plate" | "cylinder" | "bolt" | "weld" | "goodman" | "miner" | "crack";

export interface Given {
  sym: string; // TeX
  label: string;
  si: number;
  q: Quantity;
}

export interface Answer {
  key: string;
  label: string;
  sym: string; // TeX
  q: Quantity;
  si: number;
  kind: "value" | "margin" | "choice";
  choices?: string[];
  choice?: string;
}

/** One solution line: prose (Rich text) or display math. */
export interface Step {
  text?: string;
  tex?: string;
}

export interface Problem {
  topic: TopicId;
  seed: number;
  prompt: string; // Rich text
  givens: Given[];
  answers: Answer[];
  steps: Step[]; // SI working
}

export interface Topic {
  id: TopicId;
  title: string;
  week: number;
  /** Flashcard made from this problem type when you get one wrong. */
  card: { tex: string; method: string };
}

export const topics: Topic[] = [
  { id: "margin", title: "Margin of safety", week: 1, card: { tex: "MS = \\frac{\\sigma_\\text{allow}}{FS \\cdot \\sigma_\\text{limit}} - 1", method: "Multiply the limit stress by FS, divide the allowable by it, subtract 1. MS ≥ 0 passes." } },
  { id: "mohr", title: "Von Mises and Mohr's circle", week: 1, card: { tex: "\\sigma_{1,2} = \\tfrac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\tfrac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}, \\quad \\sigma_{vm} = \\sqrt{\\sigma_x^2 - \\sigma_x\\sigma_y + \\sigma_y^2 + 3\\tau_{xy}^2}", method: "Center C and radius R of Mohr's circle give σ₁ = C + R and σ₂ = C − R. Von Mises works in any axes." } },
  { id: "running", title: "Running load and P_eq", week: 1, card: { tex: "N_x = \\frac{P}{2\\pi R} + \\frac{M}{\\pi R^2}, \\qquad P_\\text{eq} = P + \\frac{2M}{R}", method: "Convert to N and N·mm first. The peak running load is on the side where bending adds to compression." } },
  { id: "pressure", title: "Hoop stress and required thickness", week: 2, card: { tex: "\\sigma_h = \\frac{pR}{t}, \\quad \\sigma_a = \\frac{pR}{2t}, \\quad t_\\text{req} = \\frac{FS \\cdot p R}{\\sigma_\\text{allow}}", method: "Hoop stress governs a cylinder. Size t from hoop stress with the factor of safety on the pressure stress." } },
  { id: "head", title: "Hydrostatic head", week: 2, card: { tex: "p_\\text{head} = \\rho\\, n\\, g\\, h, \\qquad p = p_\\text{ullage} + p_\\text{head}", method: "Use ρ in kg/m³, h in m, g = 9.81 m/s²: the result is in Pa. Divide by 10⁶ for MPa." } },
  { id: "thermal", title: "Thermal stress", week: 3, card: { tex: "\\sigma = E\\alpha\\Delta T, \\quad \\frac{E\\alpha\\Delta T}{1-\\nu}, \\quad \\frac{E\\alpha\\Delta T}{1 + EA/(kL)}", method: "Fully restrained bar, plate restrained both ways, or bar against a spring: the spring lets some strain out." } },
  { id: "section", title: "Section properties of a T or angle", week: 4, card: { tex: "\\bar y = \\frac{\\sum A_i y_i}{\\sum A_i}, \\qquad I = \\sum \\left(\\frac{b_i h_i^3}{12} + A_i d_i^2\\right)", method: "Split into rectangles, find the centroid, then add each rectangle's own I plus A d²." } },
  { id: "column", title: "Euler vs. Johnson column", week: 5, card: { tex: "\\left(\\tfrac{KL}{r}\\right)_c = \\sqrt{\\tfrac{2\\pi^2E}{\\sigma_y}}, \\quad \\sigma_\\text{E} = \\frac{\\pi^2E}{(KL/r)^2}, \\quad \\sigma_\\text{J} = \\sigma_y - \\frac{\\sigma_y^2}{4\\pi^2E}\\left(\\tfrac{KL}{r}\\right)^2", method: "Compare KL/r with the transition value: above it use Euler, below it use Johnson." } },
  { id: "plate", title: "Plate buckling and effective width", week: 5, card: { tex: "\\sigma_{cr} = k\\frac{\\pi^2E}{12(1-\\nu^2)}\\left(\\frac{t}{b}\\right)^2, \\qquad b_e = b\\sqrt{\\frac{\\sigma_{cr}}{\\sigma_\\text{max}}}", method: "Long simply supported plate: k = 4. Past buckling, only the effective width near the stiffeners carries load." } },
  { id: "cylinder", title: "SP-8007 knockdown with pressure relief", week: 6, card: { tex: "\\gamma = 1 - 0.901\\left(1 - e^{-\\phi}\\right), \\ \\phi = \\frac{1}{16}\\sqrt{\\frac{R}{t}}, \\qquad P_\\text{net} = FS\\cdot P - p_\\text{min}\\pi R^2", method: "Factor only the destabilizing load. The pressure relief uses the minimum pressure and is never factored." } },
  { id: "bolt", title: "Bolt preload and separation", week: 7, card: { tex: "F_i = \\frac{T}{K d}, \\quad C = \\frac{k_b}{k_b + k_m}, \\quad P_\\text{sep} = \\frac{F_i}{1 - C}", method: "Torque gives preload; the joint stiffness split sets how much external load the bolt sees and when the joint separates." } },
  { id: "weld", title: "Fillet weld throat", week: 7, card: { tex: "t_\\text{throat} = 0.707\\,a, \\qquad \\tau = \\frac{F}{t_\\text{throat} L_w}", method: "An equal-leg 45° fillet fails through its throat. Add up all the weld length that shares the load." } },
  { id: "goodman", title: "Goodman fatigue margin", week: 8, card: { tex: "\\sigma_a = \\tfrac{\\sigma_\\text{max} - \\sigma_\\text{min}}{2}, \\ \\sigma_m = \\tfrac{\\sigma_\\text{max} + \\sigma_\\text{min}}{2}, \\quad MS_f = \\frac{1}{\\sigma_a/S_e + \\sigma_m/S_u} - 1", method: "Split the cycle into alternating and mean stress, then use the Goodman line." } },
  { id: "miner", title: "Miner's rule", week: 8, card: { tex: "D = \\sum_i \\frac{n_i}{N_i}", method: "Add the fraction of life used at each stress level. Failure is predicted at D ≥ 1." } },
  { id: "crack", title: "Critical crack size", week: 8, card: { tex: "a_c = \\frac{1}{\\pi}\\left(\\frac{K_{Ic}}{Y\\sigma}\\right)^2", method: "Keep MPa·√m with MPa: the result is in metres. Multiply by 1000 for mm." } },
];

export const topicById = new Map(topics.map((t) => [t.id, t]));

/** Seeded random numbers (mulberry32), so `?seed=` replays a problem exactly. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;
const between = (r: Rand, lo: number, hi: number, step: number) => Number((lo + Math.floor(r() * (Math.round((hi - lo) / step) + 1)) * step).toFixed(10));
const pick = <T,>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)];

/** A number for TeX: 4 significant figures, negatives in parentheses when substituted. */
const n = (v: number, sig = 4) => (v < 0 ? `(${texNum(v, sig)})` : texNum(v, sig));
const v4 = (v: number, sig = 4) => texNum(v, sig);
const ms3 = (v: number) => (v >= 0 ? "+" : "-") + Math.abs(v).toFixed(3);

/** Unit text as TeX. */
export function unitTex(unit: string) {
  if (!unit) return "";
  const t = unit
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/·√(\w+)/, "\\sqrt{$1}")
    .replace(/°/g, "^\\circ ")
    .replace(/·/g, "\\cdot ");
  return `\\,\\mathrm{${t}}`;
}
const u = (q: Quantity) => unitTex(unitOf(q, "SI"));

/** An answer shown in the chosen system, as plain text. The solution uses the same string. */
export function answerText(answer: Answer, system: System) {
  if (answer.kind === "choice") return answer.choice ?? "";
  if (answer.kind === "margin") return ms3(answer.si);
  const unit = unitOf(answer.q, system);
  return `${fmt(fromSI(answer.si, answer.q, system))}${unit ? ` ${unit}` : ""}`;
}

/** The value a student's typed answer is compared with, in the chosen system. */
export const expected = (answer: Answer, system: System) => (answer.kind === "value" ? fromSI(answer.si, answer.q, system) : answer.si);

type Gen = (r: Rand) => Omit<Problem, "topic" | "seed">;

const generators: Record<TopicId, Gen> = {
  margin(r) {
    const allow = pick(r, [170, 215, 240, 290, 345, 485]);
    const s = between(r, 40, 260, 5);
    const fs = pick(r, [1.1, 1.25, 1.4, 1.5]);
    const ms = marginOfSafety(allow, s, fs);
    return {
      prompt: "A stainless bracket carries an applied (limit) stress $\\sigma$. Find its margin of safety against the allowable with the given factor of safety.",
      givens: [
        { sym: "\\sigma_\\text{allow}", label: "allowable stress", si: allow, q: "stress" },
        { sym: "\\sigma", label: "applied (limit) stress", si: s, q: "stress" },
        { sym: "FS", label: "factor of safety", si: fs, q: "none" },
      ],
      answers: [{ key: "ms", label: "Margin of safety", sym: "MS", q: "none", si: ms, kind: "margin" }],
      steps: [
        { tex: "MS = \\frac{\\sigma_\\text{allow}}{FS \\cdot \\sigma} - 1" },
        { tex: `MS = \\frac{${v4(allow)}}{${v4(fs)} \\times ${v4(s)}} - 1 = \\frac{${v4(allow)}}{${v4(fs * s)}} - 1 = ${ms3(ms)}` },
        { text: ms >= 0 ? "MS ≥ 0, so it passes." : "MS < 0, so it fails: the part needs more material or a lower load." },
      ],
    };
  },

  mohr(r) {
    const sx = between(r, -100, 250, 5);
    const sy = between(r, -100, 200, 5);
    const txy = between(r, 0, 120, 5);
    const p = principalStresses(sx, sy, txy);
    const vm = vonMises(sx, sy, txy);
    return {
      prompt: "A point in a weld seam has the plane stress state below. Find the largest principal stress $\\sigma_1$ and the von Mises stress.",
      givens: [
        { sym: "\\sigma_x", label: "normal stress, x face", si: sx, q: "stress" },
        { sym: "\\sigma_y", label: "normal stress, y face", si: sy, q: "stress" },
        { sym: "\\tau_{xy}", label: "shear stress", si: txy, q: "stress" },
      ],
      answers: [
        { key: "s1", label: "Largest principal stress", sym: "\\sigma_1", q: "stress", si: p.s1, kind: "value" },
        { key: "vm", label: "Von Mises stress", sym: "\\sigma_{vm}", q: "stress", si: vm, kind: "value" },
      ],
      steps: [
        { tex: `C = \\frac{\\sigma_x + \\sigma_y}{2} = \\frac{${n(sx)} + ${n(sy)}}{2} = ${v4(p.center)}${u("stress")}` },
        { tex: `R = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2} = \\sqrt{${n((sx - sy) / 2)}^2 + ${n(txy)}^2} = ${v4(p.radius)}${u("stress")}` },
        { tex: `\\sigma_1 = C + R = ${v4(p.center)} + ${v4(p.radius)} = ${v4(p.s1)}${u("stress")}, \\qquad \\sigma_2 = C - R = ${v4(p.s2)}${u("stress")}` },
        { tex: "\\sigma_{vm} = \\sqrt{\\sigma_x^2 - \\sigma_x\\sigma_y + \\sigma_y^2 + 3\\tau_{xy}^2}" },
        { tex: `\\sigma_{vm} = \\sqrt{${n(sx)}^2 - ${n(sx)}\\times${n(sy)} + ${n(sy)}^2 + 3\\times${n(txy)}^2} = ${v4(vm)}${u("stress")}` },
      ],
    };
  },

  running(r) {
    const P = between(r, 10, 60, 1);
    const M = between(r, 5, 60, 1);
    const R = pick(r, [4500, 4500, 4000, 3500]);
    const rl = runningLoad(P * 1e6, M * 1e9, R);
    const peq = equivalentAxialLoad(P * 1e6, M * 1e9, R) / 1e6;
    return {
      prompt: "A barrel section carries axial compression $P$ and bending moment $M$ (practice values). Find the peak axial running load and the equivalent axial load.",
      givens: [
        { sym: "P", label: "axial compression", si: P, q: "bigForce" },
        { sym: "M", label: "bending moment", si: M, q: "moment" },
        { sym: "R", label: "mean radius", si: R, q: "length" },
      ],
      answers: [
        { key: "nx", label: "Peak running load", sym: "N_{x,\\text{peak}}", q: "runningLoad", si: rl.peak, kind: "value" },
        { key: "peq", label: "Equivalent axial load", sym: "P_\\text{eq}", q: "bigForce", si: peq, kind: "value" },
      ],
      steps: [
        { text: `Convert first: $P = ${v4(P)}\\,\\mathrm{MN} = ${v4(P * 1e6)}\\,\\mathrm{N}$ and $M = ${v4(M)}\\,\\mathrm{MN\\cdot m} = ${v4(M * 1e9)}\\,\\mathrm{N\\cdot mm}$.` },
        { tex: `N_{x,\\text{peak}} = \\frac{P}{2\\pi R} + \\frac{M}{\\pi R^2} = \\frac{${v4(P * 1e6)}}{2\\pi \\times ${v4(R)}} + \\frac{${v4(M * 1e9)}}{\\pi \\times ${v4(R)}^2} = ${v4(rl.axial)} + ${v4(rl.bending)} = ${v4(rl.peak)}${u("runningLoad")}` },
        { tex: `P_\\text{eq} = P + \\frac{2M}{R} = ${v4(P * 1e6)} + \\frac{2 \\times ${v4(M * 1e9)}}{${v4(R)}} = ${v4(peq * 1e6)}\\,\\mathrm{N} = ${v4(peq)}${u("bigForce")}` },
      ],
    };
  },

  pressure(r) {
    const p = between(r, 0.2, 0.6, 0.01);
    const R = pick(r, [4500, 3000, 1500]);
    const t = between(r, 3, 12, 0.5);
    const fs = pick(r, [1.25, 1.4, 1.5]);
    const allow = pick(r, [170, 215, 240, 290]);
    const w = thinWall(p, R, t);
    const treq = requiredThickness(p, R, fs, allow);
    return {
      prompt: "A thin-wall cylindrical tank is pressurized. Find the hoop stress at the given wall, and the thickness hoop stress requires with the factor of safety.",
      givens: [
        { sym: "p", label: "internal pressure", si: p, q: "pressure" },
        { sym: "R", label: "mean radius", si: R, q: "length" },
        { sym: "t", label: "wall thickness", si: t, q: "length" },
        { sym: "FS", label: "factor of safety", si: fs, q: "none" },
        { sym: "\\sigma_\\text{allow}", label: "allowable stress", si: allow, q: "stress" },
      ],
      answers: [
        { key: "hoop", label: "Hoop stress", sym: "\\sigma_h", q: "stress", si: w.hoop, kind: "value" },
        { key: "treq", label: "Required thickness", sym: "t_\\text{req}", q: "length", si: treq, kind: "value" },
      ],
      steps: [
        { tex: `\\sigma_h = \\frac{pR}{t} = \\frac{${v4(p)} \\times ${v4(R)}}{${v4(t)}} = ${v4(w.hoop)}${u("stress")} \\qquad (\\sigma_a = \\tfrac{pR}{2t} = ${v4(w.axial)}${u("stress")})` },
        { tex: `t_\\text{req} = \\frac{FS \\cdot p R}{\\sigma_\\text{allow}} = \\frac{${v4(fs)} \\times ${v4(p)} \\times ${v4(R)}}{${v4(allow)}} = ${v4(treq)}${u("length")}` },
      ],
    };
  },

  head(r) {
    const liquid = pick(r, [
      { name: "liquid oxygen", rho: 1141 },
      { name: "liquid methane", rho: 422 },
    ] as const);
    const nf = between(r, 1, 4, 0.1);
    const h = between(r, 5, 30, 1);
    const pu = between(r, 0.15, 0.4, 0.01);
    const head = hydrostaticHead(liquid.rho, nf, h * 1000);
    return {
      prompt: `A tank of ${liquid.name} (density is a typical public value) accelerates at load factor $n$. Find the hydrostatic head at depth $h$ and the total wall pressure there.`,
      givens: [
        { sym: "\\rho", label: `density of ${liquid.name}`, si: liquid.rho, q: "density" },
        { sym: "n", label: "load factor", si: nf, q: "none" },
        { sym: "h", label: "liquid depth", si: h * 1000, q: "height" },
        { sym: "p_\\text{ullage}", label: "ullage pressure", si: pu, q: "pressure" },
      ],
      answers: [
        { key: "head", label: "Hydrostatic head", sym: "p_\\text{head}", q: "pressure", si: head, kind: "value" },
        { key: "total", label: "Total wall pressure", sym: "p", q: "pressure", si: pu + head, kind: "value" },
      ],
      steps: [
        { tex: `p_\\text{head} = \\rho\\, n\\, g\\, h = ${v4(liquid.rho)} \\times ${v4(nf)} \\times ${G} \\times ${v4(h)}\\,\\mathrm{m} = ${v4(head * 1e6)}\\,\\mathrm{Pa} = ${v4(head)}${u("pressure")}` },
        { tex: `p = p_\\text{ullage} + p_\\text{head} = ${v4(pu)} + ${v4(head)} = ${v4(pu + head)}${u("pressure")}` },
      ],
    };
  },

  thermal(r) {
    const variant = pick(r, ["uniaxial", "biaxial", "spring"] as const);
    const E = 193000;
    const alpha = pick(r, [1.6e-5, 1.73e-5]);
    const dT = between(r, 50, 200, 10);
    const nu = 0.29;
    const A = between(r, 50, 500, 10);
    const k = between(r, 10000, 100000, 5000);
    const L = between(r, 200, 2000, 100);
    const sigma = variant === "uniaxial" ? thermalStress(E, alpha, dT) : variant === "biaxial" ? thermalStressBiaxial(E, alpha, dT, nu) : thermalStressSpring(E, alpha, dT, A, k, L);
    const base = E * alpha * dT;
    const givens: Given[] = [
      { sym: "E", label: "Young's modulus (304L)", si: E, q: "modulus" },
      { sym: "\\alpha", label: "thermal expansion coefficient", si: alpha, q: "alpha" },
      { sym: "\\Delta T", label: "temperature drop", si: dT, q: "deltaT" },
    ];
    if (variant === "biaxial") givens.push({ sym: "\\nu", label: "Poisson's ratio", si: nu, q: "none" });
    if (variant === "spring")
      givens.push({ sym: "A", label: "bar area", si: A, q: "area" }, { sym: "k", label: "support stiffness", si: k, q: "stiffness" }, { sym: "L", label: "bar length", si: L, q: "length" });
    const steps: Step[] = [{ tex: `E\\alpha\\Delta T = ${v4(E)} \\times ${v4(alpha)} \\times ${v4(dT)} = ${v4(base)}${u("stress")}` }];
    if (variant === "uniaxial") steps.push({ tex: `|\\sigma_T| = E\\alpha\\Delta T = ${v4(sigma)}${u("stress")}` });
    if (variant === "biaxial") steps.push({ tex: `|\\sigma_T| = \\frac{E\\alpha\\Delta T}{1 - \\nu} = \\frac{${v4(base)}}{1 - ${v4(nu)}} = ${v4(sigma)}${u("stress")}` });
    if (variant === "spring")
      steps.push(
        { tex: `\\frac{EA}{kL} = \\frac{${v4(E)} \\times ${v4(A)}}{${v4(k)} \\times ${v4(L)}} = ${v4((E * A) / (k * L))}` },
        { tex: `|\\sigma_T| = \\frac{E\\alpha\\Delta T}{1 + EA/(kL)} = \\frac{${v4(base)}}{1 + ${v4((E * A) / (k * L))}} = ${v4(sigma)}${u("stress")}` },
      );
    return {
      prompt:
        variant === "uniaxial"
          ? "A stainless bar is fully restrained at both ends and chilled by cryogenic propellant. Find the magnitude of the thermal stress."
          : variant === "biaxial"
            ? "A stainless plate is restrained in both directions and chilled uniformly. Find the magnitude of the thermal stress."
            : "A stainless bar is held between a rigid wall and a support of stiffness $k$, then chilled. Find the magnitude of the thermal stress.",
      givens,
      answers: [{ key: "sigma", label: "Thermal stress magnitude", sym: "|\\sigma_T|", q: "stress", si: sigma, kind: "value" }],
      steps,
    };
  },

  section(r) {
    const kind = pick(r, ["T", "angle"] as const);
    let rects: { b: number; h: number; y: number; name: string }[];
    let givens: Given[];
    if (kind === "T") {
      const bf = between(r, 30, 80, 5);
      const tf = between(r, 3, 8, 1);
      const hw = between(r, 30, 80, 5);
      const tw = between(r, 3, 8, 1);
      rects = [
        { name: "web", b: tw, h: hw, y: hw / 2 },
        { name: "flange", b: bf, h: tf, y: hw + tf / 2 },
      ];
      givens = [
        { sym: "b_f", label: "flange width (top)", si: bf, q: "length" },
        { sym: "t_f", label: "flange thickness", si: tf, q: "length" },
        { sym: "h_w", label: "web height (below the flange)", si: hw, q: "length" },
        { sym: "t_w", label: "web thickness", si: tw, q: "length" },
      ];
    } else {
      const B = between(r, 30, 80, 5);
      const H = between(r, 30, 80, 5);
      const t = between(r, 3, 8, 1);
      rects = [
        { name: "vertical leg", b: t, h: H, y: H / 2 },
        { name: "horizontal leg", b: B - t, h: t, y: t / 2 },
      ];
      givens = [
        { sym: "H", label: "vertical leg height (overall)", si: H, q: "length" },
        { sym: "B", label: "horizontal leg width (overall, at the bottom)", si: B, q: "length" },
        { sym: "t", label: "thickness of both legs", si: t, q: "length" },
      ];
    }
    const s = sectionProperties(rects);
    return {
      prompt: `A stringer has the ${kind === "T" ? "T" : "angle (L)"} cross-section below. Measuring from the bottom edge, find the centroid height and the second moment of area about the horizontal centroidal axis.`,
      givens,
      answers: [
        { key: "ybar", label: "Centroid height from the bottom", sym: "\\bar y", q: "length", si: s.ybar, kind: "value" },
        { key: "I", label: "Second moment of area", sym: "I", q: "inertia", si: s.I, kind: "value" },
      ],
      steps: [
        { text: `Split it into rectangles: ${rects.map((x) => `${x.name} $${v4(x.b)} \\times ${v4(x.h)}$, $A = ${v4(x.b * x.h)}$, $y = ${v4(x.y)}$`).join("; ")} (mm).` },
        { tex: `\\bar y = \\frac{\\sum A_i y_i}{\\sum A_i} = \\frac{${rects.map((x) => `${v4(x.b * x.h)} \\times ${v4(x.y)}`).join(" + ")}}{${v4(s.A)}} = ${v4(s.ybar)}${u("length")}` },
        { tex: `I = \\sum\\left(\\frac{b_i h_i^3}{12} + A_i d_i^2\\right) = ${rects.map((x) => `\\left(\\frac{${v4(x.b)} \\times ${v4(x.h)}^3}{12} + ${v4(x.b * x.h)} \\times ${n(x.y - s.ybar)}^2\\right)`).join(" + ")}` },
        { tex: `I = ${rects.map((x) => v4((x.b * x.h ** 3) / 12 + x.b * x.h * (x.y - s.ybar) ** 2)).join(" + ")} = ${v4(s.I)}${u("inertia")}` },
      ],
    };
  },

  column(r) {
    const E = 193000;
    const sy = pick(r, [215, 250, 300]);
    const d = between(r, 10, 40, 2);
    const L = between(r, 200, 2000, 50);
    const end = pick(r, ["pinned-pinned", "fixed-fixed", "fixed-pinned", "fixed-free"] as EndCondition[]);
    const K = endConditionK[end];
    const A = (Math.PI * d * d) / 4;
    const I = (Math.PI * d ** 4) / 64;
    const c = columnBuckling(E, sy, A, I, K, L);
    return {
      prompt: `A solid round stainless strut is ${end.replace("-", " at one end, ")} at the other ($K = ${K}$). Decide whether Euler or Johnson applies and find the critical load.`,
      givens: [
        { sym: "d", label: "diameter", si: d, q: "length" },
        { sym: "L", label: "length", si: L, q: "length" },
        { sym: "E", label: "Young's modulus", si: E, q: "modulus" },
        { sym: "\\sigma_y", label: "yield strength", si: sy, q: "stress" },
      ],
      answers: [
        { key: "regime", label: "Which curve applies", sym: "\\text{regime}", q: "none", si: 0, kind: "choice", choices: ["Euler", "Johnson"], choice: c.regime },
        { key: "pcr", label: "Critical load", sym: "P_{cr}", q: "kiloForce", si: c.load / 1000, kind: "value" },
      ],
      steps: [
        { tex: `A = \\frac{\\pi d^2}{4} = ${v4(A)}${u("area")}, \\quad I = \\frac{\\pi d^4}{64} = ${v4(I)}${u("inertia")}, \\quad r = \\sqrt{I/A} = \\frac{d}{4} = ${v4(c.r)}${u("length")}` },
        { tex: `\\frac{KL}{r} = \\frac{${v4(K)} \\times ${v4(L)}}{${v4(c.r)}} = ${v4(c.slenderness)}, \\qquad \\left(\\frac{KL}{r}\\right)_c = \\sqrt{\\frac{2\\pi^2 \\times ${v4(E)}}{${v4(sy)}}} = ${v4(c.transition)}` },
        { text: c.regime === "Euler" ? "$KL/r$ is above the transition, so the column is long: use **Euler**." : "$KL/r$ is below the transition, so yielding and buckling interact: use **Johnson**." },
        c.regime === "Euler"
          ? { tex: `\\sigma_{cr} = \\frac{\\pi^2 E}{(KL/r)^2} = \\frac{\\pi^2 \\times ${v4(E)}}{${v4(c.slenderness)}^2} = ${v4(c.stress)}${u("stress")}` }
          : { tex: `\\sigma_{cr} = \\sigma_y - \\frac{\\sigma_y^2}{4\\pi^2E}\\left(\\frac{KL}{r}\\right)^2 = ${v4(sy)} - \\frac{${v4(sy)}^2}{4\\pi^2 \\times ${v4(E)}} \\times ${v4(c.slenderness)}^2 = ${v4(c.stress)}${u("stress")}` },
        { tex: `P_{cr} = \\sigma_{cr} A = ${v4(c.stress)} \\times ${v4(A)} = ${v4(c.load)}\\,\\mathrm{N} = ${v4(c.load / 1000)}${u("kiloForce")}` },
      ],
    };
  },

  plate(r) {
    const mat = pick(r, [
      { name: "stainless", E: 193000, nu: 0.29 },
      { name: "aluminum", E: 72000, nu: 0.33 },
    ] as const);
    let t = 1;
    let b = 100;
    let scr = Infinity;
    for (let i = 0; i < 50 && scr > 150; i++) {
      t = between(r, 1, 4, 0.5);
      b = between(r, 80, 300, 10);
      scr = plateBuckling(4, mat.E, mat.nu, t, b);
    }
    const smax = Math.round(scr * (1.5 + 2.5 * r()));
    const e = effectiveWidth(b, t, scr, smax);
    return {
      prompt: `A long ${mat.name} skin panel between two stringers is simply supported on all edges ($k = 4$). The stringers reach the edge stress $\\sigma_\\text{max}$. Find the panel's buckling stress and its effective width.`,
      givens: [
        { sym: "b", label: "panel width (stringer spacing)", si: b, q: "length" },
        { sym: "t", label: "skin thickness", si: t, q: "length" },
        { sym: "E", label: "Young's modulus", si: mat.E, q: "modulus" },
        { sym: "\\nu", label: "Poisson's ratio", si: mat.nu, q: "none" },
        { sym: "\\sigma_\\text{max}", label: "edge stress", si: smax, q: "stress" },
      ],
      answers: [
        { key: "scr", label: "Buckling stress", sym: "\\sigma_{cr}", q: "stress", si: scr, kind: "value" },
        { key: "be", label: "Effective width", sym: "b_e", q: "length", si: e.be, kind: "value" },
      ],
      steps: [
        { tex: `\\sigma_{cr} = k\\frac{\\pi^2E}{12(1-\\nu^2)}\\left(\\frac{t}{b}\\right)^2 = 4 \\times \\frac{\\pi^2 \\times ${v4(mat.E)}}{12(1 - ${v4(mat.nu)}^2)} \\times \\left(\\frac{${v4(t)}}{${v4(b)}}\\right)^2 = ${v4(scr)}${u("stress")}` },
        { tex: `b_e = b\\sqrt{\\frac{\\sigma_{cr}}{\\sigma_\\text{max}}} = ${v4(b)}\\sqrt{\\frac{${v4(scr)}}{${v4(smax)}}} = ${v4(e.be)}${u("length")}` },
      ],
    };
  },

  cylinder(r) {
    const R = pick(r, [4500, 3500, 2500]);
    const E = 193000;
    const fs = pick(r, [1.25, 1.4]);
    let t = 4;
    let P = 20;
    let pmin = 0.1;
    let net = netAxialCompressionFactored(P * 1e6, fs, pmin, R, t);
    for (let i = 0; i < 50; i++) {
      t = between(r, 3, 12, 0.5);
      P = between(r, 10, 40, 1);
      pmin = between(r, 0.05, 0.3, 0.01);
      net = netAxialCompressionFactored(P * 1e6, fs, pmin, R, t);
      if (net.netLoad > 0.2 * fs * P * 1e6) break;
    }
    const c = cylinderBuckling(R, t, E);
    const ms = bucklingMargin(c.loadCapacity, net.netLoad);
    return {
      prompt: "An unstiffened stainless barrel carries axial compression $P$ (limit) while pressurized to at least $p_\\text{min}$. Using SP-8007 with the factor of safety on $P$ only, find the knockdown factor $\\gamma$ and the buckling margin.",
      givens: [
        { sym: "R", label: "radius", si: R, q: "length" },
        { sym: "t", label: "wall thickness", si: t, q: "length" },
        { sym: "E", label: "Young's modulus", si: E, q: "modulus" },
        { sym: "P", label: "axial compression (limit)", si: P, q: "bigForce" },
        { sym: "FS", label: "buckling factor of safety", si: fs, q: "none" },
        { sym: "p_\\text{min}", label: "minimum guaranteed ullage pressure", si: pmin, q: "pressure" },
      ],
      answers: [
        { key: "gamma", label: "Knockdown factor", sym: "\\gamma", q: "none", si: c.gamma, kind: "value" },
        { key: "ms", label: "Buckling margin", sym: "MS", q: "none", si: ms, kind: "margin" },
      ],
      steps: [
        { tex: `\\sigma_{cr} = \\frac{0.605\\,E\\,t}{R} = \\frac{0.605 \\times ${v4(E)} \\times ${v4(t)}}{${v4(R)}} = ${v4(c.sigmaCr)}${u("stress")}` },
        { tex: `\\phi = \\frac{1}{16}\\sqrt{\\frac{R}{t}} = \\frac{1}{16}\\sqrt{\\frac{${v4(R)}}{${v4(t)}}} = ${v4(c.phi)}, \\qquad \\gamma = 1 - 0.901\\left(1 - e^{-${v4(c.phi)}}\\right) = ${v4(c.gamma)}` },
        { tex: `P_\\text{allow} = \\gamma\\,\\sigma_{cr}\\,2\\pi R t = ${v4(c.gamma)} \\times ${v4(c.sigmaCr)} \\times 2\\pi \\times ${v4(R)} \\times ${v4(t)} = ${v4(c.loadCapacity / 1e6)}\\,\\mathrm{MN}` },
        { tex: `P_\\text{net} = FS \\cdot P - p_\\text{min}\\pi R^2 = ${v4(fs)} \\times ${v4(P)} - \\frac{${v4(pmin)} \\times \\pi \\times ${v4(R)}^2}{10^6} = ${v4(net.factoredLoad / 1e6)} - ${v4(net.pressureRelief / 1e6)} = ${v4(net.netLoad / 1e6)}\\,\\mathrm{MN}` },
        { tex: `MS = \\frac{P_\\text{allow}}{P_\\text{net}} - 1 = \\frac{${v4(c.loadCapacity / 1e6)}}{${v4(net.netLoad / 1e6)}} - 1 = ${ms3(ms)}` },
        { text: "The pressure relief uses the minimum pressure and is never multiplied by FS." },
      ],
    };
  },

  bolt(r) {
    const d = pick(r, [6, 8, 10, 12]);
    const K = pick(r, [0.15, 0.2, 0.25]);
    const T = between(r, d, d * 6, 1);
    const kb = between(r, 100000, 400000, 10000);
    const km = kb * between(r, 2, 5, 0.5);
    const Fi = preloadFromTorque(T, K, d);
    const j = boltJoint(Fi, kb, km);
    return {
      prompt: `An M${d} bolt is torqued to $T$ with nut factor $K$. Find the preload, then the external tension at which the joint separates.`,
      givens: [
        { sym: "T", label: "tightening torque", si: T, q: "torque" },
        { sym: "K", label: "nut factor", si: K, q: "none" },
        { sym: "d", label: "nominal diameter", si: d, q: "length" },
        { sym: "k_b", label: "bolt stiffness", si: kb, q: "stiffness" },
        { sym: "k_m", label: "member (clamped parts) stiffness", si: km, q: "stiffness" },
      ],
      answers: [
        { key: "fi", label: "Preload", sym: "F_i", q: "kiloForce", si: Fi / 1000, kind: "value" },
        { key: "psep", label: "Separation load", sym: "P_\\text{sep}", q: "kiloForce", si: j.Psep / 1000, kind: "value" },
      ],
      steps: [
        { tex: `F_i = \\frac{T}{K d} = \\frac{${v4(T)}\\,\\mathrm{N\\cdot m}}{${v4(K)} \\times ${v4(d / 1000)}\\,\\mathrm{m}} = ${v4(Fi)}\\,\\mathrm{N} = ${v4(Fi / 1000)}${u("kiloForce")}` },
        { tex: `C = \\frac{k_b}{k_b + k_m} = \\frac{${v4(kb)}}{${v4(kb)} + ${v4(km)}} = ${v4(j.C)}` },
        { tex: `P_\\text{sep} = \\frac{F_i}{1 - C} = \\frac{${v4(Fi)}}{1 - ${v4(j.C)}} = ${v4(j.Psep)}\\,\\mathrm{N} = ${v4(j.Psep / 1000)}${u("kiloForce")}` },
      ],
    };
  },

  weld(r) {
    const F = between(r, 5, 80, 1);
    const a = between(r, 3, 10, 1);
    const Lw = between(r, 50, 400, 10);
    const w = filletWeld(F * 1000, a, Lw);
    return {
      prompt: "A bracket is attached with equal-leg 45° fillet welds of total length $L_w$ carrying load $F$ in shear. Find the throat and the average shear stress on it.",
      givens: [
        { sym: "F", label: "load", si: F, q: "kiloForce" },
        { sym: "a", label: "fillet leg size", si: a, q: "length" },
        { sym: "L_w", label: "total weld length", si: Lw, q: "length" },
      ],
      answers: [
        { key: "throat", label: "Throat", sym: "t_\\text{throat}", q: "length", si: w.throat, kind: "value" },
        { key: "tau", label: "Shear stress on the throat", sym: "\\tau", q: "stress", si: w.tau, kind: "value" },
      ],
      steps: [
        { tex: `t_\\text{throat} = 0.707\\,a = 0.707 \\times ${v4(a)} = ${v4(w.throat)}${u("length")}` },
        { tex: `\\tau = \\frac{F}{t_\\text{throat} L_w} = \\frac{${v4(F * 1000)}}{${v4(w.throat)} \\times ${v4(Lw)}} = ${v4(w.tau)}${u("stress")}` },
      ],
    };
  },

  goodman(r) {
    const Su = pick(r, [485, 515, 620]);
    const Se = pick(r, [150, 175, 200, 240]);
    const smax = between(r, 80, 300, 5);
    const R = pick(r, [-1, -0.5, 0, 0.1, 0.5]);
    const smin = R * smax;
    const sa = (smax - smin) / 2;
    const sm = (smax + smin) / 2;
    const g = goodman(sa, sm, Se, Su);
    return {
      prompt: "A welded fitting cycles between $\\sigma_\\text{max}$ and $\\sigma_\\text{min}$. Find the alternating stress and the fatigue margin from the modified Goodman line.",
      givens: [
        { sym: "\\sigma_\\text{max}", label: "maximum stress", si: smax, q: "stress" },
        { sym: "\\sigma_\\text{min}", label: "minimum stress", si: smin, q: "stress" },
        { sym: "S_e", label: "endurance limit (corrected)", si: Se, q: "stress" },
        { sym: "S_u", label: "ultimate strength", si: Su, q: "stress" },
      ],
      answers: [
        { key: "sa", label: "Alternating stress", sym: "\\sigma_a", q: "stress", si: sa, kind: "value" },
        { key: "ms", label: "Fatigue margin", sym: "MS_f", q: "none", si: g.ms, kind: "margin" },
      ],
      steps: [
        { tex: `\\sigma_a = \\frac{\\sigma_\\text{max} - \\sigma_\\text{min}}{2} = \\frac{${n(smax)} - ${n(smin)}}{2} = ${v4(sa)}${u("stress")}, \\qquad \\sigma_m = \\frac{${n(smax)} + ${n(smin)}}{2} = ${v4(sm)}${u("stress")}` },
        { tex: `n_f = \\frac{1}{\\sigma_a/S_e + \\sigma_m/S_u} = \\frac{1}{${v4(sa)}/${v4(Se)} + ${v4(sm)}/${v4(Su)}} = ${v4(g.nf)}` },
        { tex: `MS_f = n_f - 1 = ${ms3(g.ms)}` },
      ],
    };
  },

  miner(r) {
    const count = pick(r, [2, 3]);
    const blocks = Array.from({ length: count }, () => {
      const N = pick(r, [1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6]);
      return { n: Math.round(N * between(r, 0.05, 0.6, 0.05)), N };
    });
    const D = minersDamage(blocks);
    return {
      prompt: "A part sees the load blocks below. $N_i$ is the life at each stress level from the S-N curve. Find the Miner's rule damage $D$.",
      givens: blocks.flatMap((b, i) => [
        { sym: `n_${i + 1}`, label: `cycles applied at level ${i + 1}`, si: b.n, q: "none" as const },
        { sym: `N_${i + 1}`, label: `cycles to failure at level ${i + 1}`, si: b.N, q: "none" as const },
      ]),
      answers: [{ key: "D", label: "Damage", sym: "D", q: "none", si: D, kind: "value" }],
      steps: [
        { tex: `D = \\sum_i \\frac{n_i}{N_i} = ${blocks.map((b) => `\\frac{${v4(b.n)}}{${v4(b.N)}}`).join(" + ")} = ${blocks.map((b) => v4(b.n / b.N)).join(" + ")} = ${v4(D)}` },
        { text: D >= 1 ? "D ≥ 1: failure is predicted." : `D < 1: about ${Math.round(D * 100)}% of the life is used.` },
      ],
    };
  },

  crack(r) {
    const KIc = between(r, 50, 200, 5);
    const Y = pick(r, [1, 1.12]);
    const s = between(r, 100, 400, 10);
    const ac = criticalCrackSize(KIc, Y, s);
    return {
      prompt: `A ${Y === 1 ? "through crack in a wide plate" : "surface crack"} ($Y = ${Y}$) sits in a wall at stress $\\sigma$. Find the critical crack size.`,
      givens: [
        { sym: "K_{Ic}", label: "fracture toughness", si: KIc, q: "toughness" },
        { sym: "Y", label: "geometry factor", si: Y, q: "none" },
        { sym: "\\sigma", label: "applied stress", si: s, q: "stress" },
      ],
      answers: [{ key: "ac", label: "Critical crack size", sym: "a_c", q: "length", si: ac * 1000, kind: "value" }],
      steps: [
        { tex: `a_c = \\frac{1}{\\pi}\\left(\\frac{K_{Ic}}{Y\\sigma}\\right)^2 = \\frac{1}{\\pi}\\left(\\frac{${v4(KIc)}}{${v4(Y)} \\times ${v4(s)}}\\right)^2 = ${v4(ac)}\\,\\mathrm{m} = ${v4(ac * 1000)}${u("length")}` },
      ],
    };
  },
};

/** A fresh random seed for a new problem. */
export const newSeed = () => Math.floor(Math.random() * 1_000_000_000);

/** Mixed mode: the seed also picks the topic, from the unlocked list. */
export const mixedTopic = (unlocked: Topic[], seed: number) => unlocked[Math.floor(rng(seed ^ 0x5bd1e995)() * unlocked.length)].id;

/** Builds the problem for a topic and seed. Same inputs, same problem. */
export function makeProblem(topic: TopicId, seed: number): Problem {
  return { topic, seed, ...generators[topic](rng(seed)) };
}

/** Topics whose week has started (for mixed mode). Week 1 is always open. */
export function unlockedTopics(weekStarts: Map<number, string>, today: string) {
  return topics.filter((t) => t.week <= 1 || (weekStarts.get(t.week) ?? "9999") <= today);
}

/** Accuracy per topic, added up across devices (the store keeps one tally per topic per device). */
export function practiceAccuracy(practice: Record<string, { attempts: number; correct: number }>) {
  const out = new Map<TopicId, { attempts: number; correct: number }>();
  for (const [key, tally] of Object.entries(practice)) {
    const topic = key.split("|")[0] as TopicId;
    if (!topicById.has(topic)) continue;
    const sum = out.get(topic) ?? { attempts: 0, correct: 0 };
    out.set(topic, { attempts: sum.attempts + (tally.attempts || 0), correct: sum.correct + (tally.correct || 0) });
  }
  return out;
}

/** The full solution in the chosen system: SI working, with the conversions when the toggle is on US. */
export function solution(problem: Problem, system: System): Step[] {
  const steps: Step[] = [];
  const converted = problem.givens.filter((g) => unitOf(g.q, "SI") && system === "US");
  if (converted.length)
    steps.push({
      text: `Work in SI. Convert the givens: ${converted.map((g) => `$${g.sym} = ${v4(fromSI(g.si, g.q, "US"))}${unitTex(unitOf(g.q, "US"))} = ${v4(g.si)}${u(g.q)}$`).join(", ")}.`,
    });
  steps.push(...problem.steps);
  for (const a of problem.answers) {
    if (a.kind === "value" && system === "US" && unitOf(a.q, "SI"))
      steps.push({ text: `Convert back: $${a.sym} = ${v4(a.si)}${u(a.q)}$ = **${answerText(a, system)}**.` });
    else steps.push({ text: `**${a.label}: ${answerText(a, system)}**` });
  }
  return steps;
}
