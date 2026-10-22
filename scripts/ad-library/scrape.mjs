import { chromium } from "playwright";
import fs from "node:fs";

const KEYWORDS = process.argv.slice(2);
const out = "raw";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ locale: "en-US", viewport: { width: 1400, height: 1000 } });

for (const q of KEYWORDS) {
  const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&media_type=all&q=${encodeURIComponent(q)}&search_type=keyword_unordered`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(6000);
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(1500);
    }
    const text = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`${out}/${q.replace(/\W+/g, "_")}.txt`, text);
    const n = (text.match(/Library ID/g) || []).length;
    console.log(`${q}: ${n} ads, ${text.length} chars`);
  } catch (e) {
    console.log(`${q}: FAILED ${e.message}`);
  }
}
await browser.close();
