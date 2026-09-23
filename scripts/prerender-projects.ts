import type { Plugin } from "vite";
import { projects } from "../src/data/portfolio";

const SITE_URL = "https://charlesclark.me";

const escapeAttribute = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const escapeText = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** Replaces one head tag and fails the build if the tag is missing, so the metadata cannot silently go stale. */
function replaceTag(html: string, pattern: RegExp, replacement: string) {
  if (!pattern.test(html)) throw new Error(`prerender-projects: could not find ${pattern}`);
  return html.replace(pattern, () => replacement);
}

function renderProjectPage(template: string, project: (typeof projects)[number]) {
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

/**
 * GitHub Pages answers unknown paths with a 404, so direct project URLs would otherwise rely on the
 * 404.html redirect. This emits `projects/<slug>.html` per case study with the correct title, description,
 * and canonical tags. GitHub Pages serves each file at the clean `/projects/<slug>` URL with a 200.
 */
export function prerenderProjects(): Plugin {
  return {
    name: "prerender-projects",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("prerender-projects: index.html was not generated before this plugin ran");
      const template = String(index.source);

      for (const project of projects) {
        this.emitFile({ type: "asset", fileName: `projects/${project.slug}.html`, source: renderProjectPage(template, project) });
      }
    },
  };
}
