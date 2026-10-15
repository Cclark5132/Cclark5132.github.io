import { plain } from "../components/Tex";
import { glossary } from "../data/glossary";
import { nav } from "../data/nav";
import { weeks } from "../data/plan";
import { nastranLiteracy, toolTracks } from "../data/tools";
import { lessons } from "../lessons";
import { deck } from "./cards";

export interface SearchItem {
  title: string;
  section: string;
  to: string;
  text: string;
}

/** Turns MDX source into searchable prose: drops JSX tags, SVG, attributes and math markup. */
function mdxToText(source: string) {
  return plain(
    source
      .replace(/export const meta[\s\S]*?};/, "")
      .replace(/<svg[\s\S]*?<\/svg>/g, " ")
      .replace(/<Formula\b[\s\S]*?label="([^"]*)"[\s\S]*?\/>/g, " $1 ")
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      .replace(/[#*>]/g, " "),
  ).replace(/\s+/g, " ");
}

export const searchIndex: SearchItem[] = [
  ...nav.map((item) => ({ title: item.label, section: "Page", to: item.to, text: item.label })),
  ...lessons.map((lesson) => ({ title: lesson.title, section: `Lesson · Week ${lesson.week}`, to: `/lessons/${lesson.slug}`, text: `${lesson.summary} ${mdxToText(lesson.source)}` })),
  ...weeks.map((week) => ({
    title: `Week ${week.n}: ${week.title}`,
    section: "Week",
    to: `/week/${week.n}`,
    text: plain([...week.structures, ...(week.cad?.items ?? []), ...(week.code?.items ?? []), ...week.context, week.deliverable, ...(week.tasks ?? [])].join(" ")),
  })),
  ...glossary.map((term) => ({ title: term.term, section: `Glossary · ${term.category}`, to: `/glossary?q=${encodeURIComponent(term.term)}`, text: plain(term.def) })),
  ...deck
    .filter((card) => card.kind !== "definition")
    .map((card) => ({ title: plain(card.front).replace(/: write the formula.*$/, ""), section: `Flashcard · Week ${card.week}`, to: `/flashcards?week=${card.week}`, text: plain(card.back + " " + (card.tex ?? "")) })),
  ...toolTracks.flatMap((track) => track.path.map((step) => ({ title: `${track.name}: ${step.title}`, section: `Tool track · Week ${step.week}`, to: `/tools/${track.id}`, text: plain(step.steps.join(" ")) }))),
  {
    title: nastranLiteracy.title,
    section: "Tools · optional track",
    to: "/tools",
    text: plain([nastranLiteracy.why, ...nastranLiteracy.cards.flat(), ...nastranLiteracy.steps.map((step) => step.text)].join(" ")),
  },
];

/** Your notes are part of progress, not the static index, so they're searched live. */
export function noteItems(notes: Record<string, string>): SearchItem[] {
  return weeks
    .filter((w) => (notes[w.n] ?? "").trim())
    .map((w) => ({ title: `Notes: Week ${w.n}`, section: "Your notes", to: `/week/${w.n}?section=notes`, text: plain(notes[w.n]) }));
}

/** Ranks items: title matches first, then body matches. Every query word must appear. */
export function search(query: string, limit = 30, extra: SearchItem[] = []) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { item: SearchItem; score: number; snippet: string }[] = [];
  for (const item of [...extra, ...searchIndex]) {
    const title = item.title.toLowerCase();
    const text = item.text.toLowerCase();
    if (!words.every((word) => title.includes(word) || text.includes(word))) continue;
    let score = 0;
    for (const word of words) {
      if (title.startsWith(word)) score += 6;
      else if (title.includes(word)) score += 4;
      if (text.includes(word)) score += 1;
    }
    const at = text.indexOf(words[0]);
    const snippet = at >= 0 ? item.text.slice(Math.max(0, at - 40), at + 100).trim() : item.text.slice(0, 120);
    scored.push({ item, score, snippet });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
