import katex from "katex";
import { Fragment, type ReactNode } from "react";

const cache = new Map<string, string>();

export function texToHtml(tex: string, display = false) {
  const key = (display ? "D" : "I") + tex;
  let html = cache.get(key);
  if (html === undefined) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, output: "html" });
    cache.set(key, html);
  }
  return html;
}

/** One KaTeX expression. `display` centers it on its own line. */
export function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const Tag = display ? "div" : "span";
  return <Tag className={display ? "mathline" : undefined} dangerouslySetInnerHTML={{ __html: texToHtml(tex, display) }} />;
}

/**
 * Renders a plain-data string with light markup: $inline math$, $$display math$$, **bold**, *italic* and `code`.
 * Used for week content, self-checks, flashcards and glossary entries stored in TypeScript.
 */
export function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\$\$([^$]+)\$\$|\$([^$]+)\$|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(<Fragment key={i++}>{text.slice(last, match.index)}</Fragment>);
    if (match[1] !== undefined) parts.push(<Tex key={i++} tex={match[1]} display />);
    else if (match[2] !== undefined) parts.push(<Tex key={i++} tex={match[2]} />);
    else if (match[3] !== undefined) parts.push(<strong key={i++}>{match[3]}</strong>);
    else if (match[4] !== undefined) parts.push(<code key={i++}>{match[4]}</code>);
    else parts.push(<em key={i++}>{match[5]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<Fragment key={i}>{text.slice(last)}</Fragment>);
  return <>{parts}</>;
}

/** Strips the light markup for search and plain-text use. */
export function plain(text: string) {
  return text.replace(/\$\$?([^$]+)\$\$?/g, "$1").replace(/\*\*?([^*]+)\*\*?/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\\[a-zA-Z]+/g, " ").replace(/[{}_^]/g, "");
}
