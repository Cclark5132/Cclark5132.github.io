// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Capstone } from "../src/pages/Capstone";

describe("capstone page", () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <Capstone />
    </MemoryRouter>,
  );

  it("hides the reference solution until you've entered your own numbers", () => {
    expect(html).not.toContain("Jump to minimum t");
    expect(html).not.toContain("Minimum margin vs. wall thickness");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>.*Reveal reference solution/);
    expect(html).toContain("Answer check");
  });

  it("states the buckling FS, the corrected buckling formula and the proof logic", () => {
    expect(html).toContain("1.4 on buckling (applied to the destabilizing load only");
    expect(html).toContain("The FS 1.4 multiplies the applied (destabilizing) load only");
    expect(html).toContain("1.25 × MEOP");
    expect(html).toContain("no yield at proof");
  });
});
