import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

// GitHub Pages also answers /index.html and /projects/<slug>.html. Use the clean URL the router knows.
const cleanPath = window.location.pathname.replace(/\/index\.html$/, "/").replace(/^(\/projects\/[^/]+)\.html$/, "$1");
if (cleanPath !== window.location.pathname) {
  window.history.replaceState(null, "", cleanPath + window.location.search + window.location.hash);
}

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Reuse the prerendered markup when it belongs to this URL. After a 404 redirect it belongs to another page.
if (container.dataset.route === window.location.pathname && container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  container.replaceChildren();
  createRoot(container).render(app);
}
