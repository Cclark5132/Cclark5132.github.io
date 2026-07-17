import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight, Award, Check, Download, GraduationCap, Mail, MapPin, Send, Wrench } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Metric } from "../components/Metric";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectMedia } from "../components/ProjectMedia";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { credentials, education, experiences, processSteps, profile, projects, skillGroups } from "../data/portfolio";

const heroFacts = ["Virginia Tech", "Mechanical Engineering", "GPA 3.84", "Chicago, IL", "Open to relocation"];

export function HomePage() {
  const reduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const homepageDescription = "Mechanical engineering portfolio featuring product design, SolidWorks, FEA, pulse jet development, automotive restoration, rapid prototyping, and hands-on fabrication.";
    document.title = "Charles T. Clark | Mechanical Engineering Portfolio";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", homepageDescription);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", "Charles T. Clark | Mechanical Engineering Portfolio");
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", "Design. Analyze. Build. Test. Explore mechanical engineering work by Charles T. Clark.");
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", "https://charlesclark.me/");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", "Charles T. Clark | Mechanical Engineering Portfolio");
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", "Design. Analyze. Build. Test. Mechanical engineering work by Charles T. Clark.");
    const section = searchParams.get("section");
    if (!section) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const frame = window.requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }));
    return () => window.cancelAnimationFrame(frame);
  }, [searchParams]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const openEmailDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const body = [`Hello Charles,`, "", message, "", `From: ${name}`, `Reply to: ${email}`].join("\n");
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Portfolio inquiry")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <motion.main
      id="main-content"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <section className="hero-section technical-grid relative overflow-hidden pt-28 md:pt-36">
        <div className="hero-glow" aria-hidden="true" />
        <div className="site-container relative z-10 grid items-center gap-12 pb-10 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.72fr)] lg:pb-14">
          <div className="py-8 lg:py-16">
            <motion.div
              className="availability-badge"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <span className="pulse-dot" aria-hidden="true" />
              {profile.availability}
            </motion.div>

            <motion.p className="technical-label mt-10 text-cyan" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
              ME / 2028 / CHICAGO - BLACKSBURG
            </motion.p>
            <motion.h1
              className="mt-5 max-w-5xl text-balance text-[clamp(3.5rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-white"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              Charles T.<br /><span className="text-outline">Clark</span>
            </motion.h1>
            <motion.p
              className="mt-7 text-lg font-medium tracking-[-0.02em] text-white/90 sm:text-xl md:text-2xl"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55 }}
            >
              Mechanical Engineer <span className="mx-2 text-cyan">/</span> Designer <span className="mx-2 text-cyan">/</span> Builder
            </motion.p>
            <motion.p
              className="mt-5 max-w-2xl text-pretty text-base leading-7 text-steel md:text-lg md:leading-8"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.55 }}
            >
              I design, analyze, build, and test mechanical systems - from injection-molded products and structural assemblies to pulse jet engines and automotive restorations.
            </motion.p>
            <motion.div className="mt-8 flex flex-wrap gap-3" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44, duration: 0.55 }}>
              <button className="button button-primary" type="button" onClick={() => scrollTo("projects")}>Explore projects <ArrowDownRight size={17} /></button>
              <a className="button button-secondary" href={profile.resume} target="_blank" rel="noreferrer">Download resume <Download size={16} /></a>
              <a className="button button-ghost" href={`mailto:${profile.email}`}>Contact me <Mail size={16} /></a>
            </motion.div>
          </div>

          <motion.div
            className="relative lg:py-10"
            initial={reduceMotion ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-media-frame">
              {/* Replace profile.heroMedia in src/data/portfolio.ts. Preferred: 4:5 WebP/AVIF or a muted MP4/WebM. */}
              <ProjectMedia media={profile.heroMedia} eager className="min-h-[32rem] border-0" />
              <span className="hero-corner hero-corner-tl" aria-hidden="true" />
              <span className="hero-corner hero-corner-br" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-5 left-4 right-4 flex items-center justify-between border border-line bg-ink/95 px-4 py-3 text-xs text-steel backdrop-blur md:left-8 md:right-8">
              <span className="technical-label text-white">Featured assembly / PJ-01</span>
              <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-cyan" /> Concept to test</span>
            </div>
          </motion.div>
        </div>

        <div className="border-y border-line bg-panel/65">
          <div className="site-container grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
            {heroFacts.map((fact, index) => <div className="flex min-h-16 items-center px-4 text-xs font-medium uppercase tracking-[0.12em] text-white/75 sm:px-5" key={fact}><span className="mr-3 text-cyan">0{index + 1}</span>{fact}</div>)}
          </div>
        </div>
      </section>

      <section id="projects" className="section-space scroll-mt-24 bg-ink">
        <div className="site-container">
          <SectionHeading index="01" eyebrow="Selected work" title="Engineering is proven in the physical world." description="Four projects spanning propulsion, commercial product design, accessibility, and hands-on restoration - each organized around the problem, the process, and the measured result." />
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => <ProjectCard project={project} primary={index === 0} key={project.slug} />)}
          </div>
        </div>
      </section>

      <section className="section-space border-y border-line bg-panel/40">
        <div className="site-container">
          <SectionHeading index="02" eyebrow="Engineering process" title="A loop built around evidence." description="I move comfortably between CAD, analysis, fabrication, instrumentation, and real-world testing. The result of one stage becomes the input to the next." />
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <Reveal className="process-step" delay={index * 0.05} key={step.number}>
                <div className="flex items-center justify-between">
                  <span className="technical-label text-cyan">{step.number}</span>
                  {index < processSteps.length - 1 && <ArrowRight className="hidden text-cyan/35 lg:block" size={17} aria-hidden="true" />}
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em] text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-steel">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="section-space scroll-mt-24">
        <div className="site-container">
          <SectionHeading index="03" eyebrow="Experience" title="Design work with commercial constraints." description="Professional and academic roles where technical execution, concise communication, and measurable outcomes all mattered." />
          <div className="space-y-5">
            {experiences.map((experience, index) => (
              <Reveal className="experience-card" key={experience.company} delay={index * 0.08}>
                <div>
                  <p className="technical-label text-cyan">{experience.duration} / {experience.location}</p>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">{experience.company}</h3>
                  <p className="mt-2 font-medium text-white/75">{experience.role}</p>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-steel">{experience.summary}</p>
                </div>
                <ul className="space-y-3 border-t border-line pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0">
                  {experience.highlights.map((highlight) => <li className="flex gap-3 text-sm leading-6 text-white/85" key={highlight}><Check className="mt-1 shrink-0 text-cyan" size={15} aria-hidden="true" />{highlight}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="section-space scroll-mt-24 border-y border-line bg-panel/40">
        <div className="site-container">
          <SectionHeading index="04" eyebrow="Technical range" title="From model tree to machine shop." description="A practical toolkit for moving mechanical products from early geometry through analysis, drawings, prototype fabrication, and validation." />
          <div className="grid gap-5 lg:grid-cols-3">
            {skillGroups.map((group, groupIndex) => (
              <Reveal className="skill-card" key={group.title} delay={groupIndex * 0.08}>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full border border-cyan/25 bg-cyan/8 text-cyan"><Wrench size={17} /></span>
                  <h3 className="text-lg font-semibold tracking-[-0.025em] text-white">{group.title}</h3>
                </div>
                <div className="mt-7 flex flex-wrap gap-2">
                  {group.skills.map((skill) => <span className="tag tag-large" key={skill}>{skill}</span>)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <SectionHeading index="05" eyebrow="Education + credentials" title="Strong fundamentals. Active leadership." />
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <Reveal className="education-card">
              <div className="flex items-start justify-between gap-5">
                <span className="grid size-12 place-items-center rounded-full border border-cyan/25 bg-cyan/8 text-cyan"><GraduationCap size={21} /></span>
                <span className="technical-label text-steel">{education.graduation}</span>
              </div>
              <h3 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-white">{education.school}</h3>
              <p className="mt-2 text-lg text-white/75">{education.degree}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {education.details.map((detail) => <p className="flex gap-3 text-sm leading-6 text-steel" key={detail}><Check className="mt-1 shrink-0 text-cyan" size={14} />{detail}</p>)}
              </div>
              <div className="mt-8 border-t border-line pt-5">
                <p className="technical-label text-white">Relevant coursework</p>
                <div className="mt-4 flex flex-wrap gap-2">{education.coursework.map((course) => <span className="tag" key={course}>{course}</span>)}</div>
              </div>
            </Reveal>
            <div className="grid gap-4">
              {credentials.map((credential, index) => (
                <Reveal className="credential-card" key={credential.title} delay={index * 0.06}>
                  <Award className="mt-1 shrink-0 text-cyan" size={19} />
                  <div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="font-semibold text-white">{credential.title}</h3>
                      <span className="technical-label text-steel">{credential.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-steel">{credential.issuer}</p>
                    {credential.detail && <p className="mt-3 text-sm leading-6 text-white/75">{credential.detail}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section-space scroll-mt-24 border-y border-line bg-panel/40">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <Reveal className="relative">
            <ProjectMedia media={{ type: "image", src: profile.portrait, label: "Add Charles Portrait or Workshop Photograph", alt: "Portrait placeholder for Charles T. Clark in an engineering or workshop setting", caption: "Recommended: 4:5 WebP, natural workshop or project context", aspect: "portrait" }} className="min-h-[34rem]" />
            <div className="absolute -bottom-4 -right-3 border border-line bg-ink px-5 py-4">
              <p className="technical-label text-cyan">Hands-on by default</p>
              <p className="mt-1 text-sm text-white">CAD / Analysis / Build / Test</p>
            </div>
          </Reveal>
          <Reveal>
            <p className="technical-label text-cyan">06 / About</p>
            <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl md:text-6xl">I like ideas better once they can be tested.</h2>
            <div className="mt-8 max-w-2xl space-y-5 text-base leading-8 text-steel md:text-lg">
              <p>I am a mechanical engineering student at Virginia Tech who enjoys turning an idea into a physical system, then learning what the physical system has to say.</p>
              <p>My work moves between SolidWorks, analysis, engineering drawings, fabrication, instrumentation, and hands-on troubleshooting. I am equally interested in the precision of the model and the practical details that make a design buildable, measurable, and useful.</p>
              <p>Whether I am leading a pulse jet team, developing commercial product concepts, or restoring an older vehicle, I bring curiosity, structured problem-solving, and respect for evidence.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="button button-primary" href={`mailto:${profile.email}`}>Start a conversation <Mail size={16} /></a>
              <a className="button button-secondary" href={profile.resume} target="_blank" rel="noreferrer">View resume <Download size={16} /></a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contact" className="section-space scroll-mt-24 overflow-hidden">
        <div className="site-container">
          <div className="contact-panel technical-grid relative overflow-hidden">
            <div className="contact-glow" aria-hidden="true" />
            <div className="relative z-10 grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_0.72fr] lg:p-12">
              <div>
                <p className="technical-label text-cyan">07 / Contact</p>
                <h2 className="mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">Let's build something that works.</h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-steel md:text-lg">I am seeking a Spring 2027 co-op and Summer 2027 internship in mechanical engineering. I am based in Chicago and open to relocation.</p>
                <div className="mt-8 flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:gap-6">
                  <a className="inline-flex items-center gap-2 hover:text-cyan" href={`mailto:${profile.email}`}><Mail size={16} className="text-cyan" />{profile.email}</a>
                  <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-cyan" />{profile.location}</span>
                </div>
              </div>
              <form className="contact-form" onSubmit={openEmailDraft}>
                <div>
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" autoComplete="name" required placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
                </div>
                <div>
                  <label htmlFor="message">What would you like to discuss?</label>
                  <textarea id="message" name="message" rows={4} required placeholder="Role, project, or a quick introduction" />
                </div>
                <button className="button button-primary w-full justify-center" type="submit">Open email draft <Send size={16} /></button>
                <p className="text-center text-xs leading-5 text-steel">This form opens your default email app. No data is stored.</p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
