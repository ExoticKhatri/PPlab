// Reddit: communities, posts and comments where the group talks shop.
//
//   node reddit.mjs <group-slug>            # resumes an unfinished run of the same config
//   node reddit.mjs <group-slug> --fresh    # start over
//
// Runs inside the signed-in Brave profile and reads Reddit's own JSON (the same
// data the site loads) with the session's cookies.
//   1. discover subreddits matching the queries (with member counts)
//   2. search each subreddit (and optionally all of Reddit)
//   3. take each subreddit's top posts
//   4. open the most relevant, most-commented threads and read their comments
// Reddit now forbids its search JSON for scripted sessions; searches then fall
// back to the normal search pages in a second tab.
//
// Built to finish:
//   - one gate spaces out every request (requestGapSeconds / searchPageGapSeconds)
//   - rate limits and blocks (429, unexpected 403, HTML instead of JSON, "Failed
//     to fetch", failed page loads) trigger a cool-down: save progress, wait
//     (cooldownMinutes, escalating), reset the tabs, retry the same step
//   - progress is checkpointed after every step to raw/reddit/state.json; a
//     re-run with the same config continues where the last one stopped
//   - signed out → stop at once with the login instruction
// Configured subreddits are checked first (missing/private ones are reported).
// With relevanceFilter on, discovered communities and all-of-Reddit posts must
// mention a group term; the rest are kept aside and counted in the .md.

import fs from "node:fs";
import { closeProfileBrowser, openProfileBrowser } from "./lib/browser.mjs";
import { loadConfig, log, mdTable, quote, rawDir, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "reddit";
const BASE = "https://www.reddit.com";
const FRESH = process.argv.includes("--fresh");

class StopError extends Error {}
class Throttled extends Error {} // Reddit is rate-limiting or blocking: cool down and retry
class SearchForbidden extends Error {} // search JSON refused: use the search pages

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const firstLine = (e) => String(e?.message ?? e).split("\n")[0].slice(0, 120);

const FILLER = new Set(["the", "and", "for", "with", "how", "what", "why", "are", "you", "your", "best", "from", "india", "indian", "about", "into", "that", "this"]);

// Lowercase words (3+ letters) from phrases, minus filler words; "teachers" → "teacher".
function terms(phrases) {
  return [...new Set(phrases.flatMap((p) => String(p).toLowerCase().match(/[a-z]{3,}/g) ?? []).filter((w) => !FILLER.has(w)).map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w)))];
}

// How many of the terms start a word in the text ("fee" matches "fees").
function matchCount(text, list) {
  const t = String(text).toLowerCase();
  return list.filter((w) => new RegExp(`\\b${w}`).test(t)).length;
}

// ---------- request layer: gate, cool-downs, recovery ----------

const net = { page: null, c: null, lastAt: 0, waitedMs: 0, onCooldown: () => {} };

async function gate(range) {
  const gap = (range[0] + Math.random() * (range[1] - range[0])) * 1000;
  const wait = net.lastAt + gap - Date.now();
  if (wait > 0) await sleep(wait);
  net.lastAt = Date.now();
}

const THROTTLE_SIGNS = /Failed to fetch|ERR_HTTP_RESPONSE_CODE_FAILURE|net::ERR_|Execution context was destroyed|Target (page|closed)|Navigation timeout|Timeout \d+ms exceeded/i;

// Run one step; on throttling, save progress, wait (escalating), reset tabs and retry the same step.
async function withRecovery(label, fn) {
  const steps = net.c.cooldownMinutes;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const throttled = error instanceof Throttled || THROTTLE_SIGNS.test(error?.message ?? "");
      if (!throttled) throw error;
      const ms = steps[Math.min(attempt, steps.length - 1)] * 60_000;
      if (net.waitedMs + ms > net.c.maxWaitMinutes * 60_000) {
        throw new StopError(`Reddit kept refusing requests after ${Math.round(net.waitedMs / 60_000)} min of cool-downs (${firstLine(error)}). Progress is saved — re-run later to resume.`);
      }
      log(P, `Reddit is rate-limiting (${label}: ${firstLine(error)}) — saving progress, cooling down ${ms / 60_000} min, then retrying`);
      net.onCooldown();
      await sleep(ms);
      net.waitedMs += ms;
      await resetTabs();
    }
  }
}

async function resetTabs() {
  if (searchTab && !searchTab.isClosed()) await searchTab.close().catch(() => {});
  searchTab = null;
  await net.page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45_000 }).catch(() => {});
  await sleep(3000);
}

async function fetchRaw(url) {
  return net.page.evaluate(async (u) => {
    try {
      const r = await fetch(u, { credentials: "include", headers: { Accept: "application/json" } });
      return { status: r.status, text: await r.text() };
    } catch (e) {
      return { status: 0, text: String(e?.message ?? e) };
    }
  }, url);
}

async function getJsonOnce(path) {
  await gate(net.c.requestGapSeconds);
  const res = await fetchRaw(`${BASE}${path}${path.includes("?") ? "&" : "?"}raw_json=1`);
  const isSearch = /\/search\.json|subreddits\/search\.json/.test(path);
  if (res.status === 0) throw new Throttled(res.text);
  if (res.status === 401) throw new StopError('Reddit returned 401 (signed out). Run "node login.mjs", sign in to Reddit, close the window, then re-run.');
  if (res.status === 403 && isSearch) throw new SearchForbidden(`search JSON forbidden for ${path.split("?")[0]}`);
  if (res.status === 429 || res.status === 403) throw new Throttled(`HTTP ${res.status} for ${path.split("?")[0]}`);
  if (res.status >= 500) throw new Error(`Reddit ${res.status} for ${path.split("?")[0]}`);
  if (res.status !== 200) throw new Error(`Reddit ${res.status} for ${path.split("?")[0]}`);
  if (/^\s*</.test(res.text)) throw new Throttled(`HTML instead of JSON for ${path.split("?")[0]}`);
  return JSON.parse(res.text);
}

// JSON with recovery; plain errors (5xx, bad JSON) get 2 quick retries first.
async function getJson(path) {
  return withRecovery(path.split("?")[0], async () => {
    for (let i = 0; ; i++) {
      try {
        return await getJsonOnce(path);
      } catch (error) {
        if (error instanceof Throttled || error instanceof StopError || error instanceof SearchForbidden || i >= 2) throw error;
        await sleep(3000 * (i + 1));
      }
    }
  });
}

// A configured subreddit: does it exist, is it public, how big.
async function aboutSub(sub) {
  return withRecovery(`about r/${sub}`, async () => {
    await gate(net.c.requestGapSeconds);
    const res = await fetchRaw(`${BASE}/r/${encodeURIComponent(sub)}/about.json?raw_json=1`);
    if (res.status === 0 || res.status === 429 || /^\s*</.test(res.text)) throw new Throttled(`about r/${sub}: ${res.status || res.text}`);
    if (res.status === 403) {
      if (/private|banned|quarantin/i.test(res.text)) return { name: sub, ok: false, status: "private or banned" };
      throw new Throttled(`HTTP 403 for about r/${sub}`);
    }
    if (res.status === 404) return { name: sub, ok: false, status: "does not exist" };
    if (res.status !== 200) return { name: sub, ok: true, status: `unchecked (HTTP ${res.status})` };
    const d = JSON.parse(res.text);
    if (d?.kind !== "t5") return { name: sub, ok: false, status: "does not exist" };
    const type = d.data.subreddit_type;
    return { name: d.data.display_name, ok: type === "public" || type === "restricted", status: type, members: d.data.subscribers ?? null };
  });
}

async function signedInUser() {
  const me = await getJson("/api/me.json").catch((error) => {
    if (error instanceof StopError) throw error;
    return null;
  });
  return me?.data?.name ?? me?.name ?? null;
}

function toPost(d) {
  return {
    id: d.name,
    subreddit: d.subreddit,
    title: d.title ?? "",
    body: (d.selftext ?? "").slice(0, 4000),
    score: d.score ?? 0,
    comments: d.num_comments ?? 0,
    permalink: d.permalink,
    created: d.created_utc ?? null,
    flair: d.link_flair_text ?? null,
    nsfw: Boolean(d.over_18),
  };
}

function listing(json) {
  return (json?.data?.children ?? []).filter((c) => c.kind === "t3").map((c) => toPost(c.data));
}

// ---------- search pages (when search JSON is forbidden) ----------

let searchViaHtml = false;
// Search pages load in their own tab: after visiting them, JSON fetches from that tab fail,
// so the main tab stays on reddit.com for listings and threads.
let searchTab = null;
async function searchPage() {
  if (!searchTab || searchTab.isClosed()) searchTab = await net.page.context().newPage();
  return searchTab;
}

const count = (s) => {
  const m = String(s ?? "").match(/([\d.]+)\s*([km]?)/i);
  if (!m) return 0;
  return Math.round(Number(m[1]) * ({ k: 1_000, m: 1_000_000 }[m[2].toLowerCase()] ?? 1));
};

const BLOCK_PAGE = /whoa there|too many requests|blocked by network security|you've been blocked|rate limit/i;

async function openSearchPage(url) {
  await gate(net.c.searchPageGapSeconds);
  const page = await searchPage();
  const resp = await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (resp && [403, 429].includes(resp.status())) throw new Throttled(`search page HTTP ${resp.status()}`);
  await page.waitForTimeout(3000);
  const head = await page.evaluate(() => document.body?.innerText?.slice(0, 600) ?? "");
  if (BLOCK_PAGE.test(head)) throw new Throttled(`search page blocked: ${head.slice(0, 60).replace(/\s+/g, " ")}`);
  return page;
}

async function htmlSearchPosts(url, limit) {
  return withRecovery(`search page ${url.split("?")[0]}`, async () => {
    const page = await openSearchPage(url);
    let last = -1;
    for (let i = 0; i < 12; i++) {
      const n = await page.locator('[data-testid="sdui-post-unit"]').count();
      if (n >= limit || n === last) break;
      last = n;
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(1500);
    }
    const cards = await page.$$eval('[data-testid="sdui-post-unit"]', (units) =>
      units.map((u) => ({
        href: u.querySelector('a[href*="/comments/"]')?.getAttribute("href") ?? "",
        title: (u.querySelector('[data-testid="post-title-text"]') ?? u.querySelector('a[href*="/comments/"]'))?.innerText?.trim() ?? "",
        counters: u.querySelector('[data-testid="search-counter-row"]')?.innerText ?? u.innerText.match(/[\d.]+[KkMm]?\s*votes?.*comments?/)?.[0] ?? "",
        text: u.innerText.replace(/\s+/g, " ").trim(),
      })),
    );
    const seen = new Set();
    const posts = [];
    for (const c of cards) {
      const m = c.href.match(/\/r\/([^/]+)\/comments\/([a-z0-9]+)/i);
      if (!m || seen.has(m[2])) continue;
      seen.add(m[2]);
      const votes = c.counters.match(/([\d.]+\s*[KkMm]?)\s*votes?/)?.[1];
      const comments = c.counters.match(/([\d.]+\s*[KkMm]?)\s*comments?/)?.[1];
      posts.push({
        id: `t3_${m[2]}`,
        subreddit: m[1],
        title: c.title,
        body: c.text.replace(c.title, "").replace(/^r\/\S+\s*·\s*/, "").replace(/[\d.]+\s*[KkMm]?\s*votes?.*$/, "").trim().slice(0, 1000),
        score: count(votes),
        comments: count(comments),
        permalink: c.href.split("?")[0],
        created: null, // filled in when the thread is read
        flair: null,
        nsfw: false,
      });
      if (posts.length >= limit) break;
    }
    return posts;
  });
}

async function htmlCommunities(query) {
  return withRecovery(`communities "${query}"`, async () => {
    const page = await openSearchPage(`/search/?q=${encodeURIComponent(query)}&type=communities`);
    return page.$$eval('[data-testid="search-community"]', (units) =>
      units.map((u) => {
        const name = u.querySelector('a[href^="/r/"]')?.getAttribute("href")?.split("/")[2] ?? "";
        const text = u.innerText.replace(/\s+/g, " ");
        return { name, members: text.match(/([\d.]+\s*[KkMm]?)\s*(members|weekly)/)?.[1] ?? null, description: (u.querySelector('[data-testid="search-subreddit-desc-text"]')?.innerText ?? "").slice(0, 300) };
      }).filter((s) => s.name),
    );
  });
}

function switchToHtml() {
  if (searchViaHtml) return;
  searchViaHtml = true;
  log(P, "Reddit forbids search JSON for this session — reading search pages instead");
}

// Search through JSON while it works; after the first 403 on search, use the search pages.
async function searchPosts(jsonPath, htmlPath, limit) {
  if (!searchViaHtml) {
    try {
      return listing(await getJson(jsonPath));
    } catch (error) {
      if (!(error instanceof SearchForbidden)) throw error;
      switchToHtml();
    }
  }
  return htmlSearchPosts(htmlPath, limit);
}

async function communitiesFor(q) {
  if (!searchViaHtml) {
    try {
      const json = await getJson(`/subreddits/search.json?q=${encodeURIComponent(q)}&limit=25`);
      return (json?.data?.children ?? []).map((c) => c.data).filter((d) => !d.over18).map((d) => ({ name: d.display_name, members: d.subscribers ?? null, description: (d.public_description ?? "").slice(0, 300) }));
    } catch (error) {
      if (!(error instanceof SearchForbidden)) throw error;
      switchToHtml();
    }
  }
  return (await htmlCommunities(q)).map((d) => ({ ...d, members: d.members ? count(d.members) : null }));
}

// Flatten a comment tree (skips "more" stubs, deleted/removed).
function flattenComments(children, out, max, depth = 0) {
  for (const c of children ?? []) {
    if (out.length >= max) return;
    if (c.kind !== "t1") continue;
    const d = c.data;
    if (d.body && d.body !== "[deleted]" && d.body !== "[removed]") {
      out.push({ author: d.author, score: d.score ?? 0, depth, text: d.body, created: d.created_utc ?? null });
    }
    if (d.replies?.data?.children) flattenComments(d.replies.data.children, out, max, depth + 1);
  }
}

// Thread JSON also carries the post itself: fills in date/body for posts found via search pages.
async function readThread(post, max) {
  const json = await getJson(`${post.permalink.replace(/\/$/, "")}.json?sort=top&limit=${Math.min(500, max)}`);
  const comments = [];
  flattenComments(json?.[1]?.data?.children, comments, max);
  const d = json?.[0]?.data?.children?.[0]?.data;
  return { comments, post: d ? toPost(d) : null };
}

function buildMarkdown(config, { subs, subStatus, posts, offTopicPosts, groupTerms, threads, stopped, user, resumed, cooledMin }) {
  const c = config.reddit;
  const onSubs = subs.filter((s) => s.onTopic !== false);
  const offSubs = subs.filter((s) => s.onTopic === false);
  const badSubs = subStatus.filter((s) => !s.ok);
  const allComments = threads.flatMap((t) => t.comments.map((cm) => ({ ...cm, thread: t })));
  const topComments = allComments.filter((cm) => cm.text.length >= 60).sort((a, b) => b.score - a.score).slice(0, 30);
  const bySub = new Map();
  for (const p of posts) bySub.set(p.subreddit, (bySub.get(p.subreddit) ?? 0) + 1);

  const dated = posts.filter((p) => p.created).map((p) => p.created * 1000).sort((a, b) => a - b);
  const span = dated.length ? `${new Date(dated[0]).toISOString().slice(0, 10)} → ${new Date(dated.at(-1)).toISOString().slice(0, 10)}` : "—";
  return `# Reddit — ${config.group}

Collected ${today()}${user ? "" : " (not signed in)"} · searches: ${c.searchSort}, ${c.searchTimeframe} · top posts: ${c.topTimeframe} · ${c.subreddits.length} subreddits · ${c.searchQueries.length} queries · ${posts.length} posts · ${threads.length} threads read · ${allComments.length} comments${resumed ? " · resumed from a saved run" : ""}${cooledMin ? ` · ${cooledMin} min of rate-limit cool-downs` : ""}${stopped ? ` · stopped early: ${stopped}` : ""}${offTopicPosts.length ? ` · ${offTopicPosts.length} off-topic posts set aside` : ""}

Reddit skews to the US and other English-speaking countries — for India-focused groups, treat it as a weak signal unless Indian subreddits show up below.

Posts span ${span} (median ${dated.length ? new Date(dated[Math.floor(dated.length / 2)]).toISOString().slice(0, 10) : "—"}).

Raw data: \`raw/reddit/subreddits.json\`, \`raw/reddit/posts.json\`, \`raw/reddit/threads.json\`

## Configured subreddits

${subStatus.length ? mdTable(["Subreddit", "Status", "Members"], subStatus.map((s) => [`r/${s.name}`, s.ok ? s.status : `**${s.status}** — skipped`, s.members?.toLocaleString("en-US") ?? "—"])) : "_None configured._"}${badSubs.length ? `\n\n${badSubs.length} configured subreddit(s) could not be read — remove or replace them in config.json.` : ""}

## Communities found (Reddit's relevance order)

${onSubs.length ? mdTable(["Subreddit", "Members", "About"], onSubs.slice(0, 30).map((s) => [`r/${s.name}`, s.members?.toLocaleString("en-US") ?? "—", quote(s.description, 120)])) : "_Discovery off or nothing on-topic found._"}${offSubs.length ? `\n\n**Discovered but off-topic** (no group term in the name and fewer than two in the description): ${offSubs.slice(0, 40).map((s) => `r/${s.name}`).join(", ")}` : ""}

## Posts collected per subreddit

${bySub.size ? mdTable(["Subreddit", "Posts"], [...bySub.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => [`r/${s}`, n])) : "_None._"}

## Most-discussed posts

${[...posts].sort((a, b) => b.comments - a.comments).slice(0, 25).map((p) => `- **${quote(p.title, 140)}** · r/${p.subreddit} · ⬆${p.score} · 💬${p.comments} · ${p.created ? new Date(p.created * 1000).toISOString().slice(0, 10) : "—"}`).join("\n") || "_None._"}

${offTopicPosts.length ? `## Off-topic posts set aside\n\nAll-of-Reddit search results that mention none of the group terms (${groupTerms.join(", ")}). Busiest subreddits among them: ${[...offTopicPosts.reduce((m, p) => m.set(p.subreddit, (m.get(p.subreddit) ?? 0) + 1), new Map())].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([s, n]) => `r/${s} (${n})`).join(", ")}\n\n` : ""}## Top comments

${topComments.map((cm) => `- ⬆${cm.score} · _${quote(cm.thread.title, 60)}_ — “${quote(cm.text)}”`).join("\n") || "_None._"}

## Insights

_To be written by the group-analysis skill: recurring pains with counts and real quotes, tools people name (and complain about), what they pay, and where this group gathers._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.reddit;
  if (c.subreddits.length === 0 && c.searchQueries.length === 0 && c.discoveryQueries.length === 0) throw new Error("reddit: subreddits, searchQueries and discoveryQueries are all empty");
  const dir = rawDir(config.slug, P);
  const stateFile = `${dir}/state.json`;

  // Resume an unfinished run of the same config (same subreddits, queries and timeframes).
  const fingerprint = JSON.stringify([c.subreddits, c.searchQueries, c.discoveryQueries, c.searchAllReddit, c.searchSort, c.searchTimeframe, c.topTimeframe, c.postsPerSearch, c.topPostsPerSub]);
  let saved = null;
  if (!FRESH && fs.existsSync(stateFile)) {
    try {
      const s = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      if (s.fingerprint === fingerprint && !s.complete) saved = s;
    } catch {}
  }
  const done = new Set(saved?.done ?? []);
  const posts = new Map((saved?.posts ?? []).map((p) => [p.id, p]));
  const offTopic = new Map((saved?.offTopic ?? []).map((p) => [p.id, p]));
  const threads = saved?.threads ?? [];
  const subStatus = saved?.subStatus ?? [];
  let subs = saved?.subs ?? [];
  searchViaHtml = Boolean(saved?.searchViaHtml);
  const resumed = Boolean(saved);
  if (resumed) log(P, `resuming: ${done.size} steps done, ${posts.size} posts, ${threads.length} threads already collected (use --fresh to start over)`);

  const checkpoint = (complete = false) => {
    writeJson(stateFile, { fingerprint, complete, savedAt: new Date().toISOString(), done: [...done], posts: [...posts.values()], offTopic: [...offTopic.values()], threads, subStatus, subs, searchViaHtml });
  };
  // One step = one request group; skipped if a previous run finished it.
  const step = async (key, fn) => {
    if (done.has(key)) return;
    await fn();
    done.add(key);
    checkpoint();
  };

  // Configured groupTerms match as whole phrases ("law school" must not match every "school"); without them, fall back to the words of discoveryQueries.
  const groupTerms = c.groupTerms.length ? [...new Set(c.groupTerms.map((t) => t.toLowerCase().replace(/[^a-z0-9 '-]/g, "").trim()).filter(Boolean))] : terms(c.discoveryQueries);
  const queryTerms = terms(c.searchQueries);
  const filtering = c.relevanceFilter && groupTerms.length > 0;
  const configured = new Set(c.subreddits.map((s) => s.toLowerCase()));
  // Posts from configured subreddits are on-topic by choice; all-of-Reddit posts must mention a group term.
  const addPosts = (rows, fromConfigured) => {
    for (const r of rows.filter((x) => !x.nsfw && x.score >= c.minPostScore)) {
      if (posts.has(r.id)) continue;
      const text = `${r.title} ${r.body}`;
      const group = matchCount(text, groupTerms);
      r.relevance = group + matchCount(text, queryTerms);
      if (fromConfigured || configured.has(r.subreddit.toLowerCase()) || !filtering || group > 0) posts.set(r.id, r);
      else offTopic.set(r.id, r);
    }
  };

  const { context, page } = await openProfileBrowser();
  Object.assign(net, { page, c, onCooldown: () => checkpoint() });
  let stopped = null;
  let user = null;

  try {
    await withRecovery("open reddit.com", async () => {
      const resp = await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45_000 });
      if (resp && [403, 429].includes(resp.status())) throw new Throttled(`reddit.com HTTP ${resp.status()}`);
    });
    user = await signedInUser();
    if (!user) throw new StopError('Not signed in to Reddit in the automation profile. Run "node login.mjs", sign in to Reddit, close the window, then re-run.');
    log(P, `signed in as u/${user}`);

    if (c.discoverSubreddits && c.discoveryQueries.length) {
      await step("discover", async () => {
        const found = new Map();
        for (const q of c.discoveryQueries) {
          try {
            const list = await communitiesFor(q);
            for (const d of list) if (!found.has(d.name.toLowerCase())) found.set(d.name.toLowerCase(), { ...d, query: q });
            log(P, `subreddits for "${q}": ${list.length}`);
          } catch (error) {
            if (error instanceof StopError) throw error;
            log(P, `subreddit discovery for "${q}" failed, skipped: ${firstLine(error)}`);
          }
        }
        subs = [...found.values()];
        if (filtering) {
          // "IndianTeachers" → "Indian Teachers" so camel-case names match too.
          // On-topic: a group term in the name, or two in the description (one alone is too loose: "a school of Hinduism").
          subs = subs.map((s) => ({ ...s, onTopic: matchCount(s.name.replace(/([a-z])([A-Z])/g, "$1 $2"), groupTerms) > 0 || matchCount(s.description, groupTerms) >= 2 }));
          log(P, `communities: ${subs.filter((s) => s.onTopic).length} on-topic, ${subs.filter((s) => !s.onTopic).length} off-topic`);
        }
      });
    }

    for (const sub of c.subreddits) {
      await step(`about:${sub}`, async () => {
        let status;
        try {
          status = await aboutSub(sub);
        } catch (error) {
          if (error instanceof StopError) throw error;
          status = { name: sub, ok: true, status: `unchecked (${firstLine(error)})` };
        }
        subStatus.push(status);
        log(P, `r/${sub}: ${status.status}`);
      });
    }

    for (const sub of subStatus.filter((s) => s.ok).map((s) => s.name)) {
      for (const q of c.searchQueries) {
        await step(`search:${sub}:${q}`, async () => {
          const qs = `q=${encodeURIComponent(q)}&restrict_sr=1&sort=${c.searchSort}&t=${c.searchTimeframe}`;
          try {
            const rows = await searchPosts(`/r/${sub}/search.json?${qs}&limit=${c.postsPerSearch}`, `/r/${sub}/search/?${qs}`, c.postsPerSearch);
            addPosts(rows, true);
            log(P, `r/${sub} "${q}": ${rows.length} posts`);
          } catch (error) {
            if (error instanceof StopError) throw error;
            log(P, `r/${sub} "${q}" failed, skipped: ${firstLine(error)}`);
          }
        });
      }
      if (c.topPostsPerSub > 0) {
        await step(`top:${sub}`, async () => {
          try {
            const rows = listing(await getJson(`/r/${sub}/top.json?t=${c.topTimeframe}&limit=${c.topPostsPerSub}`));
            addPosts(rows, true);
            log(P, `r/${sub} top (${c.topTimeframe}): ${rows.length} posts`);
          } catch (error) {
            if (error instanceof StopError) throw error;
            log(P, `r/${sub} top failed, skipped: ${firstLine(error)}`);
          }
        });
      }
    }

    if (c.searchAllReddit) {
      for (const q of c.searchQueries) {
        await step(`all:${q}`, async () => {
          const qs = `q=${encodeURIComponent(q)}&sort=${c.searchSort}&t=${c.searchTimeframe}`;
          try {
            const rows = await searchPosts(`/search.json?${qs}&limit=${c.postsPerSearch}`, `/search/?${qs}`, c.postsPerSearch);
            const before = offTopic.size;
            addPosts(rows, false);
            log(P, `all of Reddit "${q}": ${rows.length} posts${offTopic.size > before ? ` (${offTopic.size - before} off-topic set aside)` : ""}`);
          } catch (error) {
            if (error instanceof StopError) throw error;
            log(P, `all of Reddit "${q}" failed, skipped: ${firstLine(error)}`);
          }
        });
      }
    }

    // Most relevant first, then busiest: each matched term counts like a 10x bigger thread.
    const rank = (p) => p.relevance + Math.log10(p.comments + 1);
    const read = new Set(threads.map((t) => t.id));
    const toRead = [...posts.values()].filter((p) => p.comments > 0 && !read.has(p.id) && !done.has(`thread:${p.id}`)).sort((a, b) => rank(b) - rank(a)).slice(0, Math.max(0, c.maxThreads - threads.length));
    for (const [i, post] of toRead.entries()) {
      await step(`thread:${post.id}`, async () => {
        try {
          const { comments, post: full } = await readThread(post, c.commentsPerThread);
          threads.push({ ...post, ...(full ?? {}), comments });
          if (full) posts.set(post.id, { ...post, ...full });
          log(P, `[${threads.length}/${c.maxThreads}] thread "${quote(post.title, 50)}": ${comments.length} comments`);
        } catch (error) {
          if (error instanceof StopError) throw error;
          log(P, `[${i + 1}/${toRead.length}] thread "${quote(post.title, 50)}" failed, skipped: ${firstLine(error)}`);
        }
      });
    }
  } catch (error) {
    if (!(error instanceof StopError)) throw error;
    stopped = error.message;
    log(P, stopped);
  } finally {
    checkpoint(!stopped);
    await closeProfileBrowser(context);
  }

  writeJson(`${dir}/subreddits.json`, subs);
  writeJson(`${dir}/posts.json`, [...posts.values()]);
  writeJson(`${dir}/threads.json`, threads);
  writeJson(`${dir}/off-topic-posts.json`, [...offTopic.values()]);
  writeJson(`${dir}/configured-subreddits.json`, subStatus);
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, { subs, subStatus, posts: [...posts.values()], offTopicPosts: [...offTopic.values()], groupTerms, threads, stopped, user, resumed, cooledMin: Math.round(net.waitedMs / 60_000) }));
  log(P, `wrote ${file}`);
  if (stopped && posts.size === 0) process.exit(1);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
