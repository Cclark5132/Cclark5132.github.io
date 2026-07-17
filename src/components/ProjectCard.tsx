import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../data/portfolio";
import { ProjectMedia } from "./ProjectMedia";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const reduceMotion = useReducedMotion();
  const headlineMetric = project.metrics[0];

  return (
    <motion.article
      className={`project-card group ${featured ? "project-card-featured" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/projects/${project.slug}`} className={featured ? "grid h-full lg:grid-cols-[1.15fr_0.85fr]" : "flex h-full flex-col"} aria-label={`View ${project.title} case study`}>
        <ProjectMedia media={project.coverImage} className={`rounded-none border-0 ${featured ? "min-h-[25rem]" : "min-h-[15rem]"}`} />
        <div className="flex flex-1 flex-col p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <p className="technical-label max-w-[75%] text-orange">{project.eyebrow}</p>
            <span className="project-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span>
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-charcoal md:text-3xl">{project.title}</h3>
          <p className="mt-3 text-base leading-7 text-steel">{project.subtitle}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-5">
            {project.skills.slice(0, featured ? 4 : 3).map((skill) => <span className="tag" key={skill}>{skill}</span>)}
          </div>
          <div className="mt-5 flex items-end justify-between gap-5 border-t border-black/10 pt-5">
            <div>
              <strong className="text-2xl text-cyan">{headlineMetric.value}</strong>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.11em] text-steel">{headlineMetric.label}</p>
            </div>
            <span className="text-sm font-semibold text-cyan">View case study</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
