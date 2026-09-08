/// <reference types="vite/client" />

/**
 * The privileged bridge Electron's preload exposes on `window`. In the browser
 * dev server it is absent — `resolveBackendBase()` falls back to the Vite proxy
 * origin. Keep this in lockstep with `electron/preload.ts`.
 */
export interface UpBridge {
  /** Loopback port the FastAPI sidecar bound, from the `UP_BACKEND_PORT=` line. */
  readonly backendPort: number;
  readonly appVersion: string;
  /** Forward a renderer log line to the main process. */
  log(level: "info" | "warn" | "error", message: string): void;
  /** Open the log directory in the OS file manager. */
  openLogDir(): void;
}

declare global {
  interface Window {
    up?: UpBridge;
  }
}

export {};
