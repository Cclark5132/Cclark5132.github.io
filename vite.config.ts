import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // A root base works for both the charlesclark.me custom domain and GitHub Pages.
  base: "/",
});
