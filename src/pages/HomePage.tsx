import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download, Linkedin, Mail } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectMedia } from "../components/ProjectMedia";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { credentials, education, experiences, profile, projects, skillGroups } from "../data/portfolio";

const quickFacts = [
  { value: "Virginia Tech", label: "B.S. Mechanical Engineering" },
  { value: "3.84", label: "GPA" },
  { value: "May 2028", label: "Expected graduation" },
  { value: "Chicago, IL", label: "Open to relocation" },
];

const topSkills = ["SolidWorks (CSWP)", "Finite Element Analysis", "Rapid Prototyping"];

const experienceTimeline = [...experiences].sort((a, b) => {
  const startYearA = Number(a.duration.match(/\d{4}/)?.[0] ?? 0);
  const startYearB = Number(b.duration.match(/\d{4}/)?.[0] ?? 0);
  return startYearB - startYearA;
});

export function HomePage() {
  const reduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const description = "Third-year Virginia Tech mechanical engineering student seeking a Spring 2027 co-op and a Summer 2027 internship, with experience in SolidWorks, FEA, product development, fabrication, and testing.";
    document.title = `${profile.name} | ${profile.title}`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", `${profile.name} | ${profile.title}`);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute("content", "https://charlesclark.me/social-preview.png");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", `${profile.name} | ${profile.title}`);
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", description);
    document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute("content", "https://charlesclark.me/social-preview.png");

    const section = searchParams.get("section");
    if (!section) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const frame = window.requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }));
    return () => window.cancelAnimationFrame(frame);
  }, [searchParams]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.main
      id="main-content"
      className="home-page"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <section className="hero-section pt-24">
        <div className="site-container hero-layout">
          <div className="hero-copy">
            <motion.p
              className="hero-kicker"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              Mechanical engineering portfolio / Virginia Tech
            </motion.p>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              Charles Clark
            </motion.h1>
            <motion.p
              className="hero-role"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              {profile.title}
            </motion.p>
            <motion.p
              className="hero-objective"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.3 }}
            >
              Third-year mechanical engineering student seeking a Spring 2027 co-op and a Summer 2027 internship.
            </motion.p>
            <p className="availability-badge">{profile.availability}</p>
            <motion.div
              className="hero-actions"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
            >
              <button className="button button-primary" type="button" onClick={() => scrollTo("work")}>View projects <ArrowDownRight size={18} /></button>
              <a className="button button-secondary" href={`mailto:${profile.email}`}><Mail size={18} /> Email me</a>
              <a className="button button-secondary" href={profile.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={18} /> View LinkedIn</a>
            </motion.div>
          </div>

          <Reveal className="hero-media-frame">
            <Link className="hero-media-link" to="/projects/pulse-jet" aria-label="View the Pulse Jet Design Team case study">
              <ProjectMedia media={profile.heroMedia} eager className="hero-project-media" />
              <div className="hero-media-label">
                <span><small>Current build</small><strong>Pulse Jet Design Team</strong></span>
                <span className="hero-media-action">View case study <ArrowUpRight size={17} /></span>
              </div>
            </Link>
          </Reveal>
        </div>

        <div className="fact-strip">
          <div className="site-container fact-grid">
            {quickFacts.map((fact) => (
              <div className="fact-item" key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-strip">
          <div className="site-container skill-strip">
            <span className="skill-strip-label">Core tools</span>
            {topSkills.map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </div>
      </section>

      <section id="work" className="section-space scroll-mt-24 work-section">
        <div className="site-container">
          <SectionHeading
            index="01"
            eyebrow="Selected work"
            title="Four projects. Clear outcomes."
            description="Click to learn more about my projects."
          />
          <div className="projects-grid">
            {projects.map((project, index) => <ProjectCard project={project} index={index + 1} key={project.slug} />)}
          </div>
        </div>
      </section>

      <section id="background" className="section-space scroll-mt-24 background-section">
        <div className="site-container">
          <SectionHeading
            index="02"
            eyebrow="Background"
            title="Experience at a glance."
            description="Four roles spanning product design, propulsion testing, accessibility, and automotive restoration."
          />

          <div className="background-layout">
            <div className="experience-list">
              {experienceTimeline.map((experience) => (
                <Link
                  className="experience-row"
                  to={`/projects/${experience.projectSlug}`}
                  key={experience.company}
                  aria-label={`View ${experience.company} case study`}
                >
                  <p className="experience-date">{experience.duration}</p>
                  <div className="experience-copy">
                    <p className="experience-location">{experience.location}</p>
                    <h3>{experience.company}</h3>
                    <p className="experience-role">{experience.role}</p>
                    <p className="experience-highlight">{experience.highlights[0]}</p>
                  </div>
                  <span className="experience-link-label">View case study <ArrowUpRight size={17} aria-hidden="true" /></span>
                </Link>
              ))}
            </div>

            <aside className="education-panel">
              <p className="technical-label">Education + credentials</p>
              <h3>{education.school}</h3>
              <p className="education-degree">{education.degree}</p>
              <p className="education-graduation">{education.graduation}</p>
              <ul className="education-details">
                {education.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>

              <div className="credential-list">
                <p className="technical-label">Credentials</p>
                {credentials.map((credential) => (
                  <div key={credential.title}>
                    <strong>{credential.title}</strong>
                    <span>{credential.issuer} / {credential.date}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="skills" className="section-space scroll-mt-24 skills-section">
        <div className="site-container">
          <SectionHeading
            index="03"
            eyebrow="Technical skills"
            title="From CAD to fabrication."
          />
          <div className="skills-list">
            {skillGroups.map((group) => (
              <section className="skill-group" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section scroll-mt-24">
        <div className="site-container contact-layout">
          <div>
            <p className="technical-label">04 / Contact</p>
            <h2>Get in touch</h2>
            <p>Seeking a Spring 2027 co-op and Summer 2027 internship. Based in Chicago and open to relocation.</p>
          </div>
          <div className="contact-links">
            <a href={profile.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={20} /><span><small>Open LinkedIn</small>charlesclarkvt</span><ArrowRight size={18} /></a>
            <a href={`mailto:${profile.email}`}><Mail size={20} /><span><small>Send an email</small>{profile.email}</span><ArrowRight size={18} /></a>
            <a href={profile.resume} target="_blank" rel="noreferrer"><Download size={20} /><span><small>View my resume</small>Open PDF</span><ArrowUpRight size={18} /></a>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
