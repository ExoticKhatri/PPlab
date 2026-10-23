// YouTube: find videos per query and pull their comments with yt-dlp
// (all comments and replies, no API key or login), instead of the
// ~20 top comments a scrolled browser page shows.
//
//   node youtube.mjs <group-slug>

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, log, mdTable, pause, quote, rawDir, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "youtube";
const here = path.dirname(fileURLToPath(import.meta.url));

function ytDlpCommand() {
  const venvPython = path.join(here, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  return fs.existsSync(venvPython) ? [venvPython, ["-m", "yt_dlp"]] : ["yt-dlp", []];
}

function runYtDlp(args) {
  const [cmd, base] = ytDlpCommand();
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...base, ...args], { windowsHide: true });
    const out = [];
    let err = "";
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.stderr.on("data", (chunk) => (err += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`yt-dlp exited ${code}: ${err.split("\n").filter(Boolean).slice(-2).join(" ")}`));
      try {
        resolve(JSON.parse(Buffer.concat(out).toString("utf8")));
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

async function searchVideos(query, count) {
  const result = await runYtDlp([`ytsearch${count}:${query}`, "--flat-playlist", "--dump-single-json", "--no-warnings"]);
  return (result.entries ?? []).filter((e) => e.id).map((e) => ({ id: e.id, query }));
}

async function fetchVideo(id, c) {
  // max_comments = total,parents,replies,replies-per-thread
  const total = c.maxCommentsPerVideo * (1 + c.maxRepliesPerThread);
  const info = await runYtDlp([
    `https://www.youtube.com/watch?v=${id}`,
    "--skip-download",
    "--write-comments",
    "--dump-single-json",
    "--no-warnings",
    "--extractor-args",
    `youtube:max_comments=${total},${c.maxCommentsPerVideo},all,${c.maxRepliesPerThread};comment_sort=${c.commentSort}`,
  ]);
  const video = {
    id,
    title: info.title,
    channel: info.channel ?? info.uploader,
    views: info.view_count ?? 0,
    likes: info.like_count ?? null,
    uploadDate: info.upload_date ? `${info.upload_date.slice(0, 4)}-${info.upload_date.slice(4, 6)}-${info.upload_date.slice(6)}` : null,
    durationSec: info.duration ?? null,
    commentCount: info.comment_count ?? null,
    description: quote(info.description, 600),
    url: info.webpage_url,
  };
  const comments = (info.comments ?? []).map((cm) => ({
    videoId: id,
    id: cm.id,
    text: cm.text,
    likes: cm.like_count ?? 0,
    author: cm.author,
    isReply: cm.parent && cm.parent !== "root",
    pinned: Boolean(cm.is_pinned),
    hearted: Boolean(cm.is_favorited),
    timestamp: cm.timestamp ?? null,
  }));
  return { video, comments };
}

function buildMarkdown(config, videos, comments) {
  const byVideo = new Map(videos.map((v) => [v.id, v]));
  const substantive = comments.filter((c) => c.text && c.text.length >= 40);
  const topComments = [...substantive].sort((a, b) => b.likes - a.likes).slice(0, 30);
  const questions = substantive.filter((c) => /\?|kaise|kitna|kya |how |what |which /i.test(c.text)).sort((a, b) => b.likes - a.likes).slice(0, 15);

  return `# YouTube — ${config.group}

Collected ${today()} · ${config.youtube.queries.length} queries · ${videos.length} videos · ${comments.length} comments (${comments.filter((c) => c.isReply).length} replies)

Raw data: \`raw/youtube/videos.json\`, \`raw/youtube/comments.json\`

## Videos (by views)

${mdTable(
  ["Video", "Channel", "Views", "Comments pulled", "Uploaded"],
  [...videos].sort((a, b) => b.views - a.views).map((v) => [quote(v.title, 90), v.channel, v.views.toLocaleString("en-IN"), comments.filter((c) => c.videoId === v.id).length, v.uploadDate ?? "—"]),
)}

## Most-liked comments

${topComments.map((c) => `- 👍${c.likes} · _${quote(byVideo.get(c.videoId)?.title, 60)}_ — “${quote(c.text)}”`).join("\n") || "_No comments._"}

## Questions people ask

${questions.map((c) => `- 👍${c.likes} — “${quote(c.text)}”`).join("\n") || "_None found._"}

## Insights

_To be written by the group-analysis skill: recurring pains and questions in the owners' own words, and which topics draw the most views._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.youtube;
  const dir = rawDir(config.slug, P);

  const found = new Map();
  for (const query of c.queries) {
    try {
      const hits = await searchVideos(query, c.videosPerQuery);
      hits.forEach((h) => found.has(h.id) || found.set(h.id, h));
      log(P, `search "${query}": ${hits.length} videos`);
    } catch (error) {
      log(P, `search failed "${query}": ${error.message}`);
    }
  }

  const videos = [];
  const comments = [];
  for (const { id, query } of found.values()) {
    try {
      const { video, comments: got } = await fetchVideo(id, c);
      if (video.views < c.minViews) continue;
      videos.push({ ...video, query });
      comments.push(...got);
      log(P, `${quote(video.title, 50)}: ${got.length} comments`);
    } catch (error) {
      log(P, `video ${id} failed: ${error.message}`);
    }
    await pause(500, 1500);
  }

  writeJson(`${dir}/videos.json`, videos);
  writeJson(`${dir}/comments.json`, comments);
  const file = writeMarkdown(config.slug, P, buildMarkdown(config, videos, comments));
  log(P, `wrote ${file}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
