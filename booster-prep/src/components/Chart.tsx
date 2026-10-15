import { useId } from "react";

export interface Series {
  name: string;
  color: string;
  points: [number, number][];
  dashed?: boolean;
  axis?: "left" | "right";
}

function niceTicks(min: number, max: number, count = 5) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? 10 * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toPrecision(10)));
  return ticks;
}

const short = (v: number) => (Math.abs(v) >= 10_000 ? `${(v / 1000).toLocaleString("en-US")}k` : v.toLocaleString("en-US", { maximumFractionDigits: 2 }));

/** A small, dependency-free SVG line chart with optional second y-axis and marker points. */
export function LineChart({
  series,
  xLabel,
  yLabel,
  y2Label,
  markers = [],
  yMin,
  height = 280,
  zeroLine = false,
  title,
}: {
  series: Series[];
  xLabel: string;
  yLabel: string;
  y2Label?: string;
  markers?: { x: number; y: number; label: string; color?: string; axis?: "left" | "right" }[];
  yMin?: number;
  height?: number;
  zeroLine?: boolean;
  title: string;
}) {
  const id = useId();
  const W = 640;
  const H = height;
  const pad = { l: 58, r: y2Label ? 58 : 18, t: 16, b: 46 };
  const left = series.filter((s) => s.axis !== "right");
  const right = series.filter((s) => s.axis === "right");
  const xs = series.flatMap((s) => s.points.map((p) => p[0]));
  const range = (list: Series[], floor?: number) => {
    const ys = list.flatMap((s) => s.points.map((p) => p[1])).filter(Number.isFinite);
    const lo = floor ?? Math.min(0, ...ys);
    const hi = Math.max(...ys, lo + 1);
    return [lo, hi + (hi - lo) * 0.06] as const;
  };
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [ly0, ly1] = range(left, yMin);
  const [ry0, ry1] = right.length ? range(right) : [0, 1];
  const sx = (x: number) => pad.l + ((x - x0) / (x1 - x0 || 1)) * (W - pad.l - pad.r);
  const syL = (y: number) => H - pad.b - ((y - ly0) / (ly1 - ly0)) * (H - pad.t - pad.b);
  const syR = (y: number) => H - pad.b - ((y - ry0) / (ry1 - ry0)) * (H - pad.t - pad.b);
  const clampY = (y: number) => Math.max(pad.t, Math.min(H - pad.b, y));
  const path = (s: Series) => {
    const sy = s.axis === "right" ? syR : syL;
    return s.points
      .filter((p) => Number.isFinite(p[1]))
      .map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${clampY(sy(p[1])).toFixed(1)}`)
      .join("");
  };

  return (
    <figure className="chart-wrap">
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t`}>
        <title id={`${id}-t`}>{title}</title>
        {niceTicks(ly0, ly1).map((t) => (
          <g key={`y${t}`}>
            <line className="grid" x1={pad.l} x2={W - pad.r} y1={syL(t)} y2={syL(t)} />
            <text className="tick" x={pad.l - 8} y={syL(t) + 4} textAnchor="end">
              {short(t)}
            </text>
          </g>
        ))}
        {right.length > 0 &&
          niceTicks(ry0, ry1).map((t) => (
            <text key={`r${t}`} className="tick" x={W - pad.r + 8} y={syR(t) + 4}>
              {short(t)}
            </text>
          ))}
        {niceTicks(x0, x1, 6).map((t) => (
          <text key={`x${t}`} className="tick" x={sx(t)} y={H - pad.b + 18} textAnchor="middle">
            {short(t)}
          </text>
        ))}
        <line className="axis" x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} />
        <line className="axis" x1={pad.l} x2={pad.l} y1={pad.t} y2={H - pad.b} />
        {zeroLine && ly0 < 0 && <line x1={pad.l} x2={W - pad.r} y1={syL(0)} y2={syL(0)} stroke="var(--bad)" strokeDasharray="5 4" strokeWidth={1.5} />}
        {series.map((s) => (
          <path key={s.name} className="series" d={path(s)} stroke={s.color} strokeDasharray={s.dashed ? "6 5" : undefined} />
        ))}
        {markers.map((m) => {
          const sy = m.axis === "right" ? syR : syL;
          const cx = sx(m.x);
          const cy = clampY(sy(m.y));
          const anchor = cx > W * 0.7 ? "end" : "start";
          return (
            <g key={m.label}>
              <circle cx={cx} cy={cy} r={5.5} fill={m.color ?? "var(--accent)"} stroke="var(--surface)" strokeWidth={2} />
              <text className="tick" x={cx + (anchor === "end" ? -9 : 9)} y={cy - 9} textAnchor={anchor} style={{ fill: "var(--ink)" }}>
                {m.label}
              </text>
            </g>
          );
        })}
        <text className="tick" x={(pad.l + W - pad.r) / 2} y={H - 8} textAnchor="middle">
          {xLabel}
        </text>
        <text className="tick" transform={`translate(14 ${(pad.t + H - pad.b) / 2}) rotate(-90)`} textAnchor="middle">
          {yLabel}
        </text>
        {y2Label && (
          <text className="tick" transform={`translate(${W - 10} ${(pad.t + H - pad.b) / 2}) rotate(90)`} textAnchor="middle">
            {y2Label}
          </text>
        )}
      </svg>
      <figcaption className="legend">
        {series.map((s) => (
          <span key={s.name} className="row" style={{ gap: 6 }}>
            <span className="swatch line" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
