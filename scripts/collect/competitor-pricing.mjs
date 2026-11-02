// Competitor pricing: what the tools this group already pays for cost.
//
//   node competitor-pricing.mjs <group-slug>
//
// For each product in competitorPricing.products:
//   1. Vendor website: finds the pricing page (given URL, or a "pricing"/"plans"
//      link on the homepage, or <site>/pricing) and reads prices, plan words,
//      "book a demo" style signals and customer-count claims. Pages are
//      rendered in Playwright's own headless Chromium (not the signed-in
//      Brave profile), because most pricing pages are built with JavaScript.
//   2. Techjockey listing (Indian software directory): listed price, plans,
//      rating, review count and the reviews it publishes.
// Websites not given in config are found with a paced Bing search (the
// domain must contain the product name); Techjockey listings by trying the
// likely /detail/<slug> addresses. Capterra, G2 and GetApp sit behind
// Cloudflare and block automated visits, so they are not used.

import { chromium } from "playwright";
import { loadConfig, log, mdTable, pause, progress, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "competitor-pricing";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const HEADERS = { "user-agent": UA, "accept-language": "en-IN,en;q=0.9", accept: "text/html" };
// Directories, social sites and stores: never a vendor's own website.
const NOT_VENDOR = /capterra|g2\.com|getapp|techjockey|softwaresuggest|saasworthy|spotsaas|softwareadvice|trustradius|itqlick|saastrac|youtube|linkedin|facebook|instagram|twitter|x\.com|play\.google|apps\.apple|wikipedia|reddit|quora|medium\.com|crunchbase|tracxn|indiamart|justdial|tradeindia|glassdoor|ambitionbox|duckduckgo/i;
const PRICE = /(₹|\bRs\.?|\bINR|\$|\bUSD|US\$)\s?\d[\d,]*(\.\d+)?(\s?(k|lakh|L))?/i;
const PRICE_SNIPPET = new RegExp(`.{0,70}${PRICE.source}.{0,50}`, "gi");
const DEMO = /book a demo|request (a )?demo|schedule (a )?demo|contact sales|talk to sales|get a quote|request (a )?(quote|price|pricing)|custom pricing|contact us for pricing/i;
const FREE = /free trial|free plan|free forever|start for free|try (it )?free/i;
// "450+ developers", "40,000 businesses" — at least two digits, so "5 users" plan limits don't count.
const CUSTOMERS = /\b\d[\d,]+\+?\s?(k\+?)?\s(customers|businesses|companies|clients|users|developers|builders|exporters|schools|hospitals|dealers|distributors|firms|teams)\b/gi;

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#8377;/g, "₹")
    .replace(/&nbsp;|&amp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: HEADERS, redirect: "follow", signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Bing HTML search, paced (DuckDuckGo's HTML search throttles after a few
// queries). Bing wraps result links as /ck/a?…&u=a1<base64url>; decode them.
let lastSearch = 0;
async function searchLinks(query, gap) {
  const wait = lastSearch + (gap[0] + Math.random() * (gap[1] - gap[0])) * 1000 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastSearch = Date.now();
  const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=en`, { headers: HEADERS, signal: AbortSignal.timeout(25_000) }).catch(() => null);
  const html = res?.ok ? await res.text() : "";
  if (/captcha|unusual traffic/i.test(html)) log(P, `search "${query}": Bing asked for a captcha — skipping discovery`);
  return [...html.matchAll(/<h2[^>]*><a[^>]+href="([^"]+)"/g)]
    .map((m) => m[1].replace(/&amp;/g, "&"))
    .map((href) => {
      const u = href.match(/[?&]u=a1([^&]+)/)?.[1];
      return u ? Buffer.from(u.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8") : href;
    })
    .filter((u) => /^https?:\/\//.test(u));
}

// The product's distinctive word ("buildesk" from "Buildesk CRM"), used to
// reject unrelated search results.
function nameToken(name) {
  return name.toLowerCase().replace(/\./g, "").match(/[a-z0-9]{3,}/)?.[0] ?? name.toLowerCase();
}

async function findWebsite(name, gap) {
  const token = nameToken(name);
  for (const query of [`${name} pricing`, `${name} software india`]) {
    const links = await searchLinks(query, gap);
    const vendor = links.find((u) => !NOT_VENDOR.test(u) && new URL(u).hostname.replace(/[.-]/g, "").includes(token));
    if (vendor) return new URL(vendor).origin;
  }
  return null;
}

// Techjockey listings live at /detail/<slug>; try the likely slugs and keep
// the first page whose product name matches.
async function findTechjockey(name) {
  const base = name.toLowerCase().replace(/\./g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const token = nameToken(name);
  for (const slug of [...new Set([base, token, `${token}-crm`, `${token}-erp`, `${token}-software`, `${token}-app`])]) {
    const url = `https://www.techjockey.com/detail/${slug}`;
    const html = await fetchText(url).catch(() => "");
    if (html && /SoftwareApplication/.test(html) && techjockeyListing(html, url).name?.toLowerCase().replace(/\./g, "").includes(token)) return url;
    await pause(800, 1600);
  }
  return null;
}

// Prices, plan signals and claims from one rendered page's text.
function readPricing(text) {
  const snippets = [...new Set((text.match(PRICE_SNIPPET) ?? []).map((s) => s.trim()))].slice(0, 10);
  return {
    snippets,
    demoLed: DEMO.test(text),
    freeOffer: (text.match(FREE) ?? [null])[0],
    perUser: /per user|\/\s?user|per seat/i.test(text),
    customerClaims: [...new Set((text.match(CUSTOMERS) ?? []).map((s) => s.trim()))].slice(0, 5),
  };
}

async function renderedText(page, url) {
  return retry(
    async () => {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForTimeout(3500);
      return page.evaluate(() => (document.body?.innerText ?? "").replace(/\s+/g, " "));
    },
    { tries: 2, platform: P, label: url },
  );
}

async function vendorPricing(page, product, c) {
  const site = product.website ? new URL(product.website) : null;
  if (!site) return { error: "no website found" };
  const candidates = [];
  if (/pric|plan/i.test(site.pathname)) candidates.push(site.href);
  try {
    await renderedText(page, site.origin);
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href));
    for (const href of links) if (/pric|plans?\b/i.test(href) && href.startsWith(site.origin)) candidates.push(href.split("#")[0]);
  } catch (error) {
    log(P, `${product.name}: homepage failed (${error.message.slice(0, 80)})`);
  }
  candidates.push(`${site.origin}/pricing`);
  const pages = [...new Set(candidates)].slice(0, c.maxPricingPages);
  const results = [];
  for (const url of pages) {
    try {
      const text = await renderedText(page, url);
      if (/sorry, you have been blocked|attention required|verify you are human/i.test(text)) {
        results.push({ url, blocked: true });
        continue;
      }
      if (/\b404\b|page not found|not found/i.test(text.slice(0, 300)) || text.length < 200) continue;
      results.push({ url, ...readPricing(text) });
      if (results.at(-1).snippets.length) break; // found prices; no need for more pages
    } catch (error) {
      log(P, `${product.name}: ${url} failed (${error.message.slice(0, 80)})`);
    }
  }
  return { pages: results };
}

function techjockeyListing(html, url) {
  const block = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((b) => b.includes("SoftwareApplication"));
  let ld = {};
  try {
    ld = block ? JSON.parse(block.replace(/[\u0000-\u001f]+/g, " ")) : {};
  } catch {
    ld = {};
  }
  const text = textOf(html);
  const start = text.search(/Pricing & Plans/i);
  const plans = start >= 0 ? text.slice(start + 15, start + 15 + 400).split(/Key Features|Request for Price/i)[0].trim() : "";
  const offer = [].concat(ld.offers ?? [])[0];
  return {
    url,
    name: ld.name ?? null,
    listedPrice: offer?.price ? `${offer.priceCurrency ?? ""} ${offer.price}`.trim() : null,
    plans: quote(plans, 300),
    rating: ld.aggregateRating?.ratingValue ?? null,
    reviewCount: ld.aggregateRating?.reviewCount ?? null,
    reviews: [].concat(ld.review ?? []).map((r) => ({
      title: r.reviewAspect ?? r.name ?? "",
      text: r.reviewBody ?? "",
      stars: r.reviewRating?.ratingValue ?? null,
      date: (r.datePublished ?? "").slice(0, 10),
    })),
  };
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.competitorPricing;
  const dir = rawDir(config.slug, P);
  const products = c.products.map((p) => (typeof p === "string" ? { name: p } : p)).filter((p) => p.name);
  if (products.length === 0) {
    log(P, "competitorPricing.products is empty — nothing to collect (add competitors found on Meta/Play, then re-run)");
    writeMarkdown(config.slug, P, `# Competitor pricing — ${config.group}\n\nCollected ${today()} · 0 products\n\n_No products configured: add the competitors found on Meta ads and Play Store to \`competitorPricing.products\` in config.json and re-run \`node run.mjs ${config.slug} competitor-pricing\`._\n\n## Insights\n\n_To be written by the group-analysis skill._\n`);
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA, locale: "en-IN", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const tick = progress(products.length).tick;
  const out = [];
  try {
    for (const product of products) {
      const row = { name: product.name, website: product.website ?? null, techjockeyUrl: product.techjockey ?? null };
      try {
        if (!row.website && c.findWebsites) row.website = await findWebsite(product.name, c.searchGapSeconds);
        row.vendor = await vendorPricing(page, { ...product, website: row.website }, c);
        if (c.techjockey) {
          if (!row.techjockeyUrl) row.techjockeyUrl = await findTechjockey(product.name);
          if (row.techjockeyUrl) {
            const html = await retry(() => fetchText(row.techjockeyUrl), { platform: P, label: `${product.name} techjockey` });
            row.techjockey = techjockeyListing(html, row.techjockeyUrl);
          }
        }
      } catch (error) {
        row.error = error.message;
      }
      out.push(row);
      const found = row.vendor?.pages?.find((p) => p.snippets?.length);
      log(P, `[${tick()}] ${product.name}: site ${row.website ?? "—"} · ${found ? `${found.snippets.length} price mentions` : row.vendor?.pages?.some((p) => p.demoLed) ? "demo-led" : "no prices"} · techjockey ${row.techjockey?.listedPrice ?? (row.techjockeyUrl ? "no price" : "not listed")}`);
      await pause(1500, 3500);
    }
  } finally {
    await browser.close().catch(() => {});
  }

  writeJson(`${dir}/products.json`, out);
  writeMarkdown(config.slug, P, render(config, out));
  log(P, `wrote ${config.slug}/${P}.md`);
}

function render(config, out) {
  const priced = out.filter((r) => r.vendor?.pages?.some((p) => p.snippets?.length));
  const rows = out.map((r) => {
    const pages = r.vendor?.pages ?? [];
    const best = pages.find((p) => p.snippets?.length) ?? pages[0];
    const signals = [best?.demoLed && "demo-led", best?.perUser && "per user", best?.freeOffer && `"${best.freeOffer}"`, best?.blocked && "blocked"].filter(Boolean).join(", ");
    return [
      r.name,
      best?.url ?? r.website ?? r.vendor?.error ?? "—",
      best?.snippets?.length ? best.snippets.slice(0, 3).map((s) => quote(s, 110)).join(" · ") : "none on page",
      signals || "—",
      (best?.customerClaims ?? []).join(", ") || "—",
    ];
  });
  const tj = out.filter((r) => r.techjockey);
  const tjRows = tj.map((r) => [r.name, r.techjockey.listedPrice ?? "—", r.techjockey.plans || "—", r.techjockey.rating ?? "—", r.techjockey.reviewCount ?? "—", r.techjockeyUrl]);
  const reviews = tj.flatMap((r) => r.techjockey.reviews.map((v) => `- **${r.name}** (${v.stars ?? "?"}★, ${v.date || "undated"}): ${quote(`${v.title ? `${v.title}: ` : ""}${v.text}`, 260)}`));
  return `# Competitor pricing — ${config.group}

Collected ${today()} · ${out.length} products · prices found on ${priced.length} vendor sites · ${tj.length} Techjockey listings

Raw data: \`raw/competitor-pricing/products.json\`

Prices are read from vendors' own pages (rendered like a browser) and from Techjockey, an Indian software directory. Snippets are raw page text: check the plan, billing period (monthly or yearly) and GST before quoting a price. "demo-led" means the page asks visitors to book a demo or contact sales.

## Vendor pricing pages

${mdTable(["Product", "Page read", "Price mentions (raw)", "Signals", "Customer claims"], rows)}

## Techjockey listings

${tjRows.length ? mdTable(["Product", "Listed price", "Plans", "Rating", "Reviews", "Listing"], tjRows) : "_No Techjockey listings found._"}

## Reviews published on Techjockey

${reviews.join("\n") || "_None._"}

## Insights

_To be written by the group-analysis skill: a pricing table (product, plan, price per month, per user or per business, source) for the README, the price band the group already pays, and where a new product should sit._
`;
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
