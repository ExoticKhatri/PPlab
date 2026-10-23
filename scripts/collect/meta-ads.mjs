// Meta Ad Library: active ads matching each keyword, per country.
//
//   node meta-ads.mjs <group-slug>
//
// Meta's API only covers political ads outside the EU, so this reads the
// public Ad Library website with Playwright, scrolling until
// maxAdsPerKeyword ads have loaded (or scrolling stops adding any).
// Keywords run in `concurrency` tabs at once. Each ad gets its language
// (from the script it is written in) and each advertiser a rule-based tag
// from sellerTerms / selfTerms — a first pass the skill then checks by hand.

import { chromium } from "playwright";
import { loadConfig, log, mapLimit, mdTable, pause, progress, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "meta-ads";

const SCRIPTS = [
  ["Hindi/Marathi (Devanagari)", /[\u0900-\u097F]/g],
  ["Bengali", /[\u0980-\u09FF]/g],
  ["Punjabi", /[\u0A00-\u0A7F]/g],
  ["Gujarati", /[\u0A80-\u0AFF]/g],
  ["Odia", /[\u0B00-\u0B7F]/g],
  ["Tamil", /[\u0B80-\u0BFF]/g],
  ["Telugu", /[\u0C00-\u0C7F]/g],
  ["Kannada", /[\u0C80-\u0CFF]/g],
  ["Malayalam", /[\u0D00-\u0D7F]/g],
];
const HINGLISH = /\b(aap|aapke|apne|apni|karein|kare|karo|hai|hain|nahi|abhi|sirf|liye|mein|bhi|kaise|sath|saath)\b/gi;

// Language of an ad from its script; Latin-script ads with several Hindi words count as Hinglish.
function languageOf(text) {
  let best = null;
  let bestCount = 0;
  for (const [name, re] of SCRIPTS) {
    const n = (text.match(re) ?? []).length;
    if (n > bestCount) [best, bestCount] = [name, n];
  }
  if (bestCount >= 10) return best;
  if ((text.match(HINGLISH) ?? []).length >= 3) return "Hinglish (Latin script)";
  return /[a-z]{3,}/i.test(text) ? "English" : "unknown";
}

const hits = (text, terms) => terms.filter((t) => text.includes(t.toLowerCase())).length;

// "seller" = sells to the group, "self" = the group advertising itself, "noise" = neither.
function tagAdvertiser(ads, c) {
  if (!c.sellerTerms.length && !c.selfTerms.length) return "untagged";
  const text = ads.map((a) => `${a.advertiser} ${a.body}`).join(" ").toLowerCase();
  const seller = hits(text, c.sellerTerms);
  const self = hits(text, c.selfTerms);
  if (!seller && !self) return "noise";
  return self > seller ? "self" : "seller";
}

function searchUrl(keyword, country, activeOnly) {
  const params = new URLSearchParams({
    active_status: activeOnly ? "active" : "all",
    ad_type: "all",
    country,
    media_type: "all",
    q: keyword,
    search_type: "keyword_unordered",
  });
  return `https://www.facebook.com/ads/library/?${params}`;
}

async function scrapeKeyword(page, keyword, country, c) {
  await page.goto(searchUrl(keyword, country, c.activeOnly), { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(5000);
  let last = -1;
  let stalled = 0;
  for (let round = 0; round < c.maxScrollRounds; round++) {
    const count = await page.evaluate(() => (document.body.innerText.match(/Library ID/g) || []).length);
    if (count >= c.maxAdsPerKeyword) break;
    stalled = count === last ? stalled + 1 : 0;
    if (stalled >= 3) break;
    last = count;
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(1500);
  }
  return page.evaluate(() => document.body.innerText);
}

// One record per ad card in the page text.
function parseAds(text, keyword, country, now = new Date()) {
  const ads = [];
  for (const chunk of text.split("Library ID: ").slice(1)) {
    const id = chunk.match(/^\d+/)?.[0];
    if (!id) continue;
    const started = chunk.match(/Started running on (\d{1,2} \w{3} \d{4})/)?.[1] ?? null;
    const afterDetails = chunk.split(/See (?:ad|summary) details\n/)[1] ?? "";
    const advertiser = afterDetails.split("\n")[0]?.trim() ?? "";
    const end = afterDetails.search(/\n​\nActive\n|\n​\nInactive\n/);
    const body = (end > 0 ? afterDetails.slice(0, end) : afterDetails)
      .split("\n")
      .slice(2)
      .join("\n")
      .replace(/Sorry, we're having trouble with playing this video\.\n?/g, "")
      .replace(/​/g, "")
      .trim()
      .slice(0, 1500);
    const days = started ? Math.round((now - new Date(started)) / 86_400_000) : null;
    ads.push({ id, country, keyword, advertiser, started, days, multiVersion: chunk.includes("multiple versions"), body });
  }
  return ads;
}

function buildMarkdown(config, ads, perKeyword) {
  const c = config.metaAds;
  const byAdvertiser = new Map();
  for (const ad of ads) {
    const entry = byAdvertiser.get(ad.advertiser) ?? { advertiser: ad.advertiser, ads: 0, longest: 0, sample: "", countries: new Set(), list: [] };
    entry.list.push(ad);
    entry.ads++;
    entry.longest = Math.max(entry.longest, ad.days ?? 0);
    entry.countries.add(ad.country);
    if (ad.body.length > entry.sample.length) entry.sample = ad.body;
    byAdvertiser.set(ad.advertiser, entry);
  }
  const advertisers = [...byAdvertiser.values()].filter((a) => a.advertiser).map((a) => ({ ...a, tag: tagAdvertiser(a.list, c) }));
  const tagged = c.sellerTerms.length || c.selfTerms.length;
  const TAG_LABEL = { seller: "sells to the group", self: "the group advertising itself", noise: "noise (neither)" };
  const tagRows = ["seller", "self", "noise"].map((t) => {
    const list = advertisers.filter((a) => a.tag === t);
    return [TAG_LABEL[t], list.length, list.reduce((n, a) => n + a.ads, 0), list.sort((a, b) => b.ads - a.ads).slice(0, 6).map((a) => a.advertiser).join(", ")];
  });
  const langs = [...ads.reduce((m, a) => m.set(a.language, (m.get(a.language) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]);
  const longest = [...ads].filter((a) => a.days !== null).sort((a, b) => b.days - a.days).slice(0, 15);

  return `# Meta Ad Library — ${config.group}

Collected ${today()} · countries: ${config.metaAds.countries.join(", ")} · ${config.metaAds.keywords.length} keywords · up to ${config.metaAds.maxAdsPerKeyword} ads per keyword · ${ads.length} unique ads · ${advertisers.length} advertisers

Raw data: \`raw/meta-ads/ads.json\`

## Ads found per keyword

${mdTable(["Country", "Keyword", "Ads loaded"], perKeyword.map((k) => [k.country, k.keyword, k.failed ? "failed" : k.count]))}

## Advertiser tags (rule-based first pass)

${tagged ? `Tagged by matching sellerTerms (${c.sellerTerms.join(", ") || "—"}) and selfTerms (${c.selfTerms.join(", ") || "—"}) in the advertiser name and ad text. A rough estimate — check samples before quoting numbers.

${mdTable(["Tag", "Advertisers", "Ads", "Biggest"], tagRows)}` : "_Not tagged — set metaAds.sellerTerms and metaAds.selfTerms in config.json._"}

## Ad language

${mdTable(["Language", "Ads", "Share"], langs.map(([l, n]) => [l, n, `${Math.round((n / ads.length) * 100)}%`]))}

## Advertisers (by number of ads)

Keyword matching is loose, so this list includes noise (ads that only mention a keyword). The skill's insights section separates real sellers to this group from the rest.

${mdTable(
  ["Advertiser", "Tag", "Ads", "Longest running", "Countries", "Sample"],
  advertisers.sort((a, b) => b.ads - a.ads || b.longest - a.longest).slice(0, 80).map((a) => [a.advertiser, a.tag, a.ads, `${a.longest}d`, [...a.countries].join(", "), quote(a.sample, 140)]),
)}

## Longest-running ads

${longest.map((a) => `- **${a.advertiser}** · ${a.days} days · ${a.country} — “${quote(a.body, 200)}”`).join("\n") || "_None._"}

## Insights

_To be written by the group-analysis skill: can Meta reach this group, who sells to them (by category, crowded vs open), the pains sellers lead with, and what has lasted._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.metaAds;
  if (c.keywords.length === 0) throw new Error("metaAds.keywords is empty in config.json");
  const dir = rawDir(config.slug, P);

  const browser = await chromium.launch();
  const jobs = c.countries.flatMap((country) => c.keywords.map((keyword) => ({ country, keyword })));
  const tabs = Math.max(1, Math.min(c.concurrency, jobs.length));
  // One tab per worker; mapLimit never runs more workers than tabs.
  const pool = await Promise.all(Array.from({ length: tabs }, () => browser.newPage({ locale: "en-US", viewport: { width: 1400, height: 1000 } })));
  const ads = new Map();
  const bar = progress(jobs.length);

  const perKeyword = await mapLimit(jobs, tabs, async ({ country, keyword }) => {
    const page = pool.pop();
    try {
      const text = await retry(() => scrapeKeyword(page, keyword, country, c), { label: `${country} "${keyword}"`, platform: P });
      const parsed = parseAds(text, keyword, country);
      for (const ad of parsed) {
        const prev = ads.get(ad.id);
        if (prev) prev.keywords = [...new Set([...prev.keywords, keyword])];
        else ads.set(ad.id, { ...ad, keywords: [keyword], language: languageOf(ad.body) });
      }
      log(P, `[${bar.tick()}] ${country} "${keyword}": ${parsed.length} ads`);
      return { country, keyword, count: parsed.length };
    } catch (error) {
      log(P, `[${bar.tick()}] ${country} "${keyword}" failed, skipped: ${error.message}`);
      return { country, keyword, count: 0, failed: true };
    } finally {
      pool.push(page);
      await pause();
    }
  });
  await browser.close();

  const list = [...ads.values()].map(({ keyword, ...rest }) => rest);
  writeJson(`${dir}/ads.json`, list);
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, list, perKeyword));
  log(P, `wrote ${file}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
