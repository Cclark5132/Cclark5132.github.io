import { useEffect, useState } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** False on the server and whenever the visitor asks for reduced motion. */
export function motionAllowed() {
  return typeof window !== "undefined" && !window.matchMedia(REDUCED_QUERY).matches;
}

/** Starts false so the first client render matches the prerendered HTML, then follows the media query. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(REDUCED_QUERY);
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

let firstPaintDone = false;

/**
 * True until the app's first mount finishes. Content already on screen at page load is left alone,
 * so prerendered numbers never flash back to zero. After a client-side navigation it is false.
 */
export const isInitialMount = () => !firstPaintDone;
export const markMounted = () => {
  firstPaintDone = true;
};

export const isInViewport = (element: Element) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};
