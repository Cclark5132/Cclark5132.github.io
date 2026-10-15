// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { expect, it } from "vitest";
import App from "../src/App";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("survives route changes when scrollTo returns a Promise, as in newer browsers", async () => {
  window.scrollTo = (() => Promise.resolve()) as unknown as typeof window.scrollTo;
  const errors: unknown[] = [];
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container, { onUncaughtError: (error) => errors.push(error) });
  await act(async () => {
    root.render(
      <HashRouter>
        <App />
      </HashRouter>,
    );
  });
  for (const hash of ["#/roadmap", "#/lessons", "#/calculators"]) {
    await act(async () => {
      window.location.hash = hash;
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  }
  expect(errors).toEqual([]);
  expect(container.querySelector("h1")?.textContent).toBe("Hand-calc toolkit");
  root.unmount();
});
