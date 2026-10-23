// One-time manual sign-in for the shared browser profile.
//
//   node login.mjs
//
// Opens the profile browser on Google and Reddit sign-in pages. Sign in by
// hand (any 2FA included), then close the browser window. The session is
// saved in the profile folder (outside the repo) and reused by collectors.
// Re-run whenever a collector reports that it's signed out.

import { openProfileBrowser, PROFILE_DIR } from "./lib/browser.mjs";

const SITES = [
  ["Google", "https://accounts.google.com/"],
  ["Reddit", "https://www.reddit.com/login/"],
];

const { context, page, executablePath } = await openProfileBrowser();
console.log(`Browser: ${executablePath}`);
console.log(`Profile: ${PROFILE_DIR}`);
await page.goto(SITES[0][1]);
for (const [, url] of SITES.slice(1)) {
  const tab = await context.newPage();
  await tab.goto(url);
}
console.log("\nSign in to each tab by hand, then close the browser window to save the session.");
await new Promise((resolve) => context.on("close", resolve));
console.log("Session saved.");
