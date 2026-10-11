export const sections = [
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
] as const;

/** Section ids used by the previous version of the site in `/?section=` links. */
export const legacySectionIds: Record<string, string> = {
  work: "projects",
  background: "experience",
  skills: "skills",
  contact: "contact",
};
