import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CaseStudyGallery } from "../components/CaseStudyGallery";
import { Metric } from "../components/Metric";
import { ProjectMedia } from "../components/ProjectMedia";
import { projects } from "../data/portfolio";
import { NotFoundPage } from "./NotFoundPage";

export function ProjectPage() {
  const { slug } = useParams();
  const reduceMotion = useReducedMotion();
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  const project = projects[projectIndex];
  const otherProjects = projects.filter((item) => item.slug !== slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    if (project) {
      const pageUrl = `https://charlesclark.me/projects/${project.slug}`;
      document.title = `${project.title} | Charles T. Clark`;
      document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", project.summary);
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", pageUrl);
      document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", `${project.title} | Charles T. Clark`);
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", project.summary);
      document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", pageUrl);
      document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute("content", "https://charlesclark.me/social-preview.png");
    }
  }, [project]);

  if (!project) return <NotFoundPage />;

  const galleryMedia = [project.coverImage, ...project.gallery];

  return (
    <motion.main
      id="main-content"
      className="pt-24"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <header className="technical-grid border-b border-line py-10 md:py-14">
        <div className="site-container">
          <Link className="back-link" to="/?section=work"><ArrowLeft size={18} /> All projects</Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.48fr] lg:items-end">
            <div>
              <p className="technical-label text-orange">Case study / {String(projectIndex + 1).padStart(2, "0")}</p>
              <h1 className="mt-4 max-w-5xl text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-5xl md:text-7xl">{project.title}</h1>
              <p className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-white/65">{project.subtitle}</p>
              {project.confidential && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-orange/25 bg-orange/8 px-4 py-3 text-sm text-charcoal">
                  <LockKeyhole size={17} className="text-orange" /> Selected details are limited due to confidentiality.
                </div>
              )}
            </div>
            <dl className="project-meta">
              <div><dt>Role</dt><dd>{project.role}</dd></div>
              <div><dt>Duration</dt><dd>{project.duration}</dd></div>
              <div><dt>Focus</dt><dd>{project.eyebrow.replaceAll(" / ", ", ")}</dd></div>
            </dl>
          </div>
        </div>
      </header>

      <section className="site-container py-8">
        <CaseStudyGallery media={galleryMedia} title={project.title} />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.metrics.map((metric) => <Metric metric={metric} key={metric.label} />)}
        </div>
      </section>

      <section className="site-container pb-12">
        <div className="star-heading">
          <p className="technical-label text-orange">STAR case study</p>
          <h2>Situation. Task. Action. Result.</h2>
        </div>

        <div className="star-grid">
          <article className="star-card">
            <div className="star-card-heading">
              <span className="star-letter" aria-hidden="true">S</span>
              <div>
                <p className="technical-label text-orange">Situation</p>
                <h3>What was the context?</h3>
              </div>
            </div>
            <p className="star-body">{project.summary}</p>
          </article>

          <article className="star-card">
            <div className="star-card-heading">
              <span className="star-letter" aria-hidden="true">T</span>
              <div>
                <p className="technical-label text-orange">Task</p>
                <h3>What was I responsible for?</h3>
              </div>
            </div>
            <p className="star-body">{project.challenge}</p>
          </article>

          <article className="star-card">
            <div className="star-card-heading">
              <span className="star-letter" aria-hidden="true">A</span>
              <div>
                <p className="technical-label text-orange">Action</p>
                <h3>What did I do?</h3>
              </div>
            </div>
            <ol className="star-action-list">
              {project.process.map((step, index) => (
                <li key={step.title}>
                  <span className="star-action-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.description}</span>
                  </div>
                </li>
              ))}
            </ol>
            <div className="star-skills">
              {project.skills.slice(0, 5).map((skill) => <span className="tag" key={skill}>{skill}</span>)}
            </div>
          </article>

          <article className="star-card">
            <div className="star-card-heading">
              <span className="star-letter" aria-hidden="true">R</span>
              <div>
                <p className="technical-label text-orange">Result</p>
                <h3>What changed?</h3>
              </div>
            </div>
            <ul className="star-result-list">
              {project.results.slice(0, 4).map((result) => (
                <li key={result}>
                  <Check aria-hidden="true" size={18} />
                  <span>{result}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="other-projects-section">
        <div className="site-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="technical-label text-orange">Keep exploring</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Other projects</h2>
            </div>
            <Link className="button button-secondary" to="/?section=work"><ArrowLeft size={18} /> All projects</Link>
          </div>

          <div className="other-projects-grid">
            {otherProjects.map((otherProject) => (
              <Link
                className="other-project-card group"
                to={`/projects/${otherProject.slug}`}
                key={otherProject.slug}
                aria-label={`View ${otherProject.title} case study`}
              >
                <ProjectMedia media={otherProject.coverImage} className="other-project-media" />
                <div className="other-project-details">
                  <div className="flex items-start justify-between gap-3">
                    <p className="technical-label text-orange">{otherProject.eyebrow.split(" / ")[0]}</p>
                    <ArrowRight className="other-project-arrow" size={19} aria-hidden="true" />
                  </div>
                  <h3>{otherProject.title}</h3>
                  <p>{otherProject.role} · {otherProject.duration}</p>
                  <div className="other-project-metric">
                    <strong>{otherProject.metrics[0].value}</strong>
                    <span>{otherProject.metrics[0].label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </motion.main>
  );
}
