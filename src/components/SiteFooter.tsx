import { profile } from "../data/portfolio";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-bar">
        <p>{profile.name}</p>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <p>
          <a href="#top">Back to top</a>
        </p>
      </div>
    </footer>
  );
}
