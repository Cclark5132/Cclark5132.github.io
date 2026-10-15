import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { viteSingleFile } from "vite-plugin-singlefile";

/** KaTeX ships woff2, woff and ttf for every font. Keep only woff2 so the single-file build stays small. */
const katexWoff2Only = {
  name: "katex-woff2-only",
  enforce: "pre" as const,
  transform(code: string, id: string) {
    if (!/katex(\.min)?\.css/.test(id)) return null;
    return code.replace(/,url\([^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g, "");
  },
};

/** Exposes each lesson's raw MDX text (for search and flashcards) as `virtual:lesson-sources`. */
const LESSONS_DIR = fileURLToPath(new URL("./src/lessons/", import.meta.url));
const lessonSources: Plugin = {
  name: "lesson-sources",
  resolveId: (id) => (id === "virtual:lesson-sources" ? "\0lesson-sources" : null),
  load(id) {
    if (id !== "\0lesson-sources") return null;
    const files = readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".mdx"));
    for (const f of files) this.addWatchFile(LESSONS_DIR + f);
    const map = Object.fromEntries(files.map((f) => [`./${f}`, readFileSync(LESSONS_DIR + f, "utf8")]));
    return `export default ${JSON.stringify(map)};`;
  },
};

// The whole app is emitted as one self-contained index.html (scripts, styles and fonts inlined),
// so scripts/encrypt.mjs can encrypt every byte of it behind the password gate.
export default defineConfig({
  base: "./",
  plugins: [
    katexWoff2Only,
    lessonSources,
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm, remarkMath] }) },
    react({ include: /\.(mdx|tsx?)$/ }),
    tailwindcss(),
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
  build: { assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 10_000 },
  test: { environment: "node", include: ["tests/**/*.test.{ts,tsx}"] },
});
