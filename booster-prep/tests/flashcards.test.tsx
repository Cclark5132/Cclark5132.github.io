// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { dailyQueue, deck, NEW_PER_DAY, schedule, startedWeeks } from "../src/lib/cards";
import { getProgress } from "../src/lib/store";
import { Flashcards } from "../src/pages/Flashcards";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("spaced repetition intervals", () => {
  it("Again resets, Hard ×1.2 (min 1 day), Good ×2, Easy ×3 (min 3)", () => {
    expect(schedule(undefined, "again")).toEqual({ interval: 0, reps: 1 });
    expect(schedule(undefined, "hard")).toEqual({ interval: 1, reps: 1 });
    expect(schedule({ interval: 1, reps: 1 }, "hard").interval).toBe(1);
    expect(schedule({ interval: 5, reps: 2 }, "hard").interval).toBe(6);
    expect(schedule({ interval: 10, reps: 3 }, "hard").interval).toBe(12);
    expect(schedule({ interval: 5, reps: 2 }, "good").interval).toBe(10);
    expect(schedule({ interval: 5, reps: 2 }, "easy").interval).toBe(15);
    expect(schedule(undefined, "easy").interval).toBe(3);
  });
});

describe("daily new-card limit", () => {
  it("only started weeks feed new cards, at most 15 a day", () => {
    expect([...startedWeeks("2026-10-16")].sort()).toEqual([0, 1]);
    const q = dailyQueue(deck, {}, "2026-10-16");
    expect(q.fresh).toHaveLength(NEW_PER_DAY);
    expect(q.fresh.every((c) => c.week <= 1)).toBe(true);
  });

  it("cards started today count against the limit; due reviews always show", () => {
    const state = Object.fromEntries(deck.filter((c) => c.week === 1).slice(0, 10).map((c) => [c.id, { due: "2026-10-16", interval: 0, reps: 1, added: "2026-10-16" }]));
    const q = dailyQueue(deck, state, "2026-10-16");
    expect(q.reviews).toHaveLength(10);
    expect(q.fresh).toHaveLength(5);
  });
});

describe("Flashcards page", () => {
  it("Space flips and 2 grades Hard; the hint is on screen", async () => {
    window.history.replaceState(null, "", "/?date=2026-10-16");
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/flashcards?week=1"]}>
          <Flashcards />
        </MemoryRouter>,
      );
    });
    expect(container.textContent).toContain("Space flips the card");
    const before = Object.keys(getProgress().cards).length;
    await act(async () => window.dispatchEvent(new KeyboardEvent("keydown", { key: " " })));
    expect(container.textContent).toContain("Hard");
    await act(async () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "2" })));
    const cards = getProgress().cards;
    expect(Object.keys(cards).length).toBe(before + 1);
    const graded = Object.values(cards).at(-1)!;
    expect(graded).toMatchObject({ interval: 1, reps: 1, added: "2026-10-16" });
    root.unmount();
    window.history.replaceState(null, "", "/");
  });
});
