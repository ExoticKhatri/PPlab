// Shared signed-in browser for sites that hide data from automated,
// signed-out browsers (Google results, Reddit, later Maps/LinkedIn).
//
// It drives the real Brave (or Chrome) install, visible, with its own
// persistent profile OUTSIDE the repo. You sign in once by hand with
// `node login.mjs`; every collector then reuses that session.
//
//   PPLAB_BROWSER_PATH  override the browser executable
//   PPLAB_PROFILE_DIR   override the profile folder (default ~/.pplab-browser-profile)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

export const PROFILE_DIR = process.env.PPLAB_PROFILE_DIR ?? path.join(os.homedir(), ".pplab-browser-profile");

function findBrowser() {
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

// Visible on purpose: sites treat a headed, signed-in real browser like a
// person. Keep runs small and human-paced (see lib/config.mjs pause()).
export async function openProfileBrowser() {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const executablePath = findBrowser() ?? undefined;
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath,
    viewport: { width: 1280, height: 900 },
    locale: "en-US",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const page = context.pages()[0] ?? (await context.newPage());
  return { context, page, executablePath: executablePath ?? "bundled chromium" };
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
  const text = await page.evaluate(() => document.body?.innerText?.slice(0, 3000) ?? "");
  return BLOCK_PATTERNS.some((re) => re.test(text)) || /\/sorry\/|captcha/i.test(page.url());
}
