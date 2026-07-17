import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main id="main-content" className="technical-grid grid min-h-[80vh] place-items-center px-5 pt-24 text-center">
      <div>
        <p className="technical-label text-orange">Error / 404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">Page not found.</h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-white/65">Return to the portfolio to see Charles's work and contact information.</p>
        <Link className="button button-primary mt-7" to="/"><ArrowLeft size={18} /> Back to portfolio</Link>
      </div>
    </main>
  );
}
