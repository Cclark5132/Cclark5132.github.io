import { useMemo, useState } from "react";
import { capstone, capstoneDefaults, capstoneMinThickness } from "../calc/structures";
import { fmt, signed } from "../calc/units";
import { LineChart } from "../components/Chart";
import { CheckItem } from "../components/Checks";
import { Icon } from "../components/Icon";
import { Rich, Tex } from "../components/Tex";
import { capstoneSpec } from "../data/plan";

const reportOutline = `# Sizing a Booster-Style LOX Tank Barrel Section
Author: Charlie · Date: ____ · All loads and allowables are practice values, not SpaceX data.

## 1. Summary
- Recommended design: t = __ mm, __ ring frames, mass __ kg
- Minimum margin: __ (load case __, failure mode __)
- Hand calc vs. FEA agreement: __%

## 2. Assumptions
- Geometry: R = 4.5 m, L = 6 m, __ ring frames (frame section __ mm², practice value)
- Material: 304L-like, E = 193 GPa, ν = 0.29, ρ = 8000 kg/m³
- Practice allowables: yield 500 MPa, ultimate 700 MPa
- Factors of safety: 1.25 yield, 1.4 ultimate, __ buckling
- Load cases: (1) proof 0.45 MPa; (2) flight 0.35 MPa ullage + LOX head at 3 g over 20 m + 30 MN; (3) handling 2 MN
- Simplifications: membrane stresses only, head ignored for axial stress, no SP-8007 pressure Δγ credit, ...

## 3. Hand calcs
- Hoop/axial stress per load case (equations, numbers, units)
- Buckling: σcr, γ, σdesign; net compression with pressure relief
- Margins table

## 4. FEA
- Model: shells at midsurface, symmetry, mesh, BCs, loads (figure)
- Mesh convergence plot
- Static results (proof, flight); buckling results (handling, prestressed flight)

## 5. Comparison
| Quantity | Hand calc | FEA | Difference | Why |
|---|---|---|---|---|

## 6. Trade study
- Mass and minimum margin vs. thickness (plot)
- Effect of ring frame count (plot)

## 7. Recommendation
- Design choice and reasoning; open questions; next steps
`;

export function Capstone() {
  const [t, setT] = useState(12);
  const [frames, setFrames] = useState(3);
  const [copied, setCopied] = useState(false);
  const inputs = { ...capstoneDefaults, t, frames };
  const result = capstone(inputs);
  const tMin = useMemo(() => capstoneMinThickness({ ...capstoneDefaults, frames }), [frames]);

  const sweep = useMemo(() => {
    const ts = Array.from({ length: 57 }, (_, i) => 2 + i * 0.25);
    return ts.map((tt) => {
      const r = capstone({ ...capstoneDefaults, t: tt, frames });
      return { t: tt, mass: r.mass, ms: Math.max(-1, Math.min(3, r.minMargin)) };
    });
  }, [frames]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportOutline);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Capstone · Weeks 10–11 · Dec 21 – Jan 3</span>
        <h1>{capstoneSpec.title}</h1>
        <p className="lede">{capstoneSpec.intro}</p>
        <p className="practice-banner">
          <strong>Practice values only.</strong> {capstoneSpec.warning}
        </p>
      </header>

      <div className="grid-auto">
        <section className="card">
          <div className="card-title">
            <h2>Geometry</h2>
          </div>
          <ul className="bullets">
            {capstoneSpec.geometry.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="card-title">
            <h2>Materials</h2>
            <span className="tag">practice</span>
          </div>
          <ul className="bullets">
            {capstoneSpec.materials.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="card-title">
            <h2>Load cases</h2>
            <span className="tag">practice</span>
          </div>
          <ol className="bullets">
            {capstoneSpec.loadCases.map((g) => (
              <li key={g}>
                <Rich text={g} />
              </li>
            ))}
          </ol>
          <p className="hint" style={{ marginTop: 8 }}>
            Factors of safety: {capstoneSpec.factors}.
          </p>
        </section>
      </div>

      <section className="card" style={{ marginTop: 24 }} aria-labelledby="panel-h">
        <div className="card-title">
          <h2 id="panel-h">Hand-calc panel</h2>
          <span className="tag accent">practice values</span>
        </div>
        <div className="capstone-controls">
          <label className="field">
            <span>
              Wall thickness t: <strong className="num">{t.toFixed(2)} mm</strong>
            </span>
            <input type="range" min={2} max={16} step={0.05} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="Wall thickness in mm" />
          </label>
          <label className="field">
            <span>
              Ring frames: <strong className="num">{frames}</strong>
            </span>
            <input type="range" min={0} max={8} step={1} value={frames} onChange={(e) => setFrames(Number(e.target.value))} aria-label="Number of ring frames" />
          </label>
          <button type="button" className="btn small" onClick={() => setT(Math.ceil(tMin * 20) / 20)}>
            Jump to minimum t ({fmt(tMin, 4)} mm)
          </button>
        </div>

        <div className="kpis">
          <div className="out">
            <span className="eyebrow">Minimum margin</span>
            <span className={`num out-value ${result.minMargin >= 0 ? "pos" : "neg"}`}>{signed(result.minMargin)}</span>
          </div>
          <div className="out">
            <span className="eyebrow">Mass (skin + frames)</span>
            <span className="num out-value">
              {fmt(result.mass, 4)} <small>kg</small>
            </span>
            <span className="out-si">
              skin {fmt(result.skinMass, 4)} + frames {fmt(result.frameMass, 3)}
            </span>
          </div>
          <div className="out">
            <span className="eyebrow">Flight pressure at bottom</span>
            <span className="num out-value">
              {fmt(result.pBottom, 4)} <small>MPa</small>
            </span>
            <span className="out-si">0.35 ullage + {fmt(result.head, 4)} head</span>
          </div>
          <div className="out">
            <span className="eyebrow">Buckling σdesign</span>
            <span className="num out-value">
              {fmt(result.buckle.sigmaDesign, 4)} <small>MPa</small>
            </span>
            <span className="out-si">
              γ = {fmt(result.buckle.gamma, 3)} × σcr {fmt(result.buckle.sigmaCr, 4)}
            </span>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table className="data">
            <caption className="sr-only">Margins of safety for each load case</caption>
            <thead>
              <tr>
                <th scope="col">Load case</th>
                <th scope="col">Check</th>
                <th scope="col">Applied [MPa]</th>
                <th scope="col">Allowable [MPa]</th>
                <th scope="col">FS</th>
                <th scope="col">MS</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.loadCase + row.check}>
                  <td>{row.loadCase}</td>
                  <td>{row.check}</td>
                  <td className="num">{row.check.startsWith("Axial") && row.applied <= 0 ? "net tension" : fmt(row.applied, 4)}</td>
                  <td className="num">{fmt(row.allowable, 4)}</td>
                  <td className="num">{row.fs}</td>
                  <td>
                    <span className={row.ms >= 0 ? "pill-pos" : "pill-neg"}>{signed(row.ms)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="reveal" style={{ marginTop: 16 }}>
          <summary>How the panel calculates</summary>
          <div className="reveal-body prose">
            <p>
              <strong>Strength:</strong> von Mises of the membrane hoop and axial stresses, against yield with FS 1.25 and ultimate with FS 1.4. In the flight case, hoop
              stress uses ullage plus hydrostatic head at the bottom of the section; axial stress is the ullage end load minus the 30 MN compression (the head is
              ignored for axial stress, which is conservative).
            </p>
            <Tex display tex={`\\sigma_\\text{hoop} = \\frac{(p_u + \\rho n g h) R}{t}, \\qquad \\sigma_\\text{axial} = \\frac{p_u \\pi R^2 - P}{2\\pi R t}`} />
            <p>
              <strong>Buckling:</strong> SP-8007 knockdown on the classical stress, FS 1.4 (practice), against the net compressive stress. Pressure is credited only
              through its end load, not the extra SP-8007 Δγ.
            </p>
            <p>
              <strong>Ring frames:</strong> each frame adds mass (<Tex tex="\rho \cdot 2\pi R \cdot A_f" /> with a practice frame area of {capstoneDefaults.frameArea} mm²). For axial
              compression of an unstiffened skin, the classical buckling stress barely depends on bay length once bays are long (Batdorf Z = {fmt(result.batdorfZ, 4)}{" "}
              here, well above about 2.85), so frames don't raise the hand-calc buckling margin. That's a real finding to discuss: frames matter for roundness,
              general instability and FEA mode shapes, which your Ansys buckling runs will show.
            </p>
          </div>
        </details>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <LineChart
            title="Mass vs. wall thickness"
            xLabel="Wall thickness t [mm]"
            yLabel="Mass [kg]"
            series={[{ name: `Mass (${frames} frames)`, color: "var(--phase-foundations)", points: sweep.map((p) => [p.t, p.mass]) }]}
            markers={[{ x: t, y: result.mass, label: `${fmt(result.mass, 3)} kg` }]}
          />
          <LineChart
            title="Minimum margin vs. wall thickness"
            xLabel="Wall thickness t [mm]"
            yLabel="Minimum MS (clipped −1 to 3)"
            zeroLine
            series={[{ name: "Minimum margin", color: "var(--accent)", points: sweep.map((p) => [p.t, p.ms]) }]}
            markers={[
              { x: t, y: Math.max(-1, Math.min(3, result.minMargin)), label: signed(result.minMargin, 2) },
              { x: tMin, y: 0, label: `MS = 0 at ${fmt(tMin, 3)} mm`, color: "var(--good)" },
            ]}
          />
        </div>
      </section>

      <section style={{ marginTop: 28 }} aria-labelledby="steps-h">
        <h2 id="steps-h" className="section-h">
          Steps
        </h2>
        <div className="grid-auto">
          {capstoneSpec.steps.map((step, i) => (
            <article key={step.title} className="card">
              <div className="card-title">
                <h3>
                  <span className="num" style={{ color: "var(--accent)" }}>
                    {i + 1}.
                  </span>{" "}
                  {step.title}
                </h3>
                <span className="tag">Week {i < 3 ? 10 : 11}</span>
              </div>
              <p className="hint" style={{ marginBottom: 8 }}>
                {step.body}
              </p>
              {step.checklist.map((item, j) => (
                <CheckItem key={j} id={`cap-${i}-${j}`}>
                  {item}
                </CheckItem>
              ))}
            </article>
          ))}
        </div>
      </section>

      <div className="grid-auto" style={{ marginTop: 24 }}>
        <section className="card">
          <div className="card-title">
            <h2>What good looks like</h2>
          </div>
          <ul className="bullets">
            {capstoneSpec.goodLooksLike.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="card-title">
            <h2>Report outline</h2>
            <button type="button" className="btn small" onClick={copy}>
              <Icon name="copy" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="outline">{reportOutline}</pre>
        </section>
      </div>
    </div>
  );
}
