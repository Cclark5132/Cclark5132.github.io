import { parseVars, type Var } from "../components/Formula";
import { glossary } from "../data/glossary";
import { weeks, type Track } from "../data/plan";
import { lessons } from "../lessons";

export interface Card {
  id: string;
  kind: "formula" | "definition" | "self-check";
  week: number;
  track: Track | "context";
  front: string; // Rich text
  back: string; // Rich text
  tex?: string;
  vars?: Var[];
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Reads every <Formula label tex vars /> out of a lesson's MDX source. */
export function formulasFromSource(source: string) {
  const out: { label: string; tex: string; vars: Var[] }[] = [];
  for (const match of source.matchAll(/<Formula\b([\s\S]*?)\/>/g)) {
    const attr = (name: string) => match[1].match(new RegExp(`${name}="([^"]*)"`))?.[1];
    const tex = attr("tex");
    if (!tex) continue;
    out.push({ label: attr("label") ?? "Formula", tex, vars: parseVars(attr("vars") ?? "") });
  }
  return out;
}

function build(): Card[] {
  const cards: Card[] = [];
  const seen = new Set<string>();
  const add = (card: Card) => {
    if (seen.has(card.id)) return;
    seen.add(card.id);
    cards.push(card);
  };

  for (const lesson of lessons) {
    for (const f of formulasFromSource(lesson.source)) {
      add({ id: `f-${lesson.slug}-${slug(f.label)}`, kind: "formula", week: lesson.week, track: "structures", front: `**${f.label}**: write the formula and define every variable.`, back: "", tex: f.tex, vars: f.vars });
    }
  }
  for (const week of weeks) {
    for (const f of week.formulas) {
      add({ id: `f-w${week.n}-${slug(f.label)}`, kind: "formula", week: week.n, track: "structures", front: `**${f.label}**: write the formula and define every variable.`, back: "", tex: f.tex, vars: f.vars });
    }
    week.selfChecks.forEach((check, i) => {
      add({ id: `s-w${week.n}-${i + 1}`, kind: "self-check", week: week.n, track: "structures", front: check.q, back: check.a });
    });
  }
  for (const term of glossary) {
    add({
      id: `d-${slug(term.term)}`,
      kind: "definition",
      week: term.week ?? 1,
      track: term.category === "Starship" ? "context" : term.category === "Analysis" ? "cad" : "structures",
      front: `Define: **${term.term}**`,
      back: term.def,
    });
  }
  return cards;
}

export const deck = build();

/** Simple spaced repetition: Again → today, Good → double the interval, Easy → triple it. */
export function schedule(prev: { interval: number; reps: number } | undefined, grade: "again" | "good" | "easy") {
  const interval = prev?.interval ?? 0;
  const reps = (prev?.reps ?? 0) + 1;
  if (grade === "again") return { interval: 0, reps };
  if (grade === "good") return { interval: Math.max(1, interval * 2), reps };
  return { interval: Math.max(3, interval * 3), reps };
}
