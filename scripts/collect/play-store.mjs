// Google Play Store: discover the apps a group uses, record their details
// (downloads, free/paid, in-app purchases, ratings…) and pull reviews.
//
//   node play-store.mjs <group-slug>
//
// Discovery uses the Play Store website through Playwright, because
// google-play-scraper's own search() is broken. Details and reviews use
// google-play-scraper.

import gplay from "google-play-scraper";
import { chromium } from "playwright";
import { loadConfig, log, mapLimit, mdTable, pause, progress, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "play-store";

async function discoverAppIds(terms, { country, lang }) {
  if (terms.length === 0) return [];
  const browser = await chromium.launch();
  const page = await browser.newPage({ locale: `${lang}-${country.toUpperCase()}` });
  const ids = new Set();
  for (const term of terms) {
    const url = `https://play.google.com/store/search?q=${encodeURIComponent(term)}&c=apps&gl=${country.toUpperCase()}&hl=${lang}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(700);
    }
    const found = await page.$$eval('a[href*="/store/apps/details?id="]', (links) =>
      links.map((a) => new URL(a.href).searchParams.get("id")).filter(Boolean),
    );
    found.forEach((id) => ids.add(id));
    log(P, `search "${term}": ${found.length} apps`);
    await pause(800, 1800);
  }
  await browser.close();
  return [...ids];
}

function toAppRecord(d) {
  return {
    appId: d.appId,
    title: d.title,
    developer: d.developer,
    developerWebsite: d.developerWebsite ?? null,
    developerEmail: d.developerEmail ?? null,
    genre: d.genre,
    genreId: d.genreId ?? null,
    summary: d.summary,
    installs: d.installs, // e.g. "1,000,000+"
    minInstalls: d.minInstalls ?? 0,
    maxInstalls: d.maxInstalls ?? null,
    free: d.free,
    price: d.price,
    currency: d.currency,
    priceText: d.priceText,
    offersIAP: d.offersIAP ?? false,
    iapRange: d.IAPRange ?? null,
    adSupported: d.adSupported ?? false,
    score: d.score ?? null,
    ratings: d.ratings ?? 0,
    reviews: d.reviews ?? 0,
    histogram: d.histogram ?? null, // { "1": n, …, "5": n }
    released: d.released ?? null,
    updated: d.updated ? new Date(d.updated).toISOString().slice(0, 10) : null,
    version: d.version ?? null,
    contentRating: d.contentRating ?? null,
    url: d.url,
  };
}

function parseCount(text) {
  if (!text) return 0;
  const m = text.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] ?? "").toUpperCase()] ?? 1;
  return Math.round(Number(m[1]) * mult);
}

// google-play-scraper's app() crashes on some app pages ("reading 'length'").
// Fallback: read the page's schema.org JSON-LD plus the visible labels.
async function scrapeDetailsFromPage(page, appId, { country, lang }) {
  const url = `https://play.google.com/store/apps/details?id=${appId}&gl=${country.toUpperCase()}&hl=${lang}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const ld = await page.$$eval('script[type="application/ld+json"]', (nodes) =>
    nodes.map((n) => { try { return JSON.parse(n.textContent); } catch { return null; } }).find((j) => j?.["@type"] === "SoftwareApplication") ?? null,
  );
  if (!ld) throw new Error("no app data on page");
  const text = await page.evaluate(() => document.body.innerText);
  const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
  const price = Number(offer?.price ?? 0);
  const downloads = text.match(/\n([\d.,]+[KMB]?\+)\nDownloads/)?.[1] ?? null;
  const reviewsText = text.match(/\n([\d.,]+[KMB]?) reviews\n/)?.[1] ?? null;
  const updated = text.match(/Updated on\n([A-Z][a-z]{2} \d{1,2}, \d{4})/)?.[1] ?? null;
  return {
    appId,
    title: ld.name,
    developer: ld.author?.name ?? null,
    developerWebsite: ld.author?.url ?? null,
    developerEmail: null,
    genre: ld.applicationCategory ?? null,
    genreId: ld.applicationCategory ?? null,
    summary: ld.description ?? null,
    installs: downloads,
    minInstalls: parseCount(downloads),
    maxInstalls: null,
    free: price === 0,
    price,
    currency: offer?.priceCurrency ?? null,
    priceText: price === 0 ? "Free" : `${offer?.priceCurrency ?? ""} ${price}`.trim(),
    offersIAP: /\nIn-app purchases\n/.test(text),
    iapRange: null,
    adSupported: /\nContains ads\n/.test(text),
    score: ld.aggregateRating?.ratingValue ? Number(ld.aggregateRating.ratingValue) : null,
    ratings: Number(ld.aggregateRating?.ratingCount ?? 0),
    reviews: parseCount(reviewsText),
    histogram: null,
    released: null,
    updated: updated ? new Date(updated).toISOString().slice(0, 10) : null,
    version: null,
    contentRating: ld.contentRating ?? null,
    url,
    source: "page",
  };
}

async function fetchDetails(ids, opts) {
  const apps = [];
  const failed = [];
  for (const appId of ids) {
    try {
      apps.push(toAppRecord(await gplay.app({ appId, country: opts.country, lang: opts.lang })));
    } catch {
      failed.push(appId);
    }
  }
  if (failed.length) {
    log(P, `${failed.length} apps need the page fallback`);
    const browser = await chromium.launch();
    const page = await browser.newPage({ locale: `${opts.lang}-${opts.country.toUpperCase()}` });
    for (const appId of failed) {
      try {
        apps.push(await scrapeDetailsFromPage(page, appId, opts));
      } catch (error) {
        log(P, `skip ${appId}: ${error.message}`);
      }
      await pause(500, 1200);
    }
    await browser.close();
  }
  return apps;
}

async function fetchReviews(appId, { country, lang, reviewsPerApp }) {
  const out = [];
  let token;
  while (out.length < reviewsPerApp) {
    const res = await gplay.reviews({
      appId,
      country,
      lang,
      sort: gplay.sort.NEWEST,
      num: Math.min(200, reviewsPerApp - out.length),
      paginate: true,
      nextPaginationToken: token,
    });
    out.push(...res.data);
    token = res.nextPaginationToken;
    if (!token || res.data.length === 0) break;
  }
  return out
    .filter((r) => r.text)
    .map((r) => ({
      appId,
      score: r.score,
      date: r.date,
      thumbsUp: r.thumbsUp ?? 0,
      text: r.text,
      replied: Boolean(r.replyText),
      version: r.version ?? null,
    }));
}

function formatInstalls(n) {
  if (!n) return "—";
  if (n >= 1e9) return `${n / 1e9}B+`;
  if (n >= 1e6) return `${n / 1e6}M+`;
  if (n >= 1e3) return `${n / 1e3}K+`;
  return `${n}+`;
}

function businessModel(app) {
  const parts = [app.free ? "Free" : `Paid ${app.priceText ?? ""}`.trim()];
  if (app.offersIAP) parts.push(`IAP ${app.iapRange ?? ""}`.trim());
  if (app.adSupported) parts.push("ads");
  return parts.join(" · ");
}

function isGame(app) {
  return /^GAME/i.test(app.genreId ?? "") || /^(action|adventure|arcade|board|card|casino|casual|puzzle|racing|role playing|simulation|strategy|trivia|word)$/i.test(app.genre ?? "");
}

function buildMarkdown(config, apps, reviews, dropped = []) {
  const c = config.playStore;
  const complaints = reviews.filter((r) => r.score <= c.complaintMaxStars);
  const byApp = new Map(apps.map((a) => [a.appId, a]));
  const perApp = apps.map((app) => {
    const own = reviews.filter((r) => r.appId === app.appId);
    const bad = own.filter((r) => r.score <= c.complaintMaxStars);
    return { app, fetched: own.length, complaints: bad.length };
  });
  const topComplaints = [...complaints].sort((a, b) => b.thumbsUp - a.thumbsUp || b.text.length - a.text.length).slice(0, 25);

  return `# Google Play Store — ${config.group}

Collected ${today()} · store: ${c.country.toUpperCase()} / ${c.lang} · ${apps.length} apps (${dropped.length} dropped) · ${reviews.length} reviews fetched · ${complaints.length} complaints (≤${c.complaintMaxStars}★)

Raw data: \`raw/play-store/apps.json\`, \`raw/play-store/reviews.json\`

## Apps (by number of ratings)

${mdTable(
  ["App", "Developer", "Downloads", "Model", "Rating", "Ratings", "Category", "Updated"],
  [...apps]
    .sort((a, b) => b.ratings - a.ratings)
    .map((a) => [a.title, a.developer, formatInstalls(a.minInstalls), businessModel(a), a.score ? a.score.toFixed(1) : "—", a.ratings.toLocaleString("en-IN"), a.genre, a.updated ?? "—"]),
)}

## Business models

- Free: ${apps.filter((a) => a.free).length} · Paid upfront: ${apps.filter((a) => !a.free).length}
- With in-app purchases: ${apps.filter((a) => a.offersIAP).length} · With ads: ${apps.filter((a) => a.adSupported).length}

## Reviews per app

${mdTable(
  ["App", "Reviews fetched", "Complaints", "Complaint share", "1★ share (all-time)"],
  perApp.map(({ app, fetched, complaints: n }) => {
    const h = app.histogram;
    const total = h ? Object.values(h).reduce((s, v) => s + v, 0) : 0;
    return [app.title, fetched, n, fetched ? `${Math.round((n / fetched) * 100)}%` : "—", total ? `${Math.round(((h["1"] ?? 0) / total) * 100)}%` : "—"];
  }),
)}

## Most-upvoted complaints

${topComplaints.map((r) => `- **${byApp.get(r.appId)?.title ?? r.appId}** · ${r.score}★ · 👍${r.thumbsUp} — “${quote(r.text)}”`).join("\n") || "_No complaints fetched._"}

## Filtered out

${dropped.length ? mdTable(["App", "Category", "Why"], dropped.map((d) => [d.app.title, d.app.genre ?? "—", d.reason])) : "_Nothing filtered._"}

## Insights

_To be written by the group-analysis skill: complaint themes with counts, who is complaining (buyer vs end user), and what it means for this group._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.playStore;
  const dir = rawDir(config.slug, P);

  const discovered = await discoverAppIds(c.searchTerms, c);
  const ids = [...new Set([...c.appIds, ...discovered])];
  log(P, `${ids.length} candidate apps`);

  const details = await fetchDetails(ids, c);
  const forced = new Set(c.appIds);
  const dropped = [];
  const excluded = details.filter((a) => {
    if (forced.has(a.appId)) return true;
    const title = c.excludeTitles.find((t) => a.title?.toLowerCase().includes(t.toLowerCase()));
    if (title) dropped.push({ app: a, reason: `title matches "${title}"` });
    else if (c.excludeGames && isGame(a)) dropped.push({ app: a, reason: "game" });
    else if (Math.max(a.reviews, a.ratings) < c.minReviews) dropped.push({ app: a, reason: `under ${c.minReviews} reviews` });
    else return true;
    return false;
  });
  const apps = excluded
    .sort((a, b) => Math.max(b.reviews, b.ratings) - Math.max(a.reviews, a.ratings))
    .slice(0, Math.max(c.maxApps, forced.size));
  writeJson(`${dir}/apps.json`, apps);
  writeJson(`${dir}/dropped-apps.json`, dropped.map((d) => ({ appId: d.app.appId, title: d.app.title, genre: d.app.genre, reason: d.reason })));
  log(P, `kept ${apps.length} apps, dropped ${dropped.filter((d) => d.reason !== `under ${c.minReviews} reviews`).length} irrelevant`);

  // Several apps' reviews at once (google-play-scraper is plain HTTP).
  const bar = progress(apps.length);
  const perApp = await mapLimit(apps, c.concurrency, async (app) => {
    try {
      const got = await retry(() => fetchReviews(app.appId, c), { label: `reviews ${app.appId}`, platform: P });
      log(P, `[${bar.tick()}] ${app.title}: ${got.length} reviews`);
      return got;
    } catch (error) {
      log(P, `[${bar.tick()}] reviews failed for ${app.appId}: ${error.message}`);
      return [];
    }
  });
  const reviews = perApp.flat();
  writeJson(`${dir}/reviews.json`, reviews);

  const file = writeMarkdown(config.slug, P, buildMarkdown(config, apps, reviews, dropped.filter((d) => !d.reason.startsWith("under"))));
  log(P, `wrote ${file}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
