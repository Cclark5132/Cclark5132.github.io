import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, Download, GraduationCap, Mail, MapPin, Phone, Wrench } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProjectCard } from "../components/ProjectCard";
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
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", "Mechanical engineer, designer, and builder. View selected work and get in touch.");
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute("content", "https://charlesclark.me/og-light.png");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", "Charles T. Clark | Mechanical Engineer");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", "Mechanical engineer, designer, and builder. View selected work and get in touch.");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute("content", "https://charlesclark.me/og-light.png");

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
        <div className="site-container grid gap-8 py-12 lg:grid-cols-[1fr_0.62fr] lg:items-center lg:py-16">
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
              className="technical-label mt-8 text-cyan"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              Mechanical engineer / designer / builder
            </motion.p>
            <motion.h1
              className="mt-4 max-w-4xl text-balance text-[clamp(3.6rem,8vw,7.2rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-charcoal"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              Charles T.<br /><span className="text-cyan">Clark</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-steel md:text-xl"
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

          <Reveal className="quick-card">
            <p className="technical-label text-orange">Quick overview</p>
            <div className="mt-5 divide-y divide-line">
              {quickFacts.map((fact) => (
                <div className="flex items-center justify-between gap-5 py-4" key={fact.label}>
                  <span className="text-sm text-steel">{fact.label}</span>
                  <strong className="text-right text-base text-charcoal">{fact.value}</strong>
                </div>
              ))}
            </div>
            <a className="button button-primary mt-6 w-full" href={profile.resume} target="_blank" rel="noreferrer">
              Download resume <Download size={19} />
            </a>
          </Reveal>
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
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => <ProjectCard project={project} key={project.slug} />)}
          </div>
        </div>
      </section>

      <section id="background" className="section-space scroll-mt-24 border-y border-line bg-panel/65">
        <div className="site-container">
          <SectionHeading
            index="02"
            eyebrow="Background"
            title="Experience at a glance."
            description="The essentials - work, education, and practical skills."
          />
          <div className="compact-background-grid">
            <Reveal className="compact-card md:col-span-2">
              <div className="flex items-center gap-3">
                <span className="icon-badge"><ArrowRight size={20} /></span>
                <h3>Experience</h3>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {experiences.map((experience) => (
                  <article className="border-l-2 border-cyan pl-4" key={experience.company}>
                    <p className="technical-label text-orange">{experience.duration}</p>
                    <h4 className="mt-2 text-lg font-semibold text-charcoal">{experience.company}</h4>
                    <p className="mt-1 text-sm text-steel">{experience.role}</p>
                    <p className="mt-3 text-sm font-medium leading-6 text-charcoal">{experience.highlights[0]}</p>
                  </article>
                ))}
              </div>
            </Reveal>

            <Reveal className="compact-card">
              <div className="flex items-center gap-3">
                <span className="icon-badge"><GraduationCap size={20} /></span>
                <h3>Education</h3>
              </div>
              <p className="mt-6 text-xl font-semibold text-charcoal">{education.school}</p>
              <p className="mt-1 text-sm leading-6 text-steel">{education.degree}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="tag">GPA 3.84</span>
                <span className="tag">Dean's List</span>
                <span className="tag">Graduating 2028</span>
              </div>
            </Reveal>

            <Reveal className="compact-card">
              <div className="flex items-center gap-3">
                <span className="icon-badge"><Wrench size={20} /></span>
                <h3>Core skills</h3>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {skillGroups.flatMap((group) => group.skills).slice(0, 10).map((skill) => <span className="tag" key={skill}>{skill}</span>)}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="contact" className="section-space scroll-mt-24">
        <div className="site-container">
          <Reveal className="contact-panel">
            <div>
              <p className="technical-label text-orange">03 / Contact</p>
              <h2 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">Let’s talk engineering.</h2>
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
