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
  { name: "Ansys Student", use: "Free FEA download for Week 0 (Windows only, 128K node limit)", weeks: [0, 4, 10, 11], tracks: ["cad"], url: "https://www.ansys.com/academic/students/ansys-student" },
  { name: "Ansys Innovation Courses", use: "Free Ansys tutorials", weeks: [4, 5, 7, 8], tracks: ["cad"] },
  { name: "MATLAB Onramp", use: "Free MATLAB starter course", weeks: [3, 8], tracks: ["code"], url: "https://matlabacademy.mathworks.com/details/matlab-onramp/gettingstarted" },
  { name: "SpaceX Starship updates page", use: "Official flight summaries", weeks: [6, 8, 12], tracks: ["context"], url: "https://www.spacex.com/vehicles/starship/" },
];
