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

export const PLATFORMS = ["meta-ads", "play-store", "youtube"];

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
  },
  youtube: {
    queries: [],
    videosPerQuery: 8,
    maxCommentsPerVideo: 500, // top-level comments per video (replies included on top)
    maxRepliesPerThread: 5,
    commentSort: "top", // "top" or "new"
    minViews: 0, // skip videos with fewer views
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
