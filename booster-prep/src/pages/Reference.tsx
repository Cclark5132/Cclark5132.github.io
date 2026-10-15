import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckItem } from "../components/Checks";
import { Rich, plain } from "../components/Tex";
import { glossary, type GlossaryCategory } from "../data/glossary";
import { launchPrep } from "../data/plan";
import { resources } from "../data/resources";

const trackLabel = { structures: "Structures", cad: "CAD / FEA", code: "Code", context: "Starship context" } as const;

export function Resources() {
  const [track, setTrack] = useState<string>("all");
  const list = resources.filter((r) => track === "all" || r.tracks.includes(track as never));
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Reference library</span>
        <h1>Resources</h1>
        <p className="lede">The reference table from the plan, tagged by the weeks and tracks where you'll use each one.</p>
      </header>
      <div className="seg" role="group" aria-label="Filter by track" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "structures", "cad", "code", "context"].map((t) => (
          <button key={t} type="button" aria-pressed={track === t} onClick={() => setTrack(t)}>
            {t === "all" ? "All" : trackLabel[t as keyof typeof trackLabel]}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Resource</th>
                <th scope="col">Use it for</th>
                <th scope="col">Weeks</th>
                <th scope="col">Track</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.name}>
                  <td style={{ minWidth: 180 }}>
                    <Rich text={r.name} />
                  </td>
                  <td style={{ color: "var(--ink-soft)", minWidth: 160 }}>{r.use}</td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {r.weeks.map((w) => (
                        <Link key={w} to={`/week/${w}`} className="tag">
                          W{w}
                        </Link>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4 }}>
                      {r.tracks.map((t) => (
                        <span key={t} className={`tag ${t}`}>
                          {trackLabel[t]}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const categories: (GlossaryCategory | "All")[] = ["All", "Structures", "Materials", "Manufacturing", "Analysis", "Starship"];

export function Glossary() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const list = useMemo(() => {
    const q = query.toLowerCase();
    return glossary
      .filter((t) => category === "All" || t.category === category)
      .filter((t) => !q || t.term.toLowerCase().includes(q) || plain(t.def).toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Glossary</span>
        <h1>Structures, manufacturing and Starship terms</h1>
        <p className="lede">Starship entries are simplified, general public knowledge.</p>
      </header>
      <div className="stack" style={{ marginBottom: 16 }}>
        <label className="field">
          <span>Search the glossary</span>
          <input className="input" type="search" value={query} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })} placeholder="e.g. knockdown, datum, HAZ" />
        </label>
        <div className="seg" role="group" aria-label="Filter by category" style={{ flexWrap: "wrap" }}>
          {categories.map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <p className="hint" aria-live="polite">
        {list.length} {list.length === 1 ? "term" : "terms"}
      </p>
      <dl className="glossary">
        {list.map((t) => (
          <div key={t.term} className="card">
            <dt>
              {t.term}
              <span className="tag">{t.category}</span>
              {t.week !== undefined && (
                <Link to={`/week/${t.week}`} className="tag">
                  W{t.week}
                </Link>
              )}
            </dt>
            <dd>
              <Rich text={t.def} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function LaunchPrep() {
  const sections = [
    { title: "Questions for your manager in week one", id: "q", items: launchPrep.questions },
    { title: "Working well as an intern", id: "h", items: launchPrep.habits },
    { title: "Logistics", id: "l", items: launchPrep.logistics },
  ];
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Week 12 · Jan 4 – Jan 10</span>
        <h1>Launch prep</h1>
        <p className="lede">
          The last week: booster anatomy, flight footage, a one-page first week plan and a clean portfolio. <Link to="/anatomy">Open Booster Anatomy</Link>.
        </p>
      </header>
      <div className="grid-auto">
        {sections.map((section) => (
          <section key={section.id} className="card">
            <div className="card-title">
              <h2>{section.title}</h2>
            </div>
            {section.items.map((item, i) => (
              <CheckItem key={i} id={`launch-${section.id}-${i}`}>
                {item}
              </CheckItem>
            ))}
          </section>
        ))}
        <section className="card">
          <div className="card-title">
            <h2>Deliverable</h2>
          </div>
          <CheckItem id="launch-d-0">One-page "first week plan"</CheckItem>
          <CheckItem id="launch-d-1">Portfolio cleaned up and ready to show</CheckItem>
          <p className="hint" style={{ marginTop: 8 }}>
            Also tracked on <Link to="/week/12">Week 12</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
