export interface ToolStep {
  week: number;
  title: string;
  steps: string[];
  check: string;
}

export interface ToolTrack {
  id: "nx" | "ansys" | "python" | "matlab";
  name: string;
  blurb: string;
  path: ToolStep[];
}

/* Guided paths that follow PLAN.md week by week. Menu names are given for current NX and Ansys Workbench
   releases; if your version labels a command differently, use the command search box. */
export const toolTracks: ToolTrack[] = [
  {
    id: "nx",
    name: "Siemens NX",
    blurb: "Weeks 1–3 and 10. You already think in SolidWorks; most of the work is learning where NX puts things.",
    path: [
      {
        week: 1,
        title: "Interface tour and first parts",
        steps: [
          "Open NX, create a new Model part in millimeters, and find the Part Navigator (your FeatureManager tree) on the resource bar.",
          "Use the command finder (search box at the top) to locate Sketch, Extrude, Revolve, Hole and Pattern Feature. Pin them to a custom toolbar.",
          "Sketch a 200 mm circle on the XY plane and Extrude it 20 mm. Note how Boolean (None, Unite, Subtract) is chosen inside the Extrude dialog.",
          "Add a 12 mm Hole at a 90 mm radius, then use Pattern Feature (Circular, 12 copies) about the Z axis.",
          "Revolve a simple L-shaped profile 360° to make a flange ring with a lip.",
          "Rename features in the Part Navigator so a reviewer can read your model.",
        ],
        check: "Deliverable: NX model of a bolted flange ring.",
      },
      {
        week: 2,
        title: "Tank model: revolve, shell, thicken, measure",
        steps: [
          "Sketch half of a tank profile (barrel line plus two dome arcs) on a plane through the axis, fully constrained with expressions for R and length.",
          "Revolve it 360° into a solid, then Shell it to wall thickness t (open nothing).",
          "Rebuild the same tank as a sheet body (revolve the profile as a surface) and Thicken it. Compare the two approaches.",
          "Assign a 304L-like material (density 8000 kg/m³) and use Measure (Bodies) to read mass and volume.",
          "Change R or t in Expressions and confirm the mass updates. Compare with $m = \\rho\\, 2\\pi R t L$ for the barrel.",
        ],
        check: "Your NX mass for the barrel matches the hand calc within a few percent.",
      },
      {
        week: 3,
        title: "Assemblies and drafting",
        steps: [
          "Create an assembly; add two ring segments and a splice plate. Explore the Assembly Navigator.",
          "Constrain them with Assembly Constraints (Touch Align, Concentric, Distance). These are SolidWorks mates.",
          "Open the Drafting application and create a drawing sheet with a Base View, Projected Views and a Section View.",
          "Dimension with Rapid Dimension, add a title block, and add a GD&T datum and a profile tolerance to practice Week 4 ahead of time.",
        ],
        check: "Deliverable: NX drawing of a barrel ring segment.",
      },
      {
        week: 10,
        title: "Capstone: midsurface model and drawing",
        steps: [
          "Model the barrel directly as a sheet body at the midsurface radius R = 4.5 m, 6 m long (or use Midsurface on a solid).",
          "Add 3 ring frames as sheet bodies at evenly spaced stations (every 1.5 m).",
          "Use Expressions for t, R, length and frame count so the trade study is quick to update.",
          "Make a drawing with the overall dimensions, frame stations and a section through a frame.",
        ],
        check: "The model meshes cleanly with shells in Ansys.",
      },
    ],
  },
  {
    id: "ansys",
    name: "Ansys Mechanical (Student)",
    blurb: "Weeks 4, 5, 7, 8, 10 and 11. Always compare with a hand calc before you believe a contour plot.",
    path: [
      {
        week: 4,
        title: "Workbench workflow: plate with a hole",
        steps: [
          "In Workbench, drag in a Static Structural system. Set units to mm, t, s, mV, mA (Metric, so stress is in MPa).",
          "Engineering Data: add a stainless steel (E = 193 GPa, ν = 0.29).",
          "Geometry: a 200 × 100 × 2 mm plate with a 10 mm center hole (d/W = 0.1, so $K_t$ ≈ 3 on gross stress).",
          "Use quarter symmetry: model one quarter with Frictionless Supports on the two symmetry faces.",
          "Apply a pressure (or force) on the far edge to give 100 MPa nominal stress. Mesh with a refinement around the hole.",
          "Solve; read the maximum normal stress at the hole edge and compare with $K_t \\times$ nominal. The Lesson 4 Heywood fit gives $K_{tg} \\approx 3.03$ on gross stress for d/W = 0.1, so about **303 MPa** at 100 MPa nominal is the right target.",
        ],
        check: "Deliverable: FEA peak within about 5% of the $K_t$ hand calc, with a short write-up.",
      },
      {
        week: 5,
        title: "Eigenvalue buckling of a column",
        steps: [
          "Model a slender column (e.g. a 1 m tube) with a fixed base and a 1 N axial load at the top (fixed-free, K = 2).",
          "Run Static Structural first, then link an Eigenvalue Buckling system to it (drag onto the Solution cell).",
          "The load multiplier for mode 1 is the critical load (because the applied load is 1 N).",
          "Compare with $P_{cr} = \\pi^2 EI/(KL)^2$. Try pinned-pinned and see the 4× change.",
        ],
        check: "Deliverable: Ansys first buckling load within a few percent of Euler.",
      },
      {
        week: 7,
        title: "Contacts, bolts and mesh convergence",
        steps: [
          "Model two plates and a bolt. Use Frictional contact between plates and Bonded at the threads (simplified).",
          "Add a Bolt Pretension load on the shank: load step 1 applies the preload, step 2 locks it and adds the external load.",
          "Check whether the joint separates under the external load.",
          "Mesh convergence: solve with 4 or more mesh sizes, record peak stress at a fixed location, and plot it against element count.",
        ],
        check: "Deliverable: a mesh convergence plot where the last refinement changes peak stress less than about 5%.",
      },
      {
        week: 8,
        title: "Pressurized tank with shells",
        steps: [
          "Import a midsurface (sheet) tank. Assign shell thickness t in the geometry details.",
          "Use axisymmetry or a 90° sector with symmetry supports to stay small.",
          "Apply internal pressure; constrain rigid-body motion without restraining hoop growth.",
          "Compare mid-barrel hoop stress with $pR/t$. Probe the dome-to-barrel joint and look for the local bending stress jump.",
        ],
        check: "Deliverable: barrel hoop stress within a few percent of $pR/t$, with the joint behavior explained.",
      },
      {
        week: 10,
        title: "Capstone static cases",
        steps: [
          "Shell model of the barrel and ring frames using symmetry.",
          "Proof case: 1.25 × MEOP ≈ 1.277 MPa internal pressure (practice), checked for no yield at proof with FS 1.0. Flight case: ullage plus hydrostatic head (a hydrostatic pressure load or a linearly varying pressure) plus 30 MN axial compression.",
          "Run a mesh convergence study on the peak stress.",
        ],
        check: "Static results compare with hand calcs within about 10%.",
      },
      {
        week: 11,
        title: "Capstone buckling",
        steps: [
          "Handling case: linear buckling with 2 MN axial compression only.",
          "Flight case: prestressed buckling, with pressure applied in the static step before buckling.",
          "Linear buckling of a perfect cylinder will be close to the classical value, not the knockdown value. Explain the gap using SP-8007.",
          "Rerun the handling-case eigenvalue buckling with 0, 3 and 6 ring frames and compare mode shapes and load factors.",
        ],
        check: "You can explain why FEA and SP-8007 differ.",
      },
      {
        week: 11,
        title: "Capstone stretch: nonlinear buckling with an imperfection",
        steps: [
          "Take eigenvalue buckling mode 1 from the handling case.",
          "Seed it as an initial geometric imperfection with amplitude $w_0 = 0.5t$, then repeat with $w_0 = 1.0t$ (a second Static Structural system whose geometry is updated from the mode shape).",
          "Run a nonlinear static analysis with Large Deflection on, ramping the axial load (or end displacement) in many substeps.",
          "Plot load vs. end shortening and read the collapse load at the peak.",
          "Compare the collapse load with the classical value and the SP-8007 value (Lesson 6 §5): it should fall between them and drop as $w_0$ grows.",
          "Stay under the 128K-node limit: shells only, and a coarse mesh that you've shown is converged on the eigenvalue load factor.",
        ],
        check: "A load vs. end-shortening plot for both amplitudes, with the collapse loads marked against classical and SP-8007.",
      },
    ],
  },
  {
    id: "python",
    name: "Python",
    blurb: "Weeks 1, 2, 4–7, 9–11. Python is your main toolkit: pytest from Week 1, one module (booster_calcs.py) you'll keep using at work, and the capstone.",
    path: [
      {
        week: 1,
        title: "Basics, pytest from day one, and running loads",
        steps: [
          "Check the environment (`python -c \"import numpy, scipy, matplotlib, pandas, pytest\"`) and run the trivial Week 0 test with `pytest`.",
          "Write `def margin_of_safety(allowable, applied, fs): return allowable / (fs * applied) - 1` and a first test in `tests/test_mos.py`: `assert abs(margin_of_safety(300, 200, 1.4) - 0.0714) < 1e-3`. Commit and push.",
          "Store load cases as a list of dicts (or a pandas DataFrame) with yield and ultimate checks. Print them with f-strings, `f\"{name}: MS = {ms:+.2f}\"`, and flag the minimum margin.",
          "Plot MS vs. applied stress with matplotlib and draw a horizontal line at MS = 0.",
          "Write `running_load(P, M, R)` and `equivalent_axial_load(P, M, R)` with tests (30 MN and 20 MN·m at R = 4500 mm give 1375.4 N/mm and 38.89 MN), then vectorize over stations with numpy.",
        ],
        check: "Deliverable: `mos.py` and `test_mos.py` pass with `pytest` and print the load-case margins table.",
      },
      {
        week: 2,
        title: "numpy and tank stress",
        steps: [
          "`t = np.linspace(2, 10, 100)`; compute hoop stress for several pressures in one line each.",
          "Plot hoop stress vs. thickness with one line per pressure and a legend.",
          "Build `tank_stress.py`: from the top of the liquid down, $p(h) = p_\\text{ullage} + \\rho n g h$, then hoop stress vs. height.",
        ],
        check: "Deliverable: `tank_stress.py` plots wall stress from top to bottom of the tank.",
      },
      {
        week: 4,
        title: "pandas and strain gauges",
        steps: [
          "Make a CSV of fake strain-gauge data (time, microstrain).",
          "Load it with `pd.read_csv`, convert to stress with $\\sigma = E \\varepsilon$ (remember microstrain is $10^{-6}$).",
          "Plot stress vs. time and mark the maximum.",
        ],
        check: "Your peak stress matches a hand conversion of the peak strain.",
      },
      {
        week: 5,
        title: "Euler/Johnson curve",
        steps: [
          "Compute the transition slenderness $\\sqrt{2\\pi^2 E/\\sigma_y}$.",
          "Use `np.where` to pick Johnson below it and Euler above it.",
          "Plot critical stress vs. $KL/r$ and mark the transition point.",
        ],
        check: "Deliverable: the Euler/Johnson plot. Compare with the Calculators page.",
      },
      {
        week: 6,
        title: "cylinder_buckling()",
        steps: ["Write `cylinder_buckling(R, t, E)` returning σ_cr, γ, σ_design.", "Test it against R = 4500, t = 4, E = 193000: 103.8, 0.21, 21.8."],
        check: "Deliverable: the buckling function.",
      },
      {
        week: 7,
        title: "bolt_preload.py",
        steps: ["Torque ↔ preload both ways, with d in meters.", "Add bolt tension and joint separation margins using the joint stiffness ratio."],
        check: "Deliverable: the bolt calc tool. 100 N·m, K = 0.2, d = 12.7 mm gives about 39,400 N.",
      },
      {
        week: 9,
        title: "Consolidate booster_calcs.py and fill test gaps",
        steps: [
          "Move every function you've written since Week 1 into one module, `booster_calcs.py`.",
          "You've had tests since Week 1. List any function without one and add a test from the plan's worked examples (`assert abs(x - expected) < tol`).",
          "Run `pytest` and get everything green.",
        ],
        check: "One module, and every function has a passing test.",
      },
      {
        week: 10,
        title: "Capstone hand calcs",
        steps: [
          "Write a function that runs all three load cases for a given t and returns a margins table. Apply the buckling FS to the axial load only, never to the pressure relief.",
          "Sweep t to find the minimum thickness with MS ≥ 0 everywhere.",
        ],
        check: "Enter your minimum thickness and margins in the Capstone page's answer check. It tells you which are within 2% before you reveal the reference solution.",
      },
      {
        week: 11,
        title: "Trade study plots",
        steps: [
          "Plot mass and minimum margin vs. thickness on twin axes.",
          "Plot mass vs. ring frame count. The unstiffened hand-calc margin doesn't change with frames (Batdorf Z ≫ 2.85); say so in the report.",
          "Stretch, with stringers: sweep 1–6 ring frames and check skin panels between stringers (Lesson 5 plate formula) and stringers as columns between frames (Euler/Johnson with effective width). Now frame count changes the margin.",
        ],
        check: "Plots ready for the report.",
      },
    ],
  },
  {
    id: "matlab",
    name: "MATLAB",
    blurb: "Weeks 3 and 8, reading literacy only. Plenty of test and analysis groups use MATLAB, so get comfortable reading it; Python stays your main toolkit.",
    path: [
      {
        week: 3,
        title: "Onramp, matrices and plotting",
        steps: [
          "Finish MATLAB Onramp (free from MathWorks).",
          "Enter published yield strength vs. temperature points for 304L as two vectors (cite the source).",
          "`plot(T, Sy, '-o')`, label axes with units, add a title and grid.",
        ],
        check: "Deliverable: a MATLAB plot of yield strength vs. temperature from published data.",
      },
      {
        week: 8,
        title: "Miner's rule calculator",
        steps: [
          "Define a made-up per-flight spectrum: cycles and stress amplitude for liftoff, max-Q and catch.",
          "Get N for each from an S-N power law, $N = (\\sigma_a / A)^{1/b}$ with practice constants.",
          "Damage per flight $= \\sum n_i/N_i$; flights to $D = 1$; then divide by a scatter factor.",
        ],
        check: "Deliverable: the Miner's-rule script. Check it with the 1000/10000 + 50/500 = 0.2 example.",
      },
    ],
  },
];

/**
 * Optional Nastran deck literacy (3–4 hours total, spread over Weeks 7–11). Public SpaceX Starship structures
 * postings name Nastran among the team's solvers, so be able to read a deck. Install instructions checked Oct 2026:
 * pyNastran 1.4.1 (`pip install pyNastran`, Python ≥ 3.9) and MYSTRAN (MIT license, Windows .exe in its GitHub releases).
 */
export const nastranLiteracy = {
  title: "Nastran deck literacy (optional)",
  budget: "3–4 hours total, spread over Weeks 7–11",
  why: "You'll learn Ansys, but the posted Starship structures roles also name Nastran-family solvers. A Nastran input deck is plain text, so learning to read one takes hours, not weeks.",
  cards: [
    ["SOL 101 / SOL 105", "Executive control: the analysis type. 101 is linear static; 105 is linear (eigenvalue) buckling."],
    ["SUBCASE", "Case control: one load case, pointing at its SPC (supports) and LOAD sets."],
    ["GRID", "A node: ID, coordinate system, x, y, z."],
    ["CQUAD4", "A 4-node shell element: element ID, property ID, four GRID IDs."],
    ["CBAR / CBEAM", "Line elements for stiffeners, stringers and frames, with an orientation vector."],
    ["PSHELL", "Shell property: material ID and thickness t."],
    ["MAT1", "Isotropic material: E, G, ν, density, thermal expansion."],
    ["SPC1", "Single-point constraints: which degrees of freedom (1–6) are fixed at which GRIDs."],
    ["FORCE", "A concentrated force at a GRID, as a magnitude times a direction vector."],
    ["PLOAD4", "Pressure on a shell element face, for tank pressure."],
  ] as [string, string][],
  steps: [
    { week: 7, text: "Read the card list above and a short example deck from the MYSTRAN or pyNastran documentation. Label every card in a printout." },
    { week: 8, text: "Write a tiny plate-with-hole deck: by hand, or in Python with **pyNastran** (`pip install pyNastran`; its BDF writer creates GRID, CQUAD4, PSHELL, MAT1, SPC1 and FORCE cards)." },
    { week: 10, text: "Run the deck in **MYSTRAN**, the free, open-source, Nastran-compatible solver (SOL 101). Compare the peak stress with your Week 4 Ansys answer and the Lesson 4 $K_t$ hand calc." },
    { week: 11, text: "Optional: open the `.f06` results file and find the displacement and element stress tables. Change SOL 101 to SOL 105 and find the eigenvalue." },
  ],
  links: [
    { label: "pyNastran on PyPI", url: "https://pypi.org/project/pyNastran/" },
    { label: "MYSTRAN on GitHub (releases have a Windows .exe)", url: "https://github.com/MYSTRANsolver/MYSTRAN" },
  ],
};

export const swToNx: [string, string][] = [
  ["FeatureManager design tree", "Part Navigator"],
  ["Assembly tree", "Assembly Navigator"],
  ["Sketch", "Sketch"],
  ["Smart Dimension", "Rapid Dimension"],
  ["Convert Entities", "Project Curve"],
  ["Extruded Boss / Cut", "Extrude (Boolean: Unite / Subtract)"],
  ["Revolved Boss / Cut", "Revolve"],
  ["Swept Boss", "Sweep Along Guide"],
  ["Lofted Boss", "Through Curves"],
  ["Hole Wizard", "Hole"],
  ["Linear / Circular Pattern", "Pattern Feature"],
  ["Fillet", "Edge Blend"],
  ["Chamfer", "Chamfer"],
  ["Shell", "Shell"],
  ["Thicken", "Thicken"],
  ["Reference plane", "Datum Plane"],
  ["Equations / global variables", "Expressions"],
  ["Mates", "Assembly Constraints"],
  ["Drawing", "Drafting application"],
  ["Mass Properties", "Measure (Bodies)"],
  ["SOLIDWORKS Simulation", "Simcenter 3D / Pre/Post"],
];

export const feaPractices: { title: string; points: string[] }[] = [
  {
    title: "Units",
    points: [
      "Pick one consistent set and write it on the model: mm, N, MPa (= N/mm²), t (tonne) for mass, s. Density is then t/mm³ (8000 kg/m³ = 8.0e-9 t/mm³).",
      "Check the unit system dropdown before you type material data. Most \"off by 1000\" results are a unit slip.",
    ],
  },
  {
    title: "Boundary conditions",
    points: [
      "Constrain only what's needed to stop rigid-body motion (6 degrees of freedom), unless the real structure is fixed.",
      "Over-constraint stiffens the model and creates fake stress peaks at supports. A Fixed Support on a pressurized tank end blocks hoop growth and causes a false bending stress.",
      "Put loads and supports where the real ones act, spread over realistic areas. Point loads are singularities.",
      "Check reaction forces: they must balance the applied loads.",
    ],
  },
  {
    title: "Shells vs. solids",
    points: [
      "Use shells when thickness is small compared with the other dimensions (roughly t less than R/10 and the panel width). Every tank wall in this plan qualifies.",
      "Shells give membrane and bending stress through the thickness directly (top, middle, bottom) with a fraction of the nodes.",
      "Use solids for thick, chunky parts (lugs, fittings) or where through-thickness stress matters.",
      "Model shells at the midsurface, and set the thickness as a property.",
    ],
  },
  {
    title: "Symmetry",
    points: [
      "If geometry, loads and supports are symmetric, model a half, quarter or sector with symmetry supports on the cut faces.",
      "For an axisymmetric pressure load, a thin sector or a 2D axisymmetric model gives hoop stress cheaply.",
      "Don't use symmetry for buckling unless the mode is known to be symmetric. It can hide the lowest (anti-symmetric) mode.",
    ],
  },
  {
    title: "Mesh convergence",
    points: [
      "Solve with at least three or four progressively finer meshes.",
      "Track one quantity at one location (e.g. peak hoop stress at mid-barrel) vs. element count.",
      "Converged when the last refinement changes it less than about 5%. Plot it and keep the plot with the results.",
      "A value at a sharp corner or point load that keeps rising is a singularity, not a lack of convergence. Don't chase it.",
    ],
  },
  {
    title: "Sanity checks against hand calcs",
    points: [
      "Before solving, write down what you expect: $pR/t$, $K_t \\times$ nominal, Euler load, and so on.",
      "Check deformed shape (exaggerated scale) first. If it doesn't make physical sense, nothing else does.",
      "Check total mass against $\\rho \\times$ volume and reaction forces against applied loads.",
      "Hand calc and FEA should agree within about 10% where the hand calc applies. Explain any larger gap in writing.",
    ],
  },
  {
    title: "Staying under the Ansys Student limit",
    points: [
      "Structural problems are capped at about 128,000 nodes/elements.",
      "Use shells instead of solids, symmetry, and local refinement only where you need it.",
      "Use linear (no midside node) elements for early checks; switch to quadratic only where stress gradients need them.",
      "Suppress bodies you don't need, and remove tiny cosmetic features (small fillets, text) far from the area of interest.",
    ],
  },
];
