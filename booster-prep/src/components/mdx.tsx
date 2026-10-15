import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { headingId, textOf } from "../lib/anchors";
import { Formula } from "./Formula";
import { Tex } from "./Tex";

/*
 * remark-math turns $…$ into <code class="language-math math-inline"> and $$…$$ into
 * <pre><code class="language-math math-display">. These overrides render them with KaTeX at runtime,
 * which keeps the bundle far smaller than pre-rendering every formula to HTML at build time.
 */
function Code({ className, children, ...rest }: ComponentProps<"code">) {
  if (className?.includes("math-inline")) return <Tex tex={String(children)} />;
  if (className?.includes("math-display")) return <Tex tex={String(children)} display />;
  return (
    <code className={className} {...rest}>
      {children}
    </code>
  );
}

function Pre({ children, ...rest }: ComponentProps<"pre">) {
  if (isValidElement<{ className?: string }>(children) && children.props.className?.includes("math-display")) return <>{children}</>;
  return <pre {...rest}>{children}</pre>;
}

/** A fully worked example. Every step goes inside as normal MDX. */
export function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="box example">
      <div className="box-head">
        <span className="eyebrow">Worked example</span>
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

/** A practice problem. Put the question first, then a <Solution> with the step-by-step answer. */
export function Problem({ n, children }: { n: number; children: ReactNode }) {
  return (
    <section className="box">
      <div className="box-head">
        <span className="eyebrow">Practice {n}</span>
      </div>
      {children}
    </section>
  );
}

export function Solution({ children, label = "Show step-by-step solution" }: { children: ReactNode; label?: string }) {
  return (
    <details className="reveal">
      <summary>{label}</summary>
      <div className="reveal-body prose">{children}</div>
    </details>
  );
}

const calloutLabels = { mistake: "Common mistake", note: "Note", context: "Starship context", tip: "Tip" } as const;

export function Callout({ kind = "note", title, children }: { kind?: keyof typeof calloutLabels; title?: string; children: ReactNode }) {
  return (
    <aside className={`box ${kind}`}>
      <div className="box-head">
        <span className="eyebrow">{calloutLabels[kind]}</span>
        {title && <span>{title}</span>}
      </div>
      {children}
    </aside>
  );
}

/** Wraps an inline SVG diagram. The SVG should use the dg-* classes so it follows the theme. */
export function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="diagram">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** Lesson `##` headings get stable anchor ids, so focus mode can link to the exact section. */
function H2({ children, ...rest }: ComponentProps<"h2">) {
  return (
    <h2 id={headingId(textOf(children))} {...rest}>
      {children}
    </h2>
  );
}

export const mdxComponents = { Formula, Example, Problem, Solution, Callout, Figure, code: Code, pre: Pre, h2: H2 };
