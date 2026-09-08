/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// The renderer is served by Vite in dev and loaded from built files by Electron
// in prod. `base: "./"` keeps asset URLs relative so the packaged `index.html`
// resolves them under `file://`.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Browser dev: the sidecar runs on a fixed port (see `npm run dev:backend`).
  // Electron dev/prod ignore this — the renderer reads window.up.backendPort.
  const backendPort = env.VITE_BACKEND_PORT ?? "8000";
  const backendTarget = `http://127.0.0.1:${backendPort}`;

  return {
    base: "./",
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": { target: backendTarget, changeOrigin: false },
        "/health": { target: backendTarget, changeOrigin: false },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/tests/setup.ts"],
      css: true,
    },
  };
});
