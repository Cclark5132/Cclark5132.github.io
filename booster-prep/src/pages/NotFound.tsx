import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="content narrow">
      <header className="page-head">
        <span className="eyebrow">404</span>
        <h1>Off the trajectory</h1>
        <p className="lede">
          That page doesn't exist. <Link to="/">Back to the dashboard</Link>.
        </p>
      </header>
    </div>
  );
}
