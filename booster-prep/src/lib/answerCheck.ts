/** Answer checking shared by the Capstone answer check and the Practice page. */

/** Parses a typed number, accepting a leading + or the Unicode minus. Empty or junk → NaN. */
export function parseAnswer(text: string) {
  const cleaned = text.trim().replace(/−/g, "-").replace(/,/g, "").replace(/^\+/, "");
  if (!cleaned || !/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}

/** Text a student might type for a margin that is not applicable (net tension) or very large. */
const notApplicable = /^(n\/?a|na|tension|net tension|inf|infinity|∞|\+?high|ms\s*=\s*\+?high)$/i;

/**
 * Within tolerance:
 *   value  → |user / ref − 1| ≤ tol (default 2%)
 *   margin → compares the capacity ratios 1 + MS, |(1 + user) / (1 + ref) − 1| ≤ tol. A not-applicable
 *            reference (net tension, Infinity) accepts "n/a", "tension", "inf" or "high".
 */
export function checkAnswer(text: string, ref: number, kind: "value" | "margin", tol = 0.02) {
  if (kind === "margin" && !Number.isFinite(ref)) return notApplicable.test(text.trim());
  const user = parseAnswer(text);
  if (!Number.isFinite(user)) return false;
  if (kind === "margin") return Math.abs((1 + user) / (1 + ref) - 1) <= tol;
  if (ref === 0) return Math.abs(user) <= tol;
  return Math.abs(user / ref - 1) <= tol;
}

export const rowKey = (loadCase: string, check: string) =>
  `${loadCase} ${check}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
