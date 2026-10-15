import { Fragment, type ReactNode } from "react";
import { Rich, Tex } from "./Tex";

/**
 * A small Markdown renderer for notes: headings, paragraphs, lists, quotes, code blocks, links,
 * **bold**, *italic*, `code`, and KaTeX math ($…$ inline, $$…$$ display, also across lines).
 * It builds React elements (no HTML strings), so nothing typed can inject markup.
 */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const link = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = link.exec(text))) {
    if (match.index > last) parts.push(<Rich key={i++} text={text.slice(last, match.index)} />);
    parts.push(
      <a key={i++} href={match[2]} target="_blank" rel="noopener noreferrer">
        {match[1]}
      </a>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<Rich key={i} text={text.slice(last)} />);
  return <>{parts}</>;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let k = 0;
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | undefined;
  const flushPara = () => {
    if (para.length) blocks.push(<p key={k++}><Inline text={para.join(" ")} /></p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((item, i) => (
      <li key={i}>
        <Inline text={item} />
      </li>
    ));
    blocks.push(list.ordered ? <ol key={k++}>{items}</ol> : <ul key={k++}>{items}</ul>);
    list = undefined;
  };
  const flush = () => {
    flushPara();
    flushList();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      flush();
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].trim().startsWith("```"); i++) code.push(lines[i]);
      blocks.push(<pre key={k++}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    if (trimmed === "$$" || (trimmed.startsWith("$$") && !trimmed.slice(2).includes("$$"))) {
      flush();
      const math: string[] = [trimmed.slice(2)];
      for (i++; i < lines.length && !lines[i].includes("$$"); i++) math.push(lines[i]);
      if (i < lines.length) math.push(lines[i].slice(0, lines[i].indexOf("$$")));
      blocks.push(<Tex key={k++} tex={math.join("\n").trim()} display />);
      continue;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flush();
      const content = <Inline text={heading[2]} />;
      blocks.push(heading[1].length === 1 ? <h3 key={k++}>{content}</h3> : heading[1].length === 2 ? <h4 key={k++}>{content}</h4> : <h5 key={k++}>{content}</h5>);
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    if (trimmed.startsWith(">")) {
      flush();
      blocks.push(<blockquote key={k++}><Inline text={trimmed.replace(/^>\s?/, "")} /></blockquote>);
      continue;
    }
    if (!trimmed) {
      flush();
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flush();
  return <div className="markdown">{blocks.length ? blocks : <Fragment />}</div>;
}
