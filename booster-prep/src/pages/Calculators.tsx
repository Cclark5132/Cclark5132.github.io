import { useState, type ReactNode } from "react";
import {
  columnBuckling,
  columnCriticalStress,
  cylinderBuckling,
  endConditionK,
  hydrostaticHead,
  marginOfSafety,
  minersDamage,
  preloadFromTorque,
  requiredThickness,
  thermalStress,
  thinWall,
  torqueFromPreload,
  type EndCondition,
} from "../calc/structures";
import { fmt, fromSI, signed, tex, unitOf, type Quantity, type System } from "../calc/units";
import { LineChart } from "../components/Chart";
import { Formula, type Var } from "../components/Formula";
import { NumField, UnitToggle } from "../components/NumField";
import { Tex } from "../components/Tex";

const SYSTEM_KEY = "booster-prep:units";

function useSystem() {
  const [system, setSystem] = useState<System>(() => {
    try {
      return localStorage.getItem(SYSTEM_KEY) === "US" ? "US" : "SI";
    } catch {
      return "SI";
    }
  });
  const set = (s: System) => {
    setSystem(s);
    try {
      localStorage.setItem(SYSTEM_KEY, s);
    } catch {
      // Not persisted.
    }
  };
  return [system, set] as const;
}

/** A result value shown in the chosen system, with the SI value alongside when in US units. */
function Out({ label, si, q = "none", system, digits = 4, tone }: { label: string; si: number; q?: Quantity; system: System; digits?: number; tone?: "pos" | "neg" }) {
  const unit = unitOf(q, system);
  return (
    <div className="out">
      <span className="eyebrow">{label}</span>
      <span className={`num out-value${tone ? ` ${tone}` : ""}`}>
        {fmt(fromSI(si, q, system), digits)} <small>{unit}</small>
      </span>
      {system === "US" && q !== "none" && (
        <span className="num out-si">
          = {fmt(si, digits)} {unitOf(q, "SI")}
        </span>
      )}
    </div>
  );
}

function MarginOut({ ms, label = "Margin of safety" }: { ms: number; label?: string }) {
  return (
    <div className="out">
      <span className="eyebrow">{label}</span>
      <span className={`num out-value ${ms >= 0 ? "pos" : "neg"}`}>{signed(ms)}</span>
      <span className="out-si">{ms >= 0 ? "Passes (MS ≥ 0)" : "Fails (MS < 0)"}</span>
    </div>
  );
}

function Calc({ id, title, intro, formula, inputs, steps, outputs, extra }: { id: string; title: string; intro: string; formula: ReactNode; inputs: ReactNode; steps: string[]; outputs: ReactNode; extra?: ReactNode }) {
  return (
    <section id={id} className="card calc" aria-labelledby={`${id}-h`}>
      <div className="card-title">
        <h2 id={`${id}-h`}>{title}</h2>
      </div>
      <p className="hint" style={{ marginBottom: 14 }}>
        {intro}
      </p>
      <div className="calc-grid">
        <div className="stack" style={{ alignContent: "start" }}>
          <div className="inputs">{inputs}</div>
          <div className="outputs">{outputs}</div>
        </div>
        <div className="stack" style={{ alignContent: "start", minWidth: 0 }}>
          {formula}
          <div className="subst">
            <div className="formula-label">Substituted (SI: MPa, mm, N)</div>
            {steps.map((s, i) => (
              <Tex key={i} tex={s} display />
            ))}
          </div>
        </div>
      </div>
      {extra}
    </section>
  );
}

const v = (s: string, m: string, u: string): Var => [s, m, u];

/* ---------- Individual calculators ---------- */

function MarginCalc({ system }: { system: System }) {
  const [allow, setAllow] = useState(300);
  const [applied, setApplied] = useState(200);
  const [fs, setFs] = useState(1.4);
  const ms = marginOfSafety(allow, applied, fs);
  return (
    <Calc
      id="margin"
      title="Margin of safety"
      intro="Applied stress times the factor of safety, compared with the allowable. Pass when MS ≥ 0."
      formula={
        <Formula
          tex="MS = \frac{\sigma_\text{allow}}{FS \times \sigma_\text{applied}} - 1"
          vars={[v("\\sigma_\\text{allow}", "allowable stress", unitOf("stress", system)), v("\\sigma_\\text{applied}", "applied stress", unitOf("stress", system)), v("FS", "factor of safety", "—")]}
        />
      }
      inputs={
        <>
          <NumField label="Allowable" q="stress" system={system} value={allow} onChange={setAllow} />
          <NumField label="Applied" q="stress" system={system} value={applied} onChange={setApplied} />
          <NumField label="Factor of safety" system={system} value={fs} onChange={setFs} step={0.05} />
        </>
      }
      steps={[`MS = \\frac{${tex(allow)}}{${tex(fs)} \\times ${tex(applied)}} - 1 = \\frac{${tex(allow)}}{${tex(fs * applied)}} - 1 = ${signed(ms)}`]}
      outputs={<MarginOut ms={ms} />}
    />
  );
}

function PressureCalc({ system }: { system: System }) {
  const [R, setR] = useState(4500);
  const [t, setT] = useState(4);
  const [pu, setPu] = useState(0.35);
  const [rho, setRho] = useState(1141);
  const [h, setH] = useState(20_000);
  const [n, setN] = useState(3);
  const head = hydrostaticHead(rho, n, h);
  const p = pu + head;
  const s = thinWall(p, R, t);
  return (
    <Calc
      id="pressure"
      title="Thin-wall pressure vessel"
      intro="Hoop, axial and dome stress at the depth you choose, with hydrostatic head that grows with acceleration. Defaults: LOX, 20 m of liquid, 3 g."
      formula={
        <Formula
          tex="p = p_\text{ullage} + \rho\, n\, g\, h, \quad \sigma_\text{hoop} = \frac{pR}{t}, \quad \sigma_\text{axial} = \sigma_\text{dome} = \frac{pR}{2t}"
          vars={[
            v("p_\\text{ullage}", "gas pressure above the liquid", unitOf("pressure", system)),
            v("\\rho", "liquid density", unitOf("density", system)),
            v("n", "load factor", "g's"),
            v("g", "9.81", "m/s²"),
            v("h", "liquid height above the point", unitOf("height", system)),
            v("R, t", "radius and wall thickness", unitOf("length", system)),
          ]}
        />
      }
      inputs={
        <>
          <NumField label="Radius R" q="length" system={system} value={R} onChange={setR} />
          <NumField label="Wall t" q="length" system={system} value={t} onChange={setT} />
          <NumField label="Ullage pressure" q="pressure" system={system} value={pu} onChange={setPu} />
          <NumField label="Liquid density ρ" q="density" system={system} value={rho} onChange={setRho} />
          <NumField label="Liquid height h" q="height" system={system} value={h} onChange={setH} />
          <NumField label="Load factor n (g's)" system={system} value={n} onChange={setN} step={0.1} />
        </>
      }
      steps={[
        `p_\\text{hydro} = ${tex(rho)} \\times ${tex(n)} \\times 9.81 \\times ${tex(h / 1000)}\\ \\text{m} = ${tex(head * 1e6)}\\ \\text{Pa} = ${tex(head)}\\ \\text{MPa}`,
        `p = ${tex(pu)} + ${tex(head)} = ${tex(p)}\\ \\text{MPa}`,
        `\\sigma_\\text{hoop} = \\frac{${tex(p)} \\times ${tex(R)}}{${tex(t)}} = ${tex(s.hoop)}\\ \\text{MPa}`,
        `\\sigma_\\text{axial} = \\sigma_\\text{dome} = \\frac{${tex(p)} \\times ${tex(R)}}{2 \\times ${tex(t)}} = ${tex(s.axial)}\\ \\text{MPa}`,
      ]}
      outputs={
        <>
          <Out label="Hydrostatic head" si={head} q="pressure" system={system} />
          <Out label="Total pressure" si={p} q="pressure" system={system} />
          <Out label="Hoop stress" si={s.hoop} q="stress" system={system} />
          <Out label="Axial / dome stress" si={s.axial} q="stress" system={system} />
        </>
      }
    />
  );
}

function ThicknessCalc({ system }: { system: System }) {
  const [p, setP] = useState(0.35);
  const [R, setR] = useState(4500);
  const [fs, setFs] = useState(1.25);
  const [allow, setAllow] = useState(500);
  const t = requiredThickness(p, R, fs, allow);
  return (
    <Calc
      id="thickness"
      title="Required wall thickness"
      intro="Minimum wall from hoop stress. The default allowable is a made-up practice value."
      formula={
        <Formula
          tex="t = \frac{FS \times p \times R}{\sigma_\text{allow}}"
          vars={[v("p", "design pressure", unitOf("pressure", system)), v("R", "radius", unitOf("length", system)), v("FS", "factor of safety", "—"), v("\\sigma_\\text{allow}", "allowable stress", unitOf("stress", system))]}
        />
      }
      inputs={
        <>
          <NumField label="Pressure" q="pressure" system={system} value={p} onChange={setP} />
          <NumField label="Radius R" q="length" system={system} value={R} onChange={setR} />
          <NumField label="Factor of safety" system={system} value={fs} onChange={setFs} step={0.05} />
          <NumField label="Allowable (practice)" q="stress" system={system} value={allow} onChange={setAllow} />
        </>
      }
      steps={[`t = \\frac{${tex(fs)} \\times ${tex(p)} \\times ${tex(R)}}{${tex(allow)}} = ${tex(t)}\\ \\text{mm}`]}
      outputs={<Out label="Minimum wall thickness" si={t} q="length" system={system} />}
    />
  );
}

function ColumnCalc({ system }: { system: System }) {
  const [E, setE] = useState(193_000);
  const [sy, setSy] = useState(300);
  const [A, setA] = useState(301.6);
  const [I, setI] = useState(87_000);
  const [L, setL] = useState(1500);
  const [end, setEnd] = useState<EndCondition>("pinned-pinned");
  const K = endConditionK[end];
  const c = columnBuckling(E, sy, A, I, K, L);
  const maxS = Math.max(200, c.slenderness * 1.3, c.transition * 1.6);
  const pts = Array.from({ length: 121 }, (_, i) => (maxS * i) / 120);
  const euler = pts.filter((s) => s > 0).map((s) => [s, Math.min((Math.PI ** 2 * E) / (s * s), sy * 1.6)] as [number, number]);
  const combined = pts.map((s) => [s, columnCriticalStress(E, sy, s).stress] as [number, number]);
  const yUnit = unitOf("stress", system);
  const conv = (pairs: [number, number][]) => pairs.map(([x, y]) => [x, fromSI(y, "stress", system)] as [number, number]);
  return (
    <Calc
      id="column"
      title="Euler and Johnson column buckling"
      intro="Euler for slender columns, the Johnson parabola below the transition slenderness. Defaults: a 50 mm × 2 mm stainless tube, practice yield 300 MPa."
      formula={
        <>
          <Formula
            label="Euler (KL/r ≥ transition)"
            tex="\sigma_{cr} = \frac{\pi^2 E}{(KL/r)^2}, \qquad P_{cr} = \sigma_{cr} A = \frac{\pi^2 E I}{(KL)^2}"
            vars={[v("E", "Young's modulus", unitOf("modulus", system)), v("I", "second moment of area", unitOf("inertia", system)), v("A", "cross-section area", unitOf("area", system)), v("K", "end-condition factor", "—"), v("L", "length", unitOf("length", system)), v("r", "radius of gyration √(I/A)", unitOf("length", system))]}
          />
          <Formula
            label="Johnson (KL/r below transition)"
            tex="\sigma_{cr} = \sigma_y - \frac{\sigma_y^2}{4\pi^2 E}\left(\frac{KL}{r}\right)^2, \qquad \left(\frac{KL}{r}\right)_c = \sqrt{\frac{2\pi^2 E}{\sigma_y}}"
            vars={[v("\\sigma_y", "yield strength", unitOf("stress", system))]}
          />
        </>
      }
      inputs={
        <>
          <NumField label="E" q="modulus" system={system} value={E} onChange={setE} />
          <NumField label="Yield σy" q="stress" system={system} value={sy} onChange={setSy} />
          <NumField label="Area A" q="area" system={system} value={A} onChange={setA} />
          <NumField label="Inertia I" q="inertia" system={system} value={I} onChange={setI} />
          <NumField label="Length L" q="length" system={system} value={L} onChange={setL} />
          <label className="field">
            <span>End condition</span>
            <select className="select" value={end} onChange={(e) => setEnd(e.target.value as EndCondition)}>
              {Object.entries(endConditionK).map(([name, k]) => (
                <option key={name} value={name}>
                  {name} (K = {k})
                </option>
              ))}
            </select>
          </label>
        </>
      }
      steps={[
        `r = \\sqrt{\\frac{${tex(I)}}{${tex(A)}}} = ${tex(c.r)}\\ \\text{mm}, \\qquad \\frac{KL}{r} = \\frac{${tex(K)} \\times ${tex(L)}}{${tex(c.r)}} = ${tex(c.slenderness)}`,
        `\\left(\\frac{KL}{r}\\right)_c = \\sqrt{\\frac{2\\pi^2 \\times ${tex(E)}}{${tex(sy)}}} = ${tex(c.transition)} \\;\\Rightarrow\\; \\text{${c.regime}}`,
        c.regime === "Euler"
          ? `\\sigma_{cr} = \\frac{\\pi^2 \\times ${tex(E)}}{${tex(c.slenderness)}^2} = ${tex(c.stress)}\\ \\text{MPa}`
          : `\\sigma_{cr} = ${tex(sy)} - \\frac{${tex(sy)}^2}{4\\pi^2 \\times ${tex(E)}} \\times ${tex(c.slenderness)}^2 = ${tex(c.stress)}\\ \\text{MPa}`,
        `P_{cr} = ${tex(c.stress)} \\times ${tex(A)} = ${tex(c.load)}\\ \\text{N}`,
      ]}
      outputs={
        <>
          <Out label="Slenderness KL/r" si={c.slenderness} system={system} />
          <Out label={`Critical stress (${c.regime})`} si={c.stress} q="stress" system={system} />
          <Out label="Critical load" si={c.load} q="force" system={system} />
        </>
      }
      extra={
        <LineChart
          title="Critical stress vs. slenderness ratio"
          xLabel="Slenderness ratio KL/r"
          yLabel={`Critical stress [${yUnit}]`}
          yMin={0}
          series={[
            { name: "Euler (elastic)", color: "var(--muted)", points: conv(euler), dashed: true },
            { name: "Design curve (Johnson + Euler)", color: "var(--accent)", points: conv(combined) },
          ]}
          markers={[
            { x: c.slenderness, y: fromSI(c.stress, "stress", system), label: "your column" },
            { x: c.transition, y: fromSI(sy / 2, "stress", system), label: "transition", color: "var(--phase-foundations)" },
          ]}
        />
      }
    />
  );
}

function CylinderCalc({ system }: { system: System }) {
  const [R, setR] = useState(4500);
  const [t, setT] = useState(4);
  const [E, setE] = useState(193_000);
  const [P, setP] = useState(2e6);
  const [p, setPr] = useState(0.35);
  const [fs, setFs] = useState(1.4);
  const b = cylinderBuckling(R, t, E);
  const area = 2 * Math.PI * R * t;
  const sNo = P / area;
  const relief = p * Math.PI * R * R;
  const sWith = (P - relief) / area;
  const msNo = marginOfSafety(b.sigmaDesign, sNo, fs);
  const msWith = sWith > 0 ? marginOfSafety(b.sigmaDesign, sWith, fs) : Infinity;
  return (
    <Calc
      id="cylinder"
      title="Thin-cylinder buckling (NASA SP-8007)"
      intro="Axial-compression buckling of an unstiffened cylinder with the SP-8007 knockdown, with and without internal pressure. Pressure is credited only through its end load; the extra SP-8007 pressure knockdown increase is conservatively ignored."
      formula={
        <Formula
          tex="\sigma_{cr} = 0.605\frac{Et}{R}, \quad \phi = \frac{1}{16}\sqrt{\frac{R}{t}}, \quad \gamma = 1 - 0.901(1 - e^{-\phi}), \quad \sigma_\text{applied} = \frac{P - p\pi R^2}{2\pi R t}"
          vars={[
            v("E", "Young's modulus", unitOf("modulus", system)),
            v("R, t", "radius and wall thickness", unitOf("length", system)),
            v("\\gamma", "knockdown factor", "—"),
            v("P", "applied axial compression", unitOf("force", system)),
            v("p", "internal pressure (0 for unpressurized)", unitOf("pressure", system)),
          ]}
        />
      }
      inputs={
        <>
          <NumField label="Radius R" q="length" system={system} value={R} onChange={setR} />
          <NumField label="Wall t" q="length" system={system} value={t} onChange={setT} />
          <NumField label="E" q="modulus" system={system} value={E} onChange={setE} />
          <NumField label="Axial compression P" q="force" system={system} value={P} onChange={setP} />
          <NumField label="Internal pressure p" q="pressure" system={system} value={p} onChange={setPr} />
          <NumField label="Factor of safety" system={system} value={fs} onChange={setFs} step={0.05} />
        </>
      }
      steps={[
        `\\sigma_{cr} = 0.605 \\times \\frac{${tex(E)} \\times ${tex(t)}}{${tex(R)}} = ${tex(b.sigmaCr)}\\ \\text{MPa}`,
        `\\phi = \\frac{1}{16}\\sqrt{\\frac{${tex(R)}}{${tex(t)}}} = ${tex(b.phi, 3)}, \\qquad \\gamma = 1 - 0.901\\,(1 - e^{-${tex(b.phi, 3)}}) = ${tex(b.gamma, 3)}`,
        `\\sigma_\\text{design} = ${tex(b.gamma, 3)} \\times ${tex(b.sigmaCr)} = ${tex(b.sigmaDesign)}\\ \\text{MPa}`,
        `\\text{No pressure: } \\sigma = \\frac{${tex(P)}}{2\\pi \\times ${tex(R)} \\times ${tex(t)}} = ${tex(sNo)}\\ \\text{MPa}`,
        `\\text{With pressure: } \\sigma = \\frac{${tex(P)} - ${tex(p)}\\,\\pi \\times ${tex(R)}^2}{2\\pi \\times ${tex(R)} \\times ${tex(t)}} = ${tex(sWith)}\\ \\text{MPa}`,
      ]}
      outputs={
        <>
          <Out label="Classical σcr" si={b.sigmaCr} q="stress" system={system} />
          <Out label="Knockdown γ" si={b.gamma} system={system} digits={3} />
          <Out label="Design σ" si={b.sigmaDesign} q="stress" system={system} />
          <MarginOut ms={msNo} label="Margin, unpressurized" />
          <MarginOut ms={msWith} label="Margin, pressurized" />
          {sWith <= 0 && <p className="hint">With pressure the wall is in net axial tension, so it can't buckle axially.</p>}
          {R / t > 1500 && <p className="hint neg">R/t is above 1500, outside the range of the SP-8007 knockdown curve.</p>}
        </>
      }
    />
  );
}

function ThermalCalc({ system }: { system: System }) {
  const [E, setE] = useState(193_000);
  const [alpha, setAlpha] = useState(17e-6);
  const [dT, setDT] = useState(200);
  const [nu, setNu] = useState(0.29);
  const [biaxial, setBiaxial] = useState(false);
  const base = thermalStress(E, alpha, dT);
  const s = biaxial ? base / (1 - nu) : base;
  return (
    <Calc
      id="thermal"
      title="Thermal stress"
      intro="Stress from blocked thermal expansion. Uniaxial: a bar between rigid walls. Biaxial: a plate restrained in both in-plane directions."
      formula={
        <Formula
          tex={biaxial ? "\\sigma = \\frac{E\\,\\alpha\\,\\Delta T}{1 - \\nu}" : "\\sigma = E\\,\\alpha\\,\\Delta T"}
          vars={[v("E", "Young's modulus", unitOf("modulus", system)), v("\\alpha", "thermal expansion coefficient", unitOf("alpha", system)), v("\\Delta T", "temperature change", unitOf("deltaT", system)), v("\\nu", "Poisson's ratio", "—")]}
        />
      }
      inputs={
        <>
          <NumField label="E" q="modulus" system={system} value={E} onChange={setE} />
          <NumField label="α" q="alpha" system={system} value={alpha} onChange={setAlpha} />
          <NumField label="ΔT" q="deltaT" system={system} value={dT} onChange={setDT} />
          <NumField label="Poisson's ratio ν" system={system} value={nu} onChange={setNu} step={0.01} />
          <div className="seg" role="group" aria-label="Constraint">
            <button type="button" aria-pressed={!biaxial} onClick={() => setBiaxial(false)}>
              Uniaxial
            </button>
            <button type="button" aria-pressed={biaxial} onClick={() => setBiaxial(true)}>
              Biaxial
            </button>
          </div>
        </>
      }
      steps={[
        biaxial
          ? `\\sigma = \\frac{${tex(E)} \\times ${tex(alpha)} \\times ${tex(dT)}}{1 - ${tex(nu)}} = ${tex(s)}\\ \\text{MPa}`
          : `\\sigma = ${tex(E)} \\times ${tex(alpha)} \\times ${tex(dT)} = ${tex(s)}\\ \\text{MPa}`,
      ]}
      outputs={<Out label="Thermal stress" si={s} q="stress" system={system} />}
    />
  );
}

function BoltCalc({ system }: { system: System }) {
  const [mode, setMode] = useState<"torque" | "preload">("torque");
  const [T, setT] = useState(100);
  const [F, setF] = useState(39_370);
  const [K, setK] = useState(0.2);
  const [d, setD] = useState(12.7);
  const preload = preloadFromTorque(T, K, d);
  const torque = torqueFromPreload(F, K, d);
  return (
    <Calc
      id="bolt"
      title="Bolt torque ↔ preload"
      intro="The short-form torque equation. K lumps thread and under-head friction (about 0.2 for dry steel), so real preload scatters widely around this value."
      formula={
        <Formula
          tex="T = K\,F\,d \qquad\Longleftrightarrow\qquad F = \frac{T}{K\,d}"
          vars={[v("T", "installation torque", unitOf("torque", system)), v("K", "nut factor", "—"), v("F", "preload", unitOf("force", system)), v("d", "nominal diameter", unitOf("length", system))]}
        />
      }
      inputs={
        <>
          <div className="seg" role="group" aria-label="Solve for">
            <button type="button" aria-pressed={mode === "torque"} onClick={() => setMode("torque")}>
              Torque → preload
            </button>
            <button type="button" aria-pressed={mode === "preload"} onClick={() => setMode("preload")}>
              Preload → torque
            </button>
          </div>
          {mode === "torque" ? (
            <NumField label="Torque T" q="torque" system={system} value={T} onChange={setT} />
          ) : (
            <NumField label="Preload F" q="force" system={system} value={F} onChange={setF} />
          )}
          <NumField label="Nut factor K" system={system} value={K} onChange={setK} step={0.01} />
          <NumField label="Diameter d" q="length" system={system} value={d} onChange={setD} />
        </>
      }
      steps={[
        mode === "torque"
          ? `F = \\frac{${tex(T)}\\ \\text{N·m}}{${tex(K)} \\times ${tex(d / 1000)}\\ \\text{m}} = ${tex(preload)}\\ \\text{N}`
          : `T = ${tex(K)} \\times ${tex(F)}\\ \\text{N} \\times ${tex(d / 1000)}\\ \\text{m} = ${tex(torque)}\\ \\text{N·m}`,
      ]}
      outputs={mode === "torque" ? <Out label="Preload" si={preload} q="force" system={system} /> : <Out label="Torque" si={torque} q="torque" system={system} />}
    />
  );
}

function MinerCalc({ system }: { system: System }) {
  const [rows, setRows] = useState([
    { name: "Block 1", n: 1000, N: 10_000 },
    { name: "Block 2", n: 50, N: 500 },
  ]);
  const D = minersDamage(rows);
  const update = (i: number, patch: Partial<(typeof rows)[number]>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  return (
    <Calc
      id="miner"
      title="Miner's rule damage"
      intro="Linear cumulative damage over load blocks. N comes from the S-N curve at each block's stress level. Treat each set of rows as one flight to see how many flights reach D = 1."
      formula={<Formula tex="D = \sum_i \frac{n_i}{N_i}, \qquad \text{failure predicted at } D \geq 1" vars={[v("n_i", "cycles applied in block i", "cycles"), v("N_i", "cycles to failure at that stress", "cycles")]} />}
      inputs={
        <div className="stack" style={{ gap: 10, gridColumn: "1 / -1" }}>
          {rows.map((row, i) => (
            <div key={i} className="miner-row">
              <label className="field">
                <span>Block</span>
                <input className="input" value={row.name} onChange={(e) => update(i, { name: e.target.value })} />
              </label>
              <NumField label="n (applied)" system={system} value={row.n} onChange={(n) => update(i, { n })} />
              <NumField label="N (to failure)" system={system} value={row.N} onChange={(N) => update(i, { N })} />
              <button type="button" className="btn small ghost" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label={`Remove ${row.name}`} disabled={rows.length === 1}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn small" style={{ justifySelf: "start" }} onClick={() => setRows((r) => [...r, { name: `Block ${r.length + 1}`, n: 100, N: 100_000 }])}>
            Add block
          </button>
        </div>
      }
      steps={[`D = ${rows.map((r) => `\\frac{${tex(r.n)}}{${tex(r.N)}}`).join(" + ")} = ${rows.map((r) => tex(r.n / r.N, 3)).join(" + ")} = ${tex(D, 4)}`]}
      outputs={
        <>
          <div className="out">
            <span className="eyebrow">Damage D</span>
            <span className={`num out-value ${D < 1 ? "pos" : "neg"}`}>{fmt(D, 4)}</span>
            <span className="out-si">{D < 1 ? "Below 1: no failure predicted" : "At or above 1: failure predicted"}</span>
          </div>
          <Out label="Repeats of this spectrum to D = 1" si={1 / D} system={system} digits={4} />
        </>
      }
    />
  );
}

const calcs = [
  ["margin", "Margin of safety"],
  ["pressure", "Pressure vessel"],
  ["thickness", "Wall thickness"],
  ["column", "Column buckling"],
  ["cylinder", "Cylinder buckling"],
  ["thermal", "Thermal stress"],
  ["bolt", "Bolt torque"],
  ["miner", "Miner's rule"],
] as const;

export function Calculators() {
  const [system, setSystem] = useSystem();
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Calculators</span>
        <h1>Hand-calc toolkit</h1>
        <p className="lede">Live as you type, with the formula, the substituted numbers and the result. Math is always shown in SI (MPa, mm, N); US inputs are converted first.</p>
      </header>
      <div className="calc-toolbar">
        <UnitToggle system={system} onChange={setSystem} />
        <nav className="row" aria-label="Calculators" style={{ gap: 6 }}>
          {calcs.map(([id, label]) => (
            <a key={id} className="tag" href={`#calc-${id}`} onClick={(e) => (e.preventDefault(), document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }))}>
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="stack-lg">
        <MarginCalc system={system} />
        <PressureCalc system={system} />
        <ThicknessCalc system={system} />
        <ColumnCalc system={system} />
        <CylinderCalc system={system} />
        <ThermalCalc system={system} />
        <BoltCalc system={system} />
        <MinerCalc system={system} />
      </div>
    </div>
  );
}
