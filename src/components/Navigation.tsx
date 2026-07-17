import { Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../data/navigation";
import { profile } from "../data/portfolio";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("projects");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.2, 0.5] },
    );
    navigation.forEach(({ section }) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToSection = (section: string) => {
    if (location.pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(section);
      setOpen(false);
      return;
    }
    navigate({ pathname: "/", search: `?section=${section}` });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-ink/82 backdrop-blur-xl">
      <nav className="site-container flex h-[4.75rem] items-center justify-between" aria-label="Primary navigation">
        <Link to="/" className="group flex items-center gap-3" aria-label="Charles T. Clark portfolio home">
          <span className="grid size-9 place-items-center border border-cyan/45 bg-cyan/8 text-xs font-semibold tracking-[0.1em] text-cyan transition group-hover:bg-cyan group-hover:text-ink">CTC</span>
          <span className="hidden text-sm font-semibold tracking-[-0.01em] text-white sm:block">Charles T. Clark</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navigation.map(({ label, section }) => (
            <button
              className={`nav-link ${location.pathname === "/" && active === section ? "nav-link-active" : ""}`}
              type="button"
              key={section}
              onClick={() => goToSection(section)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a className="button button-compact button-secondary hidden sm:inline-flex" href={profile.resume} target="_blank" rel="noreferrer">
            Resume <Download size={15} aria-hidden="true" />
          </a>
          <button className="grid size-10 place-items-center rounded-full border border-line text-white lg:hidden" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation menu" : "Open navigation menu"}>
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-ink px-5 py-5 lg:hidden">
          <div className="site-container flex flex-col">
            {navigation.map(({ label, section }) => (
              <button className="border-b border-line py-4 text-left text-base text-white" type="button" key={section} onClick={() => goToSection(section)}>{label}</button>
            ))}
            <a className="button button-primary mt-5 justify-center" href={profile.resume} target="_blank" rel="noreferrer">Open Resume <Download size={16} /></a>
          </div>
        </div>
      )}
    </header>
  );
}
