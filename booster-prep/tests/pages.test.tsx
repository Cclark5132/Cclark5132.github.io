// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { nav } from "../src/data/nav";
import { weeks } from "../src/data/plan";
import { lessons } from "../src/lessons";

const routes = [
  ...nav.map((item) => item.to),
  ...weeks.map((week) => `/week/${week.n}`),
  ...lessons.map((lesson) => `/lessons/${lesson.slug}`),
  ...["nx", "ansys", "python", "matlab", "fea"].map((tool) => `/tools/${tool}`),
];

describe("every page", () => {
  for (const route of routes) {
    it(`${route} renders without errors`, () => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );
      expect(html).not.toContain("Off the trajectory");
      expect(html).not.toContain("This page hit an error");
      expect(html.match(/class="katex-error"[^>]*title="([^"]*)"/g) ?? []).toEqual([]);
    });
  }
});
