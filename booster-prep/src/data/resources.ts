import type { Track } from "./plan";

export interface Resource {
  name: string;
  use: string;
  weeks: number[];
  tracks: (Track | "context")[];
  url?: string; // only for free, official pages that were checked
}

/** The reference library from PLAN.md, tagged by the weeks and tracks where each one is used. */
export const resources: Resource[] = [
  { name: "Bruhn, *Analysis and Design of Flight Vehicle Structures*", use: "The classic aerospace structures reference", weeks: [1, 4, 5, 6, 7], tracks: ["structures"] },
  { name: "Niu, *Airframe Structural Design*", use: "Practical design of stiffeners, joints, and cutouts", weeks: [4, 7], tracks: ["structures"] },
  { name: "*Roark's Formulas for Stress and Strain*", use: "Quick formulas for almost any shape", weeks: [2, 4, 5, 6], tracks: ["structures"] },
  { name: "Shigley's *Mechanical Engineering Design*", use: "Fatigue, bolts, and welds (you probably own it)", weeks: [7, 8], tracks: ["structures"] },
  { name: "NASA SP-8007", use: "Buckling of thin-walled cylinders, knockdown factors (free)", weeks: [6, 10, 11], tracks: ["structures"], url: "https://ntrs.nasa.gov/citations/19690013955" },
  { name: "NASA-STD-5020", use: "Threaded fastener design", weeks: [7], tracks: ["structures"], url: "https://standards.nasa.gov/standard/NASA/NASA-STD-5020" },
  { name: "MMPDS", use: "Metallic material allowables", weeks: [3], tracks: ["structures"], url: "https://www.mmpds.org/" },
  { name: "ASME Y14.5", use: "GD&T", weeks: [4], tracks: ["structures", "cad"] },
  { name: "AWS D17.1", use: "Aerospace fusion welding", weeks: [7], tracks: ["structures"] },
  { name: "Peterson's *Stress Concentration Factors*", use: "Stress concentration factors for holes, notches and fillets", weeks: [4], tracks: ["structures"] },
  { name: "Ansys Student", use: "Free FEA download for Week 0: 2026 R1, license through Mar 31, 2027, Windows only, 128K nodes/elements", weeks: [0, 4, 10, 11], tracks: ["cad"], url: "https://www.ansys.com/academic/students/ansys-student" },
  { name: "Siemens Designcenter Student Edition (includes NX)", use: "Free NX download for Week 0, Windows 64-bit only. Find it on Siemens' student software pages; if it won't work, ask VT ME about lab or remote NX access.", weeks: [0, 1, 2, 3, 10], tracks: ["cad"] },
  { name: "Ansys Innovation Courses", use: "Free Ansys tutorials", weeks: [4, 5, 7, 8], tracks: ["cad"] },
  { name: "MATLAB Onramp", use: "Free MATLAB starter course", weeks: [3, 8], tracks: ["code"], url: "https://matlabacademy.mathworks.com/details/matlab-onramp/gettingstarted" },
  { name: "SpaceX Starship updates page", use: "Official flight summaries", weeks: [6, 8, 12], tracks: ["context"], url: "https://www.spacex.com/vehicles/starship/" },
  { name: "Space.com: how Starship V3 differs (May 14, 2026)", use: "V3 booster changes: three larger grid fins mounted lower, integrated hot-staging ring, larger fuel transfer tube", weeks: [1, 5, 12], tracks: ["context"], url: "https://www.space.com/space-exploration/launches-spacecraft/the-worlds-biggest-rocket-how-spacexs-new-starship-v3-differs-from-its-predecessors" },
  { name: "Space.com: Booster 18 pressure-test anomaly (Nov 21, 2025)", use: "First V3 booster damaged during gas system pressure testing, before structural proof testing; quotes SpaceX's statement", weeks: [1, 6, 8], tracks: ["context"], url: "https://www.space.com/space-exploration/launches-spacecraft/spacexs-1st-version-3-super-heavy-starship-booster-buckles-under-pressure-during-initial-tests" },
  { name: "Wikipedia: Starship flight test 12 (May 22, 2026)", use: "First Block 3 / V3 flight, first launch from Starbase's second pad", weeks: [1, 12], tracks: ["context"], url: "https://en.wikipedia.org/wiki/Starship_flight_test_12" },
  { name: "Wikipedia: Starship flight test 13 (Jul 24, 2026)", use: "Booster 20 and Ship 40: landing-burn relight shortfall; ship deployed Starlink V3 satellites", weeks: [12], tracks: ["context"], url: "https://en.wikipedia.org/wiki/Starship_flight_test_13" },
  { name: "Space.com: Starship reaches orbit (Flight 14, Sep 28, 2026)", use: "First orbital flight; 26 Starlink V3 satellites deployed", weeks: [12], tracks: ["context"], url: "https://www.space.com/space-exploration/launches-spacecraft/starship-just-reached-orbit-for-the-1st-time-whats-next-for-the-spacex-megarocket" },
  { name: "SpaceX job posting: Sr. Structures Analyst, Starship", use: "What the Starship structures team uses: solvers, pre/post, fatigue and crack-growth tools, scripting, and the skills it values", weeks: [0, 7, 12], tracks: ["context", "cad"], url: "https://job-boards.greenhouse.io/spacex/jobs/8233882002" },
  { name: "pyNastran", use: "Python reader and writer for Nastran decks (optional Nastran literacy track)", weeks: [8, 10, 11], tracks: ["code", "cad"], url: "https://pypi.org/project/pyNastran/" },
  { name: "MYSTRAN", use: "Free, open-source, Nastran-compatible solver (SOL 101 static, 105 buckling)", weeks: [10, 11], tracks: ["cad"], url: "https://github.com/MYSTRANsolver/MYSTRAN" },
];
