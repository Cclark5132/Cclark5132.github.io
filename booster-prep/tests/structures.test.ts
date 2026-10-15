import { describe, expect, it } from "vitest";
import * as S from "../src/calc/structures";
import { fromSI, quantities, toSI } from "../src/calc/units";
import {
  capstone,
  capstoneDefaults,
  capstoneMinThickness,
  columnBuckling,
  columnCriticalStress,
  cylinderBuckling,
  eulerLoad,
  hydrostaticHead,
  marginOfSafety,
  minersDamage,
  netAxialCompression,
  netAxialCompressionFactored,
  bucklingMargin,
  preloadFromTorque,
  requiredThickness,
  runningLoad,
  equivalentAxialLoad,
  shellDiscontinuityHemiCyl,
  thermalStress,
  thinWall,
  torqueFromPreload,
  transitionSlenderness,
  vonMises,
} from "../src/calc/structures";

// Worked examples from PLAN.md.
describe("PLAN.md worked examples", () => {
  it("margin: allowable 300 MPa, applied 200 MPa, FS 1.4 → MS ≈ +0.071", () => {
    expect(marginOfSafety(300, 200, 1.4)).toBeCloseTo(0.0714, 4);
  });

  it("wall thickness: R 4500 mm, p 0.35 MPa, FS 1.25, allowable 500 MPa → t ≈ 3.94 mm", () => {
    expect(requiredThickness(0.35, 4500, 1.25, 500)).toBeCloseTo(3.9375, 4);
  });

  it("hydrostatic head: ρ 1141 kg/m³, h 20 m → ≈ 0.224 MPa at 1 g and ≈ 0.672 MPa at 3 g", () => {
    expect(hydrostaticHead(1141, 1, 20_000)).toBeCloseTo(0.2239, 4);
    expect(hydrostaticHead(1141, 3, 20_000)).toBeCloseTo(0.6716, 4);
  });

  it("cylinder buckling: R 4500 mm, t 4 mm, E 193 GPa → σ_cr ≈ 103.8 MPa, γ ≈ 0.210, σ_design ≈ 21.8 MPa", () => {
    const result = cylinderBuckling(4500, 4, 193_000);
    expect(result.sigmaCr).toBeCloseTo(103.79, 2);
    expect(result.phi).toBeCloseTo(2.096, 3);
    expect(result.gamma).toBeCloseTo(0.2097, 3);
    expect(result.sigmaDesign).toBeCloseTo(21.77, 1);
  });

  it("thermal stress: E 193 GPa, α 17e-6 /°C, ΔT 200 °C → ≈ 656 MPa", () => {
    expect(thermalStress(193_000, 17e-6, 200)).toBeCloseTo(656.2, 1);
  });

  it("bolt preload: T 100 N·m, K 0.2, d 12.7 mm → F ≈ 39,400 N", () => {
    expect(preloadFromTorque(100, 0.2, 12.7)).toBeCloseTo(39_370, 0);
    expect(torqueFromPreload(39_370.08, 0.2, 12.7)).toBeCloseTo(100, 3);
  });

  it("Miner's rule: 1000/10000 + 50/500 → D = 0.2", () => {
    expect(minersDamage([{ n: 1000, N: 10_000 }, { n: 50, N: 500 }])).toBeCloseTo(0.2, 10);
  });
});

describe("textbook relations", () => {
  it("hoop stress is twice axial stress", () => {
    const s = thinWall(0.35, 4500, 4);
    expect(s.hoop).toBeCloseTo(393.75, 2);
    expect(s.hoop / s.axial).toBeCloseTo(2, 10);
  });

  it("von Mises matches the principal-stress form", () => {
    expect(vonMises(200, 100)).toBeCloseTo(Math.sqrt(30_000), 6);
    expect(vonMises(120, 40, 30)).toBeCloseTo(Math.sqrt(13_900), 6);
  });

  it("doubling column length quarters the Euler load", () => {
    expect(eulerLoad(193_000, 1e5, 1, 2000) / eulerLoad(193_000, 1e5, 1, 1000)).toBeCloseTo(0.25, 10);
  });

  it("Euler and Johnson meet at half yield at the transition slenderness", () => {
    const sc = transitionSlenderness(193_000, 500);
    expect(columnCriticalStress(193_000, 500, sc).stress).toBeCloseTo(250, 6);
    expect(columnCriticalStress(193_000, 500, sc * 0.999).regime).toBe("Johnson");
    expect(columnCriticalStress(193_000, 500, sc * 1.001).regime).toBe("Euler");
    expect(columnCriticalStress(193_000, 500, 0).stress).toBe(500);
  });

  it("column check from geometry", () => {
    const c = columnBuckling(193_000, 500, 100, 2500, 1, 1000);
    expect(c.r).toBeCloseTo(5, 10);
    expect(c.slenderness).toBeCloseTo(200, 10);
    expect(c.regime).toBe("Euler");
    expect(c.load).toBeCloseTo((Math.PI ** 2 * 193_000 * 2500) / 1000 ** 2, 6);
  });

  it("pressure end load relieves axial compression", () => {
    const r = netAxialCompression(30e6, 0.35, 4500, 4);
    expect(r.pressureRelief).toBeCloseTo(22.266e6, -3);
    expect(r.netLoad).toBeCloseTo(7.734e6, -3);
  });
});

describe("capstone", () => {
  it("4 mm fails the flight case on hoop stress", () => {
    const result = capstone(capstoneDefaults);
    expect(result.pBottom).toBeCloseTo(1.0216, 3);
    expect(result.minMargin).toBeLessThan(0);
  });

  it("finds a minimum thickness where every margin is ≥ 0, about 11.85 mm, governed by flight yield", () => {
    const t = capstoneMinThickness(capstoneDefaults);
    expect(t).toBeCloseTo(11.85, 1);
    expect(capstone({ ...capstoneDefaults, t }).minMargin).toBeGreaterThanOrEqual(0);
    expect(capstone({ ...capstoneDefaults, t: t - 0.05 }).minMargin).toBeLessThan(0);
    const governing = capstone({ ...capstoneDefaults, t }).rows.reduce((a, b) => (b.ms < a.ms ? b : a));
    expect(governing.loadCase).toBe("2. Flight, pressurized");
    expect(governing.check).toBe("Yield (von Mises)");
  });

  it("mass grows with thickness and frames", () => {
    const a = capstone({ ...capstoneDefaults, t: 10 });
    const b = capstone({ ...capstoneDefaults, t: 12 });
    const c = capstone({ ...capstoneDefaults, t: 12, frames: 5 });
    expect(b.mass).toBeGreaterThan(a.mass);
    expect(c.mass).toBeGreaterThan(b.mass);
    expect(a.skinMass).toBeCloseTo((8000 * 2 * Math.PI * 4.5 * 0.01 * 6), 3);
  });
});

const flightBuckling = (t: number) => capstone({ ...capstoneDefaults, t }).rows.find((r) => r.loadCase.startsWith("2.") && r.check.startsWith("Axial"))!;

describe("capstone buckling factors only the destabilizing load (2.1)", () => {
  it("P_net = FS × P − p_min πR², relief never factored", () => {
    const n = netAxialCompressionFactored(30e6, 1.4, 0.35, 4500, 4);
    expect(n.factoredLoad).toBeCloseTo(42e6, 0);
    expect(n.pressureRelief / 1e6).toBeCloseTo(22.27, 2);
    expect(n.netLoad / 1e6).toBeCloseTo(19.73, 2);
    expect(n.stress).toBeCloseTo(174.5, 1);
    expect(bucklingMargin(1e6, -5)).toBe(Infinity);
  });

  it("flight buckling MS: −0.875 at 4 mm and +0.968 at 12 mm (was −0.773 and +2.587)", () => {
    expect(flightBuckling(4).ms).toBeCloseTo(-0.875, 3);
    expect(flightBuckling(12).ms).toBeCloseTo(0.968, 3);
  });

  it("flight buckling alone needs about 9.12 mm", () => {
    let lo = 4;
    let hi = 12;
    while (hi - lo > 1e-4) {
      const mid = (lo + hi) / 2;
      if (flightBuckling(mid).ms >= 0) hi = mid;
      else lo = mid;
    }
    expect(hi).toBeCloseTo(9.12, 2);
  });

  it("handling case: 2 MN × 1.4 with no pressure", () => {
    const row = capstone({ ...capstoneDefaults, t: 4 }).rows.find((r) => r.loadCase.startsWith("3.") && r.check.startsWith("Axial"))!;
    const pAllow = cylinderBuckling(4500, 4, 193_000).loadCapacity;
    expect(row.ms).toBeCloseTo(pAllow / 2.8e6 - 1, 6);
  });
});

describe("Lesson 6 Example 2: 30 MN limit × 1.4 (2.2)", () => {
  it("matches the rewritten example", () => {
    const pAllow = cylinderBuckling(4500, 4, 193_000).loadCapacity;
    expect(pAllow / 1e6).toBeCloseTo(2.46, 2);
    const n = netAxialCompressionFactored(30e6, 1.4, 0.35, 4500, 4);
    expect(n.stress).toBeGreaterThan(cylinderBuckling(4500, 4, 193_000).sigmaCr);
    expect(bucklingMargin(pAllow, n.netLoad)).toBeCloseTo(-0.875, 3);
    expect((42e6 - pAllow) / (Math.PI * 4500 ** 2)).toBeCloseTo(0.62, 2);
    expect(2.46 / 42 - 1).toBeCloseTo(-0.94, 2);
  });
});

describe("capstone proof case: 1.25 × MEOP, no yield at proof (2.4)", () => {
  it("MEOP ≈ 1.022 MPa and proof ≈ 1.277 MPa", () => {
    const r = capstone(capstoneDefaults);
    expect(r.meop).toBeCloseTo(1.022, 3);
    expect(r.proofPressure).toBeCloseTo(1.277, 3);
  });

  it("one yield row at FS 1.0: +0.19 at 11.85 mm, +0.005 at 10 mm", () => {
    const proofRows = (t: number) => capstone({ ...capstoneDefaults, t }).rows.filter((r) => r.loadCase.startsWith("1."));
    expect(proofRows(10)).toHaveLength(1);
    expect(proofRows(10)[0].fs).toBe(1);
    expect(proofRows(11.85)[0].ms).toBeCloseTo(0.19, 2);
    expect(proofRows(10)[0].ms).toBeCloseTo(0.005, 3);
  });
});

describe("running loads (3.1)", () => {
  it("30 MN and 20 MN·m at R 4500 mm: 1061.0 + 314.4 = 1375.4 N/mm, P_eq 38.89 MN", () => {
    const n = runningLoad(30e6, 20e9, 4500);
    expect(n.axial).toBeCloseTo(1061.0, 1);
    expect(n.bending).toBeCloseTo(314.4, 1);
    expect(n.peak).toBeCloseTo(1375.4, 1);
    const Peq = equivalentAxialLoad(30e6, 20e9, 4500);
    expect(Peq / 1e6).toBeCloseTo(38.89, 2);
    expect(Peq / (2 * Math.PI * 4500)).toBeCloseTo(n.peak, 6);
  });

  it("Lesson 1 Practice 7: 12 MN and 8 MN·m", () => {
    const n = runningLoad(12e6, 8e9, 4500);
    expect(n.peak).toBeCloseTo(550.2, 1);
    expect(n.min).toBeCloseTo(298.7, 1);
    expect(equivalentAxialLoad(12e6, 8e9, 4500) / 1e6).toBeCloseTo(15.56, 2);
  });

  it("Lesson 1 Practice 8 (US): 1653.6 lbf/in = 289.6 N/mm, P_eq 1,838,983 lbf", () => {
    // Works in any consistent units: lbf, in·lbf and in give lbf/in.
    const n = runningLoad(1.5e6, 3e7, 177);
    expect(n.axial).toBeCloseTo(1348.8, 1);
    expect(n.bending).toBeCloseTo(304.8, 1);
    expect(n.peak).toBeCloseTo(1653.6, 1);
    expect(toSI(n.peak, "runningLoad", "US")).toBeCloseTo(289.6, 1);
    expect(equivalentAxialLoad(1.5e6, 3e7, 177)).toBeCloseTo(1_838_983, 0);
  });

  it("Lesson 1 Practice 9: factored P_eq with unfactored relief, 12 mm wall → MS ≈ +0.21", () => {
    const Peq = equivalentAxialLoad(30e6, 20e9, 4500);
    const net = netAxialCompressionFactored(Peq, 1.4, 0.35, 4500, 12);
    expect(net.netLoad / 1e6).toBeCloseTo(32.18, 2);
    expect(net.netLoad / (2 * Math.PI * 4500)).toBeCloseTo(1138, 0);
    expect(net.stress).toBeCloseTo(94.8, 1);
    const pAllow = cylinderBuckling(4500, 12, 193_000).loadCapacity;
    expect(pAllow / 1e6).toBeCloseTo(38.83, 2);
    expect(bucklingMargin(pAllow, net.netLoad)).toBeCloseTo(0.21, 2);
  });

  it("1 lbf/in = 0.175127 N/mm", () => {
    expect(quantities.runningLoad.toSI).toBeCloseTo(0.175127, 6);
    expect(fromSI(0.175127, "runningLoad", "US")).toBeCloseTo(1, 5);
  });
});

describe("capstone max-Q stretch case (3.1)", () => {
  it("P_eq = 25 MN + 2 × 30 MN·m / 4.5 m = 38.33 MN; minimum thickness unchanged at about 11.85 mm", () => {
    const withQ = { ...capstoneDefaults, includeMaxQ: true };
    expect(capstone(withQ).maxQEquivalent / 1e6).toBeCloseTo(38.33, 2);
    expect(capstone(withQ).rows.some((r) => r.loadCase.startsWith("4."))).toBe(true);
    expect(capstone(capstoneDefaults).rows.some((r) => r.loadCase.startsWith("4."))).toBe(false);
    expect(capstoneMinThickness(withQ)).toBeCloseTo(capstoneMinThickness(capstoneDefaults), 6);
    const maxQBuckling = (t: number) => capstone({ ...withQ, t }).rows.find((r) => r.loadCase.startsWith("4.") && r.check.startsWith("Axial"))!.ms;
    expect(maxQBuckling(12)).toBeCloseTo(0.237, 3);
  });
});

describe("shell discontinuity, hemisphere on cylinder (3.3)", () => {
  const d = shellDiscontinuityHemiCyl(0.35, 4500, 4, 193_000, 0.29);
  it("matches the Lesson 2 worked example", () => {
    expect(d.beta).toBeCloseTo(0.009596, 6);
    expect(1 / d.beta).toBeCloseTo(104.2, 1);
    expect(d.peakAt).toBeCloseTo(81.8, 1);
    expect(d.decayLength).toBeCloseTo(327, 0);
    expect(d.mismatch).toBeCloseTo(4.59, 2);
    expect(d.Q0).toBeCloseTo(4.559, 3);
    expect(d.Mmax).toBeCloseTo(153.2, 1);
    expect(d.bending).toBeCloseTo(57.4, 1);
    expect(d.membrane).toBeCloseTo(196.9, 1);
    expect(d.total).toBeCloseTo(254.3, 1);
  });
  it("gives the classical ≈ 1.293 factor, independent of p, R and t", () => {
    expect(d.factor).toBeCloseTo(1.293, 2);
    expect(shellDiscontinuityHemiCyl(1, 1000, 10, 70_000, 0.29).factor).toBeCloseTo(d.factor, 10);
  });
});

describe("US-unit practice problems (3.7)", () => {
  it("Lesson 2 Practice 8: 50 psi, R 177 in, t 0.157 in", () => {
    const s = thinWall(50, 177, 0.157);
    expect(s.hoop / 1000).toBeCloseTo(56.37, 2);
    expect(toSI(s.hoop / 1000, "stress", "US")).toBeCloseTo(388.7, 1);
    expect(requiredThickness(50, 177, 1.25, 72_500)).toBeCloseTo(0.1526, 4);
  });
  it("Lesson 5 Practice 8: Johnson column in ksi", () => {
    const c = columnBuckling(28_000, 50, 1.2, 0.5, 1, 60);
    expect(c.regime).toBe("Johnson");
    expect(c.slenderness).toBeCloseTo(92.95, 2);
    expect(c.transition).toBeCloseTo(105.1, 1);
    expect(c.stress).toBeCloseTo(30.46, 2);
    expect(c.load).toBeCloseTo(36.55, 2);
    expect(toSI(c.stress, "stress", "US")).toBeCloseTo(210.0, 1);
  });
  it("Lesson 6 Practice 7: SP-8007 in ksi", () => {
    const b = cylinderBuckling(177.2, 0.1575, 28_000);
    expect(b.sigmaCr).toBeCloseTo(15.06, 2);
    expect(b.gamma).toBeCloseTo(0.210, 3);
    expect(b.sigmaDesign).toBeCloseTo(3.16, 2);
    expect(b.loadCapacity).toBeCloseTo(553.8, 1);
    expect(toSI(b.sigmaCr, "stress", "US")).toBeCloseTo(103.8, 1);
  });
  it("Lesson 7 Practice 8: 30 ft·lbf on a 3/8 in bolt → 4800 lbf ≈ 21.35 kN", () => {
    expect((30 * 12) / (0.2 * 0.375)).toBeCloseTo(4800, 6);
    expect(preloadFromTorque(toSI(30, "torque", "US"), 0.2, toSI(0.375, "length", "US"))).toBeCloseTo(21_351, 0);
  });
});

describe("formulas behind the practice generators (hand-checked values)", () => {
  it("principal stresses: σx = 100, σy = 0, τ = 50 MPa", () => {
    const p = S.principalStresses(100, 0, 50);
    expect(p.center).toBe(50);
    expect(p.radius).toBeCloseTo(70.71, 2);
    expect(p.s1).toBeCloseTo(120.71, 2);
    expect(p.s2).toBeCloseTo(-20.71, 2);
  });

  it("biaxial and spring-restrained thermal stress", () => {
    expect(S.thermalStressBiaxial(193000, 1.73e-5, 100, 0.29)).toBeCloseTo(470.27, 2);
    // EA/(kL) = 1 halves the fully restrained stress.
    expect(S.thermalStressSpring(193000, 1.73e-5, 100, 100, 19300, 1000)).toBeCloseTo((193000 * 1.73e-5 * 100) / 2, 6);
  });

  it("T-section: 5 × 50 web under a 40 × 5 flange", () => {
    const s = S.sectionProperties([
      { b: 5, h: 50, y: 25 },
      { b: 40, h: 5, y: 52.5 },
    ]);
    expect(s.A).toBe(450);
    expect(s.ybar).toBeCloseTo(37.22, 2);
    expect(s.I).toBeCloseTo(136528, 0);
  });

  it("plate buckling and effective width", () => {
    const scr = S.plateBuckling(4, 193000, 0.3, 2, 200);
    expect(scr).toBeCloseTo(69.77, 2);
    expect(S.effectiveWidth(200, 2, scr, 150).be).toBeCloseTo(136.41, 2);
    expect(S.effectiveWidth(200, 2, scr, 50).be).toBe(200); // not buckled yet: full width
  });

  it("bolted joint, fillet weld, Goodman and critical crack size", () => {
    expect(S.boltJoint(20000, 1e5, 3e5, 10000)).toEqual({ C: 0.25, Fb: 22500, Fm: 12500, Psep: 20000 / 0.75 });
    const w = S.filletWeld(30000, 6, 200);
    expect(w.throat).toBeCloseTo(4.242, 3);
    expect(w.tau).toBeCloseTo(35.36, 2);
    const gm = S.goodman(100, 50, 200, 500);
    expect(gm.nf).toBeCloseTo(1.6667, 4);
    expect(gm.ms).toBeCloseTo(0.6667, 4);
    expect(S.criticalCrackSize(100, 1, 200)).toBeCloseTo(0.0795775, 6);
  });

  it("new unit conversions", () => {
    expect(toSI(1, "kiloForce", "US")).toBeCloseTo(4.448, 3); // 1 kip = 4.448 kN
    expect(toSI(1, "toughness", "US")).toBeCloseTo(1.0988, 4); // 1 ksi·√in = 1.0988 MPa·√m
    expect(toSI(1, "stiffness", "US")).toBeCloseTo(0.175127, 6); // 1 lbf/in = 0.175127 N/mm
    expect(quantities.kiloForce.si).toBe("kN");
  });
});
