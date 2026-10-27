// Shared config + output helpers for every collector.
//
// A group's config lives at analyses/<slug>/config.json and is merged over
// DEFAULTS below (deep merge, arrays replace). Collectors are run as:
//   node <platform>.mjs <slug>
// and write raw data to analyses/<slug>/raw/<platform>/ plus a data summary
// to analyses/<slug>/<platform>.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, "../../..");
export const ANALYSES_DIR = path.join(REPO_ROOT, "analyses");

export const PLATFORMS = ["meta-ads", "play-store", "youtube", "google-search", "google-trends", "reddit", "google-maps"];

export const DEFAULTS = {
  group: "",
  // "all" or a list from PLATFORMS
  platforms: "all",
  metaAds: {
    countries: ["IN"],
    keywords: [],
    maxAdsPerKeyword: 100, // stop scrolling a keyword once this many ads have loaded
    maxScrollRounds: 25, // hard cap on scroll rounds per keyword
    activeOnly: true,
    // First-pass tagging of advertisers (the skill still checks by hand):
    sellerTerms: [], // words a seller TO this group uses, e.g. "your school", "school ERP", "for principals"
    selfTerms: [], // words the group uses advertising ITSELF, e.g. "admissions open", "enrol your child"
    concurrency: 2, // browser tabs scraping different keywords at once (keep low: Meta rate-limits)
  },
  playStore: {
    country: "in",
    lang: "en",
    searchTerms: [], // Play Store website searches used to discover apps
    appIds: [], // apps to always include, e.g. "com.teachmint.teachmint"
    maxApps: 30, // keep the N most-reviewed apps found
    minReviews: 10, // skip apps with fewer total reviews than this
    reviewsPerApp: 500, // newest reviews fetched per app (pages of 200)
    complaintMaxStars: 3, // reviews at or below this count as complaints
    excludeGames: true, // drop apps in Play's game categories
    excludeTitles: [], // case-insensitive title fragments to drop, e.g. "simulator", "family link"
    concurrency: 4, // apps whose reviews are fetched at the same time
  },
  youtube: {
    queries: [],
    videosPerQuery: 8,
    maxCommentsPerVideo: 500, // top-level comments per video (replies included on top)
    maxRepliesPerThread: 5,
    commentSort: "top", // "top" or "new"
    minViews: 0, // skip videos with fewer views
    titleMustMatch: false, // drop videos whose title shares no word (4+ letters) with the query; leave off for Hindi/regional queries
    concurrency: 3, // videos fetched at the same time (parallel yt-dlp)
  },
  googleSearch: {
    hl: "en",
    gl: "in",
    seeds: [], // short phrases the group would type, e.g. "tattoo booking", "pathology lab software"
    expandAlphabet: true, // also query "<seed> a" … "<seed> z"
    questionPrefixes: ["how", "why", "what", "best", "is", "can", "which", "where"], // "<prefix> <seed>"
    resultsQueries: [], // queries whose result pages we open for "People also ask" / related searches (signed-in browser); empty = first 5 seeds
    maxResultsPages: 6, // cap on result pages opened per run (each takes ~30 s with human-like gaps)
    expandPeopleAlsoAsk: 3, // click this many questions to load more of them
    captchaWaitSeconds: 180, // on a captcha, wait this long for a person to solve it in the window (0 = stop at once)
    bingFallback: true, // if Google blocks, read "People also ask" from Bing instead
    pageGapSeconds: [15, 40], // random wait between result pages
  },
  googleTrends: {
    geo: "IN", // "" = worldwide, "US", "IN", …
    timeframe: "today 5-y", // "today 12-m", "today 5-y", "all"
    keywords: [], // compared in batches of up to 5 (Google's limit); the first keyword anchors every batch
    regionsResolution: "REGION", // "COUNTRY", "REGION" (state), "CITY"
  },
  reddit: {
    subreddits: [], // without "r/", e.g. "TattooArtists"
    searchQueries: [], // searched inside each subreddit (and across Reddit if searchAllReddit)
    searchAllReddit: true,
    searchSort: "relevance", // relevance, new, top, comments
    searchTimeframe: "all", // hour, day, week, month, year, all — use "year" or "month" for recent talk
    discoverSubreddits: true, // also find communities (with member counts) …
    discoveryQueries: [], // … using these group terms, e.g. "tattoo artist" (not problem phrases)
    postsPerSearch: 25,
    topPostsPerSub: 25, // also take each subreddit's top posts
    topTimeframe: "year", // hour, day, week, month, year, all
    maxThreads: 60, // threads opened to read comments (most-commented first)
    commentsPerThread: 200,
    minPostScore: 0,
    relevanceFilter: true, // keep only on-topic subreddits/posts (match query or group terms); off-topic ones are listed separately
    groupTerms: [], // words or phrases that mark a post or subreddit as on-topic, e.g. "school", "law school"
    requestGapSeconds: [2, 4], // wait between Reddit JSON requests
    searchPageGapSeconds: [6, 10], // wait between Reddit search pages (heavier; used when search JSON is forbidden)
    cooldownMinutes: [3, 8, 15], // when Reddit rate-limits or blocks: wait, reset tabs, retry (escalating)
    maxWaitMinutes: 45, // total cool-down budget before stopping (progress is saved; re-run resumes)
  },
  googleMaps: {
    hl: "en",
    queries: [], // place types, e.g. "tattoo studio", "pathology lab"
    locations: [], // cities/areas; each query runs as "<query> in <location>" (empty = query as-is)
    maxPlacesPerSearch: 40, // Maps lists up to ~120 per search
    reviewsPerPlace: 20, // 0 = details only (faster)
    reviewSort: "lowest", // lowest, newest, highest, relevant
    maxReviewsPerBrand: 0, // cap reviews read per brand/chain (first two words of the name); 0 = no cap
    concurrency: 3, // browser tabs reading places + reviews at once (search lists stay in one tab)
  },
};

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
  const out = { ...base };
  for (const [key, value] of Object.entries(override ?? {})) {
    out[key] = isObject(value) && isObject(base[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function groupDir(slug) {
  return path.join(ANALYSES_DIR, slug);
}

export function loadConfig(slug) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Usage: node <collector>.mjs <group-slug>  (lowercase letters, digits, dashes; got "${slug ?? ""}")`);
  }
  const file = path.join(groupDir(slug), "config.json");
  if (!fs.existsSync(file)) throw new Error(`No config at ${file}. Create it first (see analyses/_template/config.json).`);
  const config = deepMerge(DEFAULTS, JSON.parse(fs.readFileSync(file, "utf8")));
  config.slug = slug;
  return config;
}

export function isEnabled(config, platform) {
  return config.platforms === "all" || (Array.isArray(config.platforms) && config.platforms.includes(platform));
}

export function rawDir(slug, platform) {
  const dir = path.join(groupDir(slug), "raw", platform);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 1));
}

export function writeMarkdown(slug, platform, markdown) {
  const file = path.join(groupDir(slug), `${platform}.md`);
  fs.writeFileSync(file, markdown.trimEnd() + "\n");
  return file;
}

// Human-ish pause between page loads.
export function pause(minMs = 1500, maxMs = 4000) {
  return new Promise((resolve) => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));
}

export function mdTable(headers, rows) {
  const esc = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
  return [
    `| ${headers.map(esc).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(esc).join(" | ")} |`),
  ].join("\n");
}

export function quote(text, max = 280) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function log(platform, ...args) {
  console.log(`[${platform}]`, ...args);
}

// Retry a flaky step (network blips, slow page loads). Errors whose class
// name is "StopError" (captcha, signed out, rate limit) are never retried.
// Run fn over items with at most n in flight; results keep input order.
export async function mapLimit(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, worker));
  return out;
}

// Words (4+ letters) from text, for loose relevance matching.
export function words(text) {
  return new Set(String(text ?? "").toLowerCase().match(/[a-zऀ-ॿ]{4,}/g) ?? []);
}

export async function retry(fn, { tries = 3, label = "step", platform = "collect", baseDelayMs = 2000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (error?.constructor?.name === "StopError" || attempt === tries) break;
      log(platform, `${label} failed (attempt ${attempt}/${tries}): ${String(error.message).slice(0, 120)} — retrying`);
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt + Math.random() * 1000));
    }
  }
  throw lastError;
}

// Progress tracker: tick() returns "48/180, ~30 min left" based on the pace so far.
export function progress(total) {
  const started = Date.now();
  let done = 0;
  return {
    tick() {
      done++;
      const left = ((Date.now() - started) / done) * (total - done);
      const eta = done >= total ? "done" : left < 60_000 ? "<1 min left" : `~${Math.round(left / 60_000)} min left`;
      return `${done}/${total}, ${eta}`;
    },
  };
}
