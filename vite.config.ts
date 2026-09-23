import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { prerenderProjects } from "./scripts/prerender-projects";

export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderProjects()],
  // A root base works for both the charlesclark.me custom domain and GitHub Pages.
  base: "/",
});
