// Shared signed-in browser for sites that hide data from automated,
// signed-out browsers (Google results/Maps, Reddit, later LinkedIn).
//
// It drives the real Brave (or Chrome) install, visible, with its own
// persistent profile OUTSIDE the repo. You sign in once by hand with
// `node login.mjs`; every collector then reuses that session.
//
// Tabs: restored tabs from a previous session are closed when a run
// starts, and every tab a run opened is closed when it ends
// (closeProfileBrowser), so the profile never piles up tabs.
//
//   PPLAB_BROWSER_PATH  override the browser executable
//   PPLAB_PROFILE_DIR   override the profile folder (default ~/.pplab-browser-profile)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

export const PROFILE_DIR = process.env.PPLAB_PROFILE_DIR ?? path.join(os.homedir(), ".pplab-browser-profile");

export function findBrowser() {
  if (process.env.PPLAB_BROWSER_PATH) return process.env.PPLAB_BROWSER_PATH;
  const local = process.env.LOCALAPPDATA ?? "";
  const candidates = [
    path.join(local, "BraveSoftware/Brave-Browser/Application/brave.exe"),
    "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    path.join(local, "Google/Chrome/Application/chrome.exe"),
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null; // null → Playwright's bundled Chromium
}

// Tell the profile to open a blank page on startup instead of restoring
// the last session's tabs (Chromium "restore_on_startup": 5 = new tab page),
// and mark the last exit as clean so no "restore pages?" bubble appears.
function disableSessionRestore() {
  const prefsFile = path.join(PROFILE_DIR, "Default", "Preferences");
  if (!fs.existsSync(prefsFile)) return;
  try {
    const prefs = JSON.parse(fs.readFileSync(prefsFile, "utf8"));
    prefs.session = { ...(prefs.session ?? {}), restore_on_startup: 5 };
    prefs.profile = { ...(prefs.profile ?? {}), exit_type: "Normal", exited_cleanly: true };
    fs.writeFileSync(prefsFile, JSON.stringify(prefs));
  } catch {
    // A corrupt or locked Preferences file isn't fatal — tabs are also closed below.
  }
}

// Visible on purpose: sites treat a headed, signed-in real browser like a
// person. Keep runs small and human-paced (see lib/config.mjs pause()).
export async function openProfileBrowser() {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  disableSessionRestore();
  const executablePath = findBrowser() ?? undefined;
  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath,
      viewport: { width: 1280, height: 900 },
      locale: "en-US",
      // The throttling flags keep background tabs working when a collector reads several pages at once.
      args: ["--disable-blink-features=AutomationControlled", "--no-first-run", "--no-default-browser-check", "--hide-crash-restore-bubble", "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"],
    });
  } catch (error) {
    if (/ProcessSingleton|already in use|profile.*lock/i.test(error.message)) {
      throw new Error(`The automation Brave profile is already open (${PROFILE_DIR}). Close that Brave window and re-run.`);
    }
    throw error;
  }
  // Close anything restored from a previous session; keep one clean tab.
  const pages = context.pages();
  const page = pages[0] ?? (await context.newPage());
  for (const extra of pages.slice(1)) await extra.close().catch(() => {});
  await page.goto("about:blank").catch(() => {});
  return { context, page, executablePath: executablePath ?? "bundled chromium" };
}

// Close every tab this run opened, leave a blank tab as the saved session,
// then shut the browser. Safe to call twice.
export async function closeProfileBrowser(context) {
  if (!context) return;
  try {
    const pages = context.pages();
    for (const p of pages.slice(1)) await p.close().catch(() => {});
    if (pages[0]) await pages[0].goto("about:blank").catch(() => {});
  } finally {
    await context.close().catch(() => {});
  }
}

const BLOCK_PATTERNS = [
  /unusual traffic/i,
  /not a robot/i,
  /verify you are human/i,
  /you've been blocked/i,
  /blocked by network security/i,
  /whoa there, pardner/i,
  /our systems have detected/i,
];

// True when the page is a captcha / block wall. Collectors stop instead of
// trying to get around it.
export async function isBlocked(page) {
  const text = await page.evaluate(() => document.body?.innerText?.slice(0, 3000) ?? "").catch(() => "");
  return BLOCK_PATTERNS.some((re) => re.test(text)) || /\/sorry\/|captcha/i.test(page.url());
}
