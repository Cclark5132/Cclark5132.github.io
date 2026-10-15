// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CatchUpCard } from "../src/components/CatchUp";
import { actualHours, behindQueue, hoursVsPlan, lightSlots, nextLightSlot } from "../src/lib/catchup";
import { emptyView } from "../src/lib/progressDoc";
import { dayName, plannedHours } from "../src/lib/schedule";
import { getProgress, setSession } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("catch-up queue", () => {
  it("lists unchecked past sessions oldest first", () => {
    const p = { ...emptyView(), sessions: { "w0-d0-s1": "2026-10-15" } };
    const queue = behindQueue(p, "2026-10-17");
    expect(queue.map((s) => s.id)).toEqual(["w0-d0-s2", "w1-d0-s1", "w1-d0-s2"]);
  });

  it("skipped sessions leave the queue; moved ones come back only after their new date", () => {
    const p = { ...emptyView(), skipped: { "w0-d0-s2": true }, overrides: { "w1-d0-s1": "2026-11-01" } };
    expect(behindQueue(p, "2026-10-17").map((s) => s.id)).toEqual(["w0-d0-s1", "w1-d0-s2"]);
    expect(behindQueue(p, "2026-11-02").some((s) => s.id === "w1-d0-s1")).toBe(true);
  });

  it("pushes to the next Sunday or light-week day, one moved session per slot", () => {
    expect(lightSlots.every((d) => d >= "2026-10-26")).toBe(true);
    const first = nextLightSlot("2026-10-27", {});
    expect(first).toBe("2026-11-01");
    expect(dayName(first!)).toBe("Sun");
    expect(nextLightSlot("2026-10-27", { a: "2026-11-01" })).toBe("2026-11-08");
    expect(nextLightSlot("2027-01-10", {})).toBeUndefined();
  });
});

describe("hours vs. plan", () => {
  it("planned line ends at the plan total and behind counts through yesterday", () => {
    const p = { ...emptyView(), sessions: { "w0-d0-s1": "2026-10-15", "w0-d0-s2": "2026-10-15" } };
    const h = hoursVsPlan(p, "2026-10-17");
    expect(h.planned[0]).toEqual([0, 2]);
    expect(h.planned[h.planned.length - 1][1]).toBe(plannedHours);
    expect(h.done[h.done.length - 1]).toEqual([2, 2]);
    // Through Oct 16: 2 (Oct 15) + 2 (Oct 16) planned, 2 done.
    expect({ due: h.due, behind: h.behind }).toEqual({ due: 4, behind: 2 });
    expect(hoursVsPlan(p, "2026-10-16").behind).toBe(0);
  });

  it("actual hours come from timer minutes", () => {
    expect(actualHours({ ...emptyView(), minutes: { a: 60, b: 45 } })).toBe(1.8);
  });
});

describe("Catch-up card", () => {
  it("renders the queue and Push moves a session without editing the plan", async () => {
    window.history.replaceState(null, "", "/");
    setSession("w0-d0-s1", "2026-10-15");
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <CatchUpCard today="2026-10-27" />
        </MemoryRouter>,
      );
    });
    expect(container.textContent).toContain("Catch up");
    expect(container.textContent).toContain("Do it now");
    const push = [...container.querySelectorAll("button")].find((b) => b.textContent?.startsWith("Push to Sun, Nov 1"))!;
    expect(push).toBeTruthy();
    await act(async () => push.click());
    expect(getProgress().overrides["w0-d0-s2"]).toBe("2026-11-01");
    const skip = [...container.querySelectorAll("button")].find((b) => b.textContent === "Skip")!;
    await act(async () => skip.click());
    expect(Object.keys(getProgress().skipped)).toHaveLength(1);
    expect(container.textContent).toContain("1 skipped (counted as missed)");
    root.unmount();
  });
});
