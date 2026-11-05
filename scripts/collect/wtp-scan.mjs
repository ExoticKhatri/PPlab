// Willingness-to-pay scan: public signals that people already pay for one task on its own.
//
//   node wtp-scan.mjs                  # every idea in analyses/wtp-scan/config.json
//   node wtp-scan.mjs dev-milestone    # just these idea ids
//
// Per idea, three automated signals (raw in analyses/wtp-scan/raw/results.json):
//   1. jobs     — Naukri job count for the role that does the task (money already spent on it)
//   2. ads      — Google sponsored results and ₹ prices on buyer searches ("… consultant", "… software")
//   3. intent   — Google autocomplete suggestions with buying words (price, fees, software, near me…)
// Naukri and Google pages are read in the signed-in Brave profile (headless gets blocked);
// autocomplete is plain HTTP. Results are checkpointed after every idea, so a stopped run resumes.
// The fourth signal — paid services or standalone tools for exactly this task — comes from the
// deep dives and is scored by hand in app/_components/idea-list/wtp-data.ts.

import fs from "node:fs";
import path from "node:path";
import { closeProfileBrowser, isBlocked, openProfileBrowser } from "./lib/browser.mjs";
import { ANALYSES_DIR, log, pause, writeJson } from "./lib/config.mjs";

const P = "wtp-scan";
const DIR = path.join(ANALYSES_DIR, "wtp-scan");
const RAW = path.join(DIR, "raw", "results.json");
const INTENT_WORDS = ["price", "fees", "charges", "cost", "software", "consultant", "services", "near me", "app", "format"];
const INTENT_RE = /\b(price|pricing|fees?|charges?|cost|software|consultants?|consultancy|services?|near me|app|agency|company|companies|outsourcing|best)\b/i;

async function suggest(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=in&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`suggest ${res.status}`);
  const body = await res.json();
  return Array.isArray(body?.[1]) ? body[1] : [];
}

async function intentSuggestions(seeds) {
  const found = new Set();
  for (const seed of seeds) {
    for (const probe of [seed, ...INTENT_WORDS.map((w) => `${seed} ${w}`)]) {
      const list = await suggest(probe).catch(() => []);
      for (const s of list) if (INTENT_RE.test(s)) found.add(s.toLowerCase());
      await pause(150, 400);
    }
  }
  return [...found];
}

// "1 - 20 of 562" on Naukri's results page; 0 when it says no jobs were found.
async function naukriCount(page, role) {
  const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await page.goto(`https://www.naukri.com/${slug}-jobs`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(4000 + Math.random() * 2000);
  if (await isBlocked(page)) throw new Error("Naukri blocked the page");
  const text = await page.evaluate(() => document.body.innerText);
  const m = text.match(/\d[\d,]*\s*-\s*\d[\d,]*\s+of\s+([\d,]+)/i);
  if (m) return Number(m[1].replace(/,/g, ""));
  if (/no (jobs|results) found|0 jobs/i.test(text)) return 0;
  return null;
}

async function googleSignals(page, query) {
  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=in`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(4000 + Math.random() * 2000);
  if (/\/sorry\//.test(page.url()) || (await isBlocked(page))) throw new Error("Google captcha");
  const text = await page.evaluate(() => document.body.innerText);
  const ads = (text.match(/^Sponsored( results?)?$/gim) ?? []).length;
  const prices = [...new Set(text.match(/(₹|\bRs\.?|\bINR)\s?\d[\d,]*(\.\d+)?(\s?(lakh|L|k|\/-))?/gi) ?? [])].slice(0, 12);
  const serviceWords = (text.match(/\b(consultant|consultancy|services|fees|charges|pricing|book a demo|free trial)\b/gi) ?? []).length;
  return { query, ads, prices, serviceWords };
}

// Compact per-idea numbers for the Ideas tab (committed; no personal data) and a readable table.
function writeSummary(config, results) {
  const summary = {};
  const rows = [];
  for (const idea of config.ideas) {
    const r = results[idea.id];
    if (!r?.complete) continue;
    const counts = r.jobs.map((j) => j.count).filter((c) => c !== null);
    const s = {
      jobs: counts.length ? Math.max(...counts) : null,
      ads: r.google.reduce((n, g) => n + g.ads, 0),
      prices: r.google.reduce((n, g) => n + g.prices.length, 0),
      intent: r.intent.length,
    };
    summary[idea.id] = s;
    rows.push(`| ${idea.id} | ${r.jobs.map((j) => `${j.role}: ${j.count ?? "?"}`).join("; ")} | ${s.ads} | ${r.google.flatMap((g) => g.prices).slice(0, 4).join(", ") || "—"} | ${s.intent} | ${r.intent.slice(0, 4).join("; ") || "—"} |`);
  }
  writeJson(path.join(ANALYSES_DIR, "..", "app", "_components", "idea-list", "wtp-scan.json"), summary);
  const md = [
    "# Willingness-to-pay scan",
    "",
    `Collected ${new Date().toISOString().slice(0, 10)} by \`scripts/collect/wtp-scan.mjs\` ([config.json](config.json)). Naukri job counts are for the role that does the task (the highest of the roles searched); ads and prices are from Google result pages for buyer searches; intent counts autocomplete suggestions with buying words. The hand-scored \"paid alone\" level and the combined score live in \`app/_components/idea-list/wtp-data.ts\`.`,
    "",
    "| Idea | Naukri jobs | Google ads | ₹ prices seen | Intent suggestions | Examples |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(DIR, "wtp-scan.md"), md);
  log(P, `summary: ${rows.length} ideas → app/_components/idea-list/wtp-scan.json, analyses/wtp-scan/wtp-scan.md`);
}

async function main() {
  if (process.argv.includes("--summary")) {
    const config = JSON.parse(fs.readFileSync(path.join(DIR, "config.json"), "utf8"));
    writeSummary(config, fs.existsSync(RAW) ? JSON.parse(fs.readFileSync(RAW, "utf8")) : {});
    return;
  }
  const only = process.argv.slice(2);
  const config = JSON.parse(fs.readFileSync(path.join(DIR, "config.json"), "utf8"));
  const ideas = config.ideas.filter((i) => !only.length || only.includes(i.id));
  const results = fs.existsSync(RAW) ? JSON.parse(fs.readFileSync(RAW, "utf8")) : {};
  const todo = ideas.filter((i) => only.length || !results[i.id]?.complete);
  log(P, `${todo.length} ideas to scan (${ideas.length - todo.length} already done)`);
  if (!todo.length) return;

  const { context, page } = await openProfileBrowser();
  try {
    for (const [n, idea] of todo.entries()) {
      const r = { id: idea.id, scannedAt: new Date().toISOString(), jobs: [], google: [], intent: [] };
      for (const role of idea.jobs) {
        const count = await naukriCount(page, role).catch((e) => (log(P, `  naukri "${role}": ${e.message}`), null));
        r.jobs.push({ role, count });
        await pause(3000, 6000);
      }
      for (const q of idea.google) {
        try {
          r.google.push(await googleSignals(page, q).catch((e) => (/captcha/i.test(e.message) ? Promise.reject(e) : googleSignals(page, q))));
        } catch (e) {
          if (/captcha/i.test(e.message)) {
            log(P, `  google "${q}": captcha — stopping; solve it in the window and re-run to resume`);
            throw e;
          }
          log(P, `  google "${q}": ${e.message.split("\n")[0]} — skipped`);
          r.google.push({ query: q, ads: 0, prices: [], serviceWords: 0, failed: true });
        }
        await pause(8000, 15000);
      }
      r.intent = await intentSuggestions(idea.seeds);
      r.complete = true;
      results[idea.id] = r;
      writeJson(RAW, results);
      const jobs = r.jobs.map((j) => j.count ?? "?").join("/");
      const ads = r.google.map((g) => g.ads).join("/");
      log(P, `[${n + 1}/${todo.length}] ${idea.id}: jobs ${jobs} · ads ${ads} · prices ${r.google.reduce((s, g) => s + g.prices.length, 0)} · intent ${r.intent.length}`);
    }
  } finally {
    await closeProfileBrowser(context);
    writeSummary(config, results);
  }
  log(P, `done. Raw: ${RAW}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
