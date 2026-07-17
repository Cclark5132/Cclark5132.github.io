import { ArrowUp, Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { profile } from "../data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#050c16] py-8">
      <div className="site-container flex flex-col gap-6 text-sm text-steel md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-white">Charles T. Clark</p>
          <p className="mt-1">Mechanical Engineering Portfolio / {new Date().getFullYear()}</p>
        </div>
        <p>Built with React and TypeScript</p>
        <div className="flex items-center gap-3">
          <a className="icon-link" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub placeholder"><Github size={17} /></a>
          <a className="icon-link" href={profile.linkedIn} target="_blank" rel="noreferrer" aria-label="LinkedIn placeholder"><Linkedin size={17} /></a>
          <Link className="icon-link" to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"><ArrowUp size={17} /></Link>
        </div>
      </div>
    </footer>
  );
}
