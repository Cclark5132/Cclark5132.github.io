export type System = "SI" | "US";

/** Each quantity: SI unit (what calc/structures.ts expects), US unit, and US→SI multiplier (or converter). */
export const quantities = {
  stress: { si: "MPa", us: "ksi", toSI: 6.894757 },
  pressure: { si: "MPa", us: "psi", toSI: 0.006894757 },
  modulus: { si: "MPa", us: "Msi", toSI: 6894.757 },
  length: { si: "mm", us: "in", toSI: 25.4 },
  height: { si: "mm", us: "ft", toSI: 304.8 },
  area: { si: "mm²", us: "in²", toSI: 645.16 },
  inertia: { si: "mm⁴", us: "in⁴", toSI: 416_231.4256 },
  force: { si: "N", us: "lbf", toSI: 4.448222 },
  torque: { si: "N·m", us: "lbf·ft", toSI: 1.355818 },
  density: { si: "kg/m³", us: "lb/ft³", toSI: 16.018463 },
  deltaT: { si: "°C", us: "°F", toSI: 5 / 9 },
  alpha: { si: "1/°C", us: "1/°F", toSI: 9 / 5 },
  mass: { si: "kg", us: "lb", toSI: 0.45359237 },
  none: { si: "", us: "", toSI: 1 },
} as const;

export type Quantity = keyof typeof quantities;

export const unitOf = (q: Quantity, system: System) => (system === "SI" ? quantities[q].si : quantities[q].us);
export const toSI = (value: number, q: Quantity, system: System) => (system === "SI" ? value : value * quantities[q].toSI);
export const fromSI = (value: number, q: Quantity, system: System) => (system === "SI" ? value : value / quantities[q].toSI);

/** Formats with about 4 significant figures, thousands separators, and scientific notation for tiny or huge values. */
export function fmt(value: number, sig = 4) {
  if (!Number.isFinite(value)) return value > 0 ? "∞" : "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs < 1e-3 || abs >= 1e9) {
    const [m, e] = value.toExponential(sig - 1).split("e");
    return `${m} × 10^${Number(e)}`;
  }
  const digits = Math.max(0, sig - 1 - Math.floor(Math.log10(abs)));
  return value.toLocaleString("en-US", { maximumFractionDigits: Math.min(digits, 6), minimumFractionDigits: 0 });
}

/** Same as fmt but as TeX (thin-space thousands, proper exponent). */
export function tex(value: number, sig = 4) {
  const s = fmt(value, sig);
  return s.replace(/,/g, "{,}").replace(/ × 10\^(-?\d+)/, " \\times 10^{$1}").replace("∞", "\\infty");
}

export function signed(value: number, digits = 3) {
  if (!Number.isFinite(value)) return "+∞";
  return (value >= 0 ? "+" : "−") + Math.abs(value).toFixed(digits);
}
