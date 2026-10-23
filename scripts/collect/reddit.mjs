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
//   4. open the most-commented threads and read their comments
// Read-only, human-paced; stops on 401/403/429 or when signed out.

import { closeProfileBrowser, openProfileBrowser } from "./lib/browser.mjs";
import { loadConfig, log, mdTable, pause, quote, rawDir, retry, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "reddit";
const BASE = "https://www.reddit.com";

class StopError extends Error {}

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

function buildMarkdown(config, subs, posts, threads, stopped, user) {
  const c = config.reddit;
  const allComments = threads.flatMap((t) => t.comments.map((cm) => ({ ...cm, thread: t })));
  const topComments = allComments.filter((cm) => cm.text.length >= 60).sort((a, b) => b.score - a.score).slice(0, 30);
  const bySub = new Map();
  for (const p of posts) bySub.set(p.subreddit, (bySub.get(p.subreddit) ?? 0) + 1);

  const dated = posts.filter((p) => p.created).map((p) => p.created * 1000).sort((a, b) => a - b);
  const span = dated.length ? `${new Date(dated[0]).toISOString().slice(0, 10)} → ${new Date(dated.at(-1)).toISOString().slice(0, 10)}` : "—";
  return `# Reddit — ${config.group}

Collected ${today()}${user ? "" : " (not signed in)"} · searches: ${c.searchSort}, ${c.searchTimeframe} · top posts: ${c.topTimeframe} · ${c.subreddits.length} subreddits · ${c.searchQueries.length} queries · ${posts.length} posts · ${threads.length} threads read · ${allComments.length} comments${stopped ? ` · stopped early: ${stopped}` : ""}

Posts span ${span} (median ${dated.length ? new Date(dated[Math.floor(dated.length / 2)]).toISOString().slice(0, 10) : "—"}).

Raw data: \`raw/reddit/subreddits.json\`, \`raw/reddit/posts.json\`, \`raw/reddit/threads.json\`

## Communities found (Reddit's relevance order)

${subs.length ? mdTable(["Subreddit", "Members", "About"], subs.slice(0, 30).map((s) => [`r/${s.name}`, s.members?.toLocaleString("en-US") ?? "—", quote(s.description, 120)])) : "_Discovery off or nothing found._"}

## Posts collected per subreddit

${bySub.size ? mdTable(["Subreddit", "Posts"], [...bySub.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => [`r/${s}`, n])) : "_None._"}

## Most-discussed posts

${[...posts].sort((a, b) => b.comments - a.comments).slice(0, 25).map((p) => `- **${quote(p.title, 140)}** · r/${p.subreddit} · ⬆${p.score} · 💬${p.comments} · ${p.created ? new Date(p.created * 1000).toISOString().slice(0, 10) : "—"}`).join("\n") || "_None._"}

## Top comments

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
  let subs = [];
  let stopped = null;
  let user = null;
  const addPosts = (rows) => rows.filter((r) => !r.nsfw && r.score >= c.minPostScore).forEach((r) => posts.has(r.id) || posts.set(r.id, r));

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    user = await signedInUser(page);
    log(P, user ? `signed in as u/${user}` : "not signed in — Reddit may refuse requests (run node login.mjs)");

    if (c.discoverSubreddits) {
      if (c.discoveryQueries.length) subs = await discoverSubreddits(page, c.discoveryQueries);
      else log(P, "discoverSubreddits is on but discoveryQueries is empty — skipped");
    }

    for (const sub of c.subreddits) {
      for (const q of c.searchQueries) {
        try {
          const rows = listing(await getJson(page, `/r/${sub}/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=${c.searchSort}&t=${c.searchTimeframe}&limit=${c.postsPerSearch}`));
          addPosts(rows);
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
          addPosts(rows);
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
          addPosts(rows);
          log(P, `all of Reddit "${q}": ${rows.length} posts`);
        } catch (error) {
          if (error instanceof StopError) throw error;
          log(P, `request failed, skipped: ${error.message}`);
        }
        await pause(1500, 3500);
      }
    }

    const toRead = [...posts.values()].filter((p) => p.comments > 0).sort((a, b) => b.comments - a.comments).slice(0, c.maxThreads);
    for (const post of toRead) {
      try {
        const comments = await readThread(page, post, c.commentsPerThread);
        threads.push({ ...post, comments });
        log(P, `thread "${quote(post.title, 50)}": ${comments.length} comments`);
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
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, subs, [...posts.values()], threads, stopped, user));
  log(P, `wrote ${file}`);
  if (stopped && posts.size === 0) process.exit(1);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
