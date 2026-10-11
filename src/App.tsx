import { useEffect, useLayoutEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { RouteAnalytics } from "./components/RouteAnalytics";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { legacySectionIds } from "./data/navigation";
import { markMounted } from "./lib/motion";
import { useRevealOnScroll } from "./lib/reveal";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectPage } from "./pages/ProjectPage";

/** Moves the reader to the right place after each navigation and gives keyboard focus a matching start point. */
function ScrollManager() {
  const { pathname, hash, search } = useLocation();
  const navigationType = useNavigationType();
  const firstRun = useRef(true);
  const previousPath = useRef(pathname);

  // Layout effect: the new page is placed before it paints, and before the reveal check measures it.
  useLayoutEffect(() => {
    const focusWithoutScroll = (element: HTMLElement | null) => element?.focus({ preventScroll: true });

    if (firstRun.current) {
      firstRun.current = false;
      // Links from the previous version of the site used /?section=work.
      const legacy = legacySectionIds[new URLSearchParams(search).get("section") ?? ""];
      if (legacy && !hash) document.getElementById(legacy)?.scrollIntoView();
      return;
    }
    const samePage = previousPath.current === pathname;
    previousPath.current = pathname;
    if (navigationType === "POP") return;

    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      // Glide within the page; jump straight to the section when arriving from another page.
      target.scrollIntoView(samePage ? undefined : { behavior: "instant" });
      focusWithoutScroll(target);
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    focusWithoutScroll(document.querySelector<HTMLElement>("main h1"));
  }, [pathname, hash, search, navigationType]);

  return null;
}

function App() {
  const { pathname } = useLocation();
  useRevealOnScroll(pathname);
  useEffect(markMounted, []);

  return (
    <>
      <RouteAnalytics />
      <ScrollManager />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SiteFooter />
    </>
  );
}

export default App;
