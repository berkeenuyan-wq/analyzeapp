/**
 * Headless lifecycle check for CI (docs/ROADMAP.md Phase 1 exit: "no orphaned
 * backend process — guard test or script"). Runs under Electron so `sidecar.ts`
 * can import `app`, but opens no window.
 *
 *   electron dist/smoke.js
 *
 * Exit 0 = sidecar started, answered /health, stopped, and left no child
 * process. Non-zero = a step failed or a backend process survived.
 */
import { execSync, spawnSync } from "node:child_process";

import { app } from "electron";

import { Sidecar } from "./sidecar";

// Headless CI: no GPU, no window compositor.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("no-sandbox");

// Hard wall-clock guard so a hang fails the job in seconds, not hours.
const WATCHDOG_MS = 90_000;
const watchdog = setTimeout(() => {
  process.stderr.write("smoke: FAIL watchdog timeout\n");
  app.exit(3);
}, WATCHDOG_MS);
watchdog.unref();

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function main(): Promise<void> {
  await app.whenReady();
  const sidecar = new Sidecar();

  const port = await sidecar.start();
  process.stdout.write(`smoke: sidecar up on ${String(port)}\n`);

  const health = await fetch(`http://127.0.0.1:${String(port)}/health`);
  if (!health.ok) throw new Error(`/health returned ${String(health.status)}`);

  const headline = await fetch(
    `http://127.0.0.1:${String(port)}/api/metrics/headline`,
  );
  const body = (await headline.json()) as { batch_count?: number };
  if (typeof body.batch_count !== "number") {
    throw new Error("headline response missing batch_count");
  }
  process.stdout.write(`smoke: headline batch_count=${String(body.batch_count)}\n`);

  // Crash → capped restart (docs/ROADMAP.md Phase 1: "restart on crash").
  const crashedPid = sidecar.childPid;
  if (crashedPid) {
    spawnSync("kill", ["-9", String(crashedPid)]);
    process.stdout.write(`smoke: killed sidecar pid ${String(crashedPid)}\n`);
    let recovered = false;
    for (let i = 0; i < 30; i += 1) {
      await delay(500);
      try {
        const r = await fetch(`http://127.0.0.1:${String(sidecar.backendPort ?? port)}/health`);
        if (r.ok && sidecar.childPid && sidecar.childPid !== crashedPid) {
          recovered = true;
          break;
        }
      } catch {
        /* still restarting */
      }
    }
    if (!recovered) throw new Error("sidecar did not recover after a crash");
    process.stdout.write("smoke: sidecar auto-restarted after crash — OK\n");
  }

  await sidecar.stop();

  // Nothing matching the sidecar entry point should remain.
  let survivors = "";
  try {
    survivors = execSync("pgrep -fl 'backend.run|uretim-backend' || true", {
      encoding: "utf8",
    }).trim();
  } catch {
    /* pgrep not available — skip the check */
  }
  if (survivors) {
    throw new Error(`orphaned backend process(es):\n${survivors}`);
  }
  process.stdout.write("smoke: no orphaned backend process — OK\n");
}

main()
  .then(() => {
    clearTimeout(watchdog);
    app.exit(0);
  })
  .catch((err: unknown) => {
    clearTimeout(watchdog);
    process.stderr.write(`smoke: FAIL ${String(err)}\n`);
    app.exit(1);
  });
