import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Dev: serves the whole repo (preview app at /preview/, presenter at /presenter/,
 * deck assets at /decks/<slug>/assets/...).
 * Build: bundles only the presenter into dist/presenter (static, relative paths).
 */
export default defineConfig(({ command }) => {
  if (command === "build") {
    return {
      root: resolve(import.meta.dirname, "presenter"),
      base: "./",
      build: { outDir: resolve(import.meta.dirname, "dist/presenter"), emptyOutDir: true },
    };
  }
  return {
    root: import.meta.dirname,
    plugins: [
      react(),
      {
        name: "slideschurch-root-redirect",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const [pathname = "", search] = (req.url ?? "").split("?");
            if (pathname === "/" || pathname === "/index.html") req.url = `/preview/index.html${search ? `?${search}` : ""}`;
            next();
          });
        },
      },
    ],
    server: { port: 5173, open: false },
    test: { include: ["tests/**/*.test.ts"] },
  };
});
