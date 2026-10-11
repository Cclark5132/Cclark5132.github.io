import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { notFoundMeta } from "../data/meta";
import { applyMeta } from "../lib/applyMeta";

export function NotFoundPage() {
  useEffect(() => applyMeta(notFoundMeta), []);

  return (
    <main id="main-content" tabIndex={-1} className="not-found">
      <div className="wrap">
        <p className="project-index">Error 404</p>
        <h1 tabIndex={-1}>Page not found</h1>
        <p className="project-summary">This address does not match a page on the site.</p>
        <Link className="button button-primary" to="/">
          <ArrowLeft size={16} aria-hidden="true" /> Home page
        </Link>
      </div>
    </main>
  );
}
