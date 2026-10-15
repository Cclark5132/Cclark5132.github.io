// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { weeks } from "../src/data/plan";
import { emptyView } from "../src/lib/progressDoc";
import { localToday } from "../src/lib/schedule";
import { selfCheckScore } from "../src/lib/selfcheck";
import { getProgress } from "../src/lib/store";
import { weakTopics } from "../src/lib/weak";
import { WeekPage } from "../src/pages/WeekPage";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("self-check grades", () => {
  it("scores Got it 1, Shaky ½, Missed 0", () => {
    const s = selfCheckScore({ "s-w2-1": "got", "s-w2-2": "shaky", "s-w2-3": "missed" }, 2, 5);
    expect(s).toMatchObject({ graded: 3, points: 1.5, total: 5, tally: { got: 1, shaky: 1, missed: 1 } });
  });

  it("weak topics blend self-check weeks with practice accuracy", () => {
    const p = { ...emptyView(), grades: { "s-w3-1": "missed", "s-w3-2": "shaky", "s-w3-3": "missed" } as const, practice: { "margin|a": { attempts: 3, correct: 1 } } };
    expect(weakTopics(p).map((w) => [w.title, w.accuracy])).toEqual([
      ["Week 3 self-checks", 1 / 6],
      ["Margin of safety", 1 / 3],
    ]);
    expect(weakTopics(p)[0].to).toBe("/week/3?section=self-check");
  });

  it("grading Shaky on the week page stores it, shows the score and makes the card due today", async () => {
    const week = weeks.find((w) => w.n === 2)!;
    expect(week.selfChecks.length).toBeGreaterThan(0);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/week/2"]}>
          <Routes>
            <Route path="/week/:n" element={<WeekPage />} />
          </Routes>
        </MemoryRouter>,
      );
    });
    const first = container.querySelector(".selfchecks li")!;
    const shaky = [...first.querySelectorAll("button")].find((b) => b.textContent === "Shaky")!;
    await act(async () => shaky.click());
    expect(getProgress().grades["s-w2-1"]).toBe("shaky");
    expect(getProgress().cards["s-w2-1"]).toMatchObject({ due: localToday(), interval: 0 });
    expect(container.querySelector('[data-testid="selfcheck-score"]')!.textContent).toContain("1 of");
    root.unmount();
  });
});
