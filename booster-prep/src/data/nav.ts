import type { IconName } from "../components/Icon";

export const nav: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Mission Dashboard", icon: "dashboard" },
  { to: "/roadmap", label: "Roadmap", icon: "roadmap" },
  { to: "/lessons", label: "Lessons", icon: "lessons" },
  { to: "/tools", label: "Tool tracks", icon: "tools" },
  { to: "/calculators", label: "Calculators", icon: "calc" },
  { to: "/capstone", label: "Capstone", icon: "capstone" },
  { to: "/anatomy", label: "Booster Anatomy", icon: "anatomy" },
  { to: "/flashcards", label: "Flashcards", icon: "cards" },
  { to: "/resources", label: "Resources", icon: "resources" },
  { to: "/glossary", label: "Glossary", icon: "glossary" },
  { to: "/launch", label: "Launch Prep", icon: "launch" },
];
