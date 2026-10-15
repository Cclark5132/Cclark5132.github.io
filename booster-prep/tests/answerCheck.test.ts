import { describe, expect, it } from "vitest";
import { checkAnswer, parseAnswer, rowKey } from "../src/lib/answerCheck";

describe("answer check", () => {
  it("parses typed numbers", () => {
    expect(parseAnswer("+0.97")).toBe(0.97);
    expect(parseAnswer("−0.875")).toBe(-0.875);
    expect(parseAnswer("1,375.4")).toBe(1375.4);
    expect(parseAnswer("abc")).toBeNaN();
    expect(parseAnswer("")).toBeNaN();
  });

  it("values within 2%", () => {
    expect(checkAnswer("11.9", 11.852, "value")).toBe(true);
    expect(checkAnswer("12.2", 11.852, "value")).toBe(false);
  });

  it("margins compare 1 + MS within 2%", () => {
    expect(checkAnswer("0.97", 0.968, "margin")).toBe(true);
    expect(checkAnswer("0.0", 0.013, "margin")).toBe(true);
    expect(checkAnswer("2.59", 0.968, "margin")).toBe(false);
    expect(checkAnswer("n/a", Infinity, "margin")).toBe(true);
    expect(checkAnswer("5", Infinity, "margin")).toBe(false);
  });

  it("row keys are stable", () => {
    expect(rowKey("2. Flight, pressurized", "Axial buckling (SP-8007)")).toBe("2-flight-pressurized-axial-buckling-sp-8007");
  });
});
