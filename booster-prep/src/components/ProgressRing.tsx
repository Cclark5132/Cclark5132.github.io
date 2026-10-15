export function ProgressRing({ value, size = 132, label }: { value: number; size?: number; label: string }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap={pct > 0 ? "round" : "butt"}
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="var(--ink)" style={{ font: "600 26px var(--font-mono)" }}>
        {Math.round(pct * 100)}%
      </text>
      <text x="50%" y="66%" textAnchor="middle" fill="var(--muted)" style={{ font: "500 10px var(--font-mono)", letterSpacing: "0.1em" }}>
        COMPLETE
      </text>
    </svg>
  );
}
