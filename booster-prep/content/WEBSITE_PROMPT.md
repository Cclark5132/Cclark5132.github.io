# Claude Code prompt: Booster Prep website

**How to use this:** make a new empty folder, put `PLAN.md` in it, open Claude Code in that folder, and paste everything below the line.

---

Build me a polished, in-depth personal study website called **Booster Prep** that turns `PLAN.md` (in this folder) into the tool I'll use every day for 12 weeks to prepare for my internship on the SpaceX Starship booster structures team, which starts January 11, 2027. I'm a mechanical engineering junior. I know SolidWorks and have welded. I'm learning NX, Ansys, Python, and MATLAB, and I study 2 hours a day.

## Source of truth

- `PLAN.md` is the source of truth for the schedule, topics, formulas, worked examples, capstone spec, and resources. Read all of it before writing code. Keep every week, topic, formula, self-check, and deliverable from it.
- You may expand lessons with more explanation, worked problems, and diagrams, but stay technically correct. Use standard textbook formulas only.
- Never present guesses about SpaceX hardware as fact. Anything about Starship beyond what PLAN.md says must be general public knowledge, and approximate numbers must be labeled "approx., public sources." All capstone loads and allowables are practice values and must be labeled that way on the page.

## Tech stack

- **Astro** with **MDX** for content, **React** islands for interactive parts, **TypeScript**, **Tailwind CSS**.
- **KaTeX** via remark-math and rehype-katex for every formula. Math must be large, clear, and easy to read, with each variable defined in a small table right under the equation, including units.
- Fully static, no backend. Progress is saved in localStorage, with **Export / Import progress (JSON)** buttons so I don't lose it.
- Must build cleanly with `npm run build` and be deployable to GitHub Pages or Vercel. Add a README with run and deploy steps.

## Design

- A "mission control" look: dark theme by default with a light-mode toggle, a stainless steel and deep navy palette, one orange accent color, a clean sans-serif for text, and a monospace font for numbers.
- Excellent on a phone and a laptop. No horizontal scroll on phones.
- Fast, accessible (keyboard navigation, good contrast, alt text), and calm. No clutter, no stock photos.

## Pages and features

1. **Mission Dashboard (home)**
   - Live countdown to January 11, 2027.
   - "Today" card: works out the current week and day from the calendar in PLAN.md and shows today's two 1-hour sessions with checkboxes.
   - Overall progress ring, per-track progress bars (Structures, CAD/FEA, Code), and a study streak counter.
   - Hours logged vs. planned, shown as "logged hrs / planned hrs".

2. **Roadmap**
   - A visual 12-week timeline (plus Week 0) with phases color-coded: Foundations, Core Structures, Review, Capstone, Launch Prep. Light weeks are marked.
   - Click a week to open its page.

3. **Week pages (one per week)**
   - The three tracks, Starship context, deliverable, and self-check questions from PLAN.md.
   - A day-by-day schedule using the weekly rhythm table, with a checkbox for every session.
   - Self-check answers hidden behind a "Show answer" toggle.
   - A notes box per week saved to localStorage.
   - "Mark deliverable done" with an optional link field (e.g. to my GitHub repo).

4. **Lessons (Structures track)**
   - One in-depth MDX lesson per structures topic: concept explanation, the formulas, a labeled diagram (inline SVG that works in both themes), at least 2 fully worked examples with every step shown, common mistakes, and 5 or more practice problems with hidden step-by-step solutions.
   - Topics: stress and margins; thin-walled pressure vessels and hydrostatic head; stainless steel and thermal stress; stiffeners, stress concentrations and GD&T; column and plate buckling; thin-cylinder buckling and knockdown factors; welds and bolted joints; fatigue, fracture and proof testing.

5. **Tool tracks (NX, Ansys, Python, MATLAB)**
   - A guided path for each tool matching PLAN.md week by week, with step-by-step exercises and a "SolidWorks → NX" translation table.
   - An FEA best-practices page: units, boundary conditions, shells vs. solids, symmetry, mesh convergence, sanity checks against hand calcs, and staying under the Ansys Student node limit.

6. **Calculators** (React, live as I type, with units shown and a unit toggle between SI and US customary)
   - Margin of safety
   - Thin-wall pressure vessel (hoop, axial, dome stress) with hydrostatic head and acceleration
   - Required wall thickness
   - Euler and Johnson column buckling, with a plot of critical stress vs. slenderness
   - Thin-cylinder buckling with the NASA SP-8007 knockdown factor, with and without pressure
   - Thermal stress
   - Bolt torque ↔ preload
   - Miner's rule damage
   - Each calculator shows the formula, the substituted numbers, and the result, so I see the math, not just an answer.

7. **Capstone**
   - The full spec from PLAN.md, broken into step cards with checklists.
   - A built-in hand-calc panel that runs all three load cases for a chosen wall thickness and number of ring frames, shows a margins table (green for positive, red for negative), and plots mass and minimum margin vs. thickness.
   - A report outline template I can copy.

8. **Booster Anatomy**
   - An interactive, simplified side-view SVG of a generic super heavy booster. Hovering or tapping each section (methane tank, common dome, LOX tank, downcomer, thrust section, hot-staging ring, grid fins, chines, catch hardpoints) shows what it does and what loads it carries. Label it clearly as a simplified illustration.

9. **Flashcards**
   - A deck built from all formulas, definitions, and self-check questions, with simple spaced repetition (Again / Good / Easy) saved in localStorage, and filters by week and track.

10. **Resources and Glossary**
    - The reference table from PLAN.md, with each resource tagged by week and track.
    - A searchable glossary of structures, manufacturing, and Starship terms.

11. **Launch Prep**
    - Questions for my manager, the "working well as an intern" habits, and a logistics checklist from Week 12, all with checkboxes.

Add global search across lessons, glossary, and flashcards.

## Correctness checks (required)

- Put all calculator math in one tested TypeScript module, and write **Vitest** tests using these worked examples from PLAN.md:
  - Margin: allowable 300 MPa, applied 200 MPa, FS 1.4 → MS ≈ +0.071
  - Wall thickness: R 4500 mm, p 0.35 MPa, FS 1.25, allowable 500 MPa → t ≈ 3.94 mm
  - Hydrostatic head: ρ 1141 kg/m³, h 20 m, 1 g → ≈ 0.224 MPa; at 3 g → ≈ 0.672 MPa
  - Cylinder buckling: R 4500 mm, t 4 mm, E 193 GPa → σ_cr ≈ 103.8 MPa, γ ≈ 0.210, σ_design ≈ 21.8 MPa
  - Thermal stress: E 193 GPa, α 17e-6 /°C, ΔT 200 °C → ≈ 656 MPa
  - Bolt preload: T 100 N·m, K 0.2, d 12.7 mm → F ≈ 39,400 N
  - Miner's rule: 1000/10000 + 50/500 → D = 0.2
- Run `npm run build`, the tests, and a linter, and fix everything until all pass.
- Use Playwright to screenshot the dashboard, a week page, a lesson, a calculator, and the anatomy page at phone width (390 px) and laptop width (1440 px), in both themes. Look at the screenshots and fix any layout or contrast problems.

## Working style

- Plan first: write a short `ARCHITECTURE.md` with the page map, content structure, and component list, then build.
- Build in this order: site shell and design system → content from PLAN.md → week pages and progress tracking → lessons → calculators with tests → capstone → anatomy page → flashcards → search → polish.
- When you finish, give me a summary of what was built, how to run it locally, and how to deploy it.
