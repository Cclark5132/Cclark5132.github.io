/**
 * All calculator and capstone math. Everything here works in one consistent SI-mm unit set:
 *   stress, pressure, modulus: MPa (= N/mm²)   length: mm   force: N   torque: N·m
 *   density: kg/m³   temperature difference: °C   acceleration: g's (load factor)
 * The UI converts US customary inputs to these units before calling anything here.
 */

export const G = 9.81; // m/s²

/** MS = σ_allow / (FS · σ_applied) − 1 */
export function marginOfSafety(allowable: number, applied: number, fs: number) {
  return allowable / (fs * applied) - 1;
}

/** Hydrostatic head p = ρ · n · g · h, returned in MPa. h in mm. */
export function hydrostaticHead(rho: number, n: number, hMm: number) {
  return (rho * n * G * (hMm / 1000)) / 1e6;
}

/**
 * Axial running load (force per unit length of circumference) in a thin cylinder from axial force P (N) and
 * bending moment M (N·mm): N_x = P/(2πR) ± M/(πR²), in N/mm. `peak` is the side where bending adds to P.
 */
export function runningLoad(P: number, M: number, R: number) {
  const axial = P / (2 * Math.PI * R);
  const bending = M / (Math.PI * R * R);
  return { axial, bending, peak: axial + bending, min: axial - bending };
}

/** Uniform axial load giving the same peak running load as P plus M: P_eq = P + 2M/R (N, with M in N·mm, R in mm). */
export function equivalentAxialLoad(P: number, M: number, R: number) {
  return P + (2 * M) / R;
}

/** Thin-wall cylinder and dome membrane stresses for internal pressure p (MPa). */
export function thinWall(p: number, R: number, t: number) {
  return {
    hoop: (p * R) / t,
    axial: (p * R) / (2 * t),
    dome: (p * R) / (2 * t),
  };
}

/**
 * Discontinuity stress where a hemispherical head meets a cylinder of the same thickness, from the
 * beam-on-elastic-foundation shell model (Geckeler approximation: each side takes half the radial mismatch,
 * so the joint moment M0 = 0 and only a joint shear Q0 acts).
 *   β = [3(1 − ν²)]^¼ / √(R t),  δ = p R² / (2 E t),  Q0 = p / (8β)
 *   M(x) = (Q0/β) e^(−βx) sin βx, peak at βx = π/4;  σ_b = 6 M_max / t²
 * Units: p and E in MPa, R and t in mm. Moments are per unit length of circumference (N·mm/mm).
 */
export function shellDiscontinuityHemiCyl(p: number, R: number, t: number, E: number, nu: number) {
  const beta = (3 * (1 - nu * nu)) ** 0.25 / Math.sqrt(R * t);
  const mismatch = (p * R * R) / (2 * E * t);
  const Q0 = p / (8 * beta);
  const peakAt = Math.PI / (4 * beta);
  const Mmax = (Q0 / beta) * Math.exp(-Math.PI / 4) * Math.sin(Math.PI / 4);
  const bending = (6 * Mmax) / (t * t);
  const membrane = (p * R) / (2 * t);
  return { beta, decayLength: Math.PI / beta, mismatch, Q0, peakAt, Mmax, bending, membrane, total: membrane + bending, factor: (membrane + bending) / membrane };
}

/** Required wall thickness from hoop stress: t = FS · p · R / σ_allow. */
export function requiredThickness(p: number, R: number, fs: number, allowable: number) {
  return (fs * p * R) / allowable;
}

/** Von Mises equivalent stress for a 2D state. */
export function vonMises(sx: number, sy: number, txy = 0) {
  return Math.sqrt(sx * sx - sx * sy + sy * sy + 3 * txy * txy);
}

export type EndCondition = "pinned-pinned" | "fixed-fixed" | "fixed-pinned" | "fixed-free";
export const endConditionK: Record<EndCondition, number> = {
  "pinned-pinned": 1.0,
  "fixed-fixed": 0.5,
  "fixed-pinned": 0.7,
  "fixed-free": 2.0,
};

/** Euler critical load P_cr = π² E I / (K L)². E in MPa, I in mm⁴, L in mm → N. */
export function eulerLoad(E: number, I: number, K: number, L: number) {
  return (Math.PI ** 2 * E * I) / (K * L) ** 2;
}

/** Slenderness ratio at the Euler/Johnson transition: (KL/r)_c = √(2π² E / σ_y). */
export function transitionSlenderness(E: number, sy: number) {
  return Math.sqrt((2 * Math.PI ** 2 * E) / sy);
}

/** Critical stress from the combined Euler/Johnson curve at slenderness s = KL/r. */
export function columnCriticalStress(E: number, sy: number, s: number) {
  const sc = transitionSlenderness(E, sy);
  if (s >= sc) return { stress: (Math.PI ** 2 * E) / (s * s), regime: "Euler" as const };
  return { stress: sy - ((sy * sy) / (4 * Math.PI ** 2 * E)) * s * s, regime: "Johnson" as const };
}

/** Full column check from geometry: area A (mm²), inertia I (mm⁴), length L (mm). */
export function columnBuckling(E: number, sy: number, A: number, I: number, K: number, L: number) {
  const r = Math.sqrt(I / A);
  const slenderness = (K * L) / r;
  const { stress, regime } = columnCriticalStress(E, sy, slenderness);
  return { r, slenderness, transition: transitionSlenderness(E, sy), stress, load: stress * A, regime };
}

/**
 * Axial-compression buckling of a thin unstiffened cylinder, NASA SP-8007:
 *   σ_cr = 0.605 E t / R,  φ = √(R/t) / 16,  γ = 1 − 0.901 (1 − e^(−φ)),  σ_design = γ σ_cr
 */
export function cylinderBuckling(R: number, t: number, E: number) {
  const sigmaCr = (0.605 * E * t) / R;
  const phi = Math.sqrt(R / t) / 16;
  const gamma = 1 - 0.901 * (1 - Math.exp(-phi));
  const sigmaDesign = gamma * sigmaCr;
  return { sigmaCr, phi, gamma, sigmaDesign, loadCapacity: sigmaDesign * 2 * Math.PI * R * t };
}

/**
 * Applied axial compressive wall stress for a cylinder carrying compressive load P (N) with internal
 * pressure p (MPa). The pressure end load p·π·R² relieves compression. Positive result = compression.
 * This conservatively ignores the extra SP-8007 knockdown increase (Δγ) that pressure also provides.
 */
export function netAxialCompression(P: number, p: number, R: number, t: number) {
  const pressureRelief = p * Math.PI * R * R;
  const net = P - pressureRelief;
  return { pressureRelief, netLoad: net, stress: net / (2 * Math.PI * R * t) };
}

/**
 * Net axial compression with the factor of safety on the destabilizing load only:
 *   P_net = FS · P − p_min · π R²
 * The relieving pressure end load is never factored up; use the minimum guaranteed pressure.
 * Returns the net load (N) and the net wall stress (MPa). Positive = compression.
 */
export function netAxialCompressionFactored(P: number, fs: number, pMin: number, R: number, t: number) {
  const pressureRelief = pMin * Math.PI * R * R;
  const factoredLoad = fs * P;
  const netLoad = factoredLoad - pressureRelief;
  return { pressureRelief, factoredLoad, netLoad, stress: netLoad / (2 * Math.PI * R * t) };
}

/** Buckling margin on load: MS = P_allow / P_net − 1, with P_net from netAxialCompressionFactored. Infinity in net tension. */
export function bucklingMargin(pAllow: number, netLoad: number) {
  return netLoad > 0 ? pAllow / netLoad - 1 : Infinity;
}

/** Fully constrained thermal stress σ = E α ΔT (MPa). */
export function thermalStress(E: number, alpha: number, dT: number) {
  return E * alpha * dT;
}

/** Torque to preload: F = T / (K d). T in N·m, d in mm → N. */
export function preloadFromTorque(T: number, K: number, dMm: number) {
  return T / (K * (dMm / 1000));
}

/** Preload to torque: T = K F d. F in N, d in mm → N·m. */
export function torqueFromPreload(F: number, K: number, dMm: number) {
  return K * F * (dMm / 1000);
}

/** Miner's rule: D = Σ nᵢ / Nᵢ. Failure is predicted at D ≥ 1. */
export function minersDamage(blocks: { n: number; N: number }[]) {
  return blocks.reduce((sum, { n, N }) => sum + n / N, 0);
}

/** Principal stresses and Mohr's circle for a 2D stress state: center C, radius R, σ₁ = C + R, σ₂ = C − R. */
export function principalStresses(sx: number, sy: number, txy = 0) {
  const center = (sx + sy) / 2;
  const radius = Math.sqrt(((sx - sy) / 2) ** 2 + txy * txy);
  return { center, radius, s1: center + radius, s2: center - radius, tauMax: radius };
}

/** Thermal stress magnitude in a plate restrained in both directions: E α ΔT / (1 − ν). */
export function thermalStressBiaxial(E: number, alpha: number, dT: number, nu: number) {
  return (E * alpha * dT) / (1 - nu);
}

/** Thermal stress magnitude in a bar restrained by a spring of stiffness k (N/mm): E α ΔT / (1 + E A / (k L)). */
export function thermalStressSpring(E: number, alpha: number, dT: number, A: number, k: number, L: number) {
  return (E * alpha * dT) / (1 + (E * A) / (k * L));
}

/**
 * Area, centroid and second moment of a section built from rectangles (b wide, h tall, centroid at height y
 * from the reference line), about the horizontal centroidal axis. mm in, mm² / mm / mm⁴ out.
 */
export function sectionProperties(rects: { b: number; h: number; y: number }[]) {
  const A = rects.reduce((sum, r) => sum + r.b * r.h, 0);
  const ybar = rects.reduce((sum, r) => sum + r.b * r.h * r.y, 0) / A;
  const I = rects.reduce((sum, r) => sum + (r.b * r.h ** 3) / 12 + r.b * r.h * (r.y - ybar) ** 2, 0);
  return { A, ybar, I };
}

/** Flat-plate buckling stress σ_cr = k π² E / (12 (1 − ν²)) · (t/b)². */
export function plateBuckling(k: number, E: number, nu: number, t: number, b: number) {
  return ((k * Math.PI ** 2 * E) / (12 * (1 - nu * nu))) * (t / b) ** 2;
}

/** Effective width (von Kármán): b_e = b √(σ_cr / σ_max), never more than b. P_skin = b_e t σ_max (N). */
export function effectiveWidth(b: number, t: number, sigmaCr: number, sigmaMax: number) {
  const be = Math.min(b, b * Math.sqrt(sigmaCr / sigmaMax));
  return { be, Pskin: be * t * sigmaMax };
}

/** Bolted joint under external tension P (N): C = k_b/(k_b + k_m), F_b = F_i + C P, F_m = F_i − (1 − C) P, P_sep = F_i/(1 − C). */
export function boltJoint(Fi: number, kb: number, km: number, P = 0) {
  const C = kb / (kb + km);
  return { C, Fb: Fi + C * P, Fm: Fi - (1 - C) * P, Psep: Fi / (1 - C) };
}

/** Equal-leg 45° fillet weld: throat = 0.707 a, τ = F / (throat · L_w). N and mm → mm and MPa. */
export function filletWeld(F: number, a: number, Lw: number) {
  const throat = 0.707 * a;
  return { throat, tau: F / (throat * Lw) };
}

/** Modified Goodman: 1/n_f = σ_a/S_e + σ_m/S_u, MS_f = n_f − 1. */
export function goodman(sigmaA: number, sigmaM: number, Se: number, Su: number) {
  const nf = 1 / (sigmaA / Se + sigmaM / Su);
  return { nf, ms: nf - 1 };
}

/** Critical crack size a_c = (1/π) (K_Ic / (Y σ))², in m (K_Ic in MPa·√m, σ in MPa). */
export function criticalCrackSize(KIc: number, Y: number, sigma: number) {
  return (1 / Math.PI) * (KIc / (Y * sigma)) ** 2;
}

/* ---------- Capstone: booster-style LOX tank barrel section (practice values) ---------- */

export interface CapstoneInputs {
  t: number; // wall thickness, mm
  frames: number; // number of internal ring frames
  R: number; // mm
  L: number; // barrel length, mm
  E: number; // MPa
  nu: number;
  density: number; // kg/m³
  yieldAllow: number; // MPa
  ultAllow: number; // MPa
  fsYield: number;
  fsUlt: number;
  fsBuckling: number; // on the destabilizing load only
  proofFactor: number; // proof pressure = proofFactor × MEOP
  fsProof: number; // FS on yield at proof pressure (1.0: no yield at proof)
  ullage: number; // MPa
  loxDensity: number; // kg/m³
  headHeight: number; // mm
  loadFactor: number; // g's
  flightAxial: number; // N
  handlingAxial: number; // N
  frameArea: number; // ring frame cross-section area, mm²
  includeMaxQ: boolean; // stretch goal: add load case 4, max-Q bending
  maxQAxial: number; // N, practice
  maxQMoment: number; // N·mm, practice
}

export const capstoneDefaults: CapstoneInputs = {
  t: 4,
  frames: 3,
  R: 4500,
  L: 6000,
  E: 193_000,
  nu: 0.29,
  density: 8000,
  yieldAllow: 500,
  ultAllow: 700,
  fsYield: 1.25,
  fsUlt: 1.4,
  fsBuckling: 1.4,
  proofFactor: 1.25,
  fsProof: 1.0,
  ullage: 0.35,
  loxDensity: 1141,
  headHeight: 20_000,
  loadFactor: 3,
  flightAxial: 30e6,
  handlingAxial: 2e6,
  frameArea: 2000,
  includeMaxQ: false,
  maxQAxial: 25e6,
  maxQMoment: 30e9,
};

export interface MarginRow {
  loadCase: string;
  check: string;
  applied: number; // MPa
  allowable: number; // MPa
  fs: number;
  ms: number;
  note?: string;
}

/** Runs the capstone load cases (three, plus max-Q bending when enabled) and returns a margins table plus mass. */
export function capstone(inp: CapstoneInputs) {
  const { t, R } = inp;
  const rows: MarginRow[] = [];
  const strength = (loadCase: string, sx: number, sy: number) => {
    const vm = vonMises(sx, sy);
    rows.push({ loadCase, check: "Yield (von Mises)", applied: vm, allowable: inp.yieldAllow, fs: inp.fsYield, ms: marginOfSafety(inp.yieldAllow, vm, inp.fsYield) });
    rows.push({ loadCase, check: "Ultimate (von Mises)", applied: vm, allowable: inp.ultAllow, fs: inp.fsUlt, ms: marginOfSafety(inp.ultAllow, vm, inp.fsUlt) });
  };
  const buckle = cylinderBuckling(R, t, inp.E);
  /** FS on the applied compression only; relieving pressure at its minimum, unfactored. MS = P_allow / P_net − 1. */
  const bucklingRow = (loadCase: string, P: number, pMin: number) => {
    const net = netAxialCompressionFactored(P, inp.fsBuckling, pMin, R, t);
    rows.push({
      loadCase,
      check: "Axial buckling (SP-8007)",
      applied: net.stress, // factored net compression; ≤ 0 means net tension
      allowable: buckle.sigmaDesign,
      fs: inp.fsBuckling,
      ms: bucklingMargin(buckle.loadCapacity, net.netLoad),
      note: "FS on P only",
    });
    return net;
  };

  const head = hydrostaticHead(inp.loxDensity, inp.loadFactor, inp.headHeight);
  const pBottom = inp.ullage + head;

  // 1. Proof: MEOP at the bottom of the section (ullage + head at 3 g) times the proof factor. Check no yield
  //    at proof (FS 1.0): the proof pressure already contains the proof factor, so no flight FS is applied.
  const meop = pBottom;
  const proofPressure = inp.proofFactor * meop;
  const proof = thinWall(proofPressure, R, t);
  const proofVm = vonMises(proof.axial, proof.hoop);
  rows.push({
    loadCase: "1. Proof pressure",
    check: "No yield at proof (von Mises)",
    applied: proofVm,
    allowable: inp.yieldAllow,
    fs: inp.fsProof,
    ms: marginOfSafety(inp.yieldAllow, proofVm, inp.fsProof),
  });

  // 2. Flight, pressurized: hoop from ullage + hydrostatic head at the bottom of the section; axial from
  //    ullage end load minus the applied compression (head ignored for axial, which is conservative).
  const flightHoop = (pBottom * R) / t;
  const flightAxial = netAxialCompression(inp.flightAxial, inp.ullage, R, t);
  strength("2. Flight, pressurized", -flightAxial.stress, flightHoop);
  const flightBuckling = bucklingRow("2. Flight, pressurized", inp.flightAxial, inp.ullage);

  // 3. Unpressurized handling: axial compression only.
  const handling = netAxialCompression(inp.handlingAxial, 0, R, t);
  strength("3. Handling, unpressurized", -handling.stress, 0);
  bucklingRow("3. Handling, unpressurized", inp.handlingAxial, 0);

  // 4. Stretch goal, max-Q bending: P_eq = P + 2M/R on the compression side, ullage pressure only (no head).
  const maxQEquivalent = equivalentAxialLoad(inp.maxQAxial, inp.maxQMoment, R);
  if (inp.includeMaxQ) {
    const net = netAxialCompression(maxQEquivalent, inp.ullage, R, t);
    strength("4. Max-Q bending (stretch)", -net.stress, (inp.ullage * R) / t);
    bucklingRow("4. Max-Q bending (stretch)", maxQEquivalent, inp.ullage);
  }

  const skinMass = (inp.density * 2 * Math.PI * R * t * inp.L) / 1e9;
  const frameMass = (inp.frames * inp.density * 2 * Math.PI * R * inp.frameArea) / 1e9;
  const bayLength = inp.L / (inp.frames + 1);
  // Batdorf parameter Z = L² √(1−ν²) / (R t). Classical long-cylinder buckling applies for Z above about 2.85.
  const batdorfZ = ((bayLength * bayLength) / (R * t)) * Math.sqrt(1 - inp.nu * inp.nu);

  return {
    rows,
    minMargin: Math.min(...rows.map((row) => row.ms)),
    head,
    pBottom,
    meop,
    proofPressure,
    buckle,
    flightAxial,
    flightBuckling,
    handling,
    maxQEquivalent,
    skinMass,
    frameMass,
    mass: skinMass + frameMass,
    bayLength,
    batdorfZ,
  };
}

/** Smallest wall thickness (to 0.01 mm) with every capstone margin ≥ 0. */
export function capstoneMinThickness(inp: CapstoneInputs, lo = 0.5, hi = 60) {
  const ok = (t: number) => capstone({ ...inp, t }).minMargin >= 0;
  if (!ok(hi)) return NaN;
  while (hi - lo > 0.005) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}
