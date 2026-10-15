import { describe, expect, it } from "vitest";
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
