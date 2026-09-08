/**
 * electron-builder afterPack hook — minimal ad-hoc re-sign for Phase 1.
 *
 * No Apple Developer ID yet. On macOS Sequoia+ a *packaged* Electron bundle
 * traps in V8's compiler at launch (EXC_BREAKPOINT) unless the executables that
 * run V8 carry the JIT entitlements. electron-builder skips signing entirely
 * with `identity: null`, so we re-sign just the Mach-O executables that need it
 * — the main app binary and the Helper apps — leaving the frameworks' own
 * linker signatures untouched (a `--deep` re-sign corrupts them).
 */
const { execFileSync } = require("node:child_process");
const { join } = require("node:path");

const ENTITLEMENTS = join(__dirname, "resources", "entitlements.mac.plist");

function adhocSign(target) {
  execFileSync(
    "codesign",
    [
      "--force",
      "--sign",
      "-",
      "--timestamp=none",
      "--entitlements",
      ENTITLEMENTS,
      target,
    ],
    { stdio: "inherit" },
  );
}

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  const product = context.packager.appInfo.productFilename;
  const appPath = join(context.appOutDir, `${product}.app`);
  const frameworks = join(appPath, "Contents", "Frameworks");

  // Helpers first (inside-out), then the main bundle.
  for (const helper of [
    `${product} Helper`,
    `${product} Helper (GPU)`,
    `${product} Helper (Plugin)`,
    `${product} Helper (Renderer)`,
  ]) {
    adhocSign(join(frameworks, `${helper}.app`));
  }
  adhocSign(appPath);

  execFileSync("codesign", ["--verify", "--strict", appPath], {
    stdio: "inherit",
  });
  // eslint-disable-next-line no-console
  console.log(`  • ad-hoc signed ${product}.app (JIT entitlements)`);
};
