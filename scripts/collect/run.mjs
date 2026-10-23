// Run every enabled collector for a group.
//
//   node run.mjs <group-slug>                 # platforms from config.json, in two parallel lanes
//   node run.mjs <group-slug> youtube reddit  # just these platforms
//   node run.mjs <group-slug> --serial        # one platform at a time
//   node run.mjs <group-slug> --skip-doctor   # skip the pre-flight check
//
// Lanes (default): platforms that don't need the signed-in browser all run at
// once; the signed-in ones (Google result pages, Reddit, Maps) share one Brave
// profile, so they run one after another — alongside the first lane.
// Every output line is prefixed with its platform and also written to
// analyses/<slug>/raw/<platform>/run.log. A failing platform is reported and
// skipped; the rest still run.

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { groupDir, isEnabled, loadConfig, PLATFORMS, rawDir } from "./lib/config.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const skipDoctor = args.includes("--skip-doctor");
const serial = args.includes("--serial");
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

// Run one collector; prefix its lines and copy them to its run.log.
function runPlatform(platform) {
  return new Promise((resolve) => {
    const started = Date.now();
    const logFile = fs.createWriteStream(path.join(rawDir(slug, platform), "run.log"));
    const tag = `[${platform}]`;
    console.log(`${tag} started`);
    const child = spawn(process.execPath, [path.join(here, `${platform}.mjs`), slug], { stdio: ["ignore", "pipe", "pipe"] });
    const pipeLines = (stream, write) => {
      let rest = "";
      stream.setEncoding("utf8");
      stream.on("data", (chunk) => {
        const lines = (rest + chunk).split(/\r?\n/);
        rest = lines.pop();
        for (const line of lines) emit(line, write);
      });
      stream.on("end", () => rest && emit(rest, write));
    };
    const emit = (line, write) => {
      logFile.write(`${line}\n`);
      write(line.startsWith(tag) ? line : `${tag} ${line}`);
    };
    pipeLines(child.stdout, (l) => console.log(l));
    pipeLines(child.stderr, (l) => console.error(l));
    child.on("close", (code) => {
      logFile.end();
      const seconds = Math.round((Date.now() - started) / 1000);
      console.log(`${tag} ${code === 0 ? "finished" : `FAILED (exit ${code})`} in ${formatTime(seconds)}`);
      resolve({ platform, ok: code === 0, seconds });
    });
  });
}

async function sequence(list) {
  const out = [];
  for (const p of list) out.push(await runPlatform(p));
  return out;
}

function formatTime(seconds) {
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

// The "Collected …" line each collector writes at the top of its .md: counts kept/dropped.
function headline(platform) {
  const file = path.join(groupDir(slug), `${platform}.md`);
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8").split("\n").find((l) => l.startsWith("Collected ")) ?? "";
}

const started = Date.now();
let results;
if (serial) {
  results = await sequence(targets);
} else {
  const laneA = targets.filter((p) => !SIGNED_IN.includes(p));
  const laneB = targets.filter((p) => SIGNED_IN.includes(p));
  console.log(`\nLane A (parallel): ${laneA.join(", ") || "—"}\nLane B (signed-in browser, one at a time): ${laneB.join(" → ") || "—"}\n`);
  const [a, b] = await Promise.all([Promise.all(laneA.map(runPlatform)), sequence(laneB)]);
  results = targets.map((p) => [...a, ...b].find((r) => r.platform === p));
}

console.log(`\n=== summary (${formatTime(Math.round((Date.now() - started) / 1000))} total) ===`);
for (const r of results) {
  console.log(`${r.ok ? "OK  " : "FAIL"} ${r.platform} (${formatTime(r.seconds)})`);
  const line = r.ok ? headline(r.platform) : `see analyses/${slug}/raw/${r.platform}/run.log`;
  if (line) console.log(`     ${line}`);
}
process.exit(results.every((r) => r.ok) ? 0 : 1);
