// Meta Ad Library: active ads matching each keyword, per country.
//
//   node meta-ads.mjs <group-slug>
//
// Meta's API only covers political ads outside the EU, so this reads the
// public Ad Library website with Playwright, scrolling until
// maxAdsPerKeyword ads have loaded (or scrolling stops adding any).

import { chromium } from "playwright";
import { loadConfig, log, mdTable, pause, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "meta-ads";

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
  const byAdvertiser = new Map();
  for (const ad of ads) {
    const entry = byAdvertiser.get(ad.advertiser) ?? { advertiser: ad.advertiser, ads: 0, longest: 0, sample: "", countries: new Set() };
    entry.ads++;
    entry.longest = Math.max(entry.longest, ad.days ?? 0);
    entry.countries.add(ad.country);
    if (ad.body.length > entry.sample.length) entry.sample = ad.body;
    byAdvertiser.set(ad.advertiser, entry);
  }
  const advertisers = [...byAdvertiser.values()].filter((a) => a.advertiser);
  const longest = [...ads].filter((a) => a.days !== null).sort((a, b) => b.days - a.days).slice(0, 15);

  return `# Meta Ad Library — ${config.group}

Collected ${today()} · countries: ${config.metaAds.countries.join(", ")} · ${config.metaAds.keywords.length} keywords · up to ${config.metaAds.maxAdsPerKeyword} ads per keyword · ${ads.length} unique ads · ${advertisers.length} advertisers

Raw data: \`raw/meta-ads/ads.json\`

## Ads found per keyword

${mdTable(["Country", "Keyword", "Ads loaded"], perKeyword.map((k) => [k.country, k.keyword, k.count]))}

## Advertisers (by number of ads)

Keyword matching is loose, so this list includes noise (ads that only mention a keyword). The skill's insights section separates real sellers to this group from the rest.

${mdTable(
  ["Advertiser", "Ads", "Longest running", "Countries", "Sample"],
  advertisers.sort((a, b) => b.ads - a.ads || b.longest - a.longest).slice(0, 80).map((a) => [a.advertiser, a.ads, `${a.longest}d`, [...a.countries].join(", "), quote(a.sample, 140)]),
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
  const page = await browser.newPage({ locale: "en-US", viewport: { width: 1400, height: 1000 } });
  const ads = new Map();
  const perKeyword = [];

  for (const country of c.countries) {
    for (const keyword of c.keywords) {
      try {
        const text = await retry(() => scrapeKeyword(page, keyword, country, c), { label: `${country} "${keyword}"`, platform: P });
        const parsed = parseAds(text, keyword, country);
        perKeyword.push({ country, keyword, count: parsed.length });
        for (const ad of parsed) {
          const prev = ads.get(ad.id);
          if (prev) prev.keywords = [...new Set([...prev.keywords, keyword])];
          else ads.set(ad.id, { ...ad, keywords: [keyword] });
        }
        log(P, `${country} "${keyword}": ${parsed.length} ads`);
      } catch (error) {
        perKeyword.push({ country, keyword, count: 0 });
        log(P, `${country} "${keyword}" failed: ${error.message}`);
      }
      await pause();
    }
  }
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
