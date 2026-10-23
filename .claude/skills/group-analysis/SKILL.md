---
name: group-analysis
description: Collect and analyse market data for one target customer group (e.g. "tattoo artists", "diagnostic labs") from Meta Ad Library, Google Play Store and YouTube, then write analyses/<group-slug>/<platform>.md files with data and insights plus a README.md overview. Use when the user asks to analyse, research, scrape or pull data for a group, add a new group's analysis, or re-run/refresh an existing one. Supports per-group config (which platforms, how many ads/apps/reviews/videos/comments).
---

# Group analysis

Turns a customer group into evidence: can we reach them, who already sells to them, and what they complain about — each claim backed by collected data.

Output for every group:

```
analyses/<group-slug>/
  config.json        what to collect (platforms, keywords, limits)
  README.md          overview across all platforms (you write this)
  meta-ads.md        data summary (generated) + Insights (you write)
  play-store.md      data summary (generated) + Insights (you write)
  youtube.md         data summary (generated) + Insights (you write)
  raw/<platform>/    raw JSON (gitignored, never committed)
```

## 1. Check the toolkit

Collectors live in `scripts/collect/` (see [docs/platform.md](../../../docs/platform.md) for what each platform gives and its limits).

```bash
cd scripts/collect
ls node_modules .venv >/dev/null 2>&1 || npm run setup   # npm deps, Playwright Chromium, yt-dlp in .venv
```

## 2. Create or update the group's config

Slug: lowercase-with-dashes, e.g. `tattoo-artists`. Copy `analyses/_template/config.json` to `analyses/<slug>/config.json` and fill it in. If the group already exists, edit its config instead and keep the user's earlier settings unless asked to change them.

**Ask the user only for what you can't decide yourself** — normally just the group and the market (India, global/US, or both). Choose keywords, search terms and queries yourself, then show the config in one short message before running a long collection.

### Config reference

Anything left out falls back to the default in `scripts/collect/lib/config.mjs`.

| Key | Default | Meaning |
| --- | --- | --- |
| `group` | — | Human-readable name used in headings |
| `groupId` | — | Optional: the group's id in `app/_components/group-finder/group-data.ts` |
| `platforms` | `"all"` | `"all"` or a list: `["meta-ads", "play-store", "youtube"]` |
| `metaAds.countries` | `["IN"]` | Ad Library country codes, e.g. `["US", "IN"]` |
| `metaAds.keywords` | `[]` | Searches run per country |
| `metaAds.maxAdsPerKeyword` | `100` | Stop scrolling a keyword once this many ads have loaded |
| `metaAds.maxScrollRounds` | `25` | Hard cap on scrolling per keyword |
| `metaAds.activeOnly` | `true` | Only ads running today |
| `playStore.country` / `lang` | `in` / `en` | Store to read (`us`, `in`, `gb`, …) |
| `playStore.searchTerms` | `[]` | Play Store searches used to discover apps |
| `playStore.appIds` | `[]` | Apps always included (e.g. known competitors) |
| `playStore.maxApps` | `30` | Keep this many apps (most-reviewed first) |
| `playStore.minReviews` | `10` | Drop apps with fewer reviews/ratings (unless listed in `appIds`) |
| `playStore.reviewsPerApp` | `500` | Newest reviews fetched per app |
| `playStore.complaintMaxStars` | `3` | Reviews at or below this are complaints |
| `youtube.queries` | `[]` | YouTube searches |
| `youtube.videosPerQuery` | `8` | Videos taken per query |
| `youtube.maxCommentsPerVideo` | `500` | Top-level comments per video |
| `youtube.maxRepliesPerThread` | `5` | Replies kept per comment thread |
| `youtube.commentSort` | `"top"` | `"top"` or `"new"` |
| `youtube.minViews` | `0` | Skip videos below this view count |

### Choosing good inputs

- **Meta keywords:** what a seller would write to *reach* this group: the group's own words ("tattoo artist", "lab owners"), the products sold to them ("tattoo booking", "pathology lab software", "school ERP"), franchise/equipment terms. 15–30 keywords is typical. Use the group's real markets: for global groups add `US`.
- **Play Store search terms:** the software this group (or its customers) uses: "<group> management app", "<group> booking", competitor brand names. Add known competitor package ids to `appIds`.
- **YouTube queries:** how owners talk: "how to start a …", "… business problems", "… profit", "best … software", plus Hindi phrasing for Indian groups ("… kaise khole").
- **Limits:** quick look = defaults. Deep run = `maxAdsPerKeyword` 200, `reviewsPerApp` 1500, `maxCommentsPerVideo` 1000. Mention roughly how long it will take: Meta ~30–60 s per keyword per country, YouTube ~10–40 s per video.

## 3. Collect

```bash
cd scripts/collect
node run.mjs <slug>                 # every platform enabled in config.json
node run.mjs <slug> youtube         # just one (or several) platforms
```

Long runs: start in the background and wait for completion; don't poll. Each collector writes `raw/<platform>/*.json` and regenerates `<platform>.md` with tables and samples, ending with an empty **Insights** section. A failed platform is reported in the summary and the others still run; read its error, fix config or report it — never invent its data.

## 4. Analyse and write the Insights

For each platform file, replace the placeholder under `## Insights` with your analysis. Read the raw JSON (use `node -e` one-liners to count, filter and sample; read real samples, don't rely on keyword counts alone). Every number you write must come from the data; label anything inferred as such.

- **meta-ads.md**
  - Separate real sellers *to this group* from noise (ads that only mention a keyword), by reading ad text.
  - Group them into categories; for each: advertiser count, longest-running ad, examples, and whether it's crowded, busy or open.
  - Verdict: can Meta reach this group (how many companies keep paying to target them, in which languages, and whether the group runs its own ads).
  - The pains sellers lead with, as short real quotes.
- **play-store.md**
  - Competitor landscape from the apps table: biggest by downloads, business models (free / paid / in-app purchases / ads), price points, which are actively updated.
  - Complaint themes with counts and share, tagged by who is speaking (buyer/owner vs end user); 4–8 real quotes.
  - What breaks in the tools this group pays for today.
- **youtube.md**
  - Recurring pains and questions in the owners' own words, with counts where meaningful and real quotes.
  - Which topics draw the most views (interest), and anything about cost, setup or tools they mention.

Then write **README.md** for the group:

1. Group in one paragraph, and its size if known (cite `group-data.ts` or sources).
2. Reachability verdict (mainly Meta) with the evidence.
3. Top pain points ranked, each with evidence from at least one platform and the count behind it.
4. Competitors and what they charge.
5. Opportunities spotted in the data (gaps where pain is high and supply is thin) — each with its evidence and its main risk.
6. Data gaps: platforms skipped or failed, and what to collect next.
7. Collection date and the config used (link `config.json`).

## 5. Optional: show it in pplab

The pplab group page (`/groups/<id>`) reads `app/_components/ad-research/research-registry.ts`. To surface a new analysis there, add a `Research` object (see `lab-data.ts` for the shape) built from your README numbers and register it under the group's id. Ask before doing this if the user didn't request it.

## Platform status

| Platform | Collector | Status |
| --- | --- | --- |
| Meta Ad Library | `meta-ads.mjs` | Ready |
| Google Play Store (app details + reviews) | `play-store.mjs` | Ready (page fallback when `google-play-scraper` can't parse an app) |
| YouTube (all comments via yt-dlp) | `youtube.mjs` | Ready |
| Google Maps, Reddit, LinkedIn, Google autocomplete, Apple App Store | — | Planned (see docs/platform.md). If config lists one, skip it and note it under Data gaps. |

## Rules

- Read-only collection, human-paced, small batches; stop on captchas or blocks instead of working around them.
- Raw data stays in `raw/` (gitignored). Commit `config.json` and the `.md` files.
- No invented numbers, quotes or competitors. Quote real text; say "estimate" when you estimate.
- Commit and push the analysis to main when done (user preference).

## Keeping this skill current

This skill must match `scripts/collect/`. Whenever a collector is added or changed (new platform, new config key, new output file), update in the same change: the config reference table, the platform status table, `lib/config.mjs` DEFAULTS, `analyses/_template/config.json`, and docs/platform.md.
