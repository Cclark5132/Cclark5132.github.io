import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckItem } from "../components/Checks";
import { Formula } from "../components/Formula";
import { Rich, Tex } from "../components/Tex";
import { formulaNotes } from "../data/formulaNotes";
import { formulasFromSource, startedWeeks } from "../lib/cards";
import { localToday } from "../lib/schedule";
import { lessons } from "../lessons";

/** Every lesson <Formula>, grouped by week, for the printable sheet. */
export const sheet = lessons
  .map((lesson) => ({ week: lesson.week, title: lesson.title, formulas: formulasFromSource(lesson.source) }))
  .sort((a, b) => a.week - b.week);
const sheetWeeks = sheet.map((s) => s.week);

function SheetFormula({ label, tex, vars }: { label: string; tex: string; vars: [string, string, string][] }) {
  return (
    <div className="sheet-f">
      <div className="sheet-f-head">
        <strong>{label}</strong>
        {formulaNotes[label] && <span className="sheet-use"> · {formulaNotes[label]}</span>}
      </div>
      <Tex tex={tex} display />
      {vars.length > 0 && (
        <div className="sheet-vars">
          {vars.map(([sym, meaning, unit]) => (
            <span key={sym + meaning}>
              <Tex tex={sym} />
              <span className="sheet-meaning"> {meaning}</span>
              {unit && unit !== "—" ? ` [${unit}]` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** The one-page (two-sided) printable formula sheet, with a week filter. */
function FormulaSheet() {
  const today = localToday();
  const started = startedWeeks(today);
  const startedList = sheetWeeks.filter((w) => started.has(w));
  const [chosen, setChosen] = useState<number[]>(sheetWeeks);
  const toggle = (w: number) => setChosen((list) => (list.includes(w) ? list.filter((x) => x !== w) : [...list, w].sort((a, b) => a - b)));
  const shown = sheet.filter((s) => chosen.includes(s.week));
  return (
    <section aria-labelledby="sheet-h" className="formula-sheet-wrap">
      <div className="row no-print" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <h2 id="sheet-h" className="section-h" style={{ margin: 0 }}>
          Formula sheet
        </h2>
        <button type="button" className="btn primary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
      <div className="row no-print sheet-filter" role="group" aria-label="Weeks to print">
        <span className="eyebrow">Weeks</span>
        {sheetWeeks.map((w) => (
          <button key={w} type="button" className={`btn small${chosen.includes(w) ? "" : " ghost"}`} aria-pressed={chosen.includes(w)} onClick={() => toggle(w)}>
            {w}
          </button>
        ))}
        <button type="button" className="btn small ghost" onClick={() => setChosen(sheetWeeks)}>
          All
        </button>
        <button type="button" className="btn small ghost" disabled={!startedList.length} onClick={() => setChosen(startedList)}>
          Weeks so far
        </button>
      </div>
      <p className="hint no-print" style={{ margin: "8px 0 14px" }}>
        Every lesson formula, with symbols, units and when to use it. Prints on two sides of US Letter; in the print dialog, choose Letter and default margins.
      </p>
      <div className="print-only sheet-title">
        Booster Prep formula sheet · Weeks {shown.map((s) => s.week).join(", ")}
      </div>
      <div className="formula-sheet" data-testid="formula-sheet">
        {shown.map((s) => (
          <section key={s.week} className="sheet-week">
            <h3>
              Week {s.week} · {s.title}
            </h3>
            {s.formulas.map((f) => (
              <SheetFormula key={f.label} label={f.label} tex={f.tex} vars={f.vars} />
            ))}
          </section>
        ))}
        <section className="sheet-week print-only">
          <h3>Unit conversions</h3>
          <div className="sheet-vars sheet-conv">
            {conversions.map(([a, b]) => (
              <span key={a}>
                {a} = {b}
              </span>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

/** Conversions an engineer moving between SI hand calcs and US-customary drawings uses every day. */
const conversions: [string, string][] = [
  ["1 ksi", "6.895 MPa"],
  ["1 MPa", "145.0 psi = 1 N/mm²"],
  ["1 psi", "6.895 kPa"],
  ["1 bar", "0.1 MPa = 14.50 psi"],
  ["1 in", "25.4 mm"],
  ["1 lbf", "4.448 N"],
  ["1 MN", "224,800 lbf (about 225 kip)"],
  ["1 in·lbf", "0.1130 N·m"],
  ["1 ft·lbf", "1.356 N·m"],
  ["1 lbm", "0.4536 kg"],
  ["1 lb/in³", "27,680 kg/m³"],
  ["1 g", "9.807 m/s²"],
  ["Temperature change of 1 °C", "1.8 °F (and 1 K)"],
  ["Absolute temperature", "K = °C + 273.15"],
];

const feaUnits: [string, string, string][] = [
  ["Length", "mm", "m"],
  ["Force", "N", "N"],
  ["Stress and modulus", "MPa (N/mm²)", "Pa"],
  ["Mass", "tonne (1000 kg)", "kg"],
  ["Density of steel", "7.9 × 10⁻⁹ t/mm³", "7900 kg/m³"],
  ["Gravity", "9807 mm/s²", "9.807 m/s²"],
];

/** Typical room-temperature values for annealed 304L. Strengths are ASTM A240 minimums. */
const steel: [string, string, string][] = [
  ["Young's modulus $E$", "193 GPa", "28.0 Msi"],
  ["Shear modulus $G = E / 2(1 + \\nu)$", "74.8 GPa", "10.8 Msi"],
  ["Poisson's ratio $\\nu$", "0.29", "0.29"],
  ["Density $\\rho$", "8000 kg/m³", "0.289 lb/in³"],
  ["Thermal expansion $\\alpha$ (0 to 100 °C)", "17.3 × 10⁻⁶ /°C", "9.6 × 10⁻⁶ /°F"],
  ["Yield strength $\\sigma_y$ (minimum)", "170 MPa", "25 ksi"],
  ["Ultimate strength $\\sigma_u$ (minimum)", "485 MPa", "70 ksi"],
  ["Elongation (minimum)", "40%", "40%"],
];

const ready: { text: string; to: string; where: string }[] = [
  { text: "Compute hoop and axial stress in a tank and its margin of safety", to: "/lessons/pressure-vessels", where: "Week 2 lesson" },
  { text: "Add hydrostatic head at a load factor to ullage pressure", to: "/calculators", where: "Calculators" },
  { text: "Find thermal stress in a restrained part going to cryogenic temperature", to: "/lessons/stainless-and-thermal-stress", where: "Week 3 lesson" },
  { text: "Explain a stress concentration and read a GD&T feature control frame", to: "/lessons/stiffeners-kt-gdt", where: "Week 4 lesson" },
  { text: "Pick Euler or Johnson for a column and find its critical load", to: "/lessons/column-and-plate-buckling", where: "Week 5 lesson" },
  { text: "Explain why thin cylinders need a knockdown factor and apply SP-8007", to: "/lessons/cylinder-buckling", where: "Week 6 lesson" },
  { text: "Size bolt preload from torque and check a weld", to: "/lessons/welds-and-bolted-joints", where: "Week 7 lesson" },
  { text: "Run Miner's rule and explain proof testing and leak before burst", to: "/lessons/fatigue-fracture-proof", where: "Week 8 lesson" },
  { text: "Build a shell model in Ansys with symmetry and run a mesh convergence study", to: "/tools/fea", where: "FEA practices" },
  { text: "Make an NX part and drawing with dimensions and GD&T", to: "/tools/nx", where: "NX track" },
  { text: "Write a tested Python function and push it to GitHub", to: "/tools/python", where: "Python track" },
  { text: "Name the booster's major structures and the loads each carries", to: "/anatomy", where: "Booster Anatomy" },
  { text: "Present the capstone in 5 slides and defend every assumption", to: "/capstone", where: "Capstone" },
  { text: "Convert psi, ksi, lbf and inches to SI without looking them up", to: "/reference", where: "This page" },
];

export function QuickRef() {
  return (
    <div className="content">
      <header className="page-head no-print">
        <span className="eyebrow">Quick reference</span>
        <h1>Cheat sheet and formula sheet</h1>
        <p className="lede">
          Every lesson formula on a printable two-sided sheet, plus units, margins, beam and shell formulas, 304L properties, and a checklist of what you should be able to do by January 11.
        </p>
      </header>

      <div className="stack-lg">
        <FormulaSheet />

        <section className="card no-print" aria-labelledby="ready-h">
          <div className="card-title">
            <h2 id="ready-h">Ready by January 11</h2>
            <span className="eyebrow">without notes</span>
          </div>
          {ready.map((item, i) => (
            <CheckItem key={i} id={`ready-${i}`}>
              {item.text} <Link to={item.to}>({item.where})</Link>
            </CheckItem>
          ))}
        </section>

        <section aria-labelledby="margins-h" className="no-print">
          <h2 id="margins-h" className="section-h">
            Margins and pressure terms
          </h2>
          <div className="grid-formulas">
            <Formula
              label="Margin of safety, yield and ultimate"
              tex="\begin{aligned} MS_y &= \frac{\sigma_y}{FS_y \cdot \sigma_\text{limit}} - 1 \\[4pt] MS_u &= \frac{\sigma_u}{FS_u \cdot \sigma_\text{limit}} - 1 \end{aligned}"
              vars="MS_y, MS_u | margins against yield and ultimate (report the lower one) | —; \sigma_y, \sigma_u | yield and ultimate allowables | MPa; FS_y, FS_u | yield and ultimate factors of safety | —; \sigma_\text{limit} | stress at limit load, the most expected in service | MPa"
            />
            <Formula
              label="Proof and burst pressure"
              tex="\begin{aligned} p_\text{proof} &= k_\text{proof} \cdot \text{MEOP} \\[4pt] p_\text{burst} &= k_\text{burst} \cdot \text{MEOP} \end{aligned}"
              vars="\text{MEOP} | maximum expected operating pressure | MPa; k_\text{proof} | proof factor from your requirements | —; k_\text{burst} | burst factor from your requirements | —"
            />
          </div>
          <p className="hint" style={{ marginTop: 12 }}>
            <Rich text="Factor values come from the program's requirements, such as NASA-STD-5001 for NASA structures and AIAA S-080 for metallic pressure vessels. Ask your team which apply in week one; don't assume a number." />
          </p>
        </section>

        <section aria-labelledby="beams-h" className="no-print">
          <h2 id="beams-h" className="section-h">
            Beams, torsion and the booster as a beam
          </h2>
          <div className="grid-formulas">
            <Formula
              label="Bending stress"
              tex="\sigma = \frac{M\,y}{I}"
              vars="\sigma | bending stress | MPa; M | bending moment | N·mm; y | distance from the neutral axis | mm; I | area moment of inertia | mm⁴"
            />
            <Formula
              label="Transverse shear stress"
              tex="\tau = \frac{V\,Q}{I\,b}"
              vars="\tau | shear stress | MPa; V | shear force | N; Q | first moment of the area beyond the cut | mm³; I | area moment of inertia | mm⁴; b | width at the cut | mm"
            />
            <Formula
              label="Torsion of a thin closed section (Bredt)"
              tex="q = \frac{T}{2A_m}, \qquad \tau = \frac{q}{t}"
              vars="q | shear flow | N/mm; T | torque | N·mm; A_m | area enclosed by the wall's midline | mm²; \tau | shear stress | MPa; t | wall thickness | mm"
            />
            <Formula
              label="Thin-walled cylinder section properties"
              tex="\begin{aligned} A &= 2\pi R t \\ I &= \pi R^3 t \\ J &= 2\pi R^3 t \end{aligned}"
              vars="A | wall area | mm²; I | area moment of inertia | mm⁴; J | polar moment | mm⁴; R | mean radius | mm; t | wall thickness | mm"
            />
            <Formula
              label="Bending stress in a thin cylinder"
              tex="\sigma_\text{max} = \frac{M R}{I} = \frac{M}{\pi R^2 t}"
              vars="\sigma_\text{max} | peak axial stress from bending | MPa; M | bending moment (wind, engine gimbal) | N·mm; R | mean radius | mm; t | wall thickness | mm"
            />
            <Formula
              label="Equivalent axial load for buckling"
              tex="P_\text{eq} = P + \frac{2M}{R}"
              vars="P_\text{eq} | axial load that gives the same peak line load | N; P | axial compression | N; M | bending moment | N·mm; R | mean radius | mm"
            />
          </div>
          <p className="hint" style={{ marginTop: 12 }}>
            <Rich text="Why it matters: a booster in flight is a beam. Bending adds compression on one side, so check buckling with $P_\text{eq}$, not just thrust." />
          </p>
        </section>

        <div className="grid-auto">
          <section className="card no-print" aria-labelledby="units-h">
            <div className="card-title">
              <h2 id="units-h">Unit conversions</h2>
            </div>
            <div className="table-wrap">
              <table className="data">
                <tbody>
                  {conversions.map(([a, b]) => (
                    <tr key={a}>
                      <td>{a}</td>
                      <td className="num">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card no-print" aria-labelledby="fea-units-h">
            <div className="card-title">
              <h2 id="fea-units-h">Consistent units for FEA</h2>
            </div>
            <p style={{ color: "var(--ink-soft)", marginBottom: 10 }}>
              FEA solvers don't know units. Pick one consistent set and stick to it. With mm and N, mass must be in tonnes, or dynamic and gravity results come out 1000× wrong.
            </p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">Quantity</th>
                    <th scope="col">mm–N–t–s</th>
                    <th scope="col">m–N–kg–s</th>
                  </tr>
                </thead>
                <tbody>
                  {feaUnits.map(([q, a, b]) => (
                    <tr key={q}>
                      <td>{q}</td>
                      <td className="num">{a}</td>
                      <td className="num">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="card no-print" aria-labelledby="steel-h">
          <div className="card-title">
            <h2 id="steel-h">304L stainless at room temperature</h2>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">SI</th>
                  <th scope="col">US</th>
                </tr>
              </thead>
              <tbody>
                {steel.map(([p, si, us]) => (
                  <tr key={p}>
                    <td>
                      <Rich text={p} />
                    </td>
                    <td className="num">{si}</td>
                    <td className="num">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>
            Annealed sheet and plate; strengths are ASTM A240 minimums. Strength rises a lot at cryogenic temperature, and Starship's exact alloys and allowables aren't
            public, so use these for practice only. For design, use MMPDS or your team's database.
          </p>
        </section>
      </div>
    </div>
  );
}
