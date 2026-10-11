import { useLayoutEffect } from "react";
import { isInitialMount, isInViewport, motionAllowed } from "./motion";

const IMAGE_WAIT_MS = 1500;

/** Resolves when the images inside the element's block-covered frames have loaded, or after a short timeout. */
function imagesReady(element: HTMLElement) {
  const pending = [...element.querySelectorAll<HTMLImageElement>(".plot-frame img")].filter((image) => !image.complete);
  if (!pending.length) return Promise.resolve();
  const loads = pending.map(
    (image) =>
      new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      }),
  );
  return Promise.race([Promise.all(loads), new Promise((resolve) => window.setTimeout(resolve, IMAGE_WAIT_MS))]);
}

/**
 * Drives the scroll animations. Each element with `data-reveal` is a trigger, and CSS animates its `.r-*`
 * children, its letters (BuildText) and its image blocks (BlockReveal) from the trigger's state:
 *   "pending"  hidden, waiting to scroll in
 *   "in"       playing, or finished
 *   "static"   shown without animation
 * The animations replay: when a trigger scrolls well clear of the screen it goes back to "pending", so it
 * builds again the next time it comes in. A trigger with images waits until they have loaded, so the sweep
 * never uncovers an empty frame. On the first load, triggers already on screen stay static (the prerendered
 * page is already visible there), except `.intro` blocks, whose CSS animation has been playing since the
 * first paint. Runs as a layout effect so hidden states apply before the browser paints.
 */
export function useRevealOnScroll(pathname: string) {
  useLayoutEffect(() => {
    if (!motionAllowed() || !("IntersectionObserver" in window)) return;

    let active = true;
    const waiting = new WeakSet<HTMLElement>();
    const play = (element: HTMLElement) => {
      if (waiting.has(element)) return;
      waiting.add(element);
      void imagesReady(element).then(() => {
        waiting.delete(element);
        if (active && element.dataset.revealState === "pending" && isInViewport(element)) element.dataset.revealState = "in";
      });
    };

    const enter = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting && element.dataset.revealState === "pending") play(element);
        }
      },
      { rootMargin: "0px 0px -4% 0px" },
    );

    // Reset only once a trigger is well clear of the screen, so nothing visibly disappears.
    const leave = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) (entry.target as HTMLElement).dataset.revealState = "pending";
        }
      },
      { rootMargin: "25% 0px 25% 0px" },
    );

    const firstLoad = isInitialMount();
    // A sliver peeking in at the bottom edge on first load is hidden and built on scroll, not left static.
    const shownAtLoad = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    };

    // Measure every trigger first, then write states, so the browser lays out the page once.
    const triggers = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const onScreen = triggers.map((element) => !element.dataset.revealState && (firstLoad ? shownAtLoad(element) : isInViewport(element)));
    triggers.forEach((element, index) => {
      if (!element.dataset.revealState) {
        // "in" matches the same rules as `.intro`, so an intro animation already under way just continues.
        if (onScreen[index]) element.dataset.revealState = !firstLoad || element.classList.contains("intro") ? "in" : "static";
        else element.dataset.revealState = "pending";
      }
      enter.observe(element);
      leave.observe(element);
    });

    return () => {
      active = false;
      enter.disconnect();
      leave.disconnect();
    };
  }, [pathname]);
}
