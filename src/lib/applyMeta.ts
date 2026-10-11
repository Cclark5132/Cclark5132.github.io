import type { PageMeta } from "../data/meta";

const setContent = (selector: string, value: string) => document.querySelector(selector)?.setAttribute("content", value);

/** Keeps the head tags in step with client-side navigation. The prerendered HTML already carries the same values. */
export function applyMeta(meta: PageMeta) {
  document.title = meta.title;
  setContent('meta[name="description"]', meta.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", meta.url);
  setContent('meta[property="og:title"]', meta.title);
  setContent('meta[property="og:description"]', meta.description);
  setContent('meta[property="og:url"]', meta.url);
  setContent('meta[name="twitter:title"]', meta.title);
  setContent('meta[name="twitter:description"]', meta.description);
}
