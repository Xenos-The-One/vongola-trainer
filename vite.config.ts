import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA: Workbox precaches every hashed build asset (JS/CSS/fonts/sprites/icons)
    // and auto-versions its caches each build — truly offline-capable after first
    // load, never serving stale assets. Replaces the hand-rolled public/sw.js.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false, // keep the existing hand-authored manifest + <link> in index.html
      workbox: {
        // jpg/jpeg added so the ~8MB of exercise demo photos under
        // public/exercises/ are precached for true offline use at the gym.
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,ico,woff,woff2}"],
        // Bumped from the 2MB default headroom — the largest single asset is
        // still tiny (~70KB/photo), but the total precache manifest is larger.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
