import type { Project } from "./portfolio";

export const SITE_URL = "https://charlesclark.me";

export interface PageMeta {
  title: string;
  description: string;
  url: string;
}

/** Shared by the build-time prerenderer and the client so every page's tags match. */
export const homeMeta: PageMeta = {
  title: "Charles Clark | Mechanical Engineering | Incoming SpaceX Intern 2027",
  description:
    "Charles T. Clark, Virginia Tech mechanical engineering student (B.S. expected December 2028), incoming SpaceX intern for 2027. Projects: a propane pulse jet, product design at Culligan, two Jeep restorations and a telescoping crutch.",
  url: `${SITE_URL}/`,
};

export function projectMeta(project: Project): PageMeta {
  return {
    title: `${project.title} | Charles Clark`,
    description: project.summary,
    url: `${SITE_URL}/projects/${project.slug}`,
  };
}

export const notFoundMeta: PageMeta = {
  title: "Page not found | Charles Clark",
  description: homeMeta.description,
  url: `${SITE_URL}/`,
};
