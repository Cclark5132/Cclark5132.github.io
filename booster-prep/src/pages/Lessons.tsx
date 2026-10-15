import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { mdxComponents } from "../components/mdx";
import { useScrollToParam } from "../lib/anchors";
import { formatDate } from "../lib/schedule";
import { weekByNumber } from "../data/plan";
import { lessons, lessonBySlug } from "../lessons";
import { NotFound } from "./NotFound";

export function Lessons() {
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Structures track</span>
        <h1>Lessons</h1>
        <p className="lede">
          One in-depth lesson per structures topic: the concept, every formula with its variables, a labeled diagram, fully worked examples, common mistakes and
          practice problems with hidden step-by-step solutions.
        </p>
      </header>
      <ol className="lesson-list">
        {lessons.map((lesson) => {
          const week = weekByNumber(lesson.week);
          return (
            <li key={lesson.slug}>
              <Link to={`/lessons/${lesson.slug}`} className="card lesson-card">
                <span className="num lesson-n">{String(lesson.order).padStart(2, "0")}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="eyebrow">
                    Week {lesson.week}
                    {week ? ` · ${formatDate(week.start)}` : ""}
                  </span>
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="lesson-summary">{lesson.summary}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LessonPage() {
  const { slug } = useParams();
  useScrollToParam("section");
  const lesson = lessonBySlug(slug ?? "");
  if (!lesson) return <NotFound />;
  const i = lessons.indexOf(lesson);
  const prev = lessons[i - 1];
  const next = lessons[i + 1];
  const Body = lesson.Component;
  return (
    <div className="content narrow">
      <header className="page-head">
        <div className="row">
          <Link to="/lessons" className="eyebrow">
            Lessons
          </Link>
          <span className="eyebrow">/</span>
          <Link to={`/week/${lesson.week}`} className="eyebrow">
            Week {lesson.week}
          </Link>
        </div>
        <h1>{lesson.title}</h1>
        <p className="lede">{lesson.summary}</p>
      </header>
      <article className="prose">
        <Body components={mdxComponents} />
      </article>
      <nav className="pager" aria-label="Lessons" style={{ marginTop: 40 }}>
        {prev ? (
          <Link to={`/lessons/${prev.slug}`} className="btn">
            <Icon name="back" /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/lessons/${next.slug}`} className="btn">
            {next.title} <Icon name="arrow" />
          </Link>
        )}
      </nav>
    </div>
  );
}
