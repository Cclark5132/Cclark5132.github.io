// @vitest-environment happy-dom
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { Markdown } from "../src/components/Markdown";
import { Dashboard } from "../src/pages/Dashboard";
import { Notes } from "../src/pages/Notes";
import { WeekPage } from "../src/pages/WeekPage";
import { allSessions, scheduleByWeek } from "../src/lib/schedule";
import { noteItems, search } from "../src/lib/search";
import { setNote, setSession } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function render(node: ReactNode, entry = "/") {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<MemoryRouter initialEntries={[entry]}>{node}</MemoryRouter>);
  });
  return { container, root };
}

afterEach(() => {
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
  localStorage.clear();
});

describe("Markdown notes", () => {
  it("renders headings, lists, quotes, code, links and KaTeX, without raw HTML", async () => {
    const text = [
      "# Hoop stress",
      "",
      "Thin wall: $\\sigma_h = pr/t$ and **bold** text.",
      "",
      "- first",
      "- second",
      "",
      "1. one",
      "2. two",
      "",
      "> ask the manager",
      "",
      "```",
      "x = 1",
      "```",
      "",
      "$$",
      "\\sigma_a = \\frac{pr}{2t}",
      "$$",
      "",
      "[SpaceX](https://www.spacex.com) and [bad](javascript:alert(1)) <b>raw</b>",
    ].join("\n");
    const { container, root } = await render(<Markdown text={text} />);
    expect(container.querySelector("h3")?.textContent).toBe("Hoop stress");
    expect(container.querySelectorAll("ul li")).toHaveLength(2);
    expect(container.querySelectorAll("ol li")).toHaveLength(2);
    expect(container.querySelector("blockquote")?.textContent).toContain("ask the manager");
    expect(container.querySelector("pre code")?.textContent).toBe("x = 1");
    expect(container.querySelectorAll(".katex-display")).toHaveLength(1);
    expect(container.querySelectorAll(".katex").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    const links = [...container.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["https://www.spacex.com"]);
    expect(links[0].getAttribute("rel")).toContain("noopener");
    expect(container.querySelector("b")).toBeNull();
    expect(container.textContent).toContain("<b>raw</b>");
    root.unmount();
  });
});

describe("Notes page and search", () => {
  it("lists notes from every week and filters them", async () => {
    setNote(1, "Batdorf parameter for short cylinders");
    setNote(3, "Question for manager: weld knockdown?");
    const { container, root } = await render(<Notes />, "/notes");
    expect(container.querySelectorAll("section.card")).toHaveLength(2);
    const input = container.querySelector('input[type="search"]') as HTMLInputElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "batdorf");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(container.querySelectorAll("section.card")).toHaveLength(1);
    expect(container.textContent).toContain("Week 1");
    root.unmount();
  });

  it("search finds your notes and links to the notes section of the week", () => {
    const extra = noteItems({ 2: "Remember the **Goodman** line, ask Priya", 4: "  " });
    expect(extra).toHaveLength(1);
    expect(extra[0].text).not.toContain("**");
    const hits = search("goodman priya", 30, extra);
    expect(hits).toHaveLength(1);
    expect(hits[0].item.to).toBe("/week/2?section=notes");
    expect(hits[0].item.section).toBe("Your notes");
    expect(search("priya")).toHaveLength(0);
  });
});

describe("Week page days", () => {
  it("highlights today and collapses past days that are fully done", async () => {
    const days = scheduleByWeek[1];
    const [first, second] = days;
    for (const s of first) setSession(s.id, first[0].date);
    window.history.replaceState(null, "", `/?date=${second[0].date}`);
    const { container, root } = await render(
      <Routes>
        <Route path="/week/:n" element={<WeekPage />} />
      </Routes>,
      "/week/1",
    );
    const past = container.querySelector(`#day-${first[0].date}`)!;
    const today = container.querySelector(`#day-${second[0].date}`)!;
    expect(past.classList.contains("collapsed")).toBe(true);
    expect(past.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
    expect(past.querySelector(".day-count")?.textContent).toBe(`${first.length}/${first.length}`);
    expect(today.classList.contains("today")).toBe(true);
    expect(today.getAttribute("aria-current")).toBe("date");
    expect(today.querySelectorAll('input[type="checkbox"]')).toHaveLength(second.length);
    // A collapsed day opens again on click.
    await act(async () => (past.querySelector(".day-head") as HTMLButtonElement).click());
    expect(past.querySelectorAll('input[type="checkbox"]')).toHaveLength(first.length);
    root.unmount();
  });
});

describe("Dashboard Today card", () => {
  it("shows the catch-up and cards-due chips and tomorrow's sessions", async () => {
    window.history.replaceState(null, "", "/?date=2026-10-15");
    const { container, root } = await render(<Dashboard />);
    expect(container.querySelector('[data-testid="today-catchup"]')?.textContent).toBe("Catch up: 0");
    expect(container.querySelector('[data-testid="today-cards"]')?.getAttribute("href")).toBe("/flashcards");
    const tomorrow = container.querySelector('[data-testid="tomorrow"]')!;
    const titles = allSessions.filter((s) => s.date === "2026-10-16").map((s) => s.title);
    expect(titles.length).toBeGreaterThan(0);
    expect([...tomorrow.querySelectorAll("li")].map((li) => li.textContent)).toEqual(titles);
    root.unmount();
  });
});
