import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer, type Plugin } from "vite";
import { homeMeta, projectMeta, type PageMeta } from "../src/data/meta";
import { projects } from "../src/data/portfolio";

const EMPTY_ROOT = '<div id="root"></div>';
const SITEMAP = fileURLToPath(new URL("../public/sitemap.xml", import.meta.url));

/** Latin subsets of the two fonts used above the fold. Other subsets load only if a page needs them. */
const PRELOAD_FONTS = [/archivo-latin-wdth-normal[^/]*\.woff2$/, /ibm-plex-mono-latin-500-normal[^/]*\.woff2$/];

const escapeAttribute = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const escapeText = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** Replaces one tag and fails the build if it is missing, so prerendered output cannot silently go stale. */
function replaceTag(html: string, pattern: RegExp | string, replacement: string) {
  const found = typeof pattern === "string" ? html.includes(pattern) : pattern.test(html);
  if (!found) throw new Error(`prerender-projects: could not find ${pattern}`);
  return html.replace(pattern, () => replacement);
}

function renderHead(template: string, meta: PageMeta) {
  const title = escapeAttribute(meta.title);
  const description = escapeAttribute(meta.description);

  let html = template;
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escapeText(meta.title)}</title>`);
  html = replaceTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${meta.url}" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${meta.url}" />`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`);
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

/** Every page must be listed in public/sitemap.xml. Fails the build when a project is added without it. */
function checkSitemap(urls: string[]) {
  const sitemap = readFileSync(SITEMAP, "utf8");
  const missing = urls.filter((url) => !sitemap.includes(`<loc>${url}</loc>`));
  if (missing.length) throw new Error(`prerender-projects: add these URLs to public/sitemap.xml: ${missing.join(", ")}`);
}

/**
 * Prerenders the homepage and every project page at build time.
 *
 * Each page ships with its real content in `#root` (so crawlers, link-preview bots, and readers without
 * JavaScript see the portfolio, not an empty shell) and its own title, description, canonical and social tags.
 * `data-route` records which URL the markup belongs to; src/main.tsx hydrates the markup when it matches the
 * current URL and renders fresh when it does not (the 404 fallback serves the homepage markup for every path).
 *
 * GitHub Pages answers unknown paths with a 404, so project pages are emitted as `projects/<slug>.html`,
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
      if (!String(index.source).includes(EMPTY_ROOT)) throw new Error("prerender-projects: expected an empty #root in index.html");

      const fonts = Object.keys(bundle).filter((file) => PRELOAD_FONTS.some((pattern) => pattern.test(file)));
      if (fonts.length !== PRELOAD_FONTS.length) throw new Error(`prerender-projects: expected ${PRELOAD_FONTS.length} fonts to preload, found ${fonts.join(", ") || "none"}`);
      const preloads = fonts.map((file) => `<link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin />`).join("\n    ");
      const template = replaceTag(String(index.source), "</title>", `</title>\n    ${preloads}`);

      const pages = [
        { route: "/", file: null, meta: homeMeta },
        ...projects.map((project) => ({ route: `/projects/${project.slug}`, file: `projects/${project.slug}.html`, meta: projectMeta(project) })),
      ];
      checkSitemap(pages.map((page) => page.meta.url));

      const renderer = await createRenderer();
      try {
        for (const page of pages) {
          const html = replaceTag(renderHead(template, page.meta), EMPTY_ROOT, `<div id="root" data-route="${page.route}">${renderer.render(page.route)}</div>`);
          if (page.file) this.emitFile({ type: "asset", fileName: page.file, source: html });
          else index.source = html;
        }
      } finally {
        await renderer.close();
      }
    },
  };
}
