import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { BuildText } from "../components/BuildText";
import { projectNumber } from "../components/ProjectSheet";
import { CountUp } from "../components/CountUp";
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

  const meta = [
    { label: "Role", value: project.role },
    { label: "Dates", value: project.dates },
    { label: "Location", value: project.location },
  ];
  const specs = [...(project.org ? [{ label: "Organization", value: project.org }] : []), ...project.specs];
  const order = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <main id="main-content" tabIndex={-1} className="project-page">
      {/* Dark band: title, summary and key numbers, then the photo stage. Builds on load (CSS only). */}
      <section className="project-band" aria-labelledby="project-title">
        <div className="wrap">
          <header className="project-hero intro" data-reveal="title">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link className="r-fade" to="/#projects">
                <ArrowLeft size={15} aria-hidden="true" /> All projects
              </Link>
            </nav>
            <p className="project-index r-fade">
              Project {projectNumber(index)} <span aria-hidden="true">/</span>
              <span className="sr-only"> of </span> {String(total).padStart(2, "0")}
            </p>
            <h1 id="project-title" tabIndex={-1} aria-label={project.title}>
              <BuildText text={project.title} />
            </h1>
            <p className="project-summary r-fade">{project.summary}</p>
            <dl className="project-meta">
              {meta.map((item, itemIndex) => (
                <div className="r-fade" style={order(itemIndex)} key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <dl className="project-numbers">
              {project.metrics.map((metric, metricIndex) => (
                <div className="r-block" style={order(metricIndex)} key={metric.label}>
                  <dt>
                    {metric.label}
                    {metric.note && <span>{metric.note}</span>}
                  </dt>
                  <dd>{metric.count === false ? metric.value : <CountUp value={metric.value} />}</dd>
                </div>
              ))}
            </dl>
            {project.confidentialNote && (
              <p className="confidential r-wipe">
                <strong>Confidential</strong>
                {project.confidentialNote}
              </p>
            )}
          </header>

          <SlideShow slides={slides} title={project.title} />
        </div>
      </section>

      <div className="wrap">
        {(specs.length > 0 || project.notes) && (
          <section className="project-extra" aria-label="More details" data-reveal="extra">
            {specs.length > 0 && (
              <dl className="spec-list project-specs">
                {specs.map((item, itemIndex) => (
                  <div className="r-fade" style={order(itemIndex)} key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {project.notes && (
              <div className="project-notes">
                <p className="project-notes-label r-fade">{project.notes.label}</p>
                <ul>
                  {project.notes.items.map((item, itemIndex) => (
                    <li className="r-block" style={order(itemIndex)} key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

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
