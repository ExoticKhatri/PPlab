import { chromium } from "playwright";
import fs from "node:fs";
const terms = ["school erp", "school management app", "school erp admin app", "school app teacher attendance", "school fee collection app", "campuscare", "myclassboard", "fedena", "skolaro", "edunext", "entab", "school diary app", "school parent app", "nextos school", "teachmint school", "school erp india", "preschool management app"];
const browser = await chromium.launch();
const page = await browser.newPage({ locale: "en-IN" });
const ids = new Set();
for (const t of terms) {
  await page.goto(`https://play.google.com/store/search?q=${encodeURIComponent(t)}&c=apps&gl=IN&hl=en_IN`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 3000); await page.waitForTimeout(800); }
  const found = await page.$$eval('a[href*="/store/apps/details?id="]', (as) => as.map((a) => new URL(a.href).searchParams.get("id")));
  found.forEach((id) => ids.add(id));
  console.log(t, found.length);
}
fs.writeFileSync("ids.json", JSON.stringify([...ids]));
console.log("total", ids.size);
await browser.close();
