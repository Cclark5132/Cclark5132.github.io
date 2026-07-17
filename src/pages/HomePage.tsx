import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Download, GraduationCap, Mail, MapPin, Phone, Wrench } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectMedia } from "../components/ProjectMedia";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { education, experiences, profile, projects, skillGroups } from "../data/portfolio";

const quickFacts = [
  { value: "Virginia Tech", label: "Mechanical Engineering" },
  { value: "3.84", label: "GPA" },
  { value: "May 2028", label: "Expected graduation" },
  { value: "Chicago, IL", label: "Open to relocation" },
];

export function HomePage() {
  const reduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const description = "Charles T. Clark is a Virginia Tech mechanical engineering student with experience in product design, SolidWorks, FEA, fabrication, and test engineering.";
    document.title = "Charles T. Clark | Mechanical Engineer";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", "Charles T. Clark | Mechanical Engineer");
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", "Mechanical engineering portfolio featuring selected work, experience, and technical skills.");
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute("content", "https://charlesclark.me/og-simple.png");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", "Charles T. Clark | Mechanical Engineer");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", "Mechanical engineering portfolio featuring selected work, experience, and technical skills.");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute("content", "https://charlesclark.me/og-simple.png");

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
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <section className="hero-section technical-grid pt-24">
        <div className="site-container grid gap-9 py-12 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:py-16">
          <div>
            <motion.div
              className="availability-badge"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="pulse-dot" aria-hidden="true" />
              {profile.availability}
            </motion.div>
            <motion.p
              className="technical-label mt-8 text-orange"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              Mechanical Engineer
            </motion.p>
            <motion.h1
              className="mt-4 max-w-4xl text-balance text-[clamp(3.6rem,8vw,7.2rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-white"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              Charles T.<br /><span className="text-cyan">Clark</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/70 md:text-xl"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.45 }}
            >
              I turn mechanical ideas into tested, buildable systems through CAD, analysis, prototyping, and hands-on fabrication.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
            >
              <button className="button button-primary" type="button" onClick={() => scrollTo("work")}>View my work <ArrowDownRight size={20} /></button>
              <a className="button button-secondary" href={`mailto:${profile.email}`}><Mail size={19} /> Email me</a>
              <a className="button button-secondary" href={`tel:${profile.phoneLink}`}><Phone size={19} /> Call me</a>
            </motion.div>
          </div>

          <Reveal className="hero-media-frame">
            <ProjectMedia media={profile.heroMedia} eager className="min-h-[30rem] border-0" />
            <div className="hero-media-label">
              <span className="technical-label text-white">Featured work</span>
              <span>Pulse Jet Design Team</span>
            </div>
          </Reveal>
        </div>

        <div className="fact-strip">
          <div className="site-container grid grid-cols-2 lg:grid-cols-4">
            {quickFacts.map((fact) => (
              <div className="fact-item" key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-strip">
          <div className="site-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <a href={`mailto:${profile.email}`}><Mail size={18} /> {profile.email}</a>
            <a href={`tel:${profile.phoneLink}`}><Phone size={18} /> {profile.phone}</a>
            <span><MapPin size={18} /> {profile.location}</span>
          </div>
        </div>
      </section>

      <section id="work" className="section-space scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            index="01"
            eyebrow="Selected work"
            title="Four projects. Clear outcomes."
            description="Choose a project for the problem, process, and result."
          />
          <div className="projects-grid">
            {projects.map((project, index) => <ProjectCard project={project} featured={index === 0} key={project.slug} />)}
          </div>
        </div>
      </section>

      <section id="background" className="section-space scroll-mt-24 border-y border-line bg-panel/65">
        <div className="site-container">
          <SectionHeading
            index="02"
            eyebrow="Background"
            title="Experience at a glance."
            description="Four roles spanning commercial product design, propulsion, accessibility, and hands-on restoration."
          />
          <div className="compact-background-grid">
            <Reveal className="compact-card md:col-span-2">
              <div className="flex items-center gap-3">
                <span className="icon-badge"><ArrowRight size={20} /></span>
                <h3>Experience</h3>
              </div>
              <div className="experience-grid mt-6">
                {experiences.map((experience) => (
                  <Link
                    className="experience-link group"
                    to={`/projects/${experience.projectSlug}`}
                    key={experience.company}
                    aria-label={`View ${experience.company} case study`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="technical-label text-orange">{experience.duration}</p>
                      <ArrowUpRight className="experience-link-arrow" size={19} aria-hidden="true" />
                    </div>
                    <h4 className="mt-2 text-lg font-semibold text-charcoal">{experience.company}</h4>
                    <p className="mt-1 text-sm text-steel">{experience.role}</p>
                    <p className="mt-3 text-sm font-medium leading-6 text-charcoal">{experience.highlights[0]}</p>
                    <span className="experience-link-label">View case study <ArrowRight size={15} /></span>
                  </Link>
                ))}
              </div>
            </Reveal>

            <Reveal className="compact-card md:col-span-2">
              <div className="flex items-center gap-3">
                <span className="icon-badge"><GraduationCap size={20} /></span>
                <h3>Education</h3>
              </div>
              <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xl font-semibold text-charcoal">{education.school}</p>
                  <p className="mt-1 text-sm leading-6 text-steel">{education.degree}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="tag">GPA 3.84</span>
                  <span className="tag">Dean's List</span>
                  <span className="tag">Graduating 2028</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="skills" className="section-space scroll-mt-24">
        <div className="site-container">
          <SectionHeading
            index="03"
            eyebrow="Technical skills"
            title="From CAD to fabrication."
            description="The complete toolkit I use to model, analyze, prototype, build, and test."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {skillGroups.map((group, index) => (
              <Reveal className="skill-card" delay={index * 0.06} key={group.title}>
                <span className="icon-badge"><Wrench size={20} /></span>
                <h3 className="mt-5 text-xl font-semibold text-charcoal">{group.title}</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {group.skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-space scroll-mt-24">
        <div className="site-container">
          <Reveal className="contact-panel">
            <div>
              <p className="technical-label text-orange">04 / Contact</p>
              <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">Let's talk engineering.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                Seeking a Spring 2027 co-op and Summer 2027 internship. Based in Chicago and open to relocation.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <a className="contact-action" href={`mailto:${profile.email}`}>
                <Mail size={24} /><span><small>Email</small>{profile.email}</span>
              </a>
              <a className="contact-action" href={`tel:${profile.phoneLink}`}>
                <Phone size={24} /><span><small>Phone</small>{profile.phone}</span>
              </a>
              <a className="contact-action" href={profile.resume} target="_blank" rel="noreferrer">
                <Download size={24} /><span><small>Resume</small>View PDF</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </motion.main>
  );
}
