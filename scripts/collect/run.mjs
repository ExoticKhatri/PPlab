// Run every enabled collector for a group, one after another.
//
//   node run.mjs <group-slug>              # platforms from config.json
//   node run.mjs <group-slug> youtube      # just these platforms
//   node run.mjs <group-slug> --skip-doctor   # skip the pre-flight check
//
// A failing platform is reported and skipped; the rest still run.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isEnabled, loadConfig, PLATFORMS } from "./lib/config.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const skipDoctor = args.includes("--skip-doctor");
const [slug, ...only] = args.filter((a) => !a.startsWith("--"));
const config = loadConfig(slug);

const unknown = only.filter((p) => !PLATFORMS.includes(p));
if (unknown.length) {
  console.error(`Unknown platform(s): ${unknown.join(", ")}. Available: ${PLATFORMS.join(", ")}`);
  process.exit(1);
}

const targets = only.length ? only : PLATFORMS.filter((p) => isEnabled(config, p));
const SIGNED_IN = ["google-search", "reddit", "google-maps"];

// Pre-flight: tools, browser and (if needed) sign-ins. Fail fast instead of
// discovering a missing tool an hour into a run.
if (!skipDoctor) {
  const needsBrowser = targets.some((p) => SIGNED_IN.includes(p));
  console.log("=== doctor ===");
  const doc = spawnSync(process.execPath, [path.join(here, "doctor.mjs"), ...(needsBrowser ? [] : ["--quick"])], { stdio: "inherit" });
  if (doc.status !== 0) {
    console.error("\nDoctor found problems — fix them (or re-run with --skip-doctor).");
    process.exit(1);
  }
}

const results = [];
for (const platform of targets) {
  console.log(`\n=== ${platform} ===`);
  const started = Date.now();
  const res = spawnSync(process.execPath, [path.join(here, `${platform}.mjs`), slug], { stdio: "inherit" });
  results.push({ platform, ok: res.status === 0, seconds: Math.round((Date.now() - started) / 1000) });
}

console.log("\n=== summary ===");
for (const r of results) console.log(`${r.ok ? "OK  " : "FAIL"} ${r.platform} (${r.seconds}s)`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
