import { Link, NavLink, useParams } from "react-router-dom";
import { CheckItem } from "../components/Checks";
import { Rich } from "../components/Tex";
import { feaPractices, nastranLiteracy, swToNx, toolTracks } from "../data/tools";
import { NotFound } from "./NotFound";

function ToolTabs() {
  return (
    <nav className="tabs" aria-label="Tool tracks">
      {toolTracks.map((track) => (
        <NavLink key={track.id} to={`/tools/${track.id}`} className={({ isActive }) => (isActive ? "active" : undefined)}>
          {track.name}
        </NavLink>
      ))}
      <NavLink to="/tools/fea" className={({ isActive }) => (isActive ? "active" : undefined)}>
        FEA best practices
      </NavLink>
    </nav>
  );
}

export function Tools() {
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Tool tracks</span>
        <h1>NX, Ansys, Python and MATLAB</h1>
        <p className="lede">Guided paths that follow the plan week by week, with step-by-step exercises. You know SolidWorks, so start with the translation table.</p>
      </header>
      <ToolTabs />
      <div className="grid-auto" style={{ marginTop: 20 }}>
        {toolTracks.map((track) => (
          <Link key={track.id} to={`/tools/${track.id}`} className="card link-card">
            <h2>{track.name}</h2>
            <p>{track.blurb}</p>
            <span className="eyebrow">Weeks {track.path.map((p) => p.week).join(", ")}</span>
          </Link>
        ))}
        <Link to="/tools/fea" className="card link-card">
          <h2>FEA best practices</h2>
          <p>Units, boundary conditions, shells vs. solids, symmetry, mesh convergence, sanity checks and the Ansys Student node limit.</p>
          <span className="eyebrow">Read before Week 4</span>
        </Link>
      </div>
      <NastranCard />
      <SwTable />
    </div>
  );
}

function NastranCard() {
  const n = nastranLiteracy;
  return (
    <section className="card" style={{ marginTop: 24 }} aria-labelledby="nastran-h">
      <div className="card-title">
        <h2 id="nastran-h">{n.title}</h2>
        <span className="tag">{n.budget}</span>
      </div>
      <p className="hint" style={{ marginBottom: 12 }}>
        {n.why}
      </p>
      <div className="table-wrap">
        <table className="data">
          <caption className="sr-only">Nastran bulk data cards</caption>
          <thead>
            <tr>
              <th scope="col">Card</th>
              <th scope="col">What it does</th>
            </tr>
          </thead>
          <tbody>
            {n.cards.map(([card, what]) => (
              <tr key={card}>
                <td className="num">{card}</td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12 }}>
        {n.steps.map((step, i) => (
          <CheckItem key={i} id={`tool-nastran-${i}`}>
            <span className="check-meta">Week {step.week}</span>
            <Rich text={step.text} />
          </CheckItem>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 10 }}>
        {n.links.map((link, i) => (
          <span key={link.url}>
            {i > 0 && " · "}
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </span>
        ))}
      </p>
    </section>
  );
}

function SwTable() {
  return (
    <section className="card" style={{ marginTop: 24 }} aria-labelledby="sw-h">
      <div className="card-title">
        <h2 id="sw-h">SolidWorks → NX</h2>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th scope="col">SolidWorks</th>
              <th scope="col">NX</th>
            </tr>
          </thead>
          <tbody>
            {swToNx.map(([sw, nx]) => (
              <tr key={sw}>
                <td>{sw}</td>
                <td>{nx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ToolPage() {
  const { tool } = useParams();
  if (tool === "fea") return <FeaPractices />;
  const track = toolTracks.find((t) => t.id === tool);
  if (!track) return <NotFound />;
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Tool track</span>
        <h1>{track.name}</h1>
        <p className="lede">{track.blurb}</p>
      </header>
      <ToolTabs />
      <div className="stack" style={{ marginTop: 20 }}>
        {track.path.map((step) => (
          <section key={step.week + step.title} className="card">
            <div className="card-title">
              <h2>{step.title}</h2>
              <Link to={`/week/${step.week}`} className="tag">
                Week {step.week}
              </Link>
            </div>
            <div>
              {step.steps.map((text, i) => (
                <CheckItem key={i} id={`tool-${track.id}-w${step.week}-${i}`}>
                  <span className="check-meta">Step {i + 1}</span>
                  <Rich text={text} />
                </CheckItem>
              ))}
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              <Rich text={step.check} />
            </p>
          </section>
        ))}
      </div>
      {track.id === "nx" && <SwTable />}
    </div>
  );
}

function FeaPractices() {
  return (
    <div className="content">
      <header className="page-head">
        <span className="eyebrow">Tool track</span>
        <h1>FEA best practices</h1>
        <p className="lede">A checklist to run on every model. Most bad FEA results come from units, boundary conditions or an unchecked mesh, not from the solver.</p>
      </header>
      <ToolTabs />
      <div className="grid-auto" style={{ marginTop: 20 }}>
        {feaPractices.map((section) => (
          <section key={section.title} className="card">
            <div className="card-title">
              <h2>{section.title}</h2>
            </div>
            <ul className="bullets">
              {section.points.map((point) => (
                <li key={point}>
                  <Rich text={point} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
