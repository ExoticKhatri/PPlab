// Google Maps: how many businesses of this kind exist per city, and what
// their customers complain about.
//
//   node google-maps.mjs <group-slug>
//
// Runs in the signed-in Brave profile (signed out, Maps hides reviews from
// automated browsers). For each "<query> in <location>":
//   1. scroll the results list to the end (or maxPlacesPerSearch)
//   2. open each place: name, category, rating, review count, address,
//      phone, website
//   3. open Reviews, sort (lowest first by default), read reviewsPerPlace
// Human-paced; stops at the first captcha/block.

import { closeProfileBrowser, isBlocked, openProfileBrowser } from "./lib/browser.mjs";
import { loadConfig, log, mdTable, pause, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "google-maps";
const SORT_LABELS = { relevant: /most relevant/i, newest: /newest/i, highest: /highest/i, lowest: /lowest/i };

class StopError extends Error {}

async function guard(page) {
  if (await isBlocked(page)) throw new StopError("Google showed a captcha/block — stopped. Re-run later (or sign in again with node login.mjs).");
}

// Stable id from a /maps/place/ URL (the "!1s0x…:0x…" feature id).
function placeId(href) {
  return href.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i)?.[1] ?? href.split("/data=")[0];
}

async function collectPlaceLinks(page, search, max, hl) {
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(search)}?hl=${hl}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await guard(page);

  // A single exact match opens the place directly instead of a list.
  if (/\/maps\/place\//.test(page.url()) && (await page.locator('div[role="feed"]').count()) === 0) {
    return [{ name: await page.locator("h1").first().textContent().catch(() => search), href: page.url().split("?")[0] }];
  }

  const found = new Map();
  let stalled = 0;
  for (let round = 0; round < 60 && found.size < max; round++) {
    const links = await page.$$eval('div[role="feed"] a[href*="/maps/place/"]', (as) =>
      as.map((a) => ({ name: a.getAttribute("aria-label"), href: a.href.split("?")[0] })),
    );
    const before = found.size;
    for (const l of links) if (l.name && !found.has(placeId(l.href))) found.set(placeId(l.href), l);
    const ended = await page.evaluate(() => /reached the end of the list/i.test(document.querySelector('div[role="feed"]')?.innerText ?? ""));
    if (ended) break;
    stalled = found.size === before ? stalled + 1 : 0;
    if (stalled >= 4) break;
    await page.evaluate(() => {
      const feed = document.querySelector('div[role="feed"]');
      if (feed) feed.scrollBy(0, 2500);
    });
    await page.waitForTimeout(1500 + Math.random() * 1000);
  }
  return [...found.values()].slice(0, max);
}

async function readPlace(page, link, hl) {
  await page.goto(`${link.href}?hl=${hl}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await guard(page);
  const d = await page.evaluate(() => {
    const strip = (s) => (s ?? "").replace(/^(Address|Phone|Website):\s*/i, "").trim() || null;
    const ratingText = document.querySelector("div.F7nice")?.innerText ?? "";
    return {
      name: document.querySelector("h1")?.textContent?.trim() ?? null,
      category: document.querySelector('button[jsaction*="category"]')?.textContent?.trim() ?? null,
      ratingText,
      address: strip(document.querySelector('button[data-item-id="address"]')?.getAttribute("aria-label")),
      phone: strip(document.querySelector('button[data-item-id^="phone"]')?.getAttribute("aria-label")),
      website: document.querySelector('a[data-item-id="authority"]')?.href ?? null,
      closed: /permanently closed|temporarily closed/i.test(document.body.innerText.slice(0, 2000)),
    };
  });
  const rating = Number(d.ratingText.match(/(\d[.,]\d)/)?.[1]?.replace(",", ".")) || null;
  const reviewCount = Number((d.ratingText.match(/\(([\d,.]+)\)/)?.[1] ?? "").replace(/[,.]/g, "")) || 0;
  return { id: placeId(link.href), url: link.href, name: d.name ?? link.name, category: d.category, rating, reviewCount, address: d.address, phone: d.phone, website: d.website, closed: d.closed };
}

async function readReviews(page, place, max, sort) {
  const tab = page.locator('button[role="tab"]').filter({ hasText: /reviews/i });
  if ((await tab.count()) === 0) return [];
  await tab.first().click();
  await page.waitForTimeout(2500);

  if (sort && sort !== "relevant") {
    const sortButton = page.locator('button[aria-label*="Sort"]');
    if (await sortButton.count()) {
      await sortButton.first().click();
      await page.waitForTimeout(800);
      const option = page.locator('div[role="menuitemradio"]').filter({ hasText: SORT_LABELS[sort] });
      if (await option.count()) {
        await option.first().click();
        await page.waitForTimeout(2500);
      } else {
        await page.keyboard.press("Escape");
      }
    }
  }

  let stalled = 0;
  let last = 0;
  for (let round = 0; round < 40; round++) {
    const count = await page.locator("div[data-review-id][aria-label]").count();
    if (count >= max) break;
    stalled = count === last ? stalled + 1 : 0;
    if (stalled >= 3) break;
    last = count;
    await page.evaluate(() => {
      const review = document.querySelector("div[data-review-id]");
      let el = review?.parentElement;
      while (el && el.scrollHeight <= el.clientHeight + 10) el = el.parentElement;
      el?.scrollBy(0, 3000);
    });
    await page.waitForTimeout(1200 + Math.random() * 800);
  }

  // Expand truncated reviews ("More").
  const more = page.locator('button.w8nwRe, button[aria-label="See more"]');
  const n = Math.min(await more.count(), max * 2);
  for (let i = 0; i < n; i++) await more.nth(i).click({ timeout: 1000 }).catch(() => {});

  const reviews = await page.evaluate((limit) => {
    const out = [];
    const seen = new Set();
    for (const el of document.querySelectorAll("div[data-review-id][aria-label]")) {
      const id = el.getAttribute("data-review-id");
      if (seen.has(id)) continue;
      seen.add(id);
      const starsLabel = el.querySelector('span[role="img"][aria-label]')?.getAttribute("aria-label") ?? "";
      const stars = Number(starsLabel.match(/(\d)/)?.[1]) || null;
      const reply = el.querySelector(".CDe7pd")?.innerText?.replace(/^Response from the owner\s*/i, "").trim() || null;
      out.push({
        id,
        stars,
        date: el.querySelector(".rsqaWe")?.textContent?.trim() ?? null,
        text: el.querySelector(".wiI7pd")?.innerText?.trim() ?? "",
        ownerReply: reply,
      });
      if (out.length >= limit) break;
    }
    return out;
  }, max);
  return reviews.map((r) => ({ ...r, placeId: place.id }));
}

function buildMarkdown(config, searches, places, reviews, stopped) {
  const c = config.googleMaps;
  const open = places.filter((p) => !p.closed);
  const withReviews = reviews.filter((r) => r.text);
  const low = withReviews.filter((r) => r.stars && r.stars <= 2);
  const byPlace = new Map(places.map((p) => [p.id, p]));
  const rated = open.filter((p) => p.rating);
  const avg = (list, f) => (list.length ? list.reduce((s, x) => s + f(x), 0) / list.length : 0);
  const replyRate = withReviews.length ? Math.round((withReviews.filter((r) => r.ownerReply).length / withReviews.length) * 100) : 0;

  return `# Google Maps — ${config.group}

Collected ${today()} · ${searches.length} searches · ${places.length} places · ${reviews.length} reviews read (sorted: ${c.reviewSort})${stopped ? ` · stopped early: ${stopped}` : ""}

Raw data: \`raw/google-maps/places.json\`, \`raw/google-maps/reviews.json\`

Maps lists at most ~120 places per search, so counts are a floor per city, not a census.

## Places found per search

${mdTable(["Search", "Places", "Hit the limit?"], searches.map((s) => [s.search, s.count, s.count >= c.maxPlacesPerSearch ? "yes — more exist" : "no"]))}

## Snapshot

- Open places: ${open.length} (closed: ${places.length - open.length})
- Average rating: ${avg(rated, (p) => p.rating).toFixed(2)} · median reviews per place: ${open.length ? [...open].map((p) => p.reviewCount).sort((a, b) => a - b)[Math.floor(open.length / 2)] : 0}
- Have a website: ${open.length ? Math.round((open.filter((p) => p.website).length / open.length) * 100) : 0}% · have a phone listed: ${open.length ? Math.round((open.filter((p) => p.phone).length / open.length) * 100) : 0}%
- Owner replies to the reviews we read: ${replyRate}%
- Categories: ${[...open.reduce((m, p) => m.set(p.category ?? "—", (m.get(p.category ?? "—") ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `${k} (${n})`).join(", ")}

## Places (by review count)

${mdTable(["Place", "Category", "Rating", "Reviews", "Website", "Search"], [...places].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 80).map((p) => [p.name, p.category ?? "—", p.rating ?? "—", p.reviewCount, p.website ? "yes" : "—", p.search]))}

## Low-rated reviews (≤2★)

${low.slice(0, 30).map((r) => `- ${r.stars}★ · **${byPlace.get(r.placeId)?.name ?? "?"}** · ${r.date ?? ""} — “${quote(r.text)}”${r.ownerReply ? " _(owner replied)_" : ""}`).join("\n") || "_None in the reviews read._"}

## Insights

_To be written by the group-analysis skill: how many businesses exist where (group size and reach per city), how digitally mature they are (websites, replies), and what their customers complain about — which is often what the owner struggles with._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.googleMaps;
  if (c.queries.length === 0) throw new Error("googleMaps.queries is empty in config.json");
  const dir = rawDir(config.slug, P);
  const searchesToRun = c.locations.length ? c.queries.flatMap((q) => c.locations.map((loc) => `${q} in ${loc}`)) : c.queries;

  const { context, page } = await openProfileBrowser();
  const searches = [];
  const places = new Map();
  const reviews = [];
  let stopped = null;

  try {
    for (const search of searchesToRun) {
      let links;
      try {
        links = await retry(() => collectPlaceLinks(page, search, c.maxPlacesPerSearch, c.hl), { label: `search "${search}"`, platform: P });
      } catch (error) {
        if (error instanceof StopError) throw error;
        log(P, `search "${search}" failed, skipped: ${error.message}`);
        searches.push({ search, count: 0, failed: true });
        continue;
      }
      searches.push({ search, count: links.length });
      log(P, `"${search}": ${links.length} places`);
      for (const link of links) {
        const id = placeId(link.href);
        if (places.has(id)) continue;
        try {
          const place = { ...(await retry(() => readPlace(page, link, c.hl), { label: `place "${link.name}"`, platform: P })), search };
          places.set(id, place);
          let got = [];
          if (c.reviewsPerPlace > 0 && place.reviewCount > 0) {
            try {
              got = await retry(() => readReviews(page, place, c.reviewsPerPlace, c.reviewSort), { tries: 2, label: `reviews "${place.name}"`, platform: P });
              reviews.push(...got);
            } catch (error) {
              if (error instanceof StopError) throw error;
              log(P, `  reviews failed for ${place.name}: ${error.message}`);
            }
          }
          log(P, `  ${quote(place.name, 40)}: ${place.rating ?? "—"}★ (${place.reviewCount})${c.reviewsPerPlace > 0 ? ` · ${got.length} reviews read` : ""}`);
        } catch (error) {
          if (error instanceof StopError) throw error;
          log(P, `  place "${link.name}" failed, skipped: ${error.message}`);
        }
        // Checkpoint: a crash or captcha later still leaves usable raw data.
        if (places.size % 5 === 0) {
          writeJson(`${dir}/places.json`, [...places.values()]);
          writeJson(`${dir}/reviews.json`, reviews);
        }
        await pause(1500, 3500);
      }
      await pause(3000, 6000);
    }
  } catch (error) {
    if (!(error instanceof StopError)) throw error;
    stopped = error.message;
    log(P, stopped);
  } finally {
    await closeProfileBrowser(context);
  }

  writeJson(`${dir}/places.json`, [...places.values()]);
  writeJson(`${dir}/reviews.json`, reviews);
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, searches, [...places.values()], reviews, stopped));
  log(P, `wrote ${file}`);
  if (stopped && places.size === 0) process.exit(1);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
