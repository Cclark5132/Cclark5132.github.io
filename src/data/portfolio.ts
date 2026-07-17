export type MediaType = "image" | "video" | "youtube" | "vimeo" | "cad" | "pdf";

export interface MediaItem {
  type: MediaType;
  src: string;
  label: string;
  alt: string;
  caption?: string;
  poster?: string;
  aspect?: "landscape" | "portrait" | "square" | "cinematic";
}

export interface MetricData {
  value: string;
  label: string;
  detail?: string;
}

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
}

// CONTENT GUIDE: Replace placeholder media paths, captions, and social links here.
// Components intentionally show designed fallback panels when a local file is missing.
export const profile = {
  name: "Charles T. Clark",
  title: "Mechanical Engineer",
  email: "charlesclark@vt.edu",
  phone: "(224) 358-5132",
  phoneLink: "+12243585132",
  location: "Chicago, Illinois",
  availability: "Seeking Spring 2027 Co-op + Summer 2027 Internship",
  resume: "/Charles-Clark-Resume.pdf",
  linkedIn: "",
  github: "https://github.com/Cclark5132",
  // Replace with /about/portrait.webp (recommended: 4:5 WebP, at least 1200px wide).
  portrait: "/about/portrait-placeholder.webp",
  heroMedia: {
    type: "image" as const,
    src: "/projects/pulse-jet/cover-placeholder.webp",
    label: "Add Pulse Jet Engine CAD Render or Workshop Portrait",
    alt: "Placeholder for Charles Clark with a pulse jet engine or SolidWorks assembly render",
    caption: "Featured media - replace with a portrait, CAD render, workshop photo, or muted loop",
    aspect: "portrait" as const,
  },
};

export const projects: Project[] = [
  {
    slug: "pulse-jet",
    title: "Pulse Jet Design Team",
    eyebrow: "Propulsion / Team Leadership / Test Engineering",
    subtitle: "From a blank page to measured static thrust.",
    role: "Founder and President",
    duration: "May 2025 - Present",
    location: "Blacksburg, Virginia",
    summary: "I founded and lead an eight-member team designing, fabricating, and testing pulse jet engines. Our steel, propane-fueled design moved from SolidWorks to a live bench test and produced approximately 300 newtons of peak static thrust.",
    challenge: "Create a functional pulse jet program from the ground up: organize the team, develop a manufacturable engine, build a safe test system, and replace assumptions with reliable thrust, temperature, and fuel-efficiency measurements.",
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
      type: "cad",
      src: "/projects/pulse-jet/cover-placeholder.webp",
      label: "Add Pulse Jet Engine CAD Render",
      alt: "Placeholder for a SolidWorks render of the pulse jet engine",
      caption: "Recommended: 16:10 WebP or AVIF, at least 1800px wide",
      aspect: "landscape",
    },
    gallery: [
      { type: "image", src: "/projects/pulse-jet/fabrication-placeholder.webp", label: "Add Engine Fabrication Photograph", alt: "Placeholder for pulse jet fabrication photography", aspect: "landscape" },
      { type: "image", src: "/projects/pulse-jet/test-bench-placeholder.webp", label: "Add Instrumented Test Bench Photograph", alt: "Placeholder for pulse jet thrust test bench photography", aspect: "landscape" },
      { type: "image", src: "/projects/pulse-jet/data-placeholder.webp", label: "Add Testing Data Graphic", alt: "Placeholder for thrust, temperature, and fuel-efficiency data visualization", aspect: "landscape" },
      { type: "image", src: "/projects/pulse-jet/team-placeholder.webp", label: "Add Design Team Photograph", alt: "Placeholder for the eight-member Pulse Jet Design Team", aspect: "landscape" },
    ],
    videos: [
      { type: "video", src: "/projects/pulse-jet/test-fire-placeholder.mp4", poster: "/projects/pulse-jet/test-fire-poster-placeholder.webp", label: "Add Pulse Jet Test-Fire Video", alt: "Placeholder for muted pulse jet test-fire footage", caption: "Recommended: compressed MP4/WebM with captions or transcript", aspect: "cinematic" },
      { type: "video", src: "/projects/pulse-jet/thrust-test-placeholder.mp4", label: "Add Thrust-Test Footage", alt: "Placeholder for pulse jet thrust-test footage", aspect: "cinematic" },
    ],
    documents: [
      { type: "pdf", src: "/projects/pulse-jet/test-summary-placeholder.pdf", label: "Add Test Summary PDF", alt: "Placeholder for a pulse jet test summary PDF" },
    ],
    featured: true,
  },
  {
    slug: "culligan",
    title: "Culligan Product Design Work",
    eyebrow: "Product Design / FEA / Injection Molding",
    subtitle: "Molded components, improved flow, funded training.",
    role: "Mechanical Engineering Design Intern",
    duration: "May 2026 - August 2026",
    location: "Rosemont, Illinois",
    summary: "At Culligan International, I used SolidWorks and FEA to design, develop, and build water-treatment components, including an injection-molded float system, commercial mounting brackets, and a portable field-training prototype.",
    challenge: "Develop practical components and training tools for residential and commercial water-treatment systems while working within real product constraints and appropriate confidentiality limits.",
    process: [
      { title: "Discover", description: "Translated residential product, commercial hydraulic, and field-training needs into engineering requirements." },
      { title: "Design", description: "Designed an injection-molded float system and commercial mounting brackets in SolidWorks." },
      { title: "Analyze", description: "Used SolidWorks and FEA throughout the development of water-treatment components." },
      { title: "Communicate", description: "Presented a portable training prototype and drafted five commercial product drawing sets." },
    ],
    results: [
      "Designed a new float system with injection-molded parts for a residential water softener.",
      "Developed mounting brackets to improve water pressure in a commercial hydraulic system.",
      "Created and presented a portable field-training prototype that secured $75,000 in funding.",
      "Drafted technical engineering drawings for five commercial water softeners and assemblies.",
    ],
    future: ["Selected project details and visuals are intentionally limited due to confidentiality."],
    metrics: [
      { value: "$75K", label: "Funding secured", detail: "Field-training prototype" },
      { value: "5", label: "Drawing sets", detail: "Commercial products" },
      { value: "3", label: "Product areas", detail: "Residential / commercial / training" },
    ],
    skills: ["SolidWorks", "Injection molding", "Finite element analysis", "Engineering drawings", "Prototype development"],
    coverImage: { type: "image", src: "/projects/culligan/confidential-cover-placeholder.webp", label: "Confidential Product Design - Add Approved Diagram", alt: "Confidential project placeholder for Culligan product design work", caption: "Use only imagery approved for public release", aspect: "landscape" },
    gallery: [
      { type: "cad", src: "/projects/culligan/footprint-diagram-placeholder.webp", label: "Add Approved Float-System Diagram", alt: "Placeholder for an approved diagram of the residential water-softener float system", aspect: "landscape" },
      { type: "image", src: "/projects/culligan/fea-placeholder.webp", label: "Add Sanitized Bracket or FEA Visualization", alt: "Placeholder for an approved mounting-bracket or finite element analysis visualization", aspect: "landscape" },
      { type: "image", src: "/projects/culligan/training-concept-placeholder.webp", label: "Add Approved Training Concept Diagram", alt: "Placeholder for the funded field-training suitcase concept", aspect: "landscape" },
    ],
    videos: [],
    documents: [],
    confidential: true,
    featured: true,
  },
  {
    slug: "automotive-restoration",
    title: "Automotive Restoration",
    eyebrow: "Fabrication / Diagnostics / Independent Build",
    subtitle: "Two vehicles returned to working condition.",
    role: "Independent Project",
    duration: "August 2020 - Present",
    location: "Libertyville, Illinois",
    summary: "I rebuilt and restored a 2001 Jeep Cherokee and a 1987 Jeep Comanche, using welding, machining, and diagnostic problem-solving to return both vehicles to working condition.",
    challenge: "Bring two aging vehicles back to working condition by diagnosing mechanical and structural problems, planning repairs, and applying hands-on fabrication skills.",
    process: [
      { title: "Diagnose", description: "Worked from symptoms and inspection findings to isolate mechanical and structural problems." },
      { title: "Plan", description: "Sequenced repairs around safety, system dependencies, and parts availability." },
      { title: "Restore", description: "Applied welding, machining, repair, and assembly skills across both vehicles." },
      { title: "Verify", description: "Tested repaired systems and used new evidence to resolve remaining issues." },
    ],
    results: [
      "Rebuilt and restored a 2001 Jeep Cherokee.",
      "Rebuilt and restored a 1987 Jeep Comanche.",
      "Applied welding, machining, and diagnostic problem-solving throughout both restorations.",
    ],
    future: ["Document system-by-system restoration decisions.", "Add a complete walk-around and detailed before/after gallery."],
    metrics: [
      { value: "2", label: "Vehicles restored", detail: "Cherokee + Comanche" },
      { value: "2020", label: "Project began", detail: "Independent restoration work" },
    ],
    skills: ["MIG welding", "Stick welding", "Machining", "Automotive diagnostics"],
    coverImage: { type: "image", src: "/projects/automotive/jeep-before-placeholder.webp", label: "Add Before-and-After Restoration Photos", alt: "Placeholder for before and after Jeep restoration photography", caption: "Recommended: matched-angle 16:10 WebP images", aspect: "landscape" },
    gallery: [
      { type: "image", src: "/projects/automotive/jeep-after-placeholder.webp", label: "Add Finished Vehicle Photograph", alt: "Placeholder for finished Jeep restoration photography", aspect: "landscape" },
      { type: "image", src: "/projects/automotive/engine-bay-placeholder.webp", label: "Add Engine-Bay Detail", alt: "Placeholder for restored engine-bay photography", aspect: "landscape" },
      { type: "image", src: "/projects/automotive/welding-placeholder.webp", label: "Add Welding and Fabrication Footage", alt: "Placeholder for automotive welding and fabrication work", aspect: "landscape" },
    ],
    videos: [{ type: "video", src: "/projects/automotive/walkaround-placeholder.mp4", label: "Add Vehicle Walk-Around Video", alt: "Placeholder for a restored Jeep walk-around video", aspect: "cinematic" }],
    documents: [],
    featured: true,
  },
  {
    slug: "telescoping-crutch",
    title: "Telescoping Accessibility Crutch",
    eyebrow: "Accessibility / Rapid Prototyping / Design Leadership",
    subtitle: "Full support, one-third the storage volume.",
    role: "Accessibility Design Project Leader",
    duration: "August 2024 - May 2025",
    location: "Blacksburg, Virginia",
    summary: "I led the design and rapid prototyping of a telescoping crutch that reduced required storage space by 66%, coordinating the team from SolidWorks concepts through physical demonstrations and progress reporting.",
    challenge: "Reduce the stored size of a full-length mobility aid without losing its essential function, while keeping a student design team aligned around deadlines, physical prototypes, and clear progress communication.",
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
    coverImage: { type: "cad", src: "/projects/crutch/prototype-placeholder.webp", label: "Add Telescoping Crutch Prototype", alt: "Placeholder for the telescoping accessibility crutch prototype", caption: "Recommended: 4:3 WebP plus an isolated mechanism close-up", aspect: "landscape" },
    gallery: [
      { type: "cad", src: "/projects/crutch/cad-placeholder.webp", label: "Add SolidWorks Assembly Render", alt: "Placeholder for a SolidWorks model of the telescoping crutch", aspect: "landscape" },
      { type: "image", src: "/projects/crutch/mechanism-placeholder.webp", label: "Add Telescoping Mechanism Close-Up", alt: "Placeholder for a close-up of the telescoping crutch mechanism", aspect: "square" },
      { type: "image", src: "/projects/crutch/iterations-placeholder.webp", label: "Add Prototype Iteration Comparison", alt: "Placeholder comparing telescoping crutch prototype iterations", aspect: "landscape" },
    ],
    videos: [{ type: "video", src: "/projects/crutch/demo-placeholder.mp4", label: "Add Crutch Demonstration Video", alt: "Placeholder for a demonstration of the telescoping crutch", aspect: "cinematic" }],
    documents: [],
    featured: true,
  },
];

export const experiences = [
  {
    company: "Culligan International",
    projectSlug: "culligan",
    role: "Mechanical Engineering Design Intern",
    location: "Rosemont, Illinois",
    duration: "May 2026 - August 2026",
    summary: "Designed molded components and commercial mounting brackets, developed a funded field-training prototype, and drafted production drawing sets.",
    highlights: ["Designed an injection-molded residential float system", "$75,000 secured for a field-training prototype", "Five commercial water-softener drawing sets"],
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
    summary: "Restored two aging vehicles through diagnostics, welding, machining, and repair planning.",
    highlights: ["Rebuilt a 2001 Jeep Cherokee and 1987 Jeep Comanche", "Used welding, machining, and diagnostic problem-solving"],
  },
  {
    company: "Virginia Tech Engineering Education Department",
    projectSlug: "telescoping-crutch",
    role: "Accessibility Design Project Leader",
    location: "Blacksburg, Virginia",
    duration: "August 2024 - May 2025",
    summary: "Led a rapid-prototyping team through the design of a telescoping accessibility crutch, combining CAD development with deadlines, demonstrations, and structured progress reporting.",
    highlights: ["66% storage-space reduction", "SolidWorks and rapid prototyping", "Team meetings, deadlines, and project coordination"],
  },
];

export const skillGroups = [
  { title: "CAD + analysis", skills: ["SolidWorks", "Certified SolidWorks Professional", "Finite Element Analysis", "Engineering drawings", "MATLAB"] },
  { title: "Product development", skills: ["Rapid prototyping", "Injection-molded part design", "Design validation"] },
  { title: "Manufacturing + fabrication", skills: ["MIG welding", "Stick welding", "3D printing", "CNC machining", "Forklift certification"] },
];

export const education = {
  school: "Virginia Tech",
  degree: "Bachelor of Science in Mechanical Engineering",
  graduation: "Expected May 2028",
  details: ["GPA: 3.84", "Dean's List every semester", "Mechanical Engineering Undergraduate Student Ambassador", "Raymond & Shirley Lynn Merit Scholarship recipient"],
  coursework: ["Dynamics", "Thermodynamics", "Differential Equations", "Mechanics of Bodies", "Electrical Theory"],
};

export const credentials = [
  { title: "Certified SolidWorks Professional (CSWP)", issuer: "Dassault Systèmes", date: "July 2026" },
  { title: "Finite Element Analysis Certification", issuer: "GoEngineer", date: "July 2026" },
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
