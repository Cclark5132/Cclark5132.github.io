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

/** Thin-wall cylinder and dome membrane stresses for internal pressure p (MPa). */
export function thinWall(p: number, R: number, t: number) {
  return {
    hoop: (p * R) / t,
    axial: (p * R) / (2 * t),
    dome: (p * R) / (2 * t),
  };
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
  fsBuckling: number;
  proofPressure: number; // MPa
  ullage: number; // MPa
  loxDensity: number; // kg/m³
  headHeight: number; // mm
  loadFactor: number; // g's
  flightAxial: number; // N
  handlingAxial: number; // N
  frameArea: number; // ring frame cross-section area, mm²
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
  proofPressure: 0.45,
  ullage: 0.35,
  loxDensity: 1141,
  headHeight: 20_000,
  loadFactor: 3,
  flightAxial: 30e6,
  handlingAxial: 2e6,
  frameArea: 2000,
};

export interface MarginRow {
  loadCase: string;
  check: string;
  applied: number; // MPa
  allowable: number; // MPa
  fs: number;
  ms: number;
}

/** Runs all three capstone load cases and returns a margins table plus mass. */
export function capstone(inp: CapstoneInputs) {
  const { t, R } = inp;
  const rows: MarginRow[] = [];
  const strength = (loadCase: string, sx: number, sy: number) => {
    const vm = vonMises(sx, sy);
    rows.push({ loadCase, check: "Yield (von Mises)", applied: vm, allowable: inp.yieldAllow, fs: inp.fsYield, ms: marginOfSafety(inp.yieldAllow, vm, inp.fsYield) });
    rows.push({ loadCase, check: "Ultimate (von Mises)", applied: vm, allowable: inp.ultAllow, fs: inp.fsUlt, ms: marginOfSafety(inp.ultAllow, vm, inp.fsUlt) });
  };
  const buckle = cylinderBuckling(R, t, inp.E);
  const bucklingRow = (loadCase: string, compression: number) => {
    // A section in net tension cannot buckle axially; report it as not applicable with a large margin.
    rows.push({
      loadCase,
      check: "Axial buckling (SP-8007)",
      applied: compression,
      allowable: buckle.sigmaDesign,
      fs: inp.fsBuckling,
      ms: compression > 0 ? marginOfSafety(buckle.sigmaDesign, compression, inp.fsBuckling) : Infinity,
    });
  };

  // 1. Proof pressure: membrane stresses only.
  const proof = thinWall(inp.proofPressure, R, t);
  strength("1. Proof pressure", proof.axial, proof.hoop);

  // 2. Flight, pressurized: hoop from ullage + hydrostatic head at the bottom of the section; axial from
  //    ullage end load minus the applied compression (head ignored for axial, which is conservative).
  const head = hydrostaticHead(inp.loxDensity, inp.loadFactor, inp.headHeight);
  const pBottom = inp.ullage + head;
  const flightHoop = (pBottom * R) / t;
  const flightAxial = netAxialCompression(inp.flightAxial, inp.ullage, R, t);
  strength("2. Flight, pressurized", -flightAxial.stress, flightHoop);
  bucklingRow("2. Flight, pressurized", flightAxial.stress);

  // 3. Unpressurized handling: axial compression only.
  const handling = netAxialCompression(inp.handlingAxial, 0, R, t);
  strength("3. Handling, unpressurized", -handling.stress, 0);
  bucklingRow("3. Handling, unpressurized", handling.stress);

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
    buckle,
    flightAxial,
    handling,
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
