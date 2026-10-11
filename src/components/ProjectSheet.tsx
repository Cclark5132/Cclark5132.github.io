import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../data/portfolio";
import { Media } from "./Media";
import { Readout } from "./Readout";

interface ProjectSheetProps {
  project: Project;
  index: number;
  total: number;
}

export const projectNumber = (index: number) => String(index + 1).padStart(2, "0");

/**
 * One project on the home page, styled as a drawing sheet. On large screens the sheets pin and stack while
 * the list scrolls, so each sheet's title strip stays visible as an index of the set.
 */
export function ProjectSheet({ project, index, total }: ProjectSheetProps) {
  const number = projectNumber(index);

  return (
    <article className="sheet" style={{ "--i": index } as CSSProperties} aria-labelledby={`sheet-${project.slug}`}>
      <header className="sheet-strip">
        <span className="sheet-number">
          <span className="sr-only">Project </span>
          {number}
          <span className="sheet-of">/{String(total).padStart(2, "0")}</span>
        </span>
        <h3 className="sheet-title" id={`sheet-${project.slug}`}>
          <Link className="sheet-link" to={`/projects/${project.slug}`}>
            {project.title}
          </Link>
        </h3>
        <span className="sheet-location">{project.location}</span>
        <span className="sheet-go" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </header>
      <div className="sheet-body">
        <div className="sheet-media">
          <Media media={project.cover} sizes="(min-width: 1100px) 640px, 100vw" />
        </div>
        <div className="sheet-info">
          <p className="sheet-role">
            {project.role} <span aria-hidden="true">·</span> {project.dates}
          </p>
          <p className="sheet-summary">{project.summary}</p>
          <Readout metrics={project.metrics} layout="grid" className="sheet-readout" />
          <span className="sheet-cta" aria-hidden="true">
            Open project <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
