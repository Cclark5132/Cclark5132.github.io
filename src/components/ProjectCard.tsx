import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../data/portfolio";
import { Metric } from "./Metric";
import { ProjectMedia } from "./ProjectMedia";

interface ProjectCardProps {
  project: Project;
  primary?: boolean;
}

export function ProjectCard({ project, primary = false }: ProjectCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={`project-card group ${primary ? "md:col-span-2" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 26 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/projects/${project.slug}`} className={`grid h-full ${primary ? "lg:grid-cols-[1.3fr_0.7fr]" : ""}`} aria-label={`View ${project.title} case study`}>
        <div className="overflow-hidden">
          <ProjectMedia media={project.coverImage} className={`rounded-none border-0 ${primary ? "min-h-[23rem]" : "min-h-[18rem]"}`} />
        </div>
        <div className="flex flex-col p-5 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <p className="technical-label text-cyan">{project.eyebrow}</p>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-white transition group-hover:border-cyan/50 group-hover:bg-cyan group-hover:text-ink">
              <ArrowUpRight size={17} aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">{project.title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-steel md:text-base">{project.subtitle}</p>
          {primary && (
            <div className="mt-7 grid grid-cols-2 gap-3">
              {project.metrics.slice(0, 2).map((metric) => <Metric key={metric.label} metric={metric} compact />)}
            </div>
          )}
          <div className="mt-auto flex flex-wrap gap-2 pt-7">
            {project.skills.slice(0, primary ? 5 : 3).map((skill) => <span className="tag" key={skill}>{skill}</span>)}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
