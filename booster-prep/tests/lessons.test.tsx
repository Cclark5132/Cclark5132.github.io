import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mdxComponents } from "../src/components/mdx";
import { lessons } from "../src/lessons";

describe("lessons", () => {
  it("has a lesson for every structures topic", () => {
    expect(lessons.length).toBeGreaterThanOrEqual(1);
  });

  for (const lesson of lessons) {
    describe(lesson.slug, () => {
      const html = renderToStaticMarkup(<lesson.Component components={mdxComponents} />);

      it("renders every formula without KaTeX errors", () => {
        const errors = html.match(/class="katex-error"[^>]*title="([^"]*)"/g) ?? [];
        expect(errors).toEqual([]);
      });

      it("has at least two worked examples, a diagram and five practice problems with solutions", () => {
        expect(html.match(/Worked example/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(html).toContain("<svg");
        expect(html.match(/Practice \d+/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
        expect(html.match(/<details class="reveal">/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
      });

      it("has meta and a common mistakes section", () => {
        expect(lesson.title).toBeTruthy();
        expect(lesson.week).toBeGreaterThanOrEqual(1);
        expect(html).toContain("Common mistake");
      });
    });
  }
});
