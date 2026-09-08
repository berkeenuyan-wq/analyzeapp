import { join } from "node:path";

import { app, BrowserWindow, ipcMain, shell } from "electron";

import {
  isDev,
  logDir,
  RENDERER_DEV_URL,
  rendererProdEntry,
} from "./paths";
import { Sidecar } from "./sidecar";

const sidecar = new Sidecar();
let mainWindow: BrowserWindow | null = null;
let quitting = false;

// --- single instance ----------------------------------------------------- //
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  void bootstrap();
}

async function bootstrap(): Promise<void> {
  await app.whenReady();

  ipcMain.on("up:log", (_evt, level: string, message: string) => {
    process.stdout.write(`[renderer:${level}] ${message}\n`);
  });
  ipcMain.on("up:open-log-dir", () => {
    void shell.openPath(logDir());
  });

  sidecar.onFatal((reason) => {
    showErrorWindow(reason);
  });

  try {
    const port = await sidecar.start();
    createMainWindow(port);
  } catch (err) {
    showErrorWindow(String(err));
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && sidecar.backendPort) {
      createMainWindow(sidecar.backendPort);
    }
  });
}

function baseWebPreferences(extra: string[]): Electron.WebPreferences {
  return {
    preload: join(__dirname, "preload.js"),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    additionalArguments: extra,
  };
}

function createMainWindow(port: number): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#0b0b0e",
    show: false,
    webPreferences: baseWebPreferences([
      `--up-backend-port=${String(port)}`,
      `--up-app-version=${app.getVersion()}`,
    ]),
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // External links never open in-app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    void mainWindow.loadURL(RENDERER_DEV_URL);
  } else {
    void mainWindow.loadFile(rendererProdEntry());
  }
}

function showErrorWindow(reason: string): void {
  const win = new BrowserWindow({
    width: 560,
    height: 320,
    backgroundColor: "#0b0b0e",
    webPreferences: baseWebPreferences([]),
  });
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{font:14px -apple-system,system-ui,sans-serif;background:#0b0b0e;color:#d6d6dc;padding:28px;margin:0}
    h1{font-size:16px;margin:0 0 12px}code{color:#a8a8b3;word-break:break-all}
  </style><h1>Arka uç başlatılamadı</h1>
  <p>${escapeHtml(reason)}</p>
  <p>Günlük dizini: <code>${escapeHtml(logDir())}</code></p>`;
  void win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );
}

// --- teardown: no orphaned backend, ever (docs/RULES.md §13) ------------- //
app.on("before-quit", (event) => {
  if (quitting) return;
  event.preventDefault();
  quitting = true;
  void sidecar.stop().finally(() => {
    app.quit();
  });
});

app.on("window-all-closed", () => {
  // On macOS the app usually stays alive, but for this single-window tool we
  // quit everywhere so the sidecar is always torn down.
  app.quit();
});

process.on("exit", () => {
  // Last-ditch synchronous guard if every graceful path was skipped.
  sidecar.killSync();
});
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  process.on(sig, () => {
    if (quitting) return;
    quitting = true;
    void sidecar.stop().finally(() => {
      app.exit(0);
    });
  });
}
