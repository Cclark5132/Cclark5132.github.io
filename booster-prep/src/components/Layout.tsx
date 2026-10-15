import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { nav } from "../data/nav";
import { Icon } from "./Icon";
import { ProgressIO } from "./ProgressIO";
import { SearchDialog } from "./SearchDialog";

const THEME_KEY = "booster-prep:theme";

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">(() => (document.documentElement.dataset.theme === "light" ? "light" : "dark"));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Theme just won't persist.
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))] as const;
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="nav-list">
      {nav.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} end={item.to === "/"} onClick={onNavigate} className={({ isActive }) => (isActive ? "active" : undefined)}>
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/** Forgets the key the password gate remembered on this device, then shows the gate again. */
function LockButton() {
  return (
    <button
      type="button"
      className="btn small ghost"
      style={{ justifySelf: "start" }}
      onClick={() => {
        try {
          localStorage.removeItem("booster-prep:key");
        } catch {
          // Nothing stored.
        }
        window.location.reload();
      }}
    >
      <Icon name="lock" /> Lock
    </button>
  );
}

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Booster Prep home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M12 2c2.5 2.5 3.5 6 3.5 10v8h-7v-8c0-4 1-7.5 3.5-10z" fill="currentColor" />
        </svg>
      </span>
      <span>
        Booster Prep
        <small>Starbase · Jan 11</small>
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => window.scrollTo(0, 0), [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "/" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar" aria-label="Site">
        <Brand />
        <nav aria-label="Main">
          <NavItems />
        </nav>
        <div className="sidebar-foot">
          <ProgressIO compact />
          <LockButton />
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <Brand />
          <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Icon name="search" />
            <span className="label">Search lessons, glossary, cards</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <button type="button" className="icon-btn menu-btn" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu">
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </header>
        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Main">
            <NavItems onNavigate={() => setMenuOpen(false)} />
            <div className="stack" style={{ marginTop: 20, gap: 4 }}>
              <ProgressIO compact />
              <LockButton />
            </div>
          </nav>
        )}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </div>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
