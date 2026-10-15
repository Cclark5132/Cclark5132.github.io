import { useId, useState } from "react";
import { fromSI, toSI, unitOf, type Quantity, type System } from "../calc/units";

/** A number input that shows the value in the chosen unit system and reports it back in SI. */
export function NumField({
  label,
  value,
  onChange,
  q = "none",
  system,
  step,
  min,
}: {
  label: string;
  value: number;
  onChange: (si: number) => void;
  q?: Quantity;
  system: System;
  step?: number;
  min?: number;
}) {
  const id = useId();
  const show = (v: number) => String(Number(fromSI(v, q, system).toPrecision(6)));
  const [state, setState] = useState(() => ({ text: show(value), value, system }));
  // Re-display when the unit system changes or the value changes from outside (adjusting state during render).
  if (state.value !== value || state.system !== system) setState({ text: show(value), value, system });
  const unit = unitOf(q, system);
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label} {unit && <span className="unit">[{unit}]</span>}
      </span>
      <input
        id={id}
        className="input num"
        type="number"
        inputMode="decimal"
        step={step ?? "any"}
        min={min}
        value={state.text}
        onChange={(event) => {
          const text = event.target.value;
          const n = Number(text);
          if (text !== "" && Number.isFinite(n)) {
            const si = toSI(n, q, system);
            setState({ text, value: si, system });
            onChange(si);
          } else {
            setState((s) => ({ ...s, text }));
          }
        }}
      />
    </label>
  );
}

export function UnitToggle({ system, onChange }: { system: System; onChange: (s: System) => void }) {
  return (
    <div className="seg" role="group" aria-label="Units">
      <button type="button" aria-pressed={system === "SI"} onClick={() => onChange("SI")}>
        SI
      </button>
      <button type="button" aria-pressed={system === "US"} onClick={() => onChange("US")}>
        US customary
      </button>
    </div>
  );
}
