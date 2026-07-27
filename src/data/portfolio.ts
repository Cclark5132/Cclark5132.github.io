export type MediaType = "image" | "video" | "youtube" | "vimeo" | "cad" | "pdf";

export interface MediaItem {
  type: MediaType;
  src: string;
  label: string;
  alt: string;
  caption?: string;
  poster?: string;
  aspect?: "landscape" | "portrait" | "square" | "cinematic";
  playback?: "controls" | "loop";
  fit?: "cover" | "contain";
  objectPosition?: string;
}

export interface MetricData {
  value: string;
  label: string;
  detail?: string;
}

export interface CaseStudySection {
  title: string;
  description: string;
  bullets?: string[];
}

export type CaseStudyContent =
  | { format: "star" }
  | {
      format: "sections";
      label: string;
      heading: string;
      intro: string;
      sections: CaseStudySection[];
    };

export interface Project {
  slug: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  role: string;
  duration: string;
  location?: string;
  summary: string;
  challenge: string;
  process: { title: string; description: string }[];
  results: string[];
  future: string[];
  metrics: MetricData[];
  skills: string[];
  coverImage: MediaItem;
  gallery: MediaItem[];
  videos: MediaItem[];
  documents: MediaItem[];
  confidential?: boolean;
  featured: boolean;
  caseStudy: CaseStudyContent;
}

export const profile = {
  name: "Charles T. Clark",
  title: "Third-Year Mechanical Engineering Student",
  email: "charlesclark@vt.edu",
  location: "Chicago, Illinois",
  availability: "Seeking Spring 2027 Co-op + Summer 2027 Internship",
  resume: "/Charles-Clark-Resume.pdf",
  linkedIn: "https://linkedin.com/in/charlesclarkvt",
  github: "https://github.com/Cclark5132",
  heroMedia: {
    type: "image" as const,
    src: "/project-photos/pulse-jet-assembly-render.png",
    label: "Pulse Jet Test Assembly",
    alt: "SolidWorks assembly rendering of the pulse jet engine, propane cylinder, fuel line, and wheeled support frame",
    caption: "SolidWorks assembly for the Pulse Jet Design Team test setup",
    aspect: "landscape" as const,
    fit: "contain" as const,
  },
};

export const projects: Project[] = [
  {
    slug: "pulse-jet",
    title: "Pulse Jet Design Team",
    eyebrow: "Propulsion / Team Leadership / Test Engineering",
    subtitle: "Designed, fabricated, and measured on the test bench.",
    role: "Founder and President",
    duration: "May 2025 - Present",
    location: "Blacksburg, Virginia",
    summary: "I founded and lead an eight-member Virginia Tech team that designs, fabricates, instruments, and tests pulse jet engines, with a focus on measurable, repeatable performance.",
    challenge: "As founder and president, I needed to organize the team, design and fabricate a manufacturable steel propane-fueled engine, and create a safe bench for measuring thrust, temperature, and fuel efficiency.",
    process: [
      { title: "Define", description: "Set propulsion goals, team roles, operating constraints, and a safe validation plan." },
      { title: "Model", description: "Developed the steel, propane-fueled engine geometry and assembly in SolidWorks." },
      { title: "Fabricate", description: "Converted the design into a buildable system through hands-on metal fabrication and team coordination." },
      { title: "Instrument", description: "Created a dedicated bench for thrust, temperature, and fuel-efficiency readings." },
      { title: "Test", description: "Ran controlled bench tests and recorded approximately 300 N of peak static thrust." },
    ],
    results: [
      "Founded and now leads an eight-member engine design team.",
      "Designed and fabricated a functioning steel, propane-fueled pulse jet.",
      "Measured approximately 300 N of peak static thrust during bench testing.",
      "Built an instrumented test bench for repeatable performance measurements.",
    ],
    future: [
      "Expand the test dataset across operating conditions.",
      "Refine instrumentation and measurement repeatability.",
      "Use test evidence to guide the next geometry iteration.",
    ],
    metrics: [
      { value: "~300 N", label: "Peak static thrust", detail: "About 67 lbf, bench-tested" },
      { value: "8", label: "Team members", detail: "Founded and led" },
      { value: "3", label: "Measured outputs", detail: "Thrust / temperature / fuel" },
    ],
    skills: ["SolidWorks", "Propulsion", "Test engineering", "Instrumentation", "Fabrication", "Team leadership"],
    coverImage: {
      type: "image",
      src: "/project-photos/pulse-jet-assembly-render.png",
      label: "Pulse Jet Test Assembly",
      alt: "SolidWorks assembly rendering of the pulse jet engine, propane cylinder, fuel line, and wheeled support frame",
      caption: "Complete SolidWorks assembly of the pulse jet engine and test setup",
      aspect: "landscape",
    },
    gallery: [
      { type: "image", src: "/project-photos/pulse-jet-fabrication.jpg", label: "Engine Fabrication", alt: "Pulse jet engine fabrication process", caption: "Steel fabrication and assembly", aspect: "landscape" },
      { type: "image", src: "/project-photos/pulse-jet-test-bench.jpg", label: "Instrumented Test Bench", alt: "Instrumented pulse jet thrust test bench", caption: "Bench setup for thrust, temperature, and fuel-efficiency measurements", aspect: "landscape" },
      { type: "image", src: "/project-photos/pulse-jet-test-data.jpg", label: "Performance Test Data", alt: "Pulse jet thrust, temperature, and fuel-efficiency test data", caption: "Measured performance from controlled bench testing", aspect: "landscape" },
      { type: "image", src: "/project-photos/pulse-jet-team.jpg", label: "Pulse Jet Design Team", alt: "Eight-member Virginia Tech Pulse Jet Design Team", caption: "Student team founded and led by Charles Clark", aspect: "landscape" },
    ],
    videos: [
      { type: "video", src: "/project-videos/pulse-jet-test-fire.mp4", poster: "/project-photos/pulse-jet-cover.jpg", label: "Pulse Jet Test Fire", alt: "Pulse jet engine test-fire footage", caption: "Controlled test fire of the steel propane-fueled engine", aspect: "cinematic" },
      { type: "video", src: "/project-videos/pulse-jet-thrust-test.mp4", label: "Static Thrust Test", alt: "Pulse jet static-thrust test footage", aspect: "cinematic" },
    ],
    documents: [
      { type: "pdf", src: "/project-documents/pulse-jet-test-summary.pdf", label: "Pulse Jet Test Summary", alt: "Pulse jet engine test summary PDF" },
    ],
    featured: true,
    caseStudy: {
      format: "sections",
      label: "Team / Goals / Contributions",
      heading: "Building a student propulsion team.",
      intro: "The project combines team leadership with hands-on engine design, fabrication, instrumentation, and testing.",
      sections: [
        {
          title: "The team",
          description: "I founded the eight-member Virginia Tech Pulse Jet Design Team in May 2025 and now lead its design, fabrication, and testing work. I organize roles, coordinate the work, and keep the team aligned around safe, measurable progress.",
        },
        {
          title: "Our goals",
          description: "Our goal is to develop a functional steel, propane-fueled pulse jet and a repeatable test program around it. We measure static thrust, temperature, and fuel efficiency so future design decisions can be based on test evidence.",
        },
        {
          title: "What I specifically did",
          description: "I helped move the project from an initial concept to a functioning engine and instrumented test setup.",
          bullets: [
            "Founded the team and established roles, constraints, and a safe validation plan.",
            "Designed the steel engine geometry and assembly in SolidWorks.",
            "Contributed to hands-on fabrication and assembly.",
            "Built the test bench and ran controlled tests that recorded approximately 300 N of peak static thrust.",
          ],
        },
      ],
    },
  },
  {
    slug: "culligan",
    title: "Culligan Product Design Work",
    eyebrow: "Product Design / FEA / Injection Molding",
    subtitle: "Four projects spanning product design, analysis, and documentation.",
    role: "Mechanical Engineering Design Intern",
    duration: "May 2026 - August 2026",
    location: "Rosemont, Illinois",
    summary: "At Culligan International, I contributed to four projects spanning injection-molded design, commercial hydraulic hardware, prototype development, and engineering drawings.",
    challenge: "As a Mechanical Engineering Design Intern, I developed practical, manufacturable solutions across four workstreams, communicated them through analysis, drawings, and prototypes, and protected confidential product details.",
    process: [
      { title: "Define", description: "Translated residential, commercial hydraulic, and field-training needs into engineering requirements." },
      { title: "Design", description: "Designed an injection-molded float system and commercial mounting brackets in SolidWorks." },
      { title: "Analyze", description: "Used FEA to evaluate water-treatment components and support design decisions." },
      { title: "Communicate", description: "Presented a portable field-training prototype and drafted five commercial product drawing sets." },
    ],
    results: [
      "Designed a new float system with injection-molded parts for a residential water softener.",
      "Developed mounting brackets to improve water pressure in a commercial hydraulic system.",
      "Created and presented a portable field-training suitcase prototype that secured $75,000 in funding.",
      "Drafted technical engineering drawings for five commercial water softeners and assemblies.",
    ],
    future: ["Selected project details and visuals are intentionally limited due to confidentiality."],
    metrics: [
      { value: "$75K", label: "Funding secured", detail: "Field-training prototype" },
      { value: "5", label: "Drawing packages", detail: "Commercial products" },
      { value: "4", label: "Selected projects", detail: "Design / analysis / training / drawings" },
    ],
    skills: ["SolidWorks", "Finite Element Analysis (FEA)", "Injection molding", "Engineering drawings", "Prototype development"],
    coverImage: {
      type: "image",
      src: "/project-photos/culligan-float-system.png",
      label: "Residential Float System",
      alt: "Three side-by-side views of the residential float system: physical prototype, SolidWorks model, and design comparison",
      aspect: "landscape",
      fit: "contain",
    },
    gallery: [
      {
        type: "image",
        src: "/project-photos/culligan-bracket-fea.png",
        label: "Acrylic Mounting-Bracket FEA",
        alt: "Static structural FEA results for the acrylic mounting bracket, including loading, stress distribution, factor of safety, and conclusions",
        aspect: "landscape",
        fit: "contain",
      },
      {
        type: "image",
        src: "/project-photos/culligan-training-suitcase.jpeg",
        label: "Field-Training Suitcase Prototype",
        alt: "Open portable field-training suitcase prototype with machined aluminum mounting panels installed",
        aspect: "portrait",
        fit: "contain",
      },
      {
        type: "image",
        src: "/project-photos/culligan-commercial-drawings.png",
        label: "Commercial Drawing Package",
        alt: "Both sheets of the commercial water-softener general-arrangement drawing package displayed side by side",
        aspect: "landscape",
        fit: "contain",
      },
    ],
    videos: [],
    documents: [],
    confidential: true,
    featured: true,
    caseStudy: {
      format: "sections",
      label: "Four selected projects",
      heading: "Product design work at Culligan.",
      intro: "My internship covered residential products, commercial hydraulic systems, field training, and technical documentation. Selected details remain limited because the work is confidential.",
      sections: [
        {
          title: "Residential float system",
          description: "Designed and developed an injection-molded float system for a residential water softener. I used SolidWorks to translate the product need into a practical, manufacturable component concept.",
        },
        {
          title: "Commercial mounting brackets",
          description: "Developed mounting brackets for a commercial hydraulic system with the goal of improving water pressure. SolidWorks and FEA supported the design and evaluation work.",
        },
        {
          title: "Field-training prototype",
          description: "Created and presented a portable field-training suitcase prototype. The concept secured $75,000 in funding for continued development.",
        },
        {
          title: "Commercial drawing packages",
          description: "Drafted technical engineering drawings for five commercial water softeners and assemblies, translating the designs into clear manufacturing documentation.",
        },
      ],
    },
  },
  {
    slug: "automotive-restoration",
    title: "Automotive Restoration",
    eyebrow: "Fabrication / Diagnostics / Independent Build",
    subtitle: "Two vehicles returned to working condition.",
    role: "Independent Project",
    duration: "August 2020 - Present",
    location: "Libertyville, Illinois",
    summary: "I restored a 2001 Jeep Cherokee and a 1987 Jeep Comanche through engine rebuild and swap work, an axle swap, a new wiring harness, welding, machining, and diagnostics.",
    challenge: "Working independently, I needed to diagnose each vehicle, prioritize and sequence repairs, and restore both systems safely using machining, welding, and hands-on repair skills.",
    process: [
      { title: "Diagnose", description: "Worked from symptoms and inspection findings to isolate mechanical and structural problems." },
      { title: "Plan", description: "Sequenced repairs around safety, system dependencies, and parts availability." },
      { title: "Restore", description: "Applied welding, machining, repair, and assembly skills across both vehicles." },
      { title: "Verify", description: "Tested repaired systems and used new evidence to resolve remaining issues." },
    ],
    results: [
      "Completed an engine rebuild and engine swap.",
      "Completed an axle swap.",
      "Installed a new wiring harness.",
      "Returned a 2001 Jeep Cherokee and a 1987 Jeep Comanche to working condition.",
    ],
    future: ["Continue documenting system-by-system restoration decisions.", "Add a complete walk-around video and final system checks."],
    metrics: [
      { value: "2", label: "Vehicles restored", detail: "Cherokee + Comanche" },
      { value: "2020", label: "Project began", detail: "Independent restoration work" },
    ],
    skills: ["MIG welding", "Stick welding", "Machining", "Automotive diagnostics"],
    coverImage: { type: "image", src: "/project-photos/automotive-comanche-finished.webp", label: "Restored 1987 Jeep Comanche", alt: "Charles Clark standing beside the restored 1987 Jeep Comanche", caption: "1987 Jeep Comanche returned to working condition", aspect: "landscape" },
    gallery: [
      { type: "image", src: "/project-photos/automotive-garage-teardown.webp", label: "Drivetrain and Axle Teardown", alt: "Jeep Comanche on jack stands with the engine, transmission, axle, and suspension components removed", caption: "Engine, transmission, axle, and suspension work in progress", aspect: "landscape" },
      { type: "image", src: "/project-photos/automotive-engine-install.webp", label: "Engine Rebuild and Swap", alt: "Engine being installed into the red Jeep Cherokee with a shop crane", caption: "Engine installation using a shop crane", aspect: "landscape" },
      { type: "image", src: "/project-photos/automotive-cherokee-finished.webp", label: "Restored 2001 Jeep Cherokee", alt: "Restored red 2001 Jeep Cherokee photographed in a driveway", caption: "2001 Jeep Cherokee returned to working condition", aspect: "landscape" },
      { type: "image", src: "/project-photos/automotive-engine-bay-wiring.webp", label: "Engine Bay and Wiring Harness", alt: "Jeep engine bay showing the engine, hoses, and wiring-harness work", caption: "Engine-bay assembly and new wiring-harness work", aspect: "landscape" },
    ],
    videos: [{ type: "video", src: "/project-videos/automotive-walkaround.mp4", label: "Restored Vehicle Walk-Around", alt: "Walk-around video of the restored Jeep vehicles", aspect: "cinematic" }],
    documents: [],
    featured: true,
    caseStudy: {
      format: "sections",
      label: "Major restoration work",
      heading: "Rebuilding the systems that made the vehicles run.",
      intro: "The 2001 Jeep Cherokee and 1987 Jeep Comanche restorations required major mechanical, drivetrain, and electrical work—not just cosmetic changes.",
      sections: [
        {
          title: "Engine rebuild + swap",
          description: "Rebuilt an engine and completed an engine swap as part of returning the vehicles to working condition. The work required mechanical diagnosis, careful repair sequencing, and hands-on installation.",
        },
        {
          title: "Axle swap",
          description: "Removed the existing axle assembly and completed an axle swap, using fabrication and mechanical repair skills to restore the drivetrain system.",
        },
        {
          title: "New wiring harness",
          description: "Installed a new wiring harness and worked through the electrical connections and diagnostic checks needed to restore reliable vehicle operation.",
        },
      ],
    },
  },
  {
    slug: "telescoping-crutch",
    title: "Telescoping Accessibility Crutch",
    eyebrow: "Accessibility / Rapid Prototyping / Design Leadership",
    subtitle: "A telescoping concept with 66% less storage space.",
    role: "Accessibility Design Project Leader",
    duration: "August 2024 - May 2025",
    location: "Blacksburg, Virginia",
    summary: "A full-length crutch is difficult to store and transport because its fixed length requires substantial space.",
    challenge: "As project leader, I needed to guide a student team in creating a compact telescoping concept that preserved the crutch's essential function while meeting deadlines and clearly demonstrating the design.",
    process: [
      { title: "Frame", description: "Defined the storage problem and translated accessibility needs into a compacting mechanism goal." },
      { title: "Model", description: "Used SolidWorks to develop telescoping concepts and communicate the device architecture." },
      { title: "Prototype", description: "Built rapid prototypes to demonstrate the mechanism and device capabilities." },
      { title: "Lead", description: "Ran meetings, established deadlines, coordinated work, and reported progress." },
    ],
    results: [
      "Reduced required storage space by 66%.",
      "Produced SolidWorks models and rapid prototypes demonstrating the concept.",
      "Led project meetings, deadlines, progress reporting, and team coordination.",
    ],
    future: ["Refine mechanism durability and ergonomics.", "Expand user testing and document design-validation results."],
    metrics: [{ value: "66%", label: "Storage-space reduction", detail: "Telescoping concept" }],
    skills: ["SolidWorks", "Accessibility design", "Rapid prototyping", "Project leadership", "Design communication"],
    coverImage: {
      type: "video",
      src: "/project-videos/telescoping-crutch-animation.mp4",
      label: "Telescoping Accessibility Crutch",
      alt: "Looping demonstration of the telescoping accessibility crutch prototype",
      caption: "Compact mobility-aid concept with 66% storage-space reduction",
      aspect: "landscape",
      playback: "loop",
      fit: "contain",
    },
    gallery: [
      {
        type: "image",
        src: "/project-photos/crutch-accessibility-poster.png",
        label: "Accessibility on Campus Project Poster",
        alt: "Complete Accessibility on Campus presentation poster showing design performance, stakeholders, research, solution overview, limitations, and recommendations",
        caption: "Final project poster documenting the research, design decisions, performance, and recommendations",
        aspect: "landscape",
        fit: "contain",
      },
      {
        type: "image",
        src: "/project-photos/crutch-prototype.png",
        label: "Working Telescoping Crutch Prototype",
        alt: "Physical telescoping crutch prototype with PVC frame, wiring, sensors, and a green status light",
        caption: "Physical prototype with the locking indicator illuminated",
        aspect: "portrait",
        fit: "contain",
      },
    ],
    videos: [{ type: "video", src: "/project-videos/crutch-demonstration.mp4", label: "Crutch Demonstration", alt: "Demonstration of the telescoping accessibility crutch", aspect: "cinematic" }],
    documents: [],
    featured: true,
    caseStudy: { format: "star" },
  },
];

export const experiences = [
  {
    company: "Culligan International",
    projectSlug: "culligan",
    role: "Mechanical Engineering Design Intern",
    location: "Rosemont, Illinois",
    duration: "May 2026 - August 2026",
    summary: "Used SolidWorks and FEA across four projects involving product design, prototyping, and technical documentation.",
    highlights: ["Used SolidWorks and FEA extensively to design, develop, and build water-treatment components", "Designed an injection-molded residential float system and commercial hydraulic mounting brackets", "Created a field-training suitcase prototype that secured $75,000 in funding", "Drafted engineering drawing packages for five commercial water softeners and assemblies"],
  },
  {
    company: "Pulse Jet Design Team",
    projectSlug: "pulse-jet",
    role: "Founder and President",
    location: "Blacksburg, Virginia",
    duration: "May 2025 - Present",
    summary: "Founded and lead an eight-member team that designs, fabricates, instruments, and tests pulse jet engines.",
    highlights: ["Designed and tested a steel pulse jet producing approximately 300 N of peak static thrust", "Built an instrumented bench for thrust, temperature, and fuel-efficiency measurements"],
  },
  {
    company: "Automotive Restoration",
    projectSlug: "automotive-restoration",
    role: "Independent Project",
    location: "Libertyville, Illinois",
    duration: "August 2020 - Present",
    summary: "Rebuilt and restored two vehicles through diagnostics, welding, machining, and repair planning.",
    highlights: ["Rebuilt and restored a 2001 Jeep Cherokee and a 1987 Jeep Comanche", "Used welding, machining, and diagnostic problem-solving"],
  },
  {
    company: "Virginia Tech Engineering Education Department",
    projectSlug: "telescoping-crutch",
    role: "Accessibility Design Project Leader",
    location: "Blacksburg, Virginia",
    duration: "August 2024 - May 2025",
    summary: "Led a rapid-prototyping team through the design of a telescoping accessibility crutch, combining CAD development with deadlines, demonstrations, and structured progress reporting.",
    highlights: ["Led a team to design and prototype a telescoping crutch, reducing storage space by 66%", "SolidWorks and rapid prototyping", "Team meetings, deadlines, and project coordination"],
  },
];

export const skillGroups = [
  { title: "CAD + analysis", skills: ["SolidWorks (CSWP)", "Finite Element Analysis (FEA)", "Engineering drawings", "MATLAB"] },
  { title: "Product development", skills: ["Rapid prototyping", "Injection-molded part design", "Design validation"] },
  { title: "Manufacturing + fabrication", skills: ["MIG welding", "Stick welding", "3D printing", "CNC machining", "Forklift certification"] },
];

export const education = {
  school: "Virginia Tech",
  degree: "Bachelor of Science, Mechanical Engineering Candidate",
  graduation: "Expected Graduation: May 2028",
  details: ["GPA: 3.84", "Dean's List every semester", "Mechanical Engineering Undergraduate Student Ambassador", "Raymond & Shirley Lynn Merit Scholarship recipient"],
  coursework: ["Dynamics", "Thermodynamics", "Differential Equations", "Mechanics of Bodies", "Electrical Theory"],
};

export const credentials = [
  { title: "Certified SolidWorks Professional (CSWP)", issuer: "Dassault Systèmes", date: "July 2026" },
  { title: "Finite Element Analysis (FEA) Certification", issuer: "GoEngineer", date: "July 2026" },
  { title: "Eagle Scout", issuer: "Boy Scouts of America", date: "July 2023" },
];

export const processSteps = [
  { number: "01", title: "Define", text: "Turn the need into clear constraints and success criteria." },
  { number: "02", title: "Model", text: "Develop geometry, interfaces, and manufacturable assemblies in CAD." },
  { number: "03", title: "Analyze", text: "Use calculations and FEA to challenge the design before fabrication." },
  { number: "04", title: "Prototype", text: "Build quickly enough to learn from the physical system." },
  { number: "05", title: "Test", text: "Instrument, measure, and compare the result to the requirement." },
  { number: "06", title: "Refine", text: "Use evidence from testing to make the next version stronger." },
];
