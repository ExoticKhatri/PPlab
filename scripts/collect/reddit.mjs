// Reddit: communities, posts and comments where the group talks shop.
//
//   node reddit.mjs <group-slug>
//
// Runs inside the signed-in Brave profile and reads Reddit's own JSON
// (the same data the site loads) with the session's cookies. Signed-out
// automated requests get 403, and old.reddit now redirects logged-in users
// to the redesign, so page scraping is fragile — the JSON is not.
//   1. discover subreddits matching the queries (with member counts)
//   2. search each subreddit (and optionally all of Reddit)
//   3. take each subreddit's top posts
//   4. open the most relevant, most-commented threads and read their comments
// Configured subreddits are checked first (missing/private ones are reported).
// With relevanceFilter on, discovered communities and all-of-Reddit posts
// must mention a group term; the rest are kept aside and counted in the .md.
// Read-only, human-paced; stops on 401/403/429 or when signed out.

import { closeProfileBrowser, openProfileBrowser } from "./lib/browser.mjs";
import { loadConfig, log, mdTable, pause, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "reddit";
const BASE = "https://www.reddit.com";

class StopError extends Error {}

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

// A configured subreddit: does it exist, is it public, how big. Reads the status
// itself because a private subreddit answers 403, which must not stop the run.
async function aboutSub(page, sub) {
  const res = await page.evaluate(async (url) => {
    const r = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
    return { status: r.status, text: r.status === 200 ? await r.text() : "" };
  }, `${BASE}/r/${encodeURIComponent(sub)}/about.json?raw_json=1`);
  if (res.status === 429) throw new StopError("Reddit returned 429 (rate limited) — wait and re-run.");
  if (res.status === 403) return { name: sub, ok: false, status: "private or banned" };
  if (res.status === 404) return { name: sub, ok: false, status: "does not exist" };
  if (res.status !== 200) return { name: sub, ok: true, status: `unchecked (HTTP ${res.status})` };
  const d = JSON.parse(res.text);
  if (d?.kind !== "t5") return { name: sub, ok: false, status: "does not exist" };
  const type = d.data.subreddit_type;
  return { name: d.data.display_name, ok: type === "public" || type === "restricted", status: type, members: d.data.subscribers ?? null };
}

async function getJson(page, path) {
  return retry(() => getJsonOnce(page, path), { label: path.split("?")[0], platform: P });
}

async function getJsonOnce(page, path) {
  const res = await page.evaluate(async (url) => {
    const r = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
    return { status: r.status, text: await r.text() };
  }, `${BASE}${path}${path.includes("?") ? "&" : "?"}raw_json=1`);
  if ([401, 403, 429].includes(res.status)) {
    throw new StopError(`Reddit returned ${res.status} for ${path}. ${res.status === 429 ? "Rate limited — wait and re-run." : 'Run "node login.mjs", sign in to Reddit, close the window, then re-run.'}`);
  }
  if (res.status !== 200) throw new Error(`Reddit ${res.status} for ${path}`);
  return JSON.parse(res.text);
}

async function signedInUser(page) {
  try {
    const me = await getJson(page, "/api/me.json");
    return me?.data?.name ?? me?.name ?? null;
  } catch {
    return null;
  }
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

async function discoverSubreddits(page, queries) {
  const subs = new Map();
  for (const q of queries) {
    const json = await getJson(page, `/subreddits/search.json?q=${encodeURIComponent(q)}&limit=25`);
    const found = (json?.data?.children ?? []).map((c) => c.data).filter((d) => !d.over18);
    for (const d of found) {
      const key = d.display_name.toLowerCase();
      if (!subs.has(key)) subs.set(key, { name: d.display_name, members: d.subscribers ?? null, description: (d.public_description ?? "").slice(0, 300), query: q });
    }
    log(P, `subreddits for "${q}": ${found.length}`);
    await pause(1500, 3500);
  }
  return [...subs.values()];
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

async function readThread(page, post, max) {
  const json = await getJson(page, `${post.permalink.replace(/\/$/, "")}.json?sort=top&limit=${Math.min(500, max)}`);
  const comments = [];
  flattenComments(json?.[1]?.data?.children, comments, max);
  return comments;
}

function buildMarkdown(config, { subs, subStatus, posts, offTopicPosts, groupTerms, threads, stopped, user }) {
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

Collected ${today()}${user ? "" : " (not signed in)"} · searches: ${c.searchSort}, ${c.searchTimeframe} · top posts: ${c.topTimeframe} · ${c.subreddits.length} subreddits · ${c.searchQueries.length} queries · ${posts.length} posts · ${threads.length} threads read · ${allComments.length} comments${stopped ? ` · stopped early: ${stopped}` : ""}${offTopicPosts.length ? ` · ${offTopicPosts.length} off-topic posts set aside` : ""}

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

  const { context, page } = await openProfileBrowser();
  const posts = new Map();
  const threads = [];
  const offTopic = new Map();
  const subStatus = [];
  let subs = [];
  let stopped = null;
  let user = null;
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

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    user = await signedInUser(page);
    log(P, user ? `signed in as u/${user}` : "not signed in — Reddit may refuse requests (run node login.mjs)");

    if (c.discoverSubreddits) {
      if (c.discoveryQueries.length) subs = await discoverSubreddits(page, c.discoveryQueries);
      else log(P, "discoverSubreddits is on but discoveryQueries is empty — skipped");
      if (filtering) {
        // "IndianTeachers" → "Indian Teachers" so camel-case names match too.
        // On-topic: a group term in the name, or two in the description (one alone is too loose: "a school of Hinduism").
        subs = subs.map((s) => ({ ...s, onTopic: matchCount(s.name.replace(/([a-z])([A-Z])/g, "$1 $2"), groupTerms) > 0 || matchCount(s.description, groupTerms) >= 2 }));
        log(P, `communities: ${subs.filter((s) => s.onTopic).length} on-topic, ${subs.filter((s) => !s.onTopic).length} off-topic`);
      }
    }

    for (const sub of c.subreddits) {
      try {
        subStatus.push(await aboutSub(page, sub));
      } catch (error) {
        if (error instanceof StopError) throw error;
        subStatus.push({ name: sub, ok: true, status: `unchecked (${error.message})` });
      }
      log(P, `r/${sub}: ${subStatus.at(-1).status}`);
      await pause(1000, 2500);
    }

    for (const sub of subStatus.filter((s) => s.ok).map((s) => s.name)) {
      for (const q of c.searchQueries) {
        try {
          const rows = listing(await getJson(page, `/r/${sub}/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=${c.searchSort}&t=${c.searchTimeframe}&limit=${c.postsPerSearch}`));
          addPosts(rows, true);
          log(P, `r/${sub} "${q}": ${rows.length} posts`);
        } catch (error) {
          if (error instanceof StopError) throw error;
          log(P, `request failed, skipped: ${error.message}`);
        }
        await pause(1500, 3500);
      }
      if (c.topPostsPerSub > 0) {
        try {
          const rows = listing(await getJson(page, `/r/${sub}/top.json?t=${c.topTimeframe}&limit=${c.topPostsPerSub}`));
          addPosts(rows, true);
          log(P, `r/${sub} top (${c.topTimeframe}): ${rows.length} posts`);
        } catch (error) {
          if (error instanceof StopError) throw error;
          log(P, `request failed, skipped: ${error.message}`);
        }
        await pause(1500, 3500);
      }
    }

    if (c.searchAllReddit) {
      for (const q of c.searchQueries) {
        try {
          const rows = listing(await getJson(page, `/search.json?q=${encodeURIComponent(q)}&sort=${c.searchSort}&t=${c.searchTimeframe}&limit=${c.postsPerSearch}`));
          const before = offTopic.size;
          addPosts(rows, false);
          log(P, `all of Reddit "${q}": ${rows.length} posts${offTopic.size > before ? ` (${offTopic.size - before} off-topic set aside)` : ""}`);
        } catch (error) {
          if (error instanceof StopError) throw error;
          log(P, `request failed, skipped: ${error.message}`);
        }
        await pause(1500, 3500);
      }
    }

    // Most relevant first, then busiest: each matched term counts like a 10x bigger thread.
    const rank = (p) => p.relevance + Math.log10(p.comments + 1);
    const toRead = [...posts.values()].filter((p) => p.comments > 0).sort((a, b) => rank(b) - rank(a)).slice(0, c.maxThreads);
    for (const [i, post] of toRead.entries()) {
      try {
        const comments = await readThread(page, post, c.commentsPerThread);
        threads.push({ ...post, comments });
        log(P, `[${i + 1}/${toRead.length}] thread "${quote(post.title, 50)}": ${comments.length} comments`);
      } catch (error) {
        if (error instanceof StopError) throw error;
        log(P, `thread "${quote(post.title, 50)}" failed, skipped: ${error.message}`);
      }
      await pause(2000, 4500);
    }
  } catch (error) {
    if (!(error instanceof StopError)) throw error;
    stopped = error.message;
    log(P, stopped);
  } finally {
    await closeProfileBrowser(context);
  }

  writeJson(`${dir}/subreddits.json`, subs);
  writeJson(`${dir}/posts.json`, [...posts.values()]);
  writeJson(`${dir}/threads.json`, threads);
  writeJson(`${dir}/off-topic-posts.json`, [...offTopic.values()]);
  writeJson(`${dir}/configured-subreddits.json`, subStatus);
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, { subs, subStatus, posts: [...posts.values()], offTopicPosts: [...offTopic.values()], groupTerms, threads, stopped, user }));
  log(P, `wrote ${file}`);
  if (stopped && posts.size === 0) process.exit(1);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
