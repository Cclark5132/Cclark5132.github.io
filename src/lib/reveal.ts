import { useLayoutEffect } from "react";
import { isInitialMount, isInViewport, motionAllowed } from "./motion";

/**
 * Fades blocks in the first time they scroll into view. Each element with `data-reveal` is a trigger, and CSS
 * animates its `.r-fade` and `.r-draw` children from the trigger's state:
 *   "pending"  hidden, waiting to scroll in
 *   "in"       playing, or finished
 *   "static"   shown without animation
 * On the first load, triggers already on screen stay static (the prerendered page is already visible there),
 * except `.intro` blocks, whose CSS animation has been playing since the first paint. After a client-side
 * navigation, triggers on screen play at once. Runs as a layout effect so hidden states apply before paint.
 */
export function useRevealOnScroll(pathname: string) {
  useLayoutEffect(() => {
    if (!motionAllowed() || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealState = "in";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    const firstLoad = isInitialMount();
    // A sliver peeking in at the bottom edge on first load is hidden and faded in on scroll, not left static.
    const shownAtLoad = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    };

    // Measure every trigger first, then write states, so the browser lays out the page once.
    const triggers = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-state])")];
    const onScreen = triggers.map((element) => (firstLoad ? shownAtLoad(element) : isInViewport(element)));
    triggers.forEach((element, index) => {
      if (onScreen[index]) {
        // "in" matches the same rules as `.intro`, so an intro animation already under way just continues.
        element.dataset.revealState = !firstLoad || element.classList.contains("intro") ? "in" : "static";
      } else {
        element.dataset.revealState = "pending";
        observer.observe(element);
      }
    });

    // Triggers still waiting from an earlier run (React StrictMode runs effects twice in development).
    for (const element of document.querySelectorAll<HTMLElement>('[data-reveal][data-reveal-state="pending"]')) observer.observe(element);

    return () => observer.disconnect();
  }, [pathname]);
}
