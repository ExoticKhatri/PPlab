// Reddit: communities, posts and comments where the group talks shop.
//
//   node reddit.mjs <group-slug>
//
// Runs in the signed-in Brave profile (Reddit blocks signed-out automated
// requests) on old.reddit.com, whose pages are simple and stable:
//   1. discover subreddits matching the queries (with member counts)
//   2. search each subreddit (and optionally all of Reddit) for the queries
//   3. take each subreddit's top posts
//   4. open the most-commented threads and read their comments
// Read-only, human-paced; stops if Reddit shows a block page or we're signed out.

import { isBlocked, openProfileBrowser } from "./lib/browser.mjs";
import { loadConfig, log, mdTable, pause, quote, rawDir, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "reddit";
const OLD = "https://old.reddit.com";

class StopError extends Error {}

async function visit(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  if (/\/login\b/.test(new URL(page.url()).pathname)) {
    throw new StopError('old Reddit requires a signed-in account. Run "node login.mjs", sign in to Reddit, close the browser, then re-run.');
  }
  if (await isBlocked(page)) throw new StopError(`Reddit blocked ${url}. Run "node login.mjs", sign in to Reddit, and retry later.`);
}

async function signedInUser(page) {
  return page.evaluate(() => {
    const link = document.querySelector("#header-bottom-right .user a");
    return link && !/login|sign up/i.test(link.textContent ?? "") ? link.textContent.trim() : null;
  });
}

// Every post row on an old-reddit listing or search page.
async function readPostRows(page) {
  return page.evaluate(() => {
    const rows = [];
    // Listings (top/new/hot): .thing.link carries data-* attributes.
    for (const el of document.querySelectorAll("#siteTable > .thing.link")) {
      if (el.classList.contains("promoted")) continue;
      rows.push({
        id: el.getAttribute("data-fullname"),
        subreddit: el.getAttribute("data-subreddit"),
        title: el.querySelector("a.title")?.textContent?.trim() ?? "",
        score: Number(el.getAttribute("data-score") ?? 0),
        comments: Number(el.getAttribute("data-comments-count") ?? 0),
        permalink: el.getAttribute("data-permalink"),
        created: Number(el.getAttribute("data-timestamp") ?? 0) || null,
      });
    }
    // Search results: .search-result-link.
    for (const el of document.querySelectorAll(".search-result-link")) {
      const titleLink = el.querySelector("a.search-title");
      const num = (sel) => Number((el.querySelector(sel)?.textContent ?? "0").replace(/[^\d]/g, "")) || 0;
      const href = titleLink?.getAttribute("href") ?? "";
      rows.push({
        id: el.getAttribute("data-fullname"),
        subreddit: el.querySelector("a.search-subreddit-link")?.textContent?.replace(/^r\//, "").trim() ?? null,
        title: titleLink?.textContent?.trim() ?? "",
        score: num(".search-score"),
        comments: num("a.search-comments"),
        permalink: href.replace(/^https?:\/\/(old|www)\.reddit\.com/, ""),
        created: Date.parse(el.querySelector("time")?.getAttribute("datetime") ?? "") / 1000 || null,
      });
    }
    return rows.filter((r) => r.id && r.permalink);
  });
}

async function discoverSubreddits(page, queries) {
  const subs = new Map();
  for (const q of queries) {
    await visit(page, `${OLD}/subreddits/search?q=${encodeURIComponent(q)}&limit=25`);
    const found = await page.evaluate(() =>
      [...document.querySelectorAll("#siteTable > .thing.subreddit")].map((el) => ({
        name: el.querySelector("a.title")?.textContent?.replace(/^\/?r\//, "").split(":")[0].trim() ?? "",
        members: Number((el.querySelector(".score.unvoted .number, .subscribers .number")?.textContent ?? "0").replace(/[^\d]/g, "")) || null,
        description: el.querySelector(".md")?.textContent?.trim().slice(0, 300) ?? "",
        nsfw: Boolean(el.querySelector(".nsfw-stamp")),
      })),
    );
    for (const s of found) if (s.name && !s.nsfw && !subs.has(s.name.toLowerCase())) subs.set(s.name.toLowerCase(), { ...s, query: q });
    log(P, `subreddits for "${q}": ${found.length}`);
    await pause(2000, 4500);
  }
  return [...subs.values()];
}

async function readThread(page, post, limit) {
  await visit(page, `${OLD}${post.permalink}?sort=top&limit=${Math.min(500, limit)}`);
  return page.evaluate((max) => {
    const body = document.querySelector("#siteTable .thing.link .expando .usertext-body .md")?.innerText?.trim() ?? "";
    const comments = [];
    for (const el of document.querySelectorAll(".commentarea .thing.comment")) {
      if (comments.length >= max) break;
      const text = el.querySelector(":scope > .entry .usertext-body .md")?.innerText?.trim();
      if (!text || text === "[deleted]" || text === "[removed]") continue;
      let depth = 0;
      for (let p = el.parentElement; p; p = p.parentElement) if (p.classList?.contains("comment")) depth++;
      const scoreTitle = el.querySelector(":scope > .entry .score.unvoted")?.getAttribute("title");
      comments.push({
        author: el.getAttribute("data-author"),
        score: Number(scoreTitle ?? 0) || 0,
        depth,
        text,
        created: Date.parse(el.querySelector(":scope > .entry time")?.getAttribute("datetime") ?? "") / 1000 || null,
      });
    }
    return { body, comments };
  }, limit);
}

function buildMarkdown(config, subs, posts, threads, stopped) {
  const c = config.reddit;
  const allComments = threads.flatMap((t) => t.comments.map((cm) => ({ ...cm, thread: t })));
  const topComments = allComments.filter((cm) => cm.text.length >= 60).sort((a, b) => b.score - a.score).slice(0, 30);
  const bySub = new Map();
  for (const p of posts) bySub.set(p.subreddit, (bySub.get(p.subreddit) ?? 0) + 1);

  return `# Reddit — ${config.group}

Collected ${today()} · ${c.subreddits.length} subreddits · ${c.searchQueries.length} queries · ${posts.length} posts · ${threads.length} threads read · ${allComments.length} comments${stopped ? ` · stopped early: ${stopped}` : ""}

Raw data: \`raw/reddit/subreddits.json\`, \`raw/reddit/posts.json\`, \`raw/reddit/threads.json\`

## Communities found

${subs.length ? mdTable(["Subreddit", "Members", "About"], [...subs].sort((a, b) => (b.members ?? 0) - (a.members ?? 0)).slice(0, 30).map((s) => [`r/${s.name}`, s.members?.toLocaleString("en-US") ?? "—", quote(s.description, 120)])) : "_Discovery off or nothing found._"}

## Posts collected per subreddit

${mdTable(["Subreddit", "Posts"], [...bySub.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => [`r/${s}`, n]))}

## Most-discussed posts

${[...posts].sort((a, b) => b.comments - a.comments).slice(0, 25).map((p) => `- **${quote(p.title, 140)}** · r/${p.subreddit} · ⬆${p.score} · 💬${p.comments}`).join("\n") || "_None._"}

## Top comments

${topComments.map((cm) => `- ⬆${cm.score} · _${quote(cm.thread.title, 60)}_ — “${quote(cm.text)}”`).join("\n") || "_None._"}

## Insights

_To be written by the group-analysis skill: recurring pains with counts and real quotes, tools people name (and complain about), what they pay, and where this group gathers._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.reddit;
  if (c.subreddits.length === 0 && c.searchQueries.length === 0) throw new Error("reddit.subreddits and reddit.searchQueries are both empty");
  const dir = rawDir(config.slug, P);

  const { context, page } = await openProfileBrowser();
  const posts = new Map();
  const threads = [];
  let subs = [];
  let stopped = null;
  const addPosts = (rows) => rows.filter((r) => r.score >= c.minPostScore).forEach((r) => posts.has(r.id) || posts.set(r.id, r));

  try {
    await visit(page, OLD);
    const user = await signedInUser(page);
    log(P, user ? `signed in as u/${user}` : "not signed in — results may be limited (run node login.mjs)");

    if (c.discoverSubreddits && c.searchQueries.length) subs = await discoverSubreddits(page, c.searchQueries);

    for (const sub of c.subreddits) {
      for (const q of c.searchQueries) {
        await visit(page, `${OLD}/r/${sub}/search?q=${encodeURIComponent(q)}&restrict_sr=on&sort=relevance&t=all&limit=${c.postsPerSearch}`);
        const rows = await readPostRows(page);
        addPosts(rows.slice(0, c.postsPerSearch));
        log(P, `r/${sub} "${q}": ${rows.length} posts`);
        await pause(2000, 5000);
      }
      if (c.topPostsPerSub > 0) {
        await visit(page, `${OLD}/r/${sub}/top/?sort=top&t=${c.topTimeframe}&limit=${c.topPostsPerSub}`);
        const rows = await readPostRows(page);
        addPosts(rows.slice(0, c.topPostsPerSub));
        log(P, `r/${sub} top (${c.topTimeframe}): ${rows.length} posts`);
        await pause(2000, 5000);
      }
    }

    if (c.searchAllReddit) {
      for (const q of c.searchQueries) {
        await visit(page, `${OLD}/search?q=${encodeURIComponent(q)}&sort=relevance&t=all&limit=${c.postsPerSearch}`);
        const rows = await readPostRows(page);
        addPosts(rows.slice(0, c.postsPerSearch));
        log(P, `all of Reddit "${q}": ${rows.length} posts`);
        await pause(2000, 5000);
      }
    }

    const toRead = [...posts.values()].filter((p) => p.comments > 0).sort((a, b) => b.comments - a.comments).slice(0, c.maxThreads);
    for (const post of toRead) {
      const { body, comments } = await readThread(page, post, c.commentsPerThread);
      threads.push({ ...post, body, comments });
      log(P, `thread "${quote(post.title, 50)}": ${comments.length} comments`);
      await pause(2500, 6000);
    }
  } catch (error) {
    if (!(error instanceof StopError)) throw error;
    stopped = error.message;
    log(P, stopped);
  } finally {
    await context.close();
  }

  writeJson(`${dir}/subreddits.json`, subs);
  writeJson(`${dir}/posts.json`, [...posts.values()]);
  writeJson(`${dir}/threads.json`, threads);
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, subs, [...posts.values()], threads, stopped));
  log(P, `wrote ${file}`);
  if (stopped && posts.size === 0) process.exit(1);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
