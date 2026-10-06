import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build:single` produces one self-contained HTML file (used for the
// hosted preview). Regular builds keep frames as static files for lazy loading.
export default defineConfig(({ mode }) => ({
  plugins: mode === "single" ? [viteSingleFile()] : [],
  build: {
    outDir: mode === "single" ? "dist-single" : "dist",
    assetsInlineLimit: mode === "single" ? 100_000_000 : 4096,
    target: "es2020",
  },
}));
