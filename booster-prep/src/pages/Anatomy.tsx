import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Part {
  id: string;
  name: string;
  does: string;
  loads: string[];
  lesson?: [string, string];
}

/* General descriptions of a generic super heavy booster, from public information only. */
const parts: Part[] = [
  {
    id: "hsr",
    name: "Hot-staging ring",
    does:
      "A vented ring on top of the booster. The upper stage lights its engines while still attached, and the vents let that exhaust escape sideways. On the V3 booster the ring is attached to the top of the booster; on V2 it was a separate interstage that was jettisoned after staging (Space.com, May 14, 2026).",
    loads: ["Axial compression from the upper stage stacked on top", "Upper-stage engine plume: heating and pressure on the dome below", "Bending from aerodynamic loads through the stack joint"],
  },
  {
    id: "fins",
    name: "Grid fins",
    does:
      "Lattice-shaped control surfaces near the top that steer the booster during its return. The V3 booster has three grid fins, each about 50% larger than V2's four and mounted lower on the booster (Space.com, May 14, 2026). The drawing shows a generic pair.",
    loads: ["Aerodynamic forces and hinge moments fed into local frames", "Actuator reactions", "Concentrated loads the barrel wall has to spread out: fewer, larger fins means larger loads at each attachment"],
  },
  {
    id: "hard",
    name: "Catch hardpoints",
    does: "Strong points near the top that rest on the tower's catch arms (the \"chopsticks\") when the booster is caught.",
    loads: ["The booster's whole weight, concentrated at a few points", "Dynamic impact loads at catch", "Local bending and shear into surrounding frames and skin"],
    lesson: ["stiffeners-kt-gdt", "Stiffeners and Kt"],
  },
  {
    id: "ch4",
    name: "Methane tank",
    does: "Holds liquid methane fuel above the LOX tank. Ullage gas pressure keeps the wall in tension.",
    loads: ["Internal pressure: hoop stress pR/t", "Axial compression from thrust and the mass above", "Bending at max-Q", "Thermal stress from cryogenic propellant"],
    lesson: ["pressure-vessels", "Pressure vessels"],
  },
  {
    id: "dome",
    name: "Common dome",
    does: "One dome that separates the methane and LOX tanks, so a single bulkhead does the job of two.",
    loads: ["The pressure difference between the two tanks, in whichever direction it acts", "Thermal stress: two cryogens at different temperatures on each side", "Discontinuity stresses where it joins the barrel"],
    lesson: ["pressure-vessels", "Pressure vessels"],
  },
  {
    id: "lox",
    name: "LOX tank",
    does: "Holds liquid oxygen, the larger share of propellant mass, in the lower part of the booster.",
    loads: ["Internal pressure plus hydrostatic head, highest at the bottom under acceleration", "Axial compression from thrust (relieved by pressure)", "Buckling during unpressurized handling", "Cyclic pressure: fatigue across many flights"],
    lesson: ["cylinder-buckling", "Cylinder buckling"],
  },
  {
    id: "down",
    name: "Downcomer",
    does:
      "A pipe that carries methane from the upper tank down through the LOX tank to the engines. V3's redesigned fuel transfer tube is roughly the size of a Falcon 9 first stage, so all 33 Raptor 3 engines can start together (Space.com, May 14, 2026).",
    loads: ["External pressure from the surrounding LOX (a buckling risk for the pipe)", "Thermal contraction relative to the tank", "Flow and acceleration loads; support reactions at the domes"],
    lesson: ["column-and-plate-buckling", "Buckling"],
  },
  {
    id: "chines",
    name: "Chines",
    does: "Long aerodynamic strakes along the side of the booster that affect its aerodynamics during descent.",
    loads: ["Aerodynamic pressure", "Local attachment loads into the barrel wall", "Differential thermal strain between the strake and the tank wall"],
  },
  {
    id: "thrust",
    name: "Thrust section and engine mounts",
    does: "The structure at the bottom that mounts the engines (33 Raptors) and spreads their concentrated thrust into the tank walls.",
    loads: ["Very large concentrated engine thrust, spread into the barrel", "Engine gimbal side loads", "Vibration and acoustic loads", "Fatigue from repeated firings"],
    lesson: ["welds-and-bolted-joints", "Welds and joints"],
  },
];

function Region({ id, active, onSelect, children, label }: { id: string; active: string; onSelect: (id: string) => void; children: ReactNode; label: string }) {
  return (
    <g
      className={`part${active === id ? " active" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-pressed={active === id}
      onClick={() => onSelect(id)}
      onMouseEnter={() => onSelect(id)}
      onFocus={() => onSelect(id)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(id))}
    >
      {children}
    </g>
  );
}

export function Anatomy() {
  const [active, setActive] = useState("lox");
  const part = parts.find((p) => p.id === active)!;
  const label = (id: string) => parts.find((p) => p.id === id)!.name;
  const L = 158; // left wall x
  const R = 262; // right wall x

  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Booster Anatomy · Week 12</span>
        <h1>A generic super heavy booster</h1>
        <p className="lede">
          Hover, tap or tab to each section to see what it does and what loads it carries. Roughly 70 m tall and 9 m in diameter (approx., public sources).
        </p>
        <p className="practice-banner">
          <strong>Simplified illustration.</strong> Proportions, part shapes and positions are schematic and generic, not a drawing of real hardware. V3 details come from public reporting (
          <a href="https://www.space.com/space-exploration/launches-spacecraft/the-worlds-biggest-rocket-how-spacexs-new-starship-v3-differs-from-its-predecessors" target="_blank" rel="noopener noreferrer">
            Space.com, May 14, 2026
          </a>
          ); V2 boosters differed (four smaller grid fins, a jettisoned hot-staging interstage).
        </p>
      </header>

      <div className="anatomy">
        <figure className="card anatomy-figure">
          <svg viewBox="0 0 462 940" role="group" aria-label="Simplified side view of a booster with selectable sections">
            {/* Hot-staging ring */}
            <Region id="hsr" active={active} onSelect={setActive} label={label("hsr")}>
              <rect x={L} y={30} width={R - L} height={50} rx={3} className="shape" />
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={L + 10 + i * 18.5} y={42} width={10} height={26} rx={2} className="vent" />
              ))}
            </Region>
            {/* Methane tank */}
            <Region id="ch4" active={active} onSelect={setActive} label={label("ch4")}>
              <path d={`M${L} 80 H${R} V340 Q210 370 ${L} 340 Z`} className="shape" />
              <text x={210} y={240} textAnchor="middle" className="part-label">
                CH₄
              </text>
            </Region>
            {/* Grid fins */}
            <Region id="fins" active={active} onSelect={setActive} label={label("fins")}>
              {[
                [L - 44, 92],
                [R + 4, 92],
              ].map(([x, y]) => (
                <g key={x}>
                  <rect x={x} y={y} width={40} height={52} className="shape" />
                  {[1, 2, 3].map((k) => (
                    <line key={`h${k}`} x1={x} x2={x + 40} y1={y + k * 13} y2={y + k * 13} className="lattice" />
                  ))}
                  {[1, 2].map((k) => (
                    <line key={`v${k}`} x1={x + k * 13.3} x2={x + k * 13.3} y1={y} y2={y + 52} className="lattice" />
                  ))}
                </g>
              ))}
            </Region>
            {/* Catch hardpoints */}
            <Region id="hard" active={active} onSelect={setActive} label={label("hard")}>
              <rect x={L - 16} y={160} width={16} height={22} rx={2} className="shape" />
              <rect x={R} y={160} width={16} height={22} rx={2} className="shape" />
            </Region>
            {/* LOX tank */}
            <Region id="lox" active={active} onSelect={setActive} label={label("lox")}>
              <path d={`M${L} 340 Q210 370 ${R} 340 V770 H${L} Z`} className="shape" />
              <text x={240} y={560} textAnchor="middle" className="part-label">
                LOX
              </text>
            </Region>
            {/* Common dome (drawn over the tanks) */}
            <Region id="dome" active={active} onSelect={setActive} label={label("dome")}>
              <path d={`M${L} 340 Q210 370 ${R} 340`} className="dome" />
              <path d={`M${L} 340 Q210 370 ${R} 340`} className="hit" />
            </Region>
            {/* Downcomer */}
            <Region id="down" active={active} onSelect={setActive} label={label("down")}>
              <rect x={203} y={356} width={14} height={414} rx={3} className="pipe" />
            </Region>
            {/* Chines */}
            <Region id="chines" active={active} onSelect={setActive} label={label("chines")}>
              <path d={`M${L} 560 L${L - 12} 585 L${L - 12} 760 L${L} 770 Z`} className="shape" />
              <path d={`M${R} 560 L${R + 12} 585 L${R + 12} 760 L${R} 770 Z`} className="shape" />
            </Region>
            {/* Thrust section and engines */}
            <Region id="thrust" active={active} onSelect={setActive} label={label("thrust")}>
              <rect x={L} y={770} width={R - L} height={90} className="shape" />
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i} d={`M${L + 14 + i * 19} 860 l-6 34 h20 l-6 -34 z`} className="engine" />
              ))}
              <text x={210} y={822} textAnchor="middle" className="part-label small">
                33 engines
              </text>
            </Region>
            {/* Callout labels */}
            {[
              ["hsr", 56, "Hot-staging ring"],
              ["fins", 118, "Grid fins"],
              ["hard", 174, "Catch hardpoints"],
              ["ch4", 260, "Methane tank"],
              ["dome", 352, "Common dome"],
              ["down", 470, "Downcomer"],
              ["lox", 640, "LOX tank"],
              ["chines", 700, "Chines"],
              ["thrust", 840, "Thrust section"],
            ].map(([id, y, text]) => (
              <g key={id as string} className={`callout${active === id ? " active" : ""}`} aria-hidden="true">
                <line x1={id === "fins" || id === "hard" || id === "chines" ? 306 : R + 4} x2={318} y1={Number(y)} y2={Number(y)} />
                <text x={322} y={Number(y) + 4}>
                  {text}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="hint">Simplified illustration. Not to scale.</figcaption>
        </figure>

        <section className="card anatomy-info" aria-live="polite">
          <span className="eyebrow">Selected section</span>
          <h2>{part.name}</h2>
          <p style={{ color: "var(--ink-soft)" }}>{part.does}</p>
          <h3 style={{ marginTop: 6 }}>Loads it carries</h3>
          <ul className="bullets">
            {part.loads.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          {part.lesson && (
            <Link to={`/lessons/${part.lesson[0]}`} className="btn small" style={{ justifySelf: "start" }}>
              Related lesson: {part.lesson[1]}
            </Link>
          )}
          <div className="part-list" role="list">
            {parts.map((p) => (
              <button key={p.id} type="button" role="listitem" className={`tag${p.id === active ? " accent" : ""}`} onClick={() => setActive(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
