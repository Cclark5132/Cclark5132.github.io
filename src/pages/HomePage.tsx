import { ArrowDown, ArrowUpRight, FileText, Linkedin, Mail } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { BlockReveal } from "../components/BlockReveal";
import { BuildText } from "../components/BuildText";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { Media } from "../components/Media";
import { ProjectSheet } from "../components/ProjectSheet";
import { SectionHead } from "../components/SectionHead";
import { homeMeta } from "../data/meta";
import { credentials, education, profile, projects, skillGroups } from "../data/portfolio";
import { applyMeta } from "../lib/applyMeta";

const order = (index: number) => ({ "--i": index }) as CSSProperties;

const contactRows = [
  { label: "Email", href: `mailto:${profile.email}`, text: profile.email, external: false },
  { label: "LinkedIn", href: profile.linkedIn, text: profile.linkedInLabel, external: true },
  { label: "GitHub", href: profile.github, text: profile.githubLabel, external: true },
  { label: "Resume", href: profile.resume, text: "Charles-Clark-Resume.pdf", external: true },
];

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
      {/* The hero builds itself on page load (CSS only, so it also runs before the app hydrates), and again
          whenever it scrolls back into view. */}
      <section className="hero intro" aria-labelledby="hero-title" data-reveal="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title" className="hero-name" tabIndex={-1} aria-label={profile.shortName}>
              <span className="rise-line" style={order(0)}>
                <BuildText text="Charles" />
              </span>{" "}
              <span className="rise-line" style={order(1)}>
                <BuildText text="Clark" />
              </span>
            </h1>
            <p className="hero-status r-fade">{profile.status}</p>

            <dl className="title-block hero-facts">
              {heroFacts.map((fact, index) => (
                <div className={`title-cell r-block ${fact.wide ? "title-cell-wide" : ""}`} style={order(index)} key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="hero-actions">
              <li className="r-block" style={order(0)}>
                <Link className="button button-primary" to="/#projects">
                  Projects <ArrowDown size={16} aria-hidden="true" />
                </Link>
              </li>
              <li className="r-block" style={order(1)}>
                <a className="button" href={profile.resume} target="_blank" rel="noopener">
                  <FileText size={16} aria-hidden="true" /> Resume<span className="sr-only"> (PDF)</span>
                </a>
              </li>
              <li className="r-block" style={order(2)}>
                <a className="button" href={`mailto:${profile.email}`}>
                  <Mail size={16} aria-hidden="true" /> Email
                </a>
              </li>
              <li className="r-block" style={order(3)}>
                <a className="button" href={profile.linkedIn} target="_blank" rel="noopener">
                  <Linkedin size={16} aria-hidden="true" /> LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <figure className="hero-figure">
            <div className="hero-frame plot-frame">
              <Media media={profile.heroMedia} priority sizes="(min-width: 1024px) 50vw, 100vw" />
              <BlockReveal />
            </div>
            <figcaption className="r-fade">
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
            <ExperienceTimeline />

            <aside className="education" aria-label="Education and credentials">
              <div className="panel" data-reveal="panel">
                <h3 className="panel-title r-wipe">Education</h3>
                <dl className="spec-list">
                  {[
                    ["School", education.school],
                    ["Degree", education.degree],
                    ["Graduation", education.graduation],
                    ["GPA", education.gpa],
                  ].map(([label, value], index) => (
                    <div className="r-fade" style={order(index)} key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="dash-list panel-list">
                  {education.honors.map((honor, index) => (
                    <li className="r-fade" style={order(index + 4)} key={honor}>
                      {honor}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel" data-reveal="panel">
                <h3 className="panel-title r-wipe">Credentials</h3>
                <ul className="credential-list">
                  {credentials.map((credential, index) => (
                    <li className="r-pop" style={order(index)} key={credential.title}>
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
            {skillGroups.map((group, groupIndex) => (
              <div className="skill-group" style={{ "--g": groupIndex } as CSSProperties} key={group.title} data-reveal="list">
                <h3 className="r-fade">{group.title}</h3>
                <span className="skill-rule r-draw" aria-hidden="true" />
                <ul>
                  {group.skills.map((skill, index) => (
                    <li className="r-block" style={order(index)} key={skill}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact" aria-labelledby="contact-title" tabIndex={-1}>
        <div className="wrap contact-grid">
          <div className="contact-head" data-reveal="head">
            <span className="section-rule r-draw" aria-hidden="true" />
            <span className="section-number r-pop" aria-hidden="true">
              04
            </span>
            <h2 id="contact-title" aria-label="Contact">
              <BuildText text="Contact" />
            </h2>
          </div>
          <dl className="contact-list" data-reveal="rows">
            {contactRows.map((row, index) => (
              <div style={order(index)} key={row.label}>
                <span className="contact-rule r-draw" aria-hidden="true" />
                <dt className="r-fade">{row.label}</dt>
                <dd className="r-fade">
                  <a href={row.href} {...(row.external ? { target: "_blank", rel: "noopener" } : {})}>
                    {row.text}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
