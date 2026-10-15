// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { SessionCheck } from "../src/components/Checks";
import { Toaster } from "../src/components/Toast";
import { sessionById } from "../src/lib/schedule";
import { getProgress } from "../src/lib/store";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Undo toast", () => {
  it("checking a session shows Undo, and Undo puts it back", async () => {
    const session = sessionById.get("w2-d1-s1")!;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <>
          <SessionCheck session={session} />
          <Toaster />
        </>,
      );
    });
    const box = container.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    await act(async () => box.click());
    expect(getProgress().sessions["w2-d1-s1"]).toBeTruthy();
    const undo = [...container.querySelectorAll("button")].find((b) => b.textContent === "Undo")!;
    expect(container.textContent).toContain("Checked off");
    await act(async () => undo.click());
    expect(getProgress().sessions["w2-d1-s1"]).toBeUndefined();
    expect(container.textContent).not.toContain("Undo");
    root.unmount();
  });
});
