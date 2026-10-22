import { chromium } from "playwright";
import fs from "node:fs";
const CITIES = process.argv.slice(2);
const PLACES = Number(process.env.PLACES || 8);
const b = await chromium.launch();
const p = await b.newPage({ locale: "en-IN", viewport: { width: 1300, height: 900 } });
const out = [];
for (const city of CITIES) {
  await p.goto(`https://www.google.com/maps/search/${encodeURIComponent(`pathology lab in ${city}`)}?hl=en`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(5000);
  const links = (await p.$$eval('a[href*="/maps/place/"]', (as) => as.map((a) => a.href))).slice(0, PLACES);
  for (const link of links) {
    try {
      await p.goto(link + (link.includes("?") ? "&" : "?") + "hl=en", { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(3500);
      const name = await p.$eval("h1", (h) => h.innerText).catch(() => "?");
      const tab = p.locator('button[role="tab"]:has-text("Reviews")');
      if (await tab.count()) { await tab.first().click(); await p.waitForTimeout(2500); }
      const sort = p.locator('button[aria-label*="Sort"]');
      if (await sort.count()) { await sort.first().click(); await p.waitForTimeout(800); const low = p.locator('div[role="menuitemradio"]:has-text("Lowest")'); if (await low.count()) { await low.first().click(); await p.waitForTimeout(2500); } }
      for (let i = 0; i < 6; i++) { await p.mouse.move(400, 600); await p.mouse.wheel(0, 3000); await p.waitForTimeout(900); }
      const more = p.locator('button:has-text("More")'); const n = Math.min(await more.count(), 30); for (let i = 0; i < n; i++) await more.nth(i).click().catch(() => {});
      const rev = await p.$$eval("div[data-review-id]", (els) => els.map((e) => ({ text: e.querySelector(".wiI7pd")?.innerText || "", stars: e.querySelector('span[role="img"]')?.getAttribute("aria-label") || "" })).filter((r) => r.text));
      const uniq = [...new Map(rev.map((r) => [r.text, r])).values()];
      for (const r of uniq) out.push({ city, place: name, ...r });
      console.log(city, "|", name.slice(0, 50), uniq.length);
    } catch (e) { console.log("ERR", e.message.slice(0, 80)); }
  }
}
fs.writeFileSync(process.env.OUT || "gmaps.json", JSON.stringify(out));
console.log("reviews", out.length);
await b.close();
