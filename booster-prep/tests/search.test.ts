import { describe, expect, it } from "vitest";
import { deck } from "../src/lib/cards";
import { search } from "../src/lib/search";

const titles = (query: string) => search(query).map((r) => r.item.title);

describe("search index", () => {
  it("finds the new lesson sections", () => {
    expect(search("running load").some((r) => r.item.section.startsWith("Lesson"))).toBe(true);
    expect(search("Geckeler").some((r) => r.item.to === "/lessons/pressure-vessels")).toBe(true);
    expect(search("imperfection").some((r) => r.item.section.startsWith("Lesson"))).toBe(true);
  });

  it("finds the new glossary terms", () => {
    for (const term of ["MEOP", "Limit load", "Ultimate load", "Proof factor", "Running load", "Equivalent axial load", "Discontinuity stress", "Nastran bulk data"]) {
      expect(titles(term)).toContain(term);
    }
  });

  it("finds the Nastran literacy card", () => {
    expect(titles("CQUAD4")).toContain("Nastran deck literacy (optional)");
  });
});

describe("flashcard deck", () => {
  const labels = deck.filter((c) => c.kind === "formula").map((c) => c.front);

  it("picks up the new lesson formulas automatically", () => {
    for (const label of ["Axial running load from axial force and bending", "Equivalent axial load", "Shell parameter (bending decay rate)", "Hemisphere-to-cylinder joint: shear and bending moment", "Net axial compression with internal pressure"]) {
      expect(labels.some((front) => front.includes(`**${label}**`))).toBe(true);
    }
  });

  it("has unique card ids", () => {
    expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
  });
});
