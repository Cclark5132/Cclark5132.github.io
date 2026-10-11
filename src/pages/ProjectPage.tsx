import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { BuildText } from "../components/BuildText";
import { projectNumber } from "../components/ProjectSheet";
import { Readout } from "../components/Readout";
import { SlideShow, type Slide } from "../components/SlideShow";
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
  const video = project.testVideo;
  const slides: Slide[] = [
    ...(video ? [{ media: video.media, title: video.media?.label ?? video.label, text: video.media?.caption }] : []),
    ...project.figures.map((figure) => ({ media: figure, title: figure.label, text: figure.caption })),
  ];

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
        <nav className="crumbs intro" aria-label="Breadcrumb" data-reveal="crumbs">
          <Link className="r-fade" to="/#projects">
            <ArrowLeft size={15} aria-hidden="true" /> All projects
          </Link>
        </nav>

        {/* The title block builds itself on page load (CSS only), like the home page hero. */}
        <header className="project-head intro" data-reveal="title">
          <span className="project-head-rule r-draw" aria-hidden="true" />
          <p className="project-index r-fade">
            Project {projectNumber(index)} <span aria-hidden="true">/</span>
            <span className="sr-only"> of </span> {String(total).padStart(2, "0")}
          </p>
          <h1 tabIndex={-1} aria-label={project.title}>
            <BuildText text={project.title} />
          </h1>
          <p className="project-summary r-fade">{project.summary}</p>
          {project.confidentialNote && (
            <p className="confidential r-wipe">
              <strong>Confidential</strong>
              {project.confidentialNote}
            </p>
          )}
        </header>

        {/* Details and key numbers up top; the story is told slide by slide below. */}
        <div className="project-overview intro" data-reveal="overview">
          <dl className="spec-list project-details">
            {details.map((detail, detailIndex) => (
              <div className="r-fade" style={{ "--i": detailIndex } as CSSProperties} key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
          <Readout metrics={project.metrics} layout="rows" />
          {project.notes && (
            <div className="project-notes">
              <p className="project-notes-label r-fade">{project.notes.label}</p>
              <ul>
                {project.notes.items.map((item, itemIndex) => (
                  <li className="r-block" style={{ "--i": itemIndex } as CSSProperties} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <SlideShow slides={slides} title={project.title} />

        <nav className="pager" aria-label="Other projects" data-reveal="rows">
          <Link className="pager-link r-pop" style={{ "--i": 0 } as CSSProperties} to={`/projects/${previous.slug}`}>
            <span className="pager-dir">
              <ArrowLeft size={15} aria-hidden="true" /> Previous
            </span>
            <span className="pager-title">
              <span className="pager-number">{projectNumber(projects.indexOf(previous))}</span> {previous.title}
            </span>
          </Link>
          <Link className="pager-link pager-next r-pop" style={{ "--i": 1 } as CSSProperties} to={`/projects/${next.slug}`}>
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
