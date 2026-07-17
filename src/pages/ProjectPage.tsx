import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, MoveUpRight } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Metric } from "../components/Metric";
import { ProjectMedia } from "../components/ProjectMedia";
import { Reveal } from "../components/Reveal";
import { projects } from "../data/portfolio";
import { NotFoundPage } from "./NotFoundPage";

export function ProjectPage() {
  const { slug } = useParams();
  const reduceMotion = useReducedMotion();
  const projectIndex = projects.findIndex((item) => item.slug === slug);
  const project = projects[projectIndex];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    if (project) {
      document.title = `${project.title} | Charles T. Clark`;
      const pageUrl = `https://charlesclark.me/projects/${project.slug}`;
      const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      description?.setAttribute("content", project.summary);
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", pageUrl);
      document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", `${project.title} | Charles T. Clark`);
      document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", project.summary);
      document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", pageUrl);
      document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", `${project.title} | Charles T. Clark`);
      document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", project.summary);
    }
  }, [project]);

  if (!project) return <NotFoundPage />;

  const media = [...project.gallery, ...project.videos];

  return (
    <motion.main
      id="main-content"
      className="pt-28"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="technical-grid relative overflow-hidden border-b border-line py-12 md:py-20">
        <div className="hero-glow" aria-hidden="true" />
        <div className="site-container relative z-10">
          <Link className="back-link" to="/?section=projects"><ArrowLeft size={16} /> All projects</Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.5fr]">
            <div>
              <p className="technical-label text-cyan">Case study / {String(projectIndex + 1).padStart(2, "0")}</p>
              <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl md:text-8xl">{project.title}</h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-steel md:text-xl">{project.summary}</p>
              {project.confidential && (
                <div className="mt-7 inline-flex items-center gap-3 border border-amber-300/20 bg-amber-300/8 px-4 py-3 text-sm text-amber-100/85">
                  <LockKeyhole size={16} /> Selected details are limited due to confidentiality.
                </div>
              )}
            </div>
            <dl className="project-meta">
              <div><dt>Role</dt><dd>{project.role}</dd></div>
              <div><dt>Duration</dt><dd>{project.duration}</dd></div>
              {project.location && <div><dt>Location</dt><dd>{project.location}</dd></div>}
              <div><dt>Focus</dt><dd>{project.eyebrow.replaceAll(" / ", ", ")}</dd></div>
            </dl>
          </div>
        </div>
      </header>

      <section className="site-container py-8 md:py-12">
        <ProjectMedia media={project.coverImage} eager className="min-h-[28rem] md:min-h-[38rem]" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.metrics.map((metric) => <Metric metric={metric} key={metric.label} />)}
        </div>
      </section>

      <section className="section-space pt-10 md:pt-16">
        <div className="site-container grid gap-10 border-t border-line pt-8 lg:grid-cols-[0.38fr_1fr] lg:gap-20">
          <div>
            <p className="technical-label text-cyan">01 / The challenge</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-white md:text-4xl">The engineering question.</h2>
          </div>
          <p className="max-w-4xl text-pretty text-xl leading-9 text-white/82 md:text-2xl md:leading-10">{project.challenge}</p>
        </div>
      </section>

      <section className="section-space border-y border-line bg-panel/40">
        <div className="site-container">
          <div className="mb-10 border-t border-line pt-5">
            <p className="technical-label text-cyan">02 / Process</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">How the work moved forward.</h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {project.process.map((step, index) => (
              <Reveal className="bg-ink p-6 md:p-8" key={step.title} delay={index * 0.05}>
                <span className="technical-label text-cyan">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container grid gap-10 lg:grid-cols-[0.48fr_1fr] lg:gap-20">
          <div>
            <p className="technical-label text-cyan">03 / Results</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">What changed.</h2>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {project.results.map((result, index) => (
              <li className="flex gap-4 py-5 text-base leading-7 text-white/85 md:text-lg" key={result}>
                <span className="technical-label mt-1 text-cyan">0{index + 1}</span><span>{result}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-space border-y border-line bg-panel/40">
        <div className="site-container">
          <div className="mb-10 flex flex-col gap-5 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="technical-label text-cyan">04 / Project media</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Build log + evidence.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-steel">Every panel is data-driven. Add approved images, video, CAD renders, or embeds by updating the project data file.</p>
          </div>
          {media.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {media.map((item, index) => <ProjectMedia media={item} className={index === 0 && media.length % 2 === 1 ? "md:col-span-2" : ""} key={`${item.src}-${index}`} />)}
            </div>
          ) : (
            <div className="border border-dashed border-line p-10 text-center text-steel">Approved media can be added later from the centralized project data.</div>
          )}
          {project.documents.length > 0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {project.documents.map((document) => <ProjectMedia media={document} key={document.src} />)}
            </div>
          )}
        </div>
      </section>

      <section className="section-space">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:gap-16">
          <div>
            <p className="technical-label text-cyan">05 / Next iteration</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-white md:text-5xl">Engineering never really ends.</h2>
            <ul className="mt-8 space-y-4">
              {project.future.map((item) => <li className="flex gap-3 text-base leading-7 text-steel" key={item}><Check className="mt-1 shrink-0 text-cyan" size={16} />{item}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">{project.skills.map((skill) => <span className="tag tag-large" key={skill}>{skill}</span>)}</div>
          </div>
          <Link className="next-project group" to={`/projects/${nextProject.slug}`}>
            <span className="technical-label text-cyan">Next case study</span>
            <span className="mt-auto flex items-end justify-between gap-5">
              <span className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">{nextProject.title}</span>
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line transition group-hover:border-cyan group-hover:bg-cyan group-hover:text-ink"><MoveUpRight size={18} /></span>
            </span>
          </Link>
        </div>
      </section>

      <div className="site-container pb-14">
        <Link className="back-link" to="/?section=projects"><ArrowLeft size={16} /> Return to all projects</Link>
        <Link className="back-link float-right" to={`/projects/${nextProject.slug}`}>Next <ArrowRight size={16} /></Link>
      </div>
    </motion.main>
  );
}
