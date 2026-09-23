import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App";

/** Renders a route to HTML at build time. Used only by scripts/prerender-projects.ts. */
export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
