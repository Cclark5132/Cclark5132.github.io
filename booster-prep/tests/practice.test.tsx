// @vitest-environment happy-dom
import katex from "katex";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import * as S from "../src/calc/structures";
import { Rich } from "../src/components/Tex";
import { checkPractice } from "../src/lib/answerCheck";
import { activeDeck } from "../src/lib/cards";
import { emptyView } from "../src/lib/progressDoc";
import { answerText, makeProblem, mixedTopic, solution, topics, unlockedTopics, type Problem, type TopicId } from "../src/lib/practice";
import { getProgress } from "../src/lib/store";
import { weakTopics } from "../src/lib/weak";
import { Practice } from "../src/pages/Practice";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SEEDS = [1, 2, 3, 42, 777, 2026, 123456];
const g = (p: Problem, sym: string) => p.givens.find((x) => x.sym === sym)!.si;
const a = (p: Problem, key: string) => p.answers.find((x) => x.key === key)!;

/** Recomputes each answer straight from structures.ts using the problem's own givens. */
const recompute: Record<TopicId, (p: Problem) => Record<string, number | string>> = {
  margin: (p) => ({ ms: S.marginOfSafety(g(p, "\\sigma_\\text{allow}"), g(p, "\\sigma"), g(p, "FS")) }),
  mohr: (p) => ({ s1: S.principalStresses(g(p, "\\sigma_x"), g(p, "\\sigma_y"), g(p, "\\tau_{xy}")).s1, vm: S.vonMises(g(p, "\\sigma_x"), g(p, "\\sigma_y"), g(p, "\\tau_{xy}")) }),
  running: (p) => ({ nx: S.runningLoad(g(p, "P") * 1e6, g(p, "M") * 1e9, g(p, "R")).peak, peq: S.equivalentAxialLoad(g(p, "P") * 1e6, g(p, "M") * 1e9, g(p, "R")) / 1e6 }),
  pressure: (p) => ({ hoop: S.thinWall(g(p, "p"), g(p, "R"), g(p, "t")).hoop, treq: S.requiredThickness(g(p, "p"), g(p, "R"), g(p, "FS"), g(p, "\\sigma_\\text{allow}")) }),
  head: (p) => {
    const head = S.hydrostaticHead(g(p, "\\rho"), g(p, "n"), g(p, "h"));
    return { head, total: head + g(p, "p_\\text{ullage}") };
  },
  thermal: (p) => {
    const [E, al, dT] = [g(p, "E"), g(p, "\\alpha"), g(p, "\\Delta T")];
    if (p.givens.some((x) => x.sym === "k")) return { sigma: S.thermalStressSpring(E, al, dT, g(p, "A"), g(p, "k"), g(p, "L")) };
    if (p.givens.some((x) => x.sym === "\\nu")) return { sigma: S.thermalStressBiaxial(E, al, dT, g(p, "\\nu")) };
    return { sigma: S.thermalStress(E, al, dT) };
  },
  section: (p) => {
    const rects = p.givens.some((x) => x.sym === "b_f")
      ? [
          { b: g(p, "t_w"), h: g(p, "h_w"), y: g(p, "h_w") / 2 },
          { b: g(p, "b_f"), h: g(p, "t_f"), y: g(p, "h_w") + g(p, "t_f") / 2 },
        ]
      : [
          { b: g(p, "t"), h: g(p, "H"), y: g(p, "H") / 2 },
          { b: g(p, "B") - g(p, "t"), h: g(p, "t"), y: g(p, "t") / 2 },
        ];
    const s = S.sectionProperties(rects);
    return { ybar: s.ybar, I: s.I };
  },
  column: (p) => {
    const d = g(p, "d");
    const K = Number(p.prompt.match(/K = ([\d.]+)/)![1]);
    const c = S.columnBuckling(g(p, "E"), g(p, "\\sigma_y"), (Math.PI * d * d) / 4, (Math.PI * d ** 4) / 64, K, g(p, "L"));
    return { regime: c.regime, pcr: c.load / 1000 };
  },
  plate: (p) => {
    const scr = S.plateBuckling(4, g(p, "E"), g(p, "\\nu"), g(p, "t"), g(p, "b"));
    return { scr, be: S.effectiveWidth(g(p, "b"), g(p, "t"), scr, g(p, "\\sigma_\\text{max}")).be };
  },
  cylinder: (p) => {
    const c = S.cylinderBuckling(g(p, "R"), g(p, "t"), g(p, "E"));
    const net = S.netAxialCompressionFactored(g(p, "P") * 1e6, g(p, "FS"), g(p, "p_\\text{min}"), g(p, "R"), g(p, "t"));
    return { gamma: c.gamma, ms: S.bucklingMargin(c.loadCapacity, net.netLoad) };
  },
  bolt: (p) => {
    const Fi = S.preloadFromTorque(g(p, "T"), g(p, "K"), g(p, "d"));
    return { fi: Fi / 1000, psep: S.boltJoint(Fi, g(p, "k_b"), g(p, "k_m")).Psep / 1000 };
  },
  weld: (p) => {
    const w = S.filletWeld(g(p, "F") * 1000, g(p, "a"), g(p, "L_w"));
    return { throat: w.throat, tau: w.tau };
  },
  goodman: (p) => {
    const [mx, mn] = [g(p, "\\sigma_\\text{max}"), g(p, "\\sigma_\\text{min}")];
    return { sa: (mx - mn) / 2, ms: S.goodman((mx - mn) / 2, (mx + mn) / 2, g(p, "S_e"), g(p, "S_u")).ms };
  },
  miner: (p) => {
    const blocks = [];
    for (let i = 1; p.givens.some((x) => x.sym === `n_${i}`); i++) blocks.push({ n: g(p, `n_${i}`), N: g(p, `N_${i}`) });
    return { D: S.minersDamage(blocks) };
  },
  crack: (p) => ({ ac: S.criticalCrackSize(g(p, "K_{Ic}"), g(p, "Y"), g(p, "\\sigma")) * 1000 }),
};

const solutionText = (p: Problem, system: "SI" | "US") =>
  solution(p, system)
    .map((s) => s.text ?? s.tex)
    .join("\n");

describe("practice generators", () => {
  it("there are 15 topics", () => {
    expect(topics.map((t) => t.id)).toHaveLength(15);
  });

  for (const topic of topics) {
    describe(topic.id, () => {
      for (const seed of SEEDS) {
        it(`seed ${seed}: answers come from structures.ts, and the solution shows them`, () => {
          const p = makeProblem(topic.id, seed);
          expect(makeProblem(topic.id, seed)).toEqual(p); // replayable
          const ref = recompute[topic.id](p);
          for (const ans of p.answers) {
            if (ans.kind === "choice") expect(ans.choice).toBe(ref[ans.key]);
            else {
              expect(Number.isFinite(ans.si)).toBe(true);
              expect(ans.si).toBeCloseTo(ref[ans.key] as number, 9);
            }
            for (const system of ["SI", "US"] as const) expect(solutionText(p, system)).toContain(answerText(ans, system));
          }
          for (const giv of p.givens) expect(Number.isFinite(giv.si)).toBe(true);
        });
      }

      it("every solution step renders in KaTeX", () => {
        const p = makeProblem(topic.id, 42);
        for (const system of ["SI", "US"] as const)
          for (const step of solution(p, system)) {
            if (step.tex) expect(() => katex.renderToString(step.tex!, { throwOnError: true, displayMode: true })).not.toThrow();
            if (step.text) expect(renderToStaticMarkup(<Rich text={step.text} />)).not.toContain("katex-error");
          }
      });
    });
  }

  it("inputs stay physically sensible", () => {
    for (const seed of SEEDS) {
      const cyl = makeProblem("cylinder", seed);
      expect(a(cyl, "ms").si).not.toBe(Infinity); // always net compression
      const plate = makeProblem("plate", seed);
      expect(a(plate, "be").si).toBeLessThanOrEqual(g(plate, "b"));
      expect(a(plate, "scr").si).toBeLessThan(g(plate, "\\sigma_\\text{max}"));
      expect(a(makeProblem("pressure", seed), "hoop").si).toBeGreaterThan(0);
    }
  });

  it("mixed mode only serves unlocked topics", () => {
    const starts = new Map([
      [2, "2026-10-26"],
      [5, "2026-11-16"],
    ]);
    const open = unlockedTopics(starts, "2026-10-27");
    expect(open.map((t) => t.week).every((w) => w <= 2)).toBe(true);
    for (const seed of SEEDS) expect(open.map((t) => t.id)).toContain(mixedTopic(open, seed));
  });
});

describe("practice checking", () => {
  it("accepts values within ±1% and margins within ±0.01", () => {
    expect(checkPractice("100.9", 100, "value")).toBe(true);
    expect(checkPractice("101.1", 100, "value")).toBe(false);
    expect(checkPractice("−0.205", -0.2, "margin")).toBe(true);
    expect(checkPractice("0.215", 0.2, "margin")).toBe(false);
    expect(checkPractice("", 1, "value")).toBe(false);
  });

  it("weak topics need 3 attempts and rank lowest accuracy first", () => {
    const p = { ...emptyView(), practice: { "margin|a": { attempts: 4, correct: 1 }, "margin|b": { attempts: 1, correct: 1 }, "weld|a": { attempts: 3, correct: 3 }, "crack|a": { attempts: 2, correct: 0 } } };
    expect(weakTopics(p).map((w) => [w.topic, w.accuracy])).toEqual([
      ["margin", 0.4],
      ["weld", 1],
    ]);
  });
});

describe("Practice page", () => {
  async function open(url: string) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[url]}>
          <Practice />
        </MemoryRouter>,
      );
    });
    return { container, root };
  }
  const type = async (input: HTMLInputElement, value: string) =>
    act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

  it("checks a right answer, shows the worked solution and counts the attempt", async () => {
    localStorage.setItem("booster-prep:units", "SI");
    const p = makeProblem("pressure", 9);
    const { container, root } = await open("/practice?topic=pressure&seed=9");
    const inputs = container.querySelectorAll<HTMLInputElement>("input.input");
    await type(inputs[0], String(a(p, "hoop").si.toFixed(2)));
    await type(inputs[1], String(a(p, "treq").si.toFixed(3)));
    const check = [...container.querySelectorAll("button")].find((b) => b.textContent === "Check")!;
    await act(async () => check.click());
    expect(container.textContent).toContain("Correct.");
    expect(container.textContent).toContain("Worked solution");
    expect(container.querySelectorAll(".solution .katex-display").length).toBe(2);
    const tally = Object.entries(getProgress().practice).find(([k]) => k.startsWith("pressure|"))![1];
    expect(tally).toEqual({ attempts: 1, correct: 1 });
    root.unmount();
  });

  it("a wrong answer offers Add to flashcards", async () => {
    const { container, root } = await open("/practice?topic=weld&seed=3");
    for (const input of container.querySelectorAll<HTMLInputElement>("input.input")) await type(input, "1");
    await act(async () => [...container.querySelectorAll("button")].find((b) => b.textContent === "Check")!.click());
    expect(container.textContent).toContain("Not quite.");
    const add = [...container.querySelectorAll("button")].find((b) => b.textContent === "Add to flashcards")!;
    await act(async () => add.click());
    expect(activeDeck(getProgress().checks).some((c) => c.id === "p-weld")).toBe(true);
    expect(getProgress().cards["p-weld"].interval).toBe(0);
    root.unmount();
  });

  it("works in US units", async () => {
    localStorage.setItem("booster-prep:units", "US");
    const { container, root } = await open("/practice?topic=margin&seed=5");
    expect(container.textContent).toContain("ksi");
    root.unmount();
    localStorage.setItem("booster-prep:units", "SI");
  });
});
