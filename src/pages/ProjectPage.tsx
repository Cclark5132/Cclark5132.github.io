import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Figures } from "../components/Figures";
import { projectNumber } from "../components/ProjectSheet";
import { Readout } from "../components/Readout";
import { VideoSlot } from "../components/VideoSlot";
import { projectMeta } from "../data/meta";
import { projects } from "../data/portfolio";
import { applyMeta } from "../lib/applyMeta";
import { NotFoundPage } from "./NotFoundPage";

export function ProjectPage() {
  const { slug } = useParams();
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];

  useEffect(() => {
    if (project) applyMeta(projectMeta(project));
  }, [project]);

  if (!project) return <NotFoundPage />;

  const total = projects.length;
  const previous = projects[(index - 1 + total) % total];
  const next = projects[(index + 1) % total];
  const videoMedia = project.testVideo?.media ?? null;
  const firstFigure = videoMedia ? 2 : 1;

  const details = [
    ...(project.org ? [{ label: "Organization", value: project.org }] : []),
    { label: "Role", value: project.role },
    { label: "Dates", value: project.dates },
    { label: "Location", value: project.location },
    ...project.specs,
  ];

  return (
    <main id="main-content" tabIndex={-1} className="project-page">
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/#projects">
            <ArrowLeft size={15} aria-hidden="true" /> All projects
          </Link>
        </nav>

        <header className="project-head">
          <p className="project-index">
            Project {projectNumber(index)} <span aria-hidden="true">/</span>
            <span className="sr-only"> of </span> {String(total).padStart(2, "0")}
          </p>
          <h1 tabIndex={-1}>{project.title}</h1>
          <p className="project-summary">{project.summary}</p>
          {project.confidentialNote && (
            <p className="confidential">
              <strong>Confidential</strong>
              {project.confidentialNote}
            </p>
          )}
        </header>

        <div className="project-layout">
          <aside className="spec-rail" aria-label="Project details">
            <div className="spec-rail-inner">
              <dl className="spec-list spec-list-rail">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
              <Readout metrics={project.metrics} layout="rows" />
            </div>
          </aside>

          <div className="project-body">
            {project.testVideo && <VideoSlot label={project.testVideo.label} media={videoMedia} figureNumber={1} />}

            <div className="writeup">
              {project.sections.map((section, sectionIndex) => (
                <section key={section.heading} aria-labelledby={`${project.slug}-s${sectionIndex}`} data-reveal>
                  <h2 id={`${project.slug}-s${sectionIndex}`}>
                    <span className="writeup-number" aria-hidden="true">
                      {sectionIndex + 1}.
                    </span>
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list && (
                    <ul className="dash-list writeup-list">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.metrics && <Readout metrics={section.metrics} layout="grid" className="writeup-readout" />}
                </section>
              ))}
            </div>

            <section className="figures" aria-labelledby="figures-title">
              <h2 id="figures-title" className="figures-title">
                Figures
              </h2>
              <Figures figures={project.figures} start={firstFigure} />
            </section>
          </div>
        </div>

        <nav className="pager" aria-label="Other projects">
          <Link className="pager-link" to={`/projects/${previous.slug}`}>
            <span className="pager-dir">
              <ArrowLeft size={15} aria-hidden="true" /> Previous
            </span>
            <span className="pager-title">
              <span className="pager-number">{projectNumber(projects.indexOf(previous))}</span> {previous.title}
            </span>
          </Link>
          <Link className="pager-link pager-next" to={`/projects/${next.slug}`}>
            <span className="pager-dir">
              Next <ArrowRight size={15} aria-hidden="true" />
            </span>
            <span className="pager-title">
              <span className="pager-number">{projectNumber(projects.indexOf(next))}</span> {next.title}
            </span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
