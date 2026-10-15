import { Children, isValidElement, type ReactNode } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Stable anchor id for a lesson `##` heading: numbered sections get `sec-<number>` ("1b. Running
 * loads…" → `sec-1b`), so links survive title edits; unnumbered ones use a slug ("Practice problems"
 * → `practice-problems`).
 */
export function headingId(text: string) {
  const numbered = text.trim().match(/^(\d+[a-z]?)\.\s/);
  if (numbered) return `sec-${numbered[1]}`;
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Plain text of rendered children (MDX headings can contain math or code elements). */
export function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : isValidElement<{ children?: ReactNode; tex?: string }>(child) ? (child.props.tex ?? textOf(child.props.children)) : ""))
    .join("");
}

/**
 * Scrolls to the element named by a query parameter (`?section=sec-3`) and flashes it. Runs after
 * the layout's scroll-to-top, so it wins on navigation.
 */
export function useScrollToParam(param: string, prefix = "") {
  const [params] = useSearchParams();
  const target = params.get(param);
  useEffect(() => {
    if (!target) return;
    const id = window.setTimeout(() => {
      const el = document.getElementById(prefix + target);
      if (!el) return;
      el.scrollIntoView({ block: "start" });
      el.classList.add("flash");
      window.setTimeout(() => el.classList.remove("flash"), 2000);
    }, 0);
    return () => window.clearTimeout(id);
  }, [target, prefix]);
}
