# Starship Booster Structures: 12-Week Internship Prep Plan

**Intern:** Charlie, Mechanical Engineering junior at Virginia Tech
**Team:** Starship Booster (Super Heavy) Structures, Starbase, TX
**Start date:** Monday, January 11, 2027
**Prep window:** October 15, 2026 to January 10, 2027
**Time budget:** 2 hours a day

---

## How this plan works

Every week mixes three tracks, so theory and tools grow together:

| Track | What it covers | Share of each week |
|---|---|---|
| **Structures** | The theory behind booster structures, done as hand calcs | about 40% |
| **CAD / FEA** | NX for modeling and drawings, then Ansys for analysis | about 35% |
| **Code** | Python first, MATLAB second, building your own calc toolkit | about 25% |

Each week also has a short **Starship context** reading, one **deliverable** you keep in a portfolio folder, and **self-check questions**. If you can answer the self-checks without notes, move on.

### Weekly rhythm (2 hours a day)

| Day | Hour 1 | Hour 2 |
|---|---|---|
| Mon | Structures: learn the topic | CAD / FEA |
| Tue | Structures: worked problems | Code |
| Wed | Structures: learn the topic | CAD / FEA |
| Thu | Structures: worked problems | Code |
| Fri | CAD / FEA | Code: turn this week's hand calc into a script |
| Sat | Deliverable build | Deliverable build |
| Sun | Starship context reading (30 min) | Flashcards and self-check (30 min), rest |

### Time budget

- Normal weeks: **7 days × 2 hrs = 14 hrs**
- Light weeks (Thanksgiving, finals): **about 7 hrs**
- Total: **10 normal weeks × 14 hrs + 2 light weeks × 7 hrs = 154 hrs**, plus about 4 hrs of setup in Week 0

### Calendar

| Week | Dates | Phase | Load |
|---|---|---|---|
| 0 | Oct 15 – Oct 18 | Setup | ~4 hrs |
| 1 | Oct 19 – Oct 25 | Foundations | 14 hrs |
| 2 | Oct 26 – Nov 1 | Foundations | 14 hrs |
| 3 | Nov 2 – Nov 8 | Foundations | 14 hrs |
| 4 | Nov 9 – Nov 15 | Foundations | 14 hrs |
| 5 | Nov 16 – Nov 22 | Core structures | 14 hrs |
| 6 | Nov 23 – Nov 29 | Core structures (Thanksgiving) | ~7 hrs |
| 7 | Nov 30 – Dec 6 | Core structures | 14 hrs |
| 8 | Dec 7 – Dec 13 | Core structures | 14 hrs |
| 9 | Dec 14 – Dec 20 | Review (finals) | ~7 hrs |
| 10 | Dec 21 – Dec 27 | Capstone | 14 hrs |
| 11 | Dec 28 – Jan 3 | Capstone | 14 hrs |
| 12 | Jan 4 – Jan 10 | Launch prep | 14 hrs |

Check your own exam schedule and slide Week 9 if finals land differently.

---

## Week 0: Setup (Oct 15 – Oct 18)

- Install **Ansys Student** (free; structural problems are capped at about 128,000 nodes/elements, so learn to use shells and symmetry early).
- Get **Siemens NX** access. Try the NX student edition from Siemens first. If that doesn't work, ask the VT ME department which labs or remote desktops carry NX.
- Install **MATLAB** through Virginia Tech's campus license.
- Install **Python** (Anaconda or plain Python plus VS Code) with numpy, scipy, matplotlib, pandas, and Jupyter.
- Create a portfolio folder and a GitHub repo called `booster-prep`. Every deliverable goes there.
- Start a paper or digital **engineering notebook**. Date every page. This habit matters at SpaceX.

---

## Phase 1: Foundations (Weeks 1–4)

### Week 1: Stress, loads, and margins (Oct 19 – Oct 25)

**Structures**
- Free body diagrams for a vertical rocket stage: thrust, weight, inertia, aerodynamic bending.
- Stress and strain, Hooke's law, Mohr's circle, principal stresses.
- Von Mises equivalent stress:

  σ_vm = √( σ₁² − σ₁σ₂ + σ₂² )   (2D, principal stresses)

- Factor of safety (FS) and margin of safety (MS):

  MS = σ_allowable / (FS × σ_applied) − 1

  A part passes when **MS ≥ 0**. Aerospace work talks in margins far more than in factors of safety.

**CAD / FEA (NX)**
- NX interface tour. Map SolidWorks words to NX words (Feature Manager → Part Navigator, Sketch → Sketch, Extrude → Extrude, Mates → Assembly Constraints).
- Sketch, extrude, revolve, holes, patterns.

**Code (Python)**
- Variables, functions, lists, f-strings, plotting a simple line.
- Write `margin_of_safety(allowable, applied, fs)`.

**Starship context**
- The full stack: Super Heavy booster below, Starship upper stage on top. Both are stainless steel, about 9 m in diameter, and burn liquid methane and liquid oxygen.

**Deliverable:** NX model of a bolted flange ring, plus `mos.py` that prints margins for a list of load cases.

**Self-check**
1. Why do aerospace engineers report margins instead of just factors of safety?
2. A part with σ_allowable = 300 MPa, σ_applied = 200 MPa, and FS = 1.4. What's the margin? (Answer: 300 / (1.4 × 200) − 1 = **+0.07**)
3. What does a negative margin mean, and what are the three ways to fix one?

---

### Week 2: Thin-walled pressure vessels (Oct 26 – Nov 1)

**Structures**
- Thin-wall cylinder, radius R and wall thickness t, internal pressure p:

  σ_hoop = p × R / t
  σ_axial = p × R / (2t)

- Spherical or hemispherical dome:

  σ = p × R / (2t)

- Ellipsoidal domes and why dome shape matters at the joint with the barrel.
- Hydrostatic head: liquid at the bottom of a tank sees extra pressure, and it grows with vehicle acceleration (n, in g's):

  p_hydro = ρ × n × g × h

  Example: liquid oxygen (ρ ≈ 1141 kg/m³), h = 20 m, at 1 g:
  p = 1141 × 1 × 9.81 × 20 ≈ **0.22 MPa**. At 3 g it triples to about **0.67 MPa**.

- Total wall pressure = ullage (gas) pressure + hydrostatic head.

**CAD / FEA (NX)**
- Revolve, shell, and thicken. Model a tank: cylindrical barrel plus two domes.
- Measure mass and volume with NX's measure tools.

**Code (Python)**
- numpy arrays; plot hoop stress vs. wall thickness for several pressures.

**Starship context**
- Booster tank layout: the methane tank sits above the liquid oxygen tank, separated by a common dome. A downcomer pipe carries methane down through the LOX tank to the engines.

**Deliverable:** `tank_stress.py` that takes R, t, ullage pressure, fill height, and acceleration, then plots wall stress from top to bottom of the tank.

**Self-check**
1. Why is hoop stress twice axial stress?
2. Where in a full tank under acceleration is wall pressure highest?
3. Size the wall: R = 4.5 m, p = 0.35 MPa, FS = 1.25, allowable = 500 MPa (a made-up practice value).
   t = FS × p × R / σ_allow = 1.25 × 0.35 × 4500 / 500 ≈ **3.94 mm**

---

### Week 3: Materials, stainless steel, and thermal stress (Nov 2 – Nov 8)

**Structures**
- Austenitic stainless steel (300 series, such as 304L). Its strength rises at cryogenic temperature and it stays ductile, because its crystal structure has no ductile-to-brittle transition.
- Cold work and work hardening; why yield strength depends on how the sheet was processed.
- Design allowables: A-basis and B-basis values, and the **MMPDS** handbook where they come from.
- Thermal stress in a fully constrained part:

  σ_thermal = E × α × ΔT

  Cryogenic propellant on one side of a joint and ambient air on the other creates exactly this.

**CAD / FEA (NX)**
- Assemblies and constraints. Drafting: create a drawing with views, sections, and dimensions.

**Code (MATLAB)**
- Finish **MATLAB Onramp** (free from MathWorks). Practice matrices and plotting.

**Starship context**
- Why stainless instead of carbon fiber or aluminum-lithium: low cost, strong at cryogenic temperatures, handles reentry heat, and is easy to weld and repair.

**Deliverable:** NX drawing of a barrel ring segment, plus a MATLAB plot of yield strength vs. temperature from published data.

**Self-check**
1. Why doesn't 304L get brittle in liquid oxygen when carbon steel would?
2. A constrained steel part cools by 200 °C. With E = 193 GPa and α = 17 × 10⁻⁶ /°C, what's the thermal stress?
   σ = 193,000 × 17 × 10⁻⁶ × 200 ≈ **656 MPa** (which is why parts are rarely fully constrained)
3. What's the difference between A-basis and B-basis allowables?

---

### Week 4: Stiffeners, stress concentrations, GD&T, and first FEA (Nov 9 – Nov 15)

**Structures**
- Ring frames and stringers: what each one stiffens and why.
- Bending of beams and thin walls; section properties (I, Q, centroid) of stiffener cross-sections.
- Stress concentrations (Kt) around holes and cutouts. A small hole in a wide plate under tension has **Kt ≈ 3**. Peterson's *Stress Concentration Factors* is the reference.
- **GD&T** basics from ASME Y14.5: datums, flatness, profile, position. Booster rings are large and thin, so profile and roundness tolerances matter.

**CAD / FEA (Ansys)**
- Ansys Workbench workflow: geometry, material, mesh, loads, supports, solve, results.
- First model: a plate with a center hole in tension. Check that max stress ≈ 3 × nominal.

**Code (Python)**
- pandas: load a CSV of fake strain-gauge data, convert strain to stress (σ = E × ε), and plot it.

**Starship context**
- How a booster is built: flat stainless sheet is rolled into rings, rings are welded and stacked into barrel sections, and sections are stacked into the full booster.

**Deliverable:** Ansys plate-with-hole study with a short write-up comparing FEA to the Kt hand calc.

**Self-check**
1. Why can't you trust the peak stress at a sharp corner in FEA?
2. What does a datum reference frame do on a drawing?
3. Stringers or ring frames: which one mainly helps against axial buckling?

---

## Phase 2: Core structures (Weeks 5–8)

### Week 5: Buckling I, columns and plates (Nov 16 – Nov 22)

**Structures**
- Euler column buckling:

  P_cr = π² × E × I / (K × L)²

  K is the end-condition factor (1.0 pinned-pinned, 0.5 fixed-fixed, 2.0 fixed-free).
- Johnson parabola for short columns, where yielding and buckling interact.
- Flat-plate buckling and the idea of effective width.

**CAD / FEA (Ansys)**
- Eigenvalue (linear) buckling: run a static case first, then the buckling case. Compare a column's first buckling load to Euler.

**Code (Python)**
- Plot the combined Euler/Johnson curve: critical stress vs. slenderness ratio (K × L / r).

**Starship context**
- Booster axial loads: engine thrust pushing up from the bottom, propellant weight, aerodynamic bending near max-Q, and the loads from being caught by the tower's chopstick arms.

**Deliverable:** Euler/Johnson plot, plus an Ansys column buckling check within a few percent of Euler.

**Self-check**
1. Why do you have to run a static analysis before a linear buckling analysis in Ansys?
2. Doubling a column's length changes P_cr by what factor? (Answer: **¼**)
3. When does Johnson apply instead of Euler?

---

### Week 6: Buckling II, thin cylinders (Nov 23 – Nov 29, light week)

**Structures**
- Classical buckling stress of a thin cylinder under axial compression:

  σ_cr = 0.605 × E × t / R

- Real cylinders buckle far below this because of tiny shape imperfections. NASA SP-8007 (free online) gives a **knockdown factor γ**:

  φ = (1/16) × √(R / t)
  γ = 1 − 0.901 × (1 − e^(−φ))
  σ_design = γ × σ_cr

- Worked example: R = 4500 mm, t = 4 mm, E = 193 GPa
  - σ_cr = 0.605 × 193,000 × 4 / 4500 ≈ **103.8 MPa**
  - φ = √1125 / 16 ≈ 2.10
  - γ = 1 − 0.901 × (1 − e^(−2.10)) ≈ **0.21**
  - σ_design = 0.21 × 103.8 ≈ **21.8 MPa**

  An unpressurized, unstiffened barrel loses almost 80% of its theoretical strength. That's why tanks are pressurized during loads and why stringers and frames exist.
- **Pressure stabilization:** internal pressure puts the wall in tension and raises the buckling load.

**Code (Python)**
- Add `cylinder_buckling(R, t, E)` to your toolkit, returning σ_cr, γ, and σ_design.

**Starship context**
- Watch a launch and note the moments of highest axial load: liftoff, max-Q, and just before engine cutoff.

**Deliverable:** buckling function plus a one-page note explaining knockdown factors in your own words.

**Self-check**
1. Why do imperfections hurt thin cylinders so much more than columns?
2. How does internal pressure help with buckling?

---

### Week 7: Welds, bolted joints, and mesh convergence (Nov 30 – Dec 6)

**Structures**
- Weld types: butt and fillet. Weld joint efficiency, and why the heat-affected zone (HAZ) can be weaker than the parent metal.
- Weld defects: porosity, lack of fusion, undercut, cracks. Inspection (NDT): X-ray, dye penetrant, ultrasonic.
- **AWS D17.1** is the aerospace fusion welding spec. Your welding experience is a real advantage here; connect what you saw in the booth to these terms.
- Bolted joints. Torque to preload:

  T = K × F × d

  K ≈ 0.2 for dry steel, F is preload, d is nominal diameter. Also learn joint stiffness, separation, and shear vs. tension. Reference: NASA-STD-5020.

**CAD / FEA (Ansys)**
- Contacts and a simple bolted-joint model.
- **Mesh convergence study:** refine the mesh until peak stress changes by less than about 5%. Plot it. Do this on every model from now on.

**Code (Python)**
- `bolt_preload.py`: torque ↔ preload, plus bolt and joint margins.

**Starship context**
- Booster sections are joined by long circumferential welds. Think about how weld quality and inspection would scale to a vehicle this size.

**Deliverable:** mesh convergence plot plus the bolt calc tool.

**Self-check**
1. Why is weld strength often lower than parent metal strength?
2. A ½-inch (12.7 mm) bolt torqued to 100 N·m with K = 0.2. What's the preload?
   F = T / (K × d) = 100 / (0.2 × 0.0127) ≈ **39,400 N**
3. What does a mesh convergence study prove?

---

### Week 8: Fatigue, fracture, and proof testing (Dec 7 – Dec 13)

**Structures**
- S-N curves, endurance limit, the Goodman diagram for mean stress.
- Miner's rule for cumulative damage:

  D = Σ (nᵢ / Nᵢ)   failure predicted when **D ≥ 1**

- Fracture mechanics intro:

  K = Y × σ × √(π × a)

  Crack growth (Paris law): da/dN = C × (ΔK)^m
- Leak-before-burst, and how a **proof test** at pressure above flight levels screens out flaws.

**CAD / FEA (Ansys)**
- Pressurized tank model with domes using shell elements. Compare barrel hoop stress to p × R / t. Look at the stress jump at the dome-to-barrel joint.

**Code (MATLAB)**
- Miner's-rule calculator for a made-up flight load spectrum (liftoff, max-Q, catch, repeated over many flights).

**Starship context**
- A reusable booster flies many times, so fatigue matters far more than on an expendable stage. Read about cryogenic proof testing of test tanks at Starbase.

**Deliverable:** tank FEA vs. hand calc comparison, plus the Miner's-rule script.

**Self-check**
1. Why does reusability change how you think about structures?
2. A part sees 1,000 cycles where N = 10,000 and 50 cycles where N = 500. Damage?
   D = 1000/10000 + 50/500 = 0.1 + 0.1 = **0.2**
3. Why does a successful proof test give confidence about cracks?

---

## Week 9: Review (Dec 14 – Dec 20, finals, light week)

- 30 minutes a day of flashcards and self-check questions from Weeks 1–8.
- Clean up your Python toolkit into one module, `booster_calcs.py`, with a test for every function using the worked examples in this plan.
- Read the capstone spec below and sketch your model plan.

---

## Phase 3: Capstone (Weeks 10–11, Dec 21 – Jan 3)

### Project: Sizing a booster-style LOX tank barrel section

You'll analyze a simplified stainless steel barrel section the way a structures engineer would: hand calcs first, then CAD, then FEA, then a comparison, then a short report.

**Important:** all loads and allowables below are made-up practice values, not SpaceX data. Write every assumption down.

**Geometry**
- Diameter 9 m (R = 4.5 m), barrel length 6 m
- Wall thickness t is a design variable; start at 4 mm
- 3 internal ring frames, evenly spaced (stretch goal: add stringers)

**Materials**
- 304L-like stainless steel: E = 193 GPa, ν = 0.29, density 8000 kg/m³
- Practice allowables: yield 500 MPa, ultimate 700 MPa

**Load cases**
1. **Proof pressure:** internal pressure 0.45 MPa
2. **Flight, pressurized:** 0.35 MPa ullage pressure + LOX hydrostatic head at 3 g (assume 20 m of LOX above the bottom of the section) + axial compression of 30 MN
3. **Unpressurized handling:** axial compression of 2 MN only (no pressure help)

**Factors of safety (practice values):** 1.25 on yield, 1.4 on ultimate

**Steps**
1. **Hand calcs (Python):** hoop and axial stress, buckling with knockdown, and margins for every load case. Find the minimum wall thickness that gives MS ≥ 0 everywhere.
2. **NX model:** barrel plus ring frames, built as a midsurface for shell meshing. Make a drawing.
3. **Ansys static:** pressure cases, using shell elements and symmetry to stay under the student limit. Run a mesh convergence study.
4. **Ansys buckling:** linear buckling for the handling case, then the flight case with pressure applied first (prestressed buckling). Compare to your hand calcs and explain the gap.
5. **Trade study:** plot mass and minimum margin vs. wall thickness (and vs. number of ring frames). Recommend a design.
6. **Report:** 4 pages max (Summary, Assumptions, Hand Calcs, FEA, Comparison, Trade Study, Recommendation), plus a 5-slide deck.

**What good looks like**
- Hand calcs and FEA agree within about 10% where they should, and you can explain where they don't.
- Every number has a unit and a source.
- A reviewer can follow your assumptions without asking you.

---

## Week 12: Launch prep (Jan 4 – Jan 10)

**Booster anatomy deep dive**
- Learn the main parts and what loads each one carries: methane and LOX tanks, common dome, downcomer, thrust section and engine mounts (33 Raptors), hot-staging ring, grid fins, chines, and the hardpoints used for the tower catch.
- Rewatch recent flight test footage and SpaceX's flight summaries. For each flight, note one thing that would interest a structures engineer.

**Working well as an intern**
- Keep your engineering notebook from day one.
- Ask good questions: say what you tried, what you expected, and what happened.
- Learn the shop floor and safety rules quickly; booster structures sits close to production.
- Write things down so the next person doesn't have to ask.

**Questions to bring to your manager in week one**
1. What does a typical task for an intern on this team look like?
2. Which tools and internal systems should I learn first?
3. Who should I shadow on the production floor?
4. What does "done" look like for my first project?
5. How do you like to receive updates?

**Logistics**
- Housing near Starbase or Brownsville confirmed
- Car, insurance, steel-toe boots, and any PPE they ask for
- Offer paperwork, ID, and any export-control (ITAR) documents complete

**Deliverable:** one-page "first week plan" and your portfolio cleaned up and ready to show.

---

## Reference library

| Resource | Use it for |
|---|---|
| Bruhn, *Analysis and Design of Flight Vehicle Structures* | The classic aerospace structures reference |
| Niu, *Airframe Structural Design* | Practical design of stiffeners, joints, and cutouts |
| *Roark's Formulas for Stress and Strain* | Quick formulas for almost any shape |
| Shigley's *Mechanical Engineering Design* | Fatigue, bolts, and welds (you probably own it) |
| NASA SP-8007 | Buckling of thin-walled cylinders, knockdown factors (free) |
| NASA-STD-5020 | Threaded fastener design |
| MMPDS | Metallic material allowables |
| ASME Y14.5 | GD&T |
| AWS D17.1 | Aerospace fusion welding |
| Ansys Innovation Courses | Free Ansys tutorials |
| MATLAB Onramp | Free MATLAB starter course |
| SpaceX Starship updates page | Official flight summaries |
