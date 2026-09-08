import { type ChildProcess, spawn } from "node:child_process";
import { createWriteStream, mkdirSync, type WriteStream } from "node:fs";
import { join } from "node:path";

import { backendLaunch, logDir, stateDir } from "./paths";

const HEALTH_TIMEOUT_MS = 15_000;
const HEALTH_POLL_INTERVAL_MS = 300;
const MAX_RESTARTS = 3;
const RESTART_BACKOFF_MS = [1_000, 2_000, 4_000];
const TERM_GRACE_MS = 3_000;
const HANDSHAKE_PREFIX = "UP_BACKEND_PORT=";

type FatalListener = (reason: string) => void;

/**
 * Owns the FastAPI sidecar process for the whole app lifetime.
 *
 * Guarantees (docs/RULES.md §13): the child is terminated on every exit path —
 * normal quit, crash, and `SIGKILL` fallback if it ignores `SIGTERM`. An
 * unexpected exit triggers a capped, backed-off restart; once the cap is hit the
 * `onFatal` listener fires so the main process can show an error window.
 */
export class Sidecar {
  private child: ChildProcess | null = null;
  private port: number | null = null;
  private restarts = 0;
  private shuttingDown = false;
  private starting: Promise<number> | null = null;
  private logStream: WriteStream | null = null;
  private readonly fatalListeners = new Set<FatalListener>();

  onFatal(listener: FatalListener): void {
    this.fatalListeners.add(listener);
  }

  get backendPort(): number | null {
    return this.port;
  }

  /** PID of the live sidecar process, for tests/diagnostics only. */
  get childPid(): number | undefined {
    return this.child?.pid;
  }

  /** Spawn (if not already up) and resolve once `/health` answers. */
  start(): Promise<number> {
    if (this.port !== null) return Promise.resolve(this.port);
    if (this.starting) return this.starting;
    this.starting = this.spawnAndWait().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  private openLog(): WriteStream {
    if (!this.logStream) {
      const dir = logDir();
      mkdirSync(dir, { recursive: true });
      this.logStream = createWriteStream(join(dir, "backend.log"), { flags: "a" });
    }
    return this.logStream;
  }

  private write(line: string): void {
    const stamped = `${new Date().toISOString()} ${line}\n`;
    this.openLog().write(stamped);
    process.stdout.write(`[sidecar] ${stamped}`);
  }

  private async spawnAndWait(): Promise<number> {
    const { command, args, cwd } = backendLaunch();
    this.write(`spawning: ${command} ${args.join(" ")} (cwd ${cwd})`);

    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        UP_STATE_DIR: stateDir(),
        UP_LOG_LEVEL: "info",
        UP_PARENT_PID: String(process.pid),
        PYTHONUNBUFFERED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.child = child;

    let stdoutBuf = "";
    const portFromStdout = new Promise<number>((resolvePort, rejectPort) => {
      const onData = (chunk: Buffer): void => {
        stdoutBuf += chunk.toString("utf8");
        let nl: number;
        while ((nl = stdoutBuf.indexOf("\n")) !== -1) {
          const line = stdoutBuf.slice(0, nl);
          stdoutBuf = stdoutBuf.slice(nl + 1);
          this.write(`out: ${line}`);
          if (line.startsWith(HANDSHAKE_PREFIX)) {
            const parsed = Number.parseInt(line.slice(HANDSHAKE_PREFIX.length), 10);
            if (Number.isFinite(parsed)) {
              child.stdout?.off("data", onData);
              resolvePort(parsed);
            }
          }
        }
      };
      child.stdout?.on("data", onData);
      child.on("error", rejectPort);
      child.on("exit", (code) => {
        rejectPort(new Error(`sidecar exited before handshake (code ${String(code)})`));
      });
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      this.write(`err: ${chunk.toString("utf8").trimEnd()}`);
    });

    child.on("exit", (code, signal) => {
      this.write(`exit code=${String(code)} signal=${String(signal)}`);
      this.child = null;
      this.port = null;
      if (!this.shuttingDown && code !== 0) {
        void this.handleUnexpectedExit();
      }
    });

    const port = await portFromStdout;
    await this.waitForHealth(port);
    this.port = port;
    this.restarts = 0;
    this.write(`ready on 127.0.0.1:${String(port)}`);
    return port;
  }

  private async waitForHealth(port: number): Promise<void> {
    const deadline = Date.now() + HEALTH_TIMEOUT_MS;
    const url = `http://127.0.0.1:${String(port)}/health`;
    while (Date.now() < deadline) {
      try {
        const resp = await fetch(url);
        if (resp.ok) return;
      } catch {
        /* not up yet */
      }
      await delay(HEALTH_POLL_INTERVAL_MS);
    }
    throw new Error(`sidecar /health did not answer within ${HEALTH_TIMEOUT_MS}ms`);
  }

  private async handleUnexpectedExit(): Promise<void> {
    if (this.restarts >= MAX_RESTARTS) {
      const reason = `sidecar crashed ${String(MAX_RESTARTS + 1)}× — giving up`;
      this.write(reason);
      for (const l of this.fatalListeners) l(reason);
      return;
    }
    const backoff = RESTART_BACKOFF_MS[this.restarts] ?? 4_000;
    this.restarts += 1;
    this.write(`restart ${String(this.restarts)}/${String(MAX_RESTARTS)} in ${String(backoff)}ms`);
    await delay(backoff);
    if (this.shuttingDown) return;
    try {
      this.starting = this.spawnAndWait().finally(() => {
        this.starting = null;
      });
      await this.starting;
      // stop() may have been called while this restart was in flight; if so,
      // the child it wanted to kill didn't exist yet — kill this one now.
      if (this.shuttingDown) await this.stop();
    } catch (err) {
      this.write(`restart failed: ${String(err)}`);
      if (!this.shuttingDown) void this.handleUnexpectedExit();
    }
  }

  /** Synchronous best-effort kill for a `process.on("exit")` last-ditch guard. */
  killSync(): void {
    this.shuttingDown = true;
    if (this.child && this.child.exitCode === null) {
      try {
        this.child.kill("SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }

  /** SIGTERM, then SIGKILL after a grace period. Safe to call more than once. */
  async stop(): Promise<void> {
    this.shuttingDown = true;
    // A restart may be mid-flight — let it finish spawning so we can kill the
    // child it produces rather than leaking it.
    if (this.starting) {
      try {
        await this.starting;
      } catch {
        /* start failed — nothing to kill */
      }
    }
    const child = this.child;
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      this.child = null;
      this.port = null;
      this.logStream?.end();
      return;
    }
    this.write("stopping (SIGTERM)");
    const exited = new Promise<void>((res) => child.once("exit", () => {
      res();
    }));
    child.kill("SIGTERM");
    const timer = setTimeout(() => {
      if (this.child) {
        this.write("SIGTERM ignored — SIGKILL");
        child.kill("SIGKILL");
      }
    }, TERM_GRACE_MS);
    await exited;
    clearTimeout(timer);
    this.child = null;
    this.port = null;
    this.logStream?.end();
    this.write("stopped");
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
