import { ArrowDown, ArrowUpRight, FileText, Linkedin, Mail } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Media } from "../components/Media";
import { ProjectSheet, projectNumber } from "../components/ProjectSheet";
import { SectionHead } from "../components/SectionHead";
import { homeMeta } from "../data/meta";
import { credentials, education, experiences, profile, projects, skillGroups } from "../data/portfolio";
import { applyMeta } from "../lib/applyMeta";

const heroFacts = [
  { label: "School", value: profile.school, wide: true },
  { label: "Degree", value: profile.degree, wide: true },
  { label: "Expected", value: profile.graduation },
  { label: "GPA", value: profile.gpa },
  { label: "Location", value: profile.location },
];

export function HomePage() {
  useEffect(() => applyMeta(homeMeta), []);

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title" className="hero-name" tabIndex={-1}>
              <span>Charles</span> <span>Clark</span>
            </h1>
            <p className="hero-status">{profile.status}</p>

            <dl className="title-block hero-facts">
              {heroFacts.map((fact) => (
                <div className={fact.wide ? "title-cell title-cell-wide" : "title-cell"} key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="hero-actions">
              <li>
                <Link className="button button-primary" to="/#projects">
                  Projects <ArrowDown size={16} aria-hidden="true" />
                </Link>
              </li>
              <li>
                <a className="button" href={profile.resume} target="_blank" rel="noopener">
                  <FileText size={16} aria-hidden="true" /> Resume<span className="sr-only"> (PDF)</span>
                </a>
              </li>
              <li>
                <a className="button" href={`mailto:${profile.email}`}>
                  <Mail size={16} aria-hidden="true" /> Email
                </a>
              </li>
              <li>
                <a className="button" href={profile.linkedIn} target="_blank" rel="noopener">
                  <Linkedin size={16} aria-hidden="true" /> LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <figure className="hero-figure">
            <div className="hero-frame">
              <Media media={profile.heroMedia} priority sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <figcaption>
              <span className="figure-number">Fig. 1</span>
              <span>{profile.heroMedia.caption}</span>
              <Link to="/projects/pulse-jet">
                Project 01 <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="projects" className="section section-projects" aria-labelledby="projects-title" tabIndex={-1}>
        <div className="wrap">
          <SectionHead number="01" title="Projects" id="projects-title" aside={`${projects.length} projects`} />
          <div className="sheets" style={{ "--count": projects.length } as CSSProperties}>
            {projects.map((project, index) => (
              <ProjectSheet project={project} index={index} total={projects.length} key={project.slug} />
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="section" aria-labelledby="experience-title" tabIndex={-1}>
        <div className="wrap">
          <SectionHead number="02" title="Experience and education" id="experience-title" />
          <div className="experience-grid">
            <ol className="experience-list">
              {experiences.map((item) => {
                const index = projects.findIndex((project) => project.slug === item.projectSlug);
                return (
                  <li className="experience-item" key={item.org} data-reveal>
                    <p className="experience-when">
                      <span>{item.dates}</span>
                      <span>{item.location}</span>
                    </p>
                    <div className="experience-body">
                      <h3>
                        <Link to={`/projects/${item.projectSlug}`}>
                          {item.org}
                          <span className="experience-project">
                            Project {projectNumber(index)} <ArrowUpRight size={14} aria-hidden="true" />
                          </span>
                        </Link>
                      </h3>
                      <p className="experience-role">{item.role}</p>
                      <ul className="dash-list">
                        {item.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>

            <aside className="education" aria-label="Education and credentials" data-reveal>
              <div className="panel">
                <h3 className="panel-title">Education</h3>
                <dl className="spec-list">
                  <div>
                    <dt>School</dt>
                    <dd>{education.school}</dd>
                  </div>
                  <div>
                    <dt>Degree</dt>
                    <dd>{education.degree}</dd>
                  </div>
                  <div>
                    <dt>Graduation</dt>
                    <dd>{education.graduation}</dd>
                  </div>
                  <div>
                    <dt>GPA</dt>
                    <dd>{education.gpa}</dd>
                  </div>
                </dl>
                <ul className="dash-list panel-list">
                  {education.honors.map((honor) => (
                    <li key={honor}>{honor}</li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <h3 className="panel-title">Credentials</h3>
                <ul className="credential-list">
                  {credentials.map((credential) => (
                    <li key={credential.title}>
                      <strong>{credential.title}</strong>
                      <span>
                        {credential.issuer}, {credential.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="skills" className="section" aria-labelledby="skills-title" tabIndex={-1}>
        <div className="wrap">
          <SectionHead number="03" title="Skills" id="skills-title" />
          <div className="skills-grid">
            {skillGroups.map((group) => (
              <div className="skill-group" key={group.title} data-reveal>
                <h3>{group.title}</h3>
                <ul>
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact" aria-labelledby="contact-title" tabIndex={-1}>
        <div className="wrap contact-grid">
          <div className="contact-head">
            <span className="section-number" aria-hidden="true">
              04
            </span>
            <h2 id="contact-title">Contact</h2>
          </div>
          <dl className="contact-list">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <a href={profile.linkedIn} target="_blank" rel="noopener">
                  {profile.linkedInLabel}
                </a>
              </dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={profile.github} target="_blank" rel="noopener">
                  {profile.githubLabel}
                </a>
              </dd>
            </div>
            <div>
              <dt>Resume</dt>
              <dd>
                <a href={profile.resume} target="_blank" rel="noopener">
                  Charles-Clark-Resume.pdf
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
