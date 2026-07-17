import { ArrowUp, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { profile } from "../data/portfolio";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#2c3033] py-7">
      <div className="site-container flex flex-col gap-5 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-white">Charles T. Clark</p>
          <p className="mt-1">{profile.title} / {new Date().getFullYear()}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a className="footer-link" href={`mailto:${profile.email}`}><Mail size={16} />{profile.email}</a>
          <a className="footer-link" href={profile.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={16} />LinkedIn</a>
        </div>
        <div className="flex items-center gap-2">
          <Link className="icon-link" to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"><ArrowUp size={18} /></Link>
        </div>
      </div>
    </footer>
  );
}
