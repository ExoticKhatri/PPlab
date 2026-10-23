// Pre-flight check before a long collection run.
//
//   node doctor.mjs          # tools + browser + sign-ins
//   node doctor.mjs --quick  # skip opening the browser (no sign-in check)
//
// Exits 1 if anything a collector needs is missing, with the fix for each.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { closeProfileBrowser, findBrowser, openProfileBrowser, PROFILE_DIR } from "./lib/browser.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const quick = process.argv.includes("--quick");
const results = [];
const check = (name, ok, detail, fix) => results.push({ name, ok, detail, fix });

// npm packages
for (const pkg of ["playwright", "google-play-scraper", "google-trends-api"]) {
  check(`npm: ${pkg}`, fs.existsSync(path.join(here, "node_modules", pkg)), "", "cd scripts/collect && npm run setup");
}

// Playwright's own Chromium (used headless by meta-ads / play-store search)
const bundled = chromium.executablePath();
check("Playwright Chromium", fs.existsSync(bundled), bundled, "npx playwright install chromium");

// yt-dlp
const venvPython = path.join(here, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
const yt = fs.existsSync(venvPython) ? spawnSync(venvPython, ["-m", "yt_dlp", "--version"], { encoding: "utf8" }) : { status: 1 };
check("yt-dlp", yt.status === 0, yt.stdout?.trim() ?? "", "python -m venv .venv && .venv/Scripts/python -m pip install -U yt-dlp");

// Brave / Chrome for the signed-in profile
const browser = findBrowser();
check("Brave/Chrome for signed-in collectors", Boolean(browser), browser ?? "not found", "Install Brave, or set PPLAB_BROWSER_PATH");
check("Automation profile folder", fs.existsSync(PROFILE_DIR), PROFILE_DIR, "node login.mjs");

if (!quick && browser && fs.existsSync(PROFILE_DIR)) {
  let context;
  try {
    ({ context } = await openProfileBrowser());
    const page = context.pages()[0];
    await page.goto("https://www.reddit.com/", { waitUntil: "domcontentloaded" });
    const me = await page.evaluate(async () => {
      const r = await fetch("https://www.reddit.com/api/me.json", { credentials: "include" });
      try {
        const j = await r.json();
        return j?.data?.name ?? j?.name ?? null;
      } catch {
        return null;
      }
    });
    check("Reddit signed in", Boolean(me), me ? `u/${me}` : "signed out", "node login.mjs → sign in to Reddit → close the window");
    const cookies = await context.cookies("https://www.google.com");
    const google = cookies.some((c) => c.name === "SID" || c.name === "__Secure-1PSID");
    check("Google signed in", google, google ? "session cookie present" : "signed out", "node login.mjs → sign in to Google → close the window (optional, reduces captchas)");
  } catch (error) {
    check("Open automation profile", false, error.message.split("\n")[0], "Close any Brave window using the automation profile and retry");
  } finally {
    await closeProfileBrowser(context);
  }
}

// Internet
try {
  const res = await fetch("https://www.google.com/generate_204");
  check("Internet", res.status === 204 || res.ok, `HTTP ${res.status}`, "Check the connection");
} catch (error) {
  check("Internet", false, error.message, "Check the connection");
}

for (const r of results) console.log(`${r.ok ? "OK  " : "FAIL"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}${r.ok ? "" : `\n     fix: ${r.fix}`}`);
const failed = results.filter((r) => !r.ok && r.name !== "Google signed in");
console.log(failed.length ? `\n${failed.length} problem(s) — fix before collecting.` : "\nAll good.");
process.exit(failed.length ? 1 : 0);
