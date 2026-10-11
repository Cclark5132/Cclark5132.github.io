export type MediaType = "image" | "video" | "youtube" | "vimeo" | "cad" | "pdf";

export interface MediaItem {
  type: MediaType;
  /** File path under public/ for images and video files. For "youtube" and "vimeo", the video id or full URL. */
  src: string;
  /** Short name used in figure captions and the full-size viewer. */
  label: string;
  alt: string;
  caption?: string;
  /** Still image shown before a video plays. */
  poster?: string;
  /** Intrinsic pixel size, so the browser reserves the right space before the file loads. */
  width?: number;
  height?: number;
  /** Optional smaller copies for phones, e.g. "/a-800.webp 800w, /a.webp 1200w". */
  srcSet?: string;
  /** "loop" plays muted on repeat with a pause button. "controls" (the default) shows the standard player. */
  playback?: "controls" | "loop";
  /** How the image fills a fixed frame such as a project card. "contain" keeps the whole image visible. */
  fit?: "cover" | "contain";
  /** Background color around a contained image. Match the image's own background so the edges disappear. */
  matte?: string;
  objectPosition?: string;
}

export interface Metric {
  value: string;
  label: string;
  note?: string;
  /** Numbers count up when they scroll into view. Set false for values such as years. */
  count?: boolean;
}

export interface Spec {
  label: string;
  value: string;
}

export interface WriteUpSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
  metrics?: Metric[];
}

export interface Project {
  slug: string;
  title: string;
  /** Organization, when it differs from the title. */
  org?: string;
  role: string;
  dates: string;
  location: string;
  /** One sentence. Used on the project card and as the page description. */
  summary: string;
  metrics: Metric[];
  specs: Spec[];
  cover: MediaItem;
  /**
   * Test video slot, shown near the top of the project page. While `media` is null the page shows a
   * labeled placeholder. To publish a video, set `media` to one of:
   *   { type: "video", src: "/project-videos/pulse-jet-test.mp4", poster: "/project-photos/…webp", … }
   *   { type: "youtube", src: "dQw4w9WgXcQ", … }   (id or full YouTube URL)
   *   { type: "vimeo", src: "76979871", … }        (id or full Vimeo URL)
   */
  testVideo?: { label: string; media: MediaItem | null };
  sections: WriteUpSection[];
  /** Figures on the project page, in order. */
  figures: MediaItem[];
  confidentialNote?: string;
}

const pulseJetRender: MediaItem = {
  type: "image",
  src: "/project-photos/pulse-jet-assembly-render.webp",
  srcSet: "/project-photos/pulse-jet-assembly-render-800.webp 800w, /project-photos/pulse-jet-assembly-render.webp 1600w",
  width: 1600,
  height: 1000,
  fit: "contain",
  matte: "#f5f5f5",
  label: "SolidWorks assembly",
  alt: "SolidWorks render of the pulse jet engine on its frame, connected to a propane tank by a fuel line",
  caption: "SolidWorks assembly of the engine, frame and propane supply.",
};

const culliganFloat: MediaItem = {
  type: "image",
  src: "/project-photos/culligan-float-system.webp",
  srcSet: "/project-photos/culligan-float-system-800.webp 800w, /project-photos/culligan-float-system.webp 2400w",
  width: 2400,
  height: 1500,
  fit: "contain",
  matte: "#eef1f0",
  label: "Valve float",
  alt: "Three panels of the injection-molded float: a photo of the black molded part, a gray 3D model, and the same model shaded green and red for comparison",
  caption: "Float for the water softener valve: molded part, 3D model and comparison view.",
};

const comancheFinished: MediaItem = {
  type: "image",
  src: "/project-photos/automotive-comanche-finished.webp",
  srcSet: "/project-photos/automotive-comanche-finished-800.webp 800w, /project-photos/automotive-comanche-finished.webp 1400w",
  width: 1400,
  height: 788,
  label: "1987 Jeep Comanche",
  alt: "Charles Clark standing next to the restored 1987 Jeep Comanche in a parking lot",
  caption: "1987 Jeep Comanche.",
};

const crutchAnimation: MediaItem = {
  type: "video",
  src: "/project-videos/telescoping-crutch-animation.mp4",
  poster: "/project-videos/telescoping-crutch-animation-poster.webp",
  width: 1814,
  height: 1402,
  label: "Telescoping animation",
  alt: "SolidWorks animation of the crutch extending to full length and retracting",
  caption: "SolidWorks animation of the crutch extending and retracting.",
  playback: "loop",
};

export const profile = {
  name: "Charles T. Clark",
  shortName: "Charles Clark",
  status: "Incoming at SpaceX",
  school: "Virginia Tech",
  degree: "B.S. Mechanical Engineering",
  graduation: "May 2028",
  gpa: "3.84",
  location: "Chicago, IL",
  email: "charlesclark@vt.edu",
  resume: "/Charles-Clark-Resume.pdf",
  linkedIn: "https://linkedin.com/in/charlesclarkvt",
  linkedInLabel: "linkedin.com/in/charlesclarkvt",
  github: "https://github.com/Cclark5132",
  githubLabel: "github.com/Cclark5132",
  heroMedia: {
    type: "image",
    src: "/project-photos/pulse-jet-test-assembly-hero.webp",
    srcSet:
      "/project-photos/pulse-jet-test-assembly-hero-600.webp 600w, /project-photos/pulse-jet-test-assembly-hero-800.webp 800w, /project-photos/pulse-jet-test-assembly-hero.webp 1200w",
    width: 1200,
    height: 900,
    label: "Pulse jet test assembly",
    alt: "Steel pulse jet mounted on a wheeled frame on a wooden work table, fed by a propane tank on the shelf below",
    caption: "Pulse jet test assembly on its rolling frame.",
  } satisfies MediaItem,
};

export const projects: Project[] = [
  {
    slug: "pulse-jet",
    title: "Pulse Jet Design Team",
    role: "Founder and President",
    dates: "May 2025 – Present",
    location: "Blacksburg, VA",
    summary:
      "I founded and lead an 8-member team that built a propane-fueled pulse jet from cold-rolled steel, with a test bench that records thrust, temperature and fuel efficiency.",
    metrics: [
      { value: "~200 N", label: "Peak static thrust", note: "About 45 lbf" },
      { value: "8", label: "Team members" },
      { value: "3", label: "Bench metrics", note: "Thrust, temperature, fuel efficiency" },
    ],
    specs: [
      { label: "Material", value: "Cold-rolled steel" },
      { label: "Fuel", value: "Propane" },
      { label: "CAD", value: "SolidWorks" },
      { label: "Thrust gauge", value: "Tension scale" },
    ],
    cover: pulseJetRender,
    // Filler clip made from the three photos below. Replace it with a test run video when one exists (see README).
    testVideo: {
      label: "Build sequence",
      media: {
        type: "video",
        src: "/project-videos/pulse-jet-build-sequence.mp4",
        poster: "/project-videos/pulse-jet-build-sequence-poster.webp",
        width: 1280,
        height: 720,
        playback: "loop",
        label: "Build sequence",
        alt: "Slow pan across the SolidWorks assembly, then the fabricated engine, then the completed test assembly",
        caption: "SolidWorks assembly, fabricated engine and completed test assembly.",
      },
    },
    sections: [
      {
        heading: "Team",
        paragraphs: ["I founded the team in May 2025 and lead it as president. It has 8 members."],
      },
      {
        heading: "Goal",
        paragraphs: ["The goal was a backyard pulse jet built to produce real, testable metrics."],
      },
      {
        heading: "Engine and test assembly",
        paragraphs: [
          "The engine is made of cold-rolled steel and runs on propane. It was designed in SolidWorks and is mounted on a rolling frame for testing.",
        ],
      },
      {
        heading: "Test bench",
        paragraphs: ["The bench records three metrics: thrust, temperature and fuel efficiency. Thrust is measured on a tension scale."],
      },
      {
        heading: "Fuel injector iterations",
        paragraphs: [
          "We built multiple fuel injector versions and live-tested each one. The results of each test guided the design of the next version.",
        ],
      },
      {
        heading: "Result",
        paragraphs: ["Peak static thrust measured on the bench is about 200 N (about 45 lbf)."],
      },
    ],
    figures: [
      pulseJetRender,
      {
        type: "image",
        src: "/project-photos/pulse-jet-fabricated-engine.webp",
        width: 1440,
        height: 1920,
        label: "Fabricated engine",
        alt: "Fabricated steel pulse jet standing upright on an outdoor work table next to an angle grinder",
        caption: "Steel engine after fabrication.",
      },
      {
        type: "image",
        src: "/project-photos/pulse-jet-test-assembly.webp",
        width: 1920,
        height: 1440,
        label: "Completed test assembly",
        alt: "Steel pulse jet mounted on a wheeled frame on a wooden work table, with a propane tank on the shelf below, a braided fuel line, and a red digital scale tied to the frame",
        caption: "Completed test assembly on the rolling frame, fed from a propane tank.",
      },
    ],
  },
  {
    slug: "culligan",
    title: "Culligan International",
    role: "Mechanical Engineering Design Intern",
    dates: "May – Aug 2026",
    location: "Rosemont, IL",
    summary:
      "Design internship with four workstreams: a float redesign for a water softener valve, a booster pump kit, a field-training prototype, and drawings for 5 commercial water softeners.",
    metrics: [
      { value: "$15K/yr", label: "Reassembly cost removed", note: "Float redesign" },
      { value: "150%", label: "Water pressure increase", note: "Booster pump kit" },
      { value: "$75K", label: "Funding secured", note: "Field-training prototype" },
      { value: "5", label: "Commercial softeners", note: "3D models and drawings" },
    ],
    specs: [],
    cover: culliganFloat,
    confidentialNote: "This work is confidential. The images here were approved for public release, and some details are left out.",
    sections: [
      {
        heading: "Water softener valve float",
        paragraphs: [
          "I 3D modeled an injection-molded float for a water softener valve and drafted its GD&T drawings.",
          "The redesign removes about $15,000 per year in reassembly costs caused by a broken part.",
        ],
      },
      {
        heading: "Booster pump kit",
        paragraphs: ["I developed a booster pump kit for a commercial hydraulic valve. The kit raised water pressure by 150%."],
      },
      {
        heading: "Field-training prototype",
        paragraphs: ["I fabricated a portable field-training prototype and sourced its parts. The prototype secured $75,000 in funding."],
      },
      {
        heading: "Commercial water softener drawings",
        paragraphs: ["I made 3D models and technical drawings for 5 commercial water softeners."],
      },
      {
        heading: "Acrylic bracket FEA",
        paragraphs: [
          "A static structural analysis of an acrylic mounting bracket predicted a maximum von Mises stress of 2,217 psi and a factor of safety of 2.94.",
        ],
        metrics: [
          { value: "2,217 psi", label: "Max von Mises stress" },
          { value: "2.94", label: "Factor of safety" },
        ],
      },
    ],
    figures: [
      culliganFloat,
      {
        type: "image",
        src: "/project-photos/culligan-bracket-fea.webp",
        width: 1584,
        height: 993,
        label: "Bracket FEA",
        alt: "Static structural FEA plot of the acrylic mounting bracket with a von Mises stress color scale, boundary conditions and a results summary",
        caption: "Acrylic mounting bracket. Maximum von Mises stress 2,217 psi, factor of safety 2.94.",
      },
      {
        type: "image",
        src: "/project-photos/culligan-training-suitcase.webp",
        width: 1600,
        height: 2133,
        label: "Field-training prototype",
        alt: "Open hard-shell case with perforated aluminum mounting panels in the lid and base",
        caption: "Portable field-training prototype.",
      },
      {
        type: "image",
        src: "/project-photos/culligan-commercial-drawings.webp",
        width: 2400,
        height: 3125,
        label: "Commercial softener drawings",
        alt: "Two drawing sheets for commercial water softener systems, with orthographic views, a data table and notes",
        caption: "Two-sheet drawing package for commercial water softeners.",
      },
    ],
  },
  {
    slug: "automotive-restoration",
    title: "Automotive Restoration",
    role: "Independent project",
    dates: "Aug 2020 – Present",
    location: "Libertyville, IL",
    summary: "I restored a 2001 Jeep Cherokee and a 1987 Jeep Comanche to working condition, including body, engine and drivetrain work.",
    metrics: [{ value: "2", label: "Vehicles restored", note: "To working condition" }],
    specs: [
      { label: "Vehicles", value: "2001 Jeep Cherokee, 1987 Jeep Comanche" },
      { label: "Welding", value: "MIG and stick" },
    ],
    cover: comancheFinished,
    sections: [
      {
        heading: "Vehicles",
        paragraphs: ["The project covers two vehicles: a 2001 Jeep Cherokee and a 1987 Jeep Comanche. Both are restored to working condition."],
      },
      {
        heading: "Work completed",
        paragraphs: ["This list covers both vehicles together."],
        list: [
          "Body work: floor pans and rockers",
          "Engine rebuild",
          "Engine swap",
          "Axle swap",
          "Driveshaft machining",
          "MIG and stick welding",
          "Diagnostics",
        ],
      },
    ],
    figures: [
      comancheFinished,
      {
        type: "image",
        src: "/project-photos/automotive-garage-teardown.webp",
        width: 1400,
        height: 788,
        label: "Teardown",
        alt: "Jeep on jack stands in a garage with the engine, transmission and axle removed and parts on the floor",
        caption: "Teardown in the garage.",
      },
      {
        type: "image",
        src: "/project-photos/automotive-engine-install.webp",
        width: 1400,
        height: 788,
        label: "Engine installation",
        alt: "Engine hanging from a shop crane above an open engine bay",
        caption: "Engine installation with a shop crane.",
      },
      {
        type: "image",
        src: "/project-photos/automotive-cherokee-finished.webp",
        width: 1400,
        height: 788,
        label: "2001 Jeep Cherokee",
        alt: "Restored red 2001 Jeep Cherokee parked in a driveway",
        caption: "2001 Jeep Cherokee.",
      },
      {
        type: "image",
        src: "/project-photos/automotive-engine-bay-wiring.webp",
        width: 1400,
        height: 788,
        label: "Engine bay",
        alt: "Engine bay with the engine, hoses and air intake installed",
        caption: "Engine bay during the restoration.",
      },
    ],
  },
  {
    slug: "telescoping-crutch",
    title: "Telescoping Accessibility Crutch",
    org: "Virginia Tech Engineering Education Department",
    role: "Accessibility Design Project Leader",
    dates: "Aug 2024 – May 2025",
    location: "Blacksburg, VA",
    summary: "I led a team that designed a telescoping crutch with a locking mechanism that takes 66% less storage space.",
    metrics: [{ value: "66%", label: "Less storage space" }],
    specs: [
      { label: "Mechanism", value: "Telescoping, with a lock" },
      { label: "CAD", value: "SolidWorks" },
      { label: "Prototyping", value: "Rapid prototypes" },
    ],
    cover: crutchAnimation,
    sections: [
      {
        heading: "Problem",
        paragraphs: ["The problem was transporting and storing a crutch when a student is injured on campus."],
      },
      {
        heading: "Design",
        paragraphs: ["The design is a telescoping crutch with a locking mechanism. It takes 66% less storage space."],
      },
      {
        heading: "Process",
        paragraphs: ["I led the team. We modeled the crutch in SolidWorks and built rapid prototypes."],
      },
      {
        heading: "Scope",
        paragraphs: ["The crutch was one part of a larger project that also included a mobile ordering app. I worked only on the crutch."],
      },
    ],
    figures: [
      crutchAnimation,
      {
        type: "image",
        src: "/project-photos/crutch-prototype.webp",
        width: 419,
        height: 744,
        label: "Working prototype",
        alt: "Telescoping crutch prototype built from white PVC pipe, held upright in a lab, with a green indicator light lit",
        caption: "Working prototype with the locking indicator lit.",
      },
      {
        type: "image",
        src: "/project-photos/crutch-accessibility-poster.webp",
        width: 2400,
        height: 1800,
        label: "Final poster",
        alt: "Accessibility on Campus project poster with sections on design performance, stakeholders, the problem, the solution, limitations and recommendations",
        caption: "Final project poster.",
      },
    ],
  },
];

export interface Experience {
  org: string;
  projectSlug: string;
  role: string;
  dates: string;
  location: string;
  points: string[];
}

export const experiences: Experience[] = [
  {
    org: "Culligan International",
    projectSlug: "culligan",
    role: "Mechanical Engineering Design Intern",
    dates: "May – Aug 2026",
    location: "Rosemont, IL",
    points: [
      "3D modeled an injection-molded float for a water softener valve and drafted its GD&T drawings. The redesign removes about $15,000 per year in reassembly costs.",
      "Developed a booster pump kit that raised water pressure by 150% for a commercial hydraulic valve.",
      "Fabricated and sourced a portable field-training prototype that secured $75,000 in funding.",
      "Made 3D models and technical drawings for 5 commercial water softeners.",
    ],
  },
  {
    org: "Pulse Jet Design Team",
    projectSlug: "pulse-jet",
    role: "Founder and President",
    dates: "May 2025 – Present",
    location: "Blacksburg, VA",
    points: [
      "Lead an 8-member team that built a propane-fueled pulse jet from cold-rolled steel.",
      "Peak static thrust of about 200 N (45 lbf), measured on a test bench that records thrust, temperature and fuel efficiency.",
    ],
  },
  {
    org: "Automotive Restoration",
    projectSlug: "automotive-restoration",
    role: "Independent project",
    dates: "Aug 2020 – Present",
    location: "Libertyville, IL",
    points: ["Restored a 2001 Jeep Cherokee and a 1987 Jeep Comanche to working condition."],
  },
  {
    org: "Virginia Tech Engineering Education Department",
    projectSlug: "telescoping-crutch",
    role: "Accessibility Design Project Leader",
    dates: "Aug 2024 – May 2025",
    location: "Blacksburg, VA",
    points: ["Led the team that designed a telescoping crutch with a locking mechanism that takes 66% less storage space."],
  },
];

export const education = {
  school: "Virginia Tech",
  degree: "B.S. Mechanical Engineering",
  graduation: "Expected May 2028",
  gpa: "3.84",
  honors: [
    "Dean's List every semester",
    "Mechanical Engineering Undergraduate Student Ambassador",
    "Raymond & Shirley Lynn Merit Scholarship recipient",
  ],
};

export const credentials = [
  { title: "Certified SolidWorks Professional (CSWP)", issuer: "Dassault Systèmes", date: "July 2026" },
  { title: "FEA Certification", issuer: "GoEngineer", date: "July 2026" },
  { title: "Eagle Scout", issuer: "Boy Scouts of America", date: "July 2023" },
];

export const skillGroups = [
  { title: "CAD and analysis", skills: ["SolidWorks (CSWP)", "Finite Element Analysis", "Engineering drawings (GD&T)", "MATLAB"] },
  { title: "Product development", skills: ["Rapid prototyping", "Injection-molded part design", "Design validation"] },
  { title: "Fabrication", skills: ["MIG and stick welding", "3D printing", "CNC machining"] },
];
