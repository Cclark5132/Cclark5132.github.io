import { Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../data/navigation";
import { profile } from "../data/portfolio";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToSection = (section: string) => {
    if (location.pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
      return;
    }
    navigate({ pathname: "/", search: `?section=${section}` });
  };

  return (
    <header className="site-header">
      <nav className="site-container site-nav" aria-label="Primary navigation">
        <Link to="/" className="site-brand" aria-label="Charles T. Clark portfolio home">
          <span>CC</span>
          <div>
            <strong>Charles Clark</strong>
            <small>Mechanical engineering</small>
          </div>
        </Link>

        <div className="desktop-navigation">
          {navigation.map(({ label, section }) => (
            <button className="nav-link" type="button" key={section} onClick={() => goToSection(section)}>{label}</button>
          ))}
        </div>

        <div className="nav-actions">
          <a className="nav-resume" href={profile.resume} target="_blank" rel="noreferrer">View resume <Download size={15} /></a>
          <button className="mobile-menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation menu" : "Open navigation menu"}>
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <div className="site-container">
            {navigation.map(({ label, section }) => (
              <button type="button" key={section} onClick={() => goToSection(section)}>{label}</button>
            ))}
            <a href={profile.resume} target="_blank" rel="noreferrer">Open resume <Download size={17} /></a>
          </div>
        </div>
      )}
    </header>
  );
}
