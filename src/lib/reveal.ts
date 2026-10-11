import { useLayoutEffect } from "react";
import { isInitialMount, isInViewport, motionAllowed } from "./motion";

/**
 * Drives the scroll-in animations. Each element with `data-reveal` is a trigger: when it scrolls into view it
 * gets `data-reveal-state="in"`, and CSS animates its `.r-*` children (draw, rise, fade, pop, wipe, plot).
 *
 * States: "pending" (hidden, waiting to scroll in), "in" (animating or done), "static" (shown without animation).
 * On the first load, triggers already on screen are left static, because the prerendered page is already
 * visible there (a thin sliver at the bottom edge does not count). After a client-side navigation the new
 * page is fresh, so on-screen triggers animate at once.
 * Runs as a layout effect so hidden states are applied before the browser paints.
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
      { rootMargin: "0px 0px -8% 0px" },
    );

    const firstLoad = isInitialMount();
    // A sliver peeking in at the bottom edge on first load is hidden and drawn later, not left static.
    const shownAtLoad = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    };
    const triggers = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal-state="in"]):not([data-reveal-state="static"])');
    for (const element of triggers) {
      if (firstLoad ? shownAtLoad(element) : isInViewport(element)) {
        element.dataset.revealState = firstLoad ? "static" : "in";
      } else {
        element.dataset.revealState = "pending";
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, [pathname]);
}
