// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { mdxComponents } from "../src/components/mdx";
import { toolTracks } from "../src/data/tools";
import { headingId } from "../src/lib/anchors";
import { lessons } from "../src/lessons";
import { allSessions, sessionById, sessionLink } from "../src/lib/schedule";
import { getProgress } from "../src/lib/store";
import { MAX_LOG_MINUTES, timerView } from "../src/lib/timer";
import { Focus } from "../src/pages/Focus";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const min = 60_000;
const at = (mode: "60" | "25/5", minutes: number) => timerView({ mode, startedAt: 0 }, minutes * min);

describe("timer math (from the stored start time)", () => {
  it("60-minute mode counts down one hour", () => {
    expect(at("60", 0)).toMatchObject({ remainingSec: 3600, phase: "focus", focusMinutes: 0 });
    expect(at("60", 30)).toMatchObject({ remainingSec: 1800, phase: "focus", focusMinutes: 30 });
    expect(at("60", 61)).toMatchObject({ remainingSec: 0, phase: "done", focusMinutes: 61 });
  });

  it("25/5 mode alternates focus and break and logs focus time only", () => {
    expect(at("25/5", 10)).toMatchObject({ phase: "focus", remainingSec: 15 * 60, focusMinutes: 10 });
    expect(at("25/5", 27)).toMatchObject({ phase: "break", remainingSec: 3 * 60, focusMinutes: 25 });
    expect(at("25/5", 35)).toMatchObject({ phase: "focus", remainingSec: 20 * 60, focusMinutes: 30 });
    expect(at("25/5", 60)).toMatchObject({ phase: "done", focusMinutes: 50 });
  });

  it("a forgotten timer is capped, and a clock skew can't go negative", () => {
    expect(at("60", 600).focusMinutes).toBe(MAX_LOG_MINUTES);
    expect(timerView({ mode: "60", startedAt: 10 * min }, 0).elapsedSec).toBe(0);
  });
});

describe("focus links", () => {
  const ids = new Map(lessons.map((l) => [l.slug, new Set([...renderToStaticMarkup(<l.Component components={mdxComponents} />).matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]))]));

  it("lesson headings get stable ids", () => {
    expect(headingId("1b. Running loads and equivalent axial load")).toBe("sec-1b");
    expect(headingId("Practice problems")).toBe("practice-problems");
    expect(ids.get("stress-and-margins")).toContain("sec-1b");
    expect(ids.get("pressure-vessels")).toContain("sec-3");
  });

  it("every session links somewhere that exists", () => {
    for (const session of allSessions) {
      const { to } = sessionLink(session);
      const [path, query = ""] = to.split("?");
      const params = new URLSearchParams(query);
      if (path.startsWith("/lessons/")) {
        const slug = path.slice("/lessons/".length);
        expect(ids.has(slug), `${session.id} → ${to}`).toBe(true);
        if (params.get("section")) expect(ids.get(slug)!.has(params.get("section")!), `${session.id} → ${to}`).toBe(true);
      } else if (path.startsWith("/tools/")) {
        const track = toolTracks.find((t) => t.id === path.slice("/tools/".length));
        expect(track, `${session.id} → ${to}`).toBeTruthy();
        if (params.get("step")) expect(track!.path.some((s) => `w${s.week}` === params.get("step"))).toBe(true);
      } else {
        expect(to).toMatch(/^\/(week\/\d+|capstone|flashcards|anatomy|launch|resources)/);
      }
    }
  });

  it("points sessions at the section they name", () => {
    expect(sessionLink(sessionById.get("w1-d1-s1")!).to).toBe("/lessons/stress-and-margins?section=sec-1b");
    expect(sessionLink(sessionById.get("w2-d0-s1")!).to).toBe("/lessons/pressure-vessels?section=sec-3");
    expect(sessionLink(sessionById.get("w1-d1-s2")!).to).toBe("/tools/python?step=w1");
    expect(sessionLink(sessionById.get("w1-d8-s1")!).to).toBe("/week/1?section=deliverable");
  });
});

describe("Focus page", () => {
  it("starts a timer, and Done checks the session off and logs the minutes", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/focus/w3-d0-s1"]}>
          <Routes>
            <Route path="/focus/:id" element={<Focus />} />
            <Route path="*" element={<p>home</p>} />
          </Routes>
        </MemoryRouter>,
      );
    });
    expect(container.textContent).toContain("Open: Lesson 3 §1");
    const button = (label: string) => [...container.querySelectorAll("button")].find((b) => b.textContent === label)!;
    await act(async () => button("25 / 5").click());
    await act(async () => button("Start timer").click());
    expect(JSON.parse(localStorage.getItem("booster-prep:timer")!)).toMatchObject({ sessionId: "w3-d0-s1", mode: "25/5" });
    expect(container.querySelector('[role="timer"]')?.textContent).toBe("25:00");
    const input = container.querySelector<HTMLInputElement>("input.input")!;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "42");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => button("Done").click());
    expect(getProgress().sessions["w3-d0-s1"]).toBeTruthy();
    expect(getProgress().minutes["w3-d0-s1"]).toBe(42);
    expect(localStorage.getItem("booster-prep:timer")).toBeNull();
    root.unmount();
  });
});
