import { Download, Mail, Menu, X } from "lucide-react";
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/92 backdrop-blur-xl">
      <nav className="site-container flex h-[4.75rem] items-center justify-between" aria-label="Primary navigation">
        <Link to="/" className="group flex items-center gap-3" aria-label="Charles T. Clark portfolio home">
          <span className="grid size-10 place-items-center rounded-lg bg-cyan text-xs font-bold tracking-[0.08em] text-white transition group-hover:bg-[#6f1836]">CTC</span>
          <span className="hidden text-sm font-semibold text-white sm:block">Charles T. Clark</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navigation.map(({ label, section }) => (
            <button className="nav-link" type="button" key={section} onClick={() => goToSection(section)}>{label}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a className="button button-compact button-ghost hidden md:inline-flex" href={`mailto:${profile.email}`}>
            <Mail size={17} /> Email
          </a>
          <a className="button button-compact button-primary hidden sm:inline-flex" href={profile.resume} target="_blank" rel="noreferrer">
            Resume <Download size={17} />
          </a>
          <button className="grid size-12 place-items-center rounded-lg border border-white/15 bg-white/8 text-white lg:hidden" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation menu" : "Open navigation menu"}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-ink px-5 py-5 lg:hidden">
          <div className="site-container flex flex-col gap-2">
            {navigation.map(({ label, section }) => (
              <button className="rounded-lg border border-white/12 bg-white/6 px-5 py-4 text-left text-lg font-semibold text-white" type="button" key={section} onClick={() => goToSection(section)}>{label}</button>
            ))}
            <a className="button button-primary mt-2 w-full" href={profile.resume} target="_blank" rel="noreferrer">Open resume <Download size={18} /></a>
          </div>
        </div>
      )}
    </header>
  );
}
