import type { CSSProperties } from "react";
import type { Metric } from "../data/portfolio";
import { CountUp } from "./CountUp";

interface ReadoutProps {
  metrics: Metric[];
  /** "grid" lays values side by side (project cards). "rows" stacks label and value (spec rail, write-up). */
  layout?: "grid" | "rows";
  className?: string;
}

/**
 * Key numbers on a dark panel, where the orange values meet AA contrast.
 * Its cells fade in one after another.
 */
export function Readout({ metrics, layout = "grid", className = "" }: ReadoutProps) {
  return (
    <dl className={`readout readout-${layout} ${className}`} data-count={metrics.length}>
      {metrics.map((metric, index) => (
        <div className="readout-cell r-fade" style={{ "--i": index } as CSSProperties} key={metric.label}>
          <dt>
            <span className="readout-label">{metric.label}</span>
            {metric.note && <span className="readout-note">{metric.note}</span>}
          </dt>
          <dd className="readout-value">{metric.count === false ? metric.value : <CountUp value={metric.value} />}</dd>
        </div>
      ))}
    </dl>
  );
}
