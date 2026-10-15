import { useMemo, useState } from "react";
import { capstone, capstoneDefaults, capstoneMinThickness, type CapstoneInputs } from "../calc/structures";
import { fmt, signed } from "../calc/units";
import { LineChart } from "../components/Chart";
import { CheckItem } from "../components/Checks";
import { Icon } from "../components/Icon";
import { Rich, Tex } from "../components/Tex";
import { capstoneSpec } from "../data/plan";
import { checkAnswer, rowKey } from "../lib/answerCheck";
import { setCapstoneEntry, setCheck, useProgress } from "../lib/store";

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
- Factors of safety: 1.25 yield, 1.4 ultimate, 1.4 buckling (on the destabilizing load only; relieving pressure at its minimum guaranteed value, unfactored), 1.0 yield at proof
- Limit load = maximum expected in service; ultimate load = limit × FS. 30 MN and 2 MN are limit loads.
- Load cases: (1) proof 1.25 × MEOP ≈ 1.277 MPa, no yield at proof; (2) flight 0.35 MPa ullage + LOX head at 3 g over 20 m (MEOP ≈ 1.022 MPa) + 30 MN; (3) handling 2 MN; (4, stretch) max-Q P_eq
- Simplifications: membrane stresses only, head ignored for axial stress, no SP-8007 pressure Δγ credit, ...

## 3. Hand calcs
- Hoop/axial stress per load case (equations, numbers, units)
- Buckling: σcr, γ, σdesign, P_allow; P_net = FS × P − p_min πR²; MS = P_allow / P_net − 1
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
- Mass vs. ring frame count; why unstiffened buckling ignores frame spacing (Batdorf Z)
- FEA buckling load factors for 0, 3 and 6 frames (stretch: stringers)

## 7. Recommendation
- Design choice and reasoning; open questions; next steps
`;

const ENTRY_TMIN = "tmin";
const ENTRY_T = "t-check";
const REVEALED = "cap-revealed";

/**
 * Answer check: you type your own minimum thickness and your margins at a thickness you choose. The page
 * says which are within 2% and only reveals the reference solution after you've entered numbers and confirmed.
 */
function AnswerCheck({ inputs }: { inputs: CapstoneInputs }) {
  const progress = useProgress();
  const entries = progress.capstone ?? {};
  const revealed = Boolean(progress.checks[REVEALED]);
  const [confirming, setConfirming] = useState(false);
  const tMin = useMemo(() => capstoneMinThickness(inputs), [inputs]);
  const tCheck = Number(entries[ENTRY_T]);
  const tValid = Number.isFinite(tCheck) && tCheck >= 1 && tCheck <= 60;
  const reference = tValid ? capstone({ ...inputs, t: tCheck }) : undefined;
  const rows = reference?.rows ?? capstone(inputs).rows;
  const keys = rows.map((row) => rowKey(row.loadCase, row.check));
  const filled = Boolean(entries[ENTRY_TMIN]?.trim()) && tValid && keys.every((key) => entries[key]?.trim());
  const verdict = (text: string | undefined, ref: number, kind: "value" | "margin") =>
    !text?.trim() ? undefined : checkAnswer(text, ref, kind) ? "pos" : "neg";
  const tMinVerdict = verdict(entries[ENTRY_TMIN], tMin, "value");
  const results = reference ? rows.map((row, i) => verdict(entries[keys[i]], row.ms, "margin")) : [];
  const right = [tMinVerdict, ...results].filter((v) => v === "pos").length;
  const answered = [tMinVerdict, ...results].filter(Boolean).length;

  return (
    <section className="card" style={{ marginTop: 24 }} aria-labelledby="check-h">
      <div className="card-title">
        <h2 id="check-h">Answer check</h2>
        <span className="tag accent">practice values</span>
      </div>
      <p className="hint" style={{ marginBottom: 12 }}>
        Do the hand calcs in Python first. Then type your minimum thickness and your margins here. Each answer is marked as within 2% or not (margins are compared
        as capacity ratios, <Tex tex="1 + MS" />). Type <code>n/a</code> for a buckling check in net tension. Your entries are saved with your progress and
        included in export.
      </p>
      <div className="inputs" style={{ maxWidth: 560 }}>
        <label className="field">
          <span>Your minimum thickness with MS ≥ 0 everywhere [mm]</span>
          <input className={`input ${tMinVerdict ?? ""}`} inputMode="decimal" value={entries[ENTRY_TMIN] ?? ""} onChange={(e) => setCapstoneEntry(ENTRY_TMIN, e.target.value)} />
        </label>
        <label className="field">
          <span>Thickness for your margins table, t [mm]</span>
          <input className="input" inputMode="decimal" value={entries[ENTRY_T] ?? ""} placeholder="e.g. 12" onChange={(e) => setCapstoneEntry(ENTRY_T, e.target.value)} />
        </label>
      </div>
      {tMinVerdict && (
        <p className={`check-verdict ${tMinVerdict}`} role="status">
          Minimum thickness: {tMinVerdict === "pos" ? "within 2%" : "not within 2%. Recheck which case governs."}
        </p>
      )}
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="data">
          <caption className="sr-only">Your margins of safety for each load case</caption>
          <thead>
            <tr>
              <th scope="col">Load case</th>
              <th scope="col">Check</th>
              <th scope="col">FS</th>
              <th scope="col">Your MS{tValid ? ` at t = ${tCheck} mm` : ""}</th>
              <th scope="col">Within 2%?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={keys[i]}>
                <td>{row.loadCase}</td>
                <td>
                  {row.check}
                  {row.note ? <span className="hint"> ({row.note})</span> : null}
                </td>
                <td className="num">{row.fs}</td>
                <td>
                  <input
                    className="input"
                    style={{ minWidth: 90 }}
                    inputMode="decimal"
                    aria-label={`Your margin: ${row.loadCase}, ${row.check}`}
                    value={entries[keys[i]] ?? ""}
                    onChange={(e) => setCapstoneEntry(keys[i], e.target.value)}
                  />
                </td>
                <td>{!tValid ? "—" : results[i] === "pos" ? <span className="pill-pos">yes</span> : results[i] === "neg" ? <span className="pill-neg">no</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        {answered > 0 && (
          <span className="eyebrow" style={{ textTransform: "none", letterSpacing: 0 }}>
            {right} of {answered} answers within 2%
          </span>
        )}
        {!revealed &&
          (confirming ? (
            <>
              <span className="hint">Reveal the reference table, minimum t and plots?</span>
              <button type="button" className="btn small primary" onClick={() => (setCheck(REVEALED, true), setConfirming(false))}>
                Yes, reveal
              </button>
              <button type="button" className="btn small ghost" onClick={() => setConfirming(false)}>
                Not yet
              </button>
            </>
          ) : (
            <button type="button" className="btn small" disabled={!filled} onClick={() => setConfirming(true)} title={filled ? undefined : "Enter all your numbers first"}>
              <Icon name="lock" /> Reveal reference solution
            </button>
          ))}
        {revealed && (
          <button type="button" className="btn small ghost" onClick={() => setCheck(REVEALED, false)}>
            Hide reference solution
          </button>
        )}
      </div>
      {!filled && !revealed && <p className="hint" style={{ marginTop: 6 }}>The reveal button unlocks once you've entered your minimum thickness, a thickness, and every margin.</p>}
    </section>
  );
}

export function Capstone() {
  const progress = useProgress();
  const revealed = Boolean(progress.checks[REVEALED]);
  const [t, setT] = useState(12);
  const [frames, setFrames] = useState(3);
  const [includeMaxQ, setIncludeMaxQ] = useState(false);
  const [copied, setCopied] = useState(false);
  const base = useMemo(() => ({ ...capstoneDefaults, frames, includeMaxQ }), [frames, includeMaxQ]);
  const inputs = { ...base, t };
  const result = capstone(inputs);
  const tMin = useMemo(() => capstoneMinThickness(base), [base]);

  const sweep = useMemo(() => {
    const ts = Array.from({ length: 57 }, (_, i) => 2 + i * 0.25);
    return ts.map((tt) => {
      const r = capstone({ ...base, t: tt });
      return { t: tt, mass: r.mass, ms: Math.max(-1, Math.min(3, r.minMargin)) };
    });
  }, [base]);

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
            <Rich text={capstoneSpec.limitNote} />
          </p>
          <p className="hint" style={{ marginTop: 8 }}>
            {capstoneSpec.proofNote}
          </p>
          <p className="hint" style={{ marginTop: 8 }}>
            <strong>Factors of safety:</strong> {capstoneSpec.factors}.
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
          <label className="check" style={{ paddingLeft: 0 }}>
            <input type="checkbox" checked={includeMaxQ} onChange={(e) => setIncludeMaxQ(e.target.checked)} />
            <span className="check-text">Stretch goal: include case 4, max-Q bending (25 MN plus 30 MN·m, practice)</span>
          </label>
        </div>

        <div className="kpis">
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
            <span className="eyebrow">MEOP at section bottom</span>
            <span className="num out-value">
              {fmt(result.meop, 4)} <small>MPa</small>
            </span>
            <span className="out-si">0.35 ullage + {fmt(result.head, 4)} head</span>
          </div>
          <div className="out">
            <span className="eyebrow">Proof pressure</span>
            <span className="num out-value">
              {fmt(result.proofPressure, 4)} <small>MPa</small>
            </span>
            <span className="out-si">1.25 × MEOP, FS 1.0 on yield</span>
          </div>
          {revealed && (
            <div className="out">
              <span className="eyebrow">Minimum margin</span>
              <span className={`num out-value ${result.minMargin >= 0 ? "pos" : "neg"}`}>{signed(result.minMargin)}</span>
              <span className="out-si">at t = {t.toFixed(2)} mm</span>
            </div>
          )}
        </div>

        {!revealed ? (
          <p className="hint" style={{ marginTop: 16 }}>
            The margins table, minimum thickness and trade plots stay hidden until you've checked your own answers below.
          </p>
        ) : (
          <>
            <div className="row" style={{ marginTop: 16 }}>
              <button type="button" className="btn small" onClick={() => setT(Math.ceil(tMin * 20) / 20)}>
                Jump to minimum t ({fmt(tMin, 4)} mm)
              </button>
              <span className="out-si">
                Buckling σdesign = {fmt(result.buckle.sigmaDesign, 4)} MPa (γ = {fmt(result.buckle.gamma, 3)} × σcr {fmt(result.buckle.sigmaCr, 4)}), P_allow ={" "}
                {fmt(result.buckle.loadCapacity / 1e6, 4)} MN
              </span>
            </div>
            <div className="table-wrap" style={{ marginTop: 12 }}>
              <table className="data">
                <caption className="sr-only">Reference margins of safety for each load case</caption>
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
                      <td>
                        {row.check}
                        {row.note ? <span className="hint"> ({row.note})</span> : null}
                      </td>
                      <td className="num">{row.check.startsWith("Axial") && row.applied <= 0 ? "net tension" : fmt(row.applied, 4)}</td>
                      <td className="num">{fmt(row.allowable, 4)}</td>
                      <td className="num">{row.fs}</td>
                      <td>
                        <span className={row.ms >= 0 ? "pill-pos" : "pill-neg"}>{Number.isFinite(row.ms) ? signed(row.ms) : "n/a"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

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
              <strong>Proof:</strong> MEOP is the flight wall pressure at the bottom of the section. The proof pressure is 1.25 × MEOP, and it is checked for no
              yield at proof (FS 1.0), because the proof pressure already contains the proof factor.
            </p>
            <Tex display tex={`p_\\text{proof} = 1.25 \\times \\text{MEOP}, \\qquad MS = \\frac{\\sigma_y}{1.0 \\times \\sigma_{vm}\\!\\left(\\frac{p_\\text{proof} R}{t},\\, \\frac{p_\\text{proof} R}{2t}\\right)} - 1`} />
            <p>
              <strong>Buckling:</strong> SP-8007 knockdown on the classical stress gives the allowable load. The FS 1.4 multiplies the applied (destabilizing) load
              only. The relieving pressure end load uses the minimum guaranteed pressure and is never factored. Pressure is credited only through its end load, not
              the extra SP-8007 Δγ.
            </p>
            <Tex display tex={`P_\\text{net} = FS \\times P - p_\\text{min}\\,\\pi R^2, \\qquad P_\\text{allow} = 2\\pi R t\\,\\sigma_\\text{design}, \\qquad MS = \\frac{P_\\text{allow}}{P_\\text{net}} - 1`} />
            <p>If <Tex tex="P_\text{net} \le 0" /> the wall is in net tension and the buckling check is not applicable.</p>
            <p>
              <strong>Max-Q (stretch):</strong> axial force and bending become an equivalent axial load <Tex tex="P_\text{eq} = P + 2M/R" /> ={" "}
              {fmt(result.maxQEquivalent / 1e6, 4)} MN, checked like the flight case with ullage pressure only.
            </p>
            <p>
              <strong>Ring frames:</strong> each frame adds mass (<Tex tex="\rho \cdot 2\pi R \cdot A_f" /> with a practice frame area of {capstoneDefaults.frameArea} mm²). For axial
              compression of an unstiffened skin, the classical buckling stress barely depends on bay length once bays are long (Batdorf Z = {fmt(result.batdorfZ, 4)}{" "}
              here, well above about 2.85), so frames don't raise the hand-calc buckling margin. That's a real finding to discuss: frames matter for roundness,
              general instability and FEA mode shapes (compare 0, 3 and 6 frames in Week 11), and they change the margin once you add stringers.
            </p>
          </div>
        </details>

        {revealed && (
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
        )}
      </section>

      <AnswerCheck inputs={base} />

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
