import react from "@vitejs/plugin-react";
import { createServer, type Plugin } from "vite";
import { projects } from "../src/data/portfolio";

const SITE_URL = "https://charlesclark.me";
const EMPTY_ROOT = '<div id="root"></div>';

const escapeAttribute = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const escapeText = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** Replaces one tag and fails the build if it is missing, so prerendered output cannot silently go stale. */
function replaceTag(html: string, pattern: RegExp | string, replacement: string) {
  const found = typeof pattern === "string" ? html.includes(pattern) : pattern.test(html);
  if (!found) throw new Error(`prerender-projects: could not find ${pattern}`);
  return html.replace(pattern, () => replacement);
}

function renderProjectHead(template: string, project: (typeof projects)[number]) {
  const title = `${project.title} | Charles T. Clark`;
  const url = `${SITE_URL}/projects/${project.slug}`;
  const description = escapeAttribute(project.summary);
  const attributeTitle = escapeAttribute(title);

  let html = template;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escapeText(title)}</title>`);
  html = replaceTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${attributeTitle}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${attributeTitle}" />`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`);
  return html;
}

/** Loads the app through Vite's SSR loader so the real components render to HTML without a second build. */
async function createRenderer() {
  const server = await createServer({
    configFile: false,
    plugins: [react()],
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  const { render } = (await server.ssrLoadModule("/src/entry-server.tsx")) as { render: (url: string) => string };
  return { render, close: () => server.close() };
}

/**
 * Prerenders the homepage and every case study at build time.
 *
 * Each page ships with its real content in `#root` (so crawlers, link-preview bots, and readers without
 * JavaScript see the portfolio, not an empty shell) and, for case studies, its own title, description, and
 * canonical tags. React's server renderer also emits a high-priority preload for each page's first image.
 * The client still mounts with `createRoot`, which replaces the prerendered markup.
 *
 * GitHub Pages answers unknown paths with a 404, so case studies are emitted as `projects/<slug>.html`,
 * which it serves at the clean `/projects/<slug>` URL with a 200.
 */
export function prerenderProjects(): Plugin {
  return {
    name: "prerender-projects",
    apply: "build",
    enforce: "post",
    async generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("prerender-projects: index.html was not generated before this plugin ran");
      const template = String(index.source);
      if (!template.includes(EMPTY_ROOT)) throw new Error("prerender-projects: expected an empty #root in index.html");

      const renderer = await createRenderer();
      try {
        index.source = replaceTag(template, EMPTY_ROOT, `<div id="root">${renderer.render("/")}</div>`);

        for (const project of projects) {
          const page = replaceTag(renderProjectHead(template, project), EMPTY_ROOT, `<div id="root">${renderer.render(`/projects/${project.slug}`)}</div>`);
          this.emitFile({ type: "asset", fileName: `projects/${project.slug}.html`, source: page });
        }
      } finally {
        await renderer.close();
      }
    },
  };
}
