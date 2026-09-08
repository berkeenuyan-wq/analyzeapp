import { contextBridge, ipcRenderer } from "electron";

/**
 * The entire privileged surface exposed to the renderer (docs/RULES.md §15).
 * Nothing else. Values come from `--up-*` args the main process sets on
 * `webPreferences.additionalArguments` (readable here even under `sandbox:true`).
 */
function argValue(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit?.slice(prefix.length);
}

const backendPort = Number.parseInt(argValue("up-backend-port") ?? "", 10);
const appVersion = argValue("up-app-version") ?? "0.0.0";

type LogLevel = "info" | "warn" | "error";

contextBridge.exposeInMainWorld("up", {
  backendPort: Number.isFinite(backendPort) ? backendPort : 0,
  appVersion,
  log(level: LogLevel, message: string): void {
    ipcRenderer.send("up:log", level, String(message).slice(0, 4000));
  },
  openLogDir(): void {
    ipcRenderer.send("up:open-log-dir");
  },
});
