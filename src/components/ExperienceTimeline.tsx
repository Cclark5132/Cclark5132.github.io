import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { experiences, projects } from "../data/portfolio";
import { projectNumber } from "./ProjectSheet";

/** Distance from the top of an entry to the centre of its marker, in px. Matches .experience-node in styles.css. */
const NODE_CENTER = 34;

/**
 * Experience entries on a vertical line that draws itself as the list scrolls past the middle of the screen.
 * Each entry's marker turns orange when the line reaches it. Under reduced motion the line is drawn in full.
 */
export function ExperienceTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) return;
    const items = [...track.querySelectorAll<HTMLElement>(".experience-item")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let marks: number[] = [];
    let frame = 0;

    const measure = () => {
      marks = items.map((item) => item.offsetTop + NODE_CENTER);
    };

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const drawn = reduced.matches ? rect.height : Math.min(Math.max(window.innerHeight * 0.62 - rect.top, 0), rect.height);
      fill.style.transform = `scaleY(${rect.height ? drawn / rect.height : 1})`;
      items.forEach((item, index) => {
        const reached = String(drawn >= marks[index]);
        if (item.dataset.reached !== reached) item.dataset.reached = reached;
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    remeasure();
    window.addEventListener("scroll", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(track);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", schedule);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="experience-track" ref={trackRef}>
      <span className="experience-line" aria-hidden="true">
        <span className="experience-line-fill" ref={fillRef} />
      </span>
      <ol className="experience-list">
        {experiences.map((item) => {
          const index = projects.findIndex((project) => project.slug === item.projectSlug);
          return (
            <li className="experience-item" key={item.org} data-reveal="entry">
              <span className="experience-rule r-draw" aria-hidden="true" />
              <span className="experience-node" aria-hidden="true" />
              <p className="experience-when r-fade">
                <span>{item.dates}</span>
                <span>{item.location}</span>
              </p>
              <div className="experience-body">
                <h3 className="r-fade">
                  <Link to={`/projects/${item.projectSlug}`}>
                    {item.org}
                    <span className="experience-project r-pop">
                      Project {projectNumber(index)} <ArrowUpRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                </h3>
                <p className="experience-role r-fade">{item.role}</p>
                <ul className="dash-list">
                  {item.points.map((point, pointIndex) => (
                    <li className="r-fade" style={{ "--i": pointIndex } as CSSProperties} key={point}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
