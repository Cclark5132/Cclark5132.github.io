import { profile } from "../data/portfolio";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-bar">
        <p>
          {profile.name}
          {/* Private study page, encrypted behind a password. Deliberately looks like a decorative marker. */}
          <a className="footer-mark" href="/booster-prep/" aria-label="Private area" />
        </p>
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
