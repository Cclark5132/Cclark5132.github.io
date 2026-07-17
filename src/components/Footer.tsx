import { ArrowUp, Github, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { profile } from "../data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white py-7">
      <div className="site-container flex flex-col gap-5 text-sm text-steel md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-charcoal">Charles T. Clark</p>
          <p className="mt-1">Mechanical Engineer / {new Date().getFullYear()}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="footer-link" href={`mailto:${profile.email}`}><Mail size={16} />{profile.email}</a>
          <a className="footer-link" href={`tel:${profile.phoneLink}`}><Phone size={16} />{profile.phone}</a>
        </div>
        <div className="flex items-center gap-2">
          <a className="icon-link" href={profile.github} target="_blank" rel="noreferrer" aria-label="Charles Clark on GitHub"><Github size={18} /></a>
          <Link className="icon-link" to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"><ArrowUp size={18} /></Link>
        </div>
      </div>
    </footer>
  );
}
