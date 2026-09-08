import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import { app } from "electron";

export interface BackendLaunch {
  command: string;
  args: string[];
  cwd: string;
}

/** `true` when running from source (`electron .`), `false` in a packaged app. */
export const isDev = !app.isPackaged;

/** Per-user writable dir for the SQLite DB and exports (mirrors config.STATE_DIR). */
export function stateDir(): string {
  return join(app.getPath("appData"), "UretimPaneli");
}

export function logDir(): string {
  return join(app.getPath("logs"));
}

/**
 * How to start the FastAPI sidecar.
 *
 * - dev: the repo venv's Python running `python -m backend.run`, cwd = repo root
 * - prod: the one-file PyInstaller binary bundled via electron-builder
 *   `extraResources`, cwd = the resources dir (so it finds `data/seed/`)
 */
export function backendLaunch(): BackendLaunch {
  if (isDev) {
    // __dirname is <repo>/electron/dist at runtime.
    const repoRoot = resolve(__dirname, "..", "..");
    const venvPython = join(
      repoRoot,
      "backend",
      ".venv",
      "bin",
      process.platform === "win32" ? "python.exe" : "python",
    );
    const command = existsSync(venvPython) ? venvPython : "python3";
    return { command, args: ["-m", "backend.run"], cwd: repoRoot };
  }
  const resourcesPath = process.resourcesPath;
  const binName =
    process.platform === "win32" ? "uretim-backend.exe" : "uretim-backend";
  return {
    command: join(resourcesPath, "backend", binName),
    args: [],
    cwd: join(resourcesPath, "backend"),
  };
}

export const RENDERER_DEV_URL = "http://localhost:5173";

export function rendererProdEntry(): string {
  // electron-builder copies frontend/dist to Contents/Resources/renderer
  // (see build/electron-builder.yml `extraResources`).
  return join(process.resourcesPath, "renderer", "index.html");
}
