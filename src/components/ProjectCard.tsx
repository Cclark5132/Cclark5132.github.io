import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../data/portfolio";
import { ProjectMedia } from "./ProjectMedia";

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const reduceMotion = useReducedMotion();
  const headlineMetric = project.metrics[0];

  return (
    <motion.article
      className="project-card"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.28 }}
    >
      <Link to={`/projects/${project.slug}`} aria-label={`View ${project.title} case study`}>
        <ProjectMedia media={project.coverImage} className="home-project-media" />
        <div className="project-card-body">
          <div className="project-card-index">
            <span>Project {String(index).padStart(2, "0")}</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </div>
          <p className="project-card-discipline">{project.eyebrow}</p>
          <h3>{project.title}</h3>
          <p className="project-card-summary">{project.subtitle}</p>
          <p className="project-card-skills">{project.skills.slice(0, 2).join(" / ")}</p>
          <div className="project-card-result">
            <strong>{headlineMetric.value}</strong>
            <span>{headlineMetric.label}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
