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
  allowNegative = false,
}: {
  label: string;
  value: number;
  onChange: (si: number) => void;
  q?: Quantity;
  system: System;
  step?: number;
  min?: number;
  /** Most inputs are physical sizes, so negatives are rejected unless the quantity can be signed. */
  allowNegative?: boolean;
}) {
  const id = useId();
  const show = (v: number) => String(Number(fromSI(v, q, system).toPrecision(6)));
  const [state, setState] = useState(() => ({ text: show(value), value, system }));
  // Re-display when the unit system changes or the value changes from outside (adjusting state during render).
  if (state.value !== value || state.system !== system) setState({ text: show(value), value, system });
  const unit = unitOf(q, system);
  const typed = Number(state.text);
  const invalid = state.text === "" || !Number.isFinite(typed) || (!allowNegative && typed < 0);
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
        min={min ?? (allowNegative ? undefined : 0)}
        value={state.text}
        aria-invalid={invalid || undefined}
        onChange={(event) => {
          const text = event.target.value;
          const n = Number(text);
          if (text !== "" && Number.isFinite(n) && (allowNegative || n >= 0)) {
            const si = toSI(n, q, system);
            setState({ text, value: si, system });
            onChange(si);
          } else {
            setState((s) => ({ ...s, text }));
          }
        }}
      />
      {invalid && <span className="field-error">{state.text === "" ? "Enter a number." : "Must be 0 or more."}</span>}
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

const SYSTEM_KEY = "booster-prep:units";

/** The SI / US choice, remembered on this device. Shared by Calculators and Practice. */
export function useSystem() {
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
