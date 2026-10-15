// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { Dashboard } from "../src/pages/Dashboard";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function renderOn(date: string) {
  window.history.replaceState(null, "", `/?date=${date}`);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
  });
  return { container, root };
}

describe("dashboard on mocked dates (dev ?date= override)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    window.history.replaceState(null, "", "/");
  });

  it("2026-10-15 shows Week 0, Day 1 of 1, Setup, with 2 sessions", async () => {
    const { container, root } = await renderOn("2026-10-15");
    expect(container.textContent).toContain("Week 0 · Day 1 of 1 · Setup");
    const today = [...container.querySelectorAll("section")].find((s) => s.textContent?.includes("Today: Setup"))!;
    expect(today.querySelectorAll('input[type="checkbox"]').length).toBe(2);
    expect(container.textContent).toContain("/ 162 hrs");
    root.unmount();
  });

  it("2026-10-16 shows Week 1, Day 1 of 10", async () => {
    const { container, root } = await renderOn("2026-10-16");
    expect(container.textContent).toContain("Week 1 · Day 1 of 10");
    root.unmount();
  });

  it("2026-10-26 shows Week 2, Day 1", async () => {
    const { container, root } = await renderOn("2026-10-26");
    expect(container.textContent).toContain("Week 2 · Day 1 of 7");
    root.unmount();
  });
});
