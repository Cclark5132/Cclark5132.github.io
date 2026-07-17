import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main id="main-content" className="technical-grid grid min-h-[80vh] place-items-center px-5 pt-24 text-center">
      <div>
        <p className="technical-label text-cyan">Error / 404</p>
        <h1 className="mt-5 text-6xl font-semibold tracking-[-0.06em] text-white md:text-8xl">Out of tolerance.</h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-steel">The requested page is outside the current assembly. Return to the portfolio and continue exploring the work.</p>
        <Link className="button button-primary mt-8" to="/"><ArrowLeft size={16} /> Back to portfolio</Link>
      </div>
    </main>
  );
}
