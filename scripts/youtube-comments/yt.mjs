import { chromium } from "playwright";
import fs from "node:fs";
const QUERIES = process.argv.slice(2);
const PER_QUERY = Number(process.env.PER_QUERY || 6);
const b = await chromium.launch();
const p = await b.newPage({ locale: "en-IN" });
const videos = new Map();
for (const q of QUERIES) {
  await p.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(3500);
  const found = await p.$$eval("a#video-title", (as) => as.map((a) => ({ href: a.href, title: a.title })).filter((v) => v.href.includes("watch?v=")));
  for (const v of found.slice(0, PER_QUERY)) { const id = new URL(v.href).searchParams.get("v"); if (!videos.has(id)) videos.set(id, { id, title: v.title, q }); }
  console.log(q, found.length);
}
const comments = [];
for (const v of videos.values()) {
  try {
    await p.goto(`https://www.youtube.com/watch?v=${v.id}`, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(4000);
    await p.evaluate(() => window.scrollTo(0, 700));
    await p.waitForSelector("ytd-comments", { timeout: 15000 }).catch(() => {});
    for (let i = 0; i < 14; i++) { await p.evaluate(() => window.scrollBy(0, 2500)); await p.waitForTimeout(1500); }
    const cs = await p.$$eval("ytd-comment-thread-renderer #content-text", (els) => els.map((e) => e.innerText));
    for (const text of cs) comments.push({ video: v.id, title: v.title, q: v.q, text });
    console.log(v.id, cs.length, v.title.slice(0, 70));
  } catch (e) { console.log(v.id, "ERR", e.message.slice(0, 80)); }
}
fs.writeFileSync(process.env.OUT || "yt.json", JSON.stringify(comments));
console.log("videos", videos.size, "comments", comments.length);
await b.close();
