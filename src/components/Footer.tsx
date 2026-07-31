import { ArrowUp, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { profile } from "../data/portfolio";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-layout">
        <p><strong>Charles T. Clark</strong><span>{profile.title}</span></p>
        <div className="footer-contact">
          <a href={`mailto:${profile.email}`}><Mail size={15} />{profile.email}</a>
          <a href={profile.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={15} />LinkedIn</a>
        </div>
        <Link className="back-to-top" to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top"><ArrowUp size={17} /></Link>
      </div>
    </footer>
  );
}
