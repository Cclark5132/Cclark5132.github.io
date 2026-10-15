// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { formulaNotes } from "../src/data/formulaNotes";
import { formulasFromSource } from "../src/lib/cards";
import { lessons } from "../src/lessons";
import { QuickRef, sheet } from "../src/pages/QuickRef";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const allFormulas = lessons.flatMap((l) => formulasFromSource(l.source));

describe("printable formula sheet", () => {
  it("covers every lesson <Formula>, grouped by week, each with a use-when note", () => {
    expect(sheet.flatMap((s) => s.formulas)).toHaveLength(allFormulas.length);
    expect(sheet.map((s) => s.week)).toEqual([...sheet.map((s) => s.week)].sort((a, b) => a - b));
    for (const f of allFormulas) expect(formulaNotes[f.label], f.label).toBeTruthy();
  });

  it("renders, prints, and filters by week", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <QuickRef />
        </MemoryRouter>,
      );
    });
    const sheetEl = container.querySelector('[data-testid="formula-sheet"]')!;
    expect(sheetEl.querySelectorAll(".sheet-f")).toHaveLength(allFormulas.length);
    expect(sheetEl.querySelector(".katex-error")).toBeNull();
    expect(sheetEl.textContent).toContain("Net axial compression with internal pressure");

    const print = vi.fn();
    window.print = print;
    await act(async () => [...container.querySelectorAll("button")].find((b) => b.textContent === "Print / Save as PDF")!.click());
    expect(print).toHaveBeenCalledOnce();

    const week8 = [...container.querySelectorAll('[aria-label="Weeks to print"] button')].find((b) => b.textContent === "8")!;
    await act(async () => (week8 as HTMLButtonElement).click());
    const without8 = allFormulas.length - sheet.find((s) => s.week === 8)!.formulas.length;
    expect(sheetEl.querySelectorAll(".sheet-f")).toHaveLength(without8);
    expect(sheetEl.textContent).not.toContain("Paris law");
    root.unmount();
  });
});
