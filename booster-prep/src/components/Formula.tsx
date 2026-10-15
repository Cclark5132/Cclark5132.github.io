import { Rich, Tex } from "./Tex";

export type Var = [symbol: string, meaning: string, unit: string];

/** Parses "sym | meaning | unit; sym | meaning | unit" (the compact form used inside MDX lessons). */
export function parseVars(spec: string): Var[] {
  return spec
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [s = "", m = "", u = ""] = row.split("|").map((cell) => cell.trim());
      return [s, m, u] as Var;
    });
}

/** A large display formula with every variable defined underneath, units included. */
export function Formula({ tex, vars, label }: { tex: string; vars?: string | Var[]; label?: string }) {
  const rows = typeof vars === "string" ? parseVars(vars) : (vars ?? []);
  return (
    <div className="formula">
      {label && <div className="formula-label">{label}</div>}
      <div className="formula-math">
        <Tex tex={tex} display />
      </div>
      {rows.length > 0 && (
        <table className="vars">
          <caption className="sr-only">Variables</caption>
          <tbody>
            {rows.map(([s, m, u]) => (
              <tr key={s + m}>
                <td>
                  <Tex tex={s} />
                </td>
                <td>
                  <Rich text={m} />
                </td>
                <td>{u || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
