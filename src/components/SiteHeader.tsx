import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sections } from "../data/navigation";
import { profile } from "../data/portfolio";
import { ScrollProgress } from "./ScrollProgress";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="wrap header-bar">
        <Link to="/" className="brand">
          <span className="brand-mark">CTC</span>
          <span className="brand-name">Charles T. Clark</span>
        </Link>

        <nav className="header-nav" aria-label="Sections">
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <Link to={`/#${section.id}`}>{section.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a className="header-resume" href={profile.resume} target="_blank" rel="noopener">
            Resume<span className="sr-only"> (PDF)</span>
          </a>
          <button
            className="menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      <nav id="mobile-menu" className="mobile-menu" aria-label="Sections" hidden={!open}>
        <ul className="wrap">
          {sections.map((section, index) => (
            <li key={section.id}>
              <Link to={`/#${section.id}`} onClick={() => setOpen(false)}>
                <span className="mobile-menu-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ScrollProgress />
    </header>
  );
}
