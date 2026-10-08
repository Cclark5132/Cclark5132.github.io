import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    goatcounter?: { count?: (vars: { path: string }) => void };
  }
}

/**
 * Counts client-side page changes in GoatCounter. The script in index.html already counts the first page
 * load, so the initial render is skipped. GoatCounter ignores localhost by default.
 */
export function RouteAnalytics() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    window.goatcounter?.count?.({ path: pathname });
  }, [pathname]);

  return null;
}
