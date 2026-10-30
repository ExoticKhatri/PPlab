---
name: group-analysis
description: Collect and analyse market data for one target customer group (e.g. "tattoo artists", "diagnostic labs") from Meta Ad Library, Google Play Store, YouTube, Google search (autocomplete, People also ask), Google Trends, Reddit and Google Maps, then write analyses/<group-slug>/<platform>.md files with data and insights plus a README.md overview. Use when the user asks to analyse, research, scrape or pull data for a group, add a new group's analysis, or re-run/refresh an existing one. Supports per-group config (which platforms, how many ads/apps/reviews/videos/comments).
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
  google-search.md   data summary (generated) + Insights (you write)
  google-trends.md   data summary (generated) + Insights (you write)
  reddit.md          data summary (generated) + Insights (you write)
  google-maps.md     data summary (generated) + Insights (you write)
  raw/<platform>/    raw JSON (gitignored, never committed)
```

## 1. Check the toolkit

Collectors live in `scripts/collect/` (see [docs/platform.md](../../../docs/platform.md) for what each platform gives and its limits).

```bash
cd scripts/collect
ls node_modules .venv >/dev/null 2>&1 || npm run setup   # npm deps, Playwright Chromium, yt-dlp in .venv
node doctor.mjs                                          # tools, Brave, profile, Reddit/Google sign-in
```

`run.mjs` runs the doctor automatically before collecting and stops if something is missing; fix what it reports (it prints the fix) rather than skipping it with `--skip-doctor`.

**Signed-in browser (Reddit, Google result pages, Google Maps):** these run in a visible Brave window with its own profile (`~/.pplab-browser-profile`, outside the repo). Reddit reads Reddit's JSON through that signed-in session; if the session is missing or expired, `reddit.mjs` stops with a 401/403 message. Then ask the user to run `node login.mjs` from `scripts/collect`, sign in to Reddit (and Google) in the window that opens, and close it — you can't sign in for them. The window appears on their screen while collectors run; tell them not to close it mid-run. Only one run can use the profile at a time (a second one fails with "profile is already open"), so run signed-in platforms one after another. Restored tabs are closed at start and every tab a run opened is closed at the end.

## 2. Create or update the group's config

Slug: lowercase-with-dashes, e.g. `tattoo-artists`. Copy `analyses/_template/config.json` to `analyses/<slug>/config.json` and fill it in. If the group already exists, edit its config instead and keep the user's earlier settings unless asked to change them.

**Ask the user only for what you can't decide yourself** — normally just the group and the market (India, global/US, or both). Choose keywords, search terms and queries yourself, then show the config in one short message before running a long collection.

### Config reference

Anything left out falls back to the default in `scripts/collect/lib/config.mjs`.

| Key | Default | Meaning |
| --- | --- | --- |
| `group` | — | Human-readable name used in headings |
| `groupId` | — | Optional: the group's id in `app/_components/group-finder/group-data.ts` |
| `platforms` | `"all"` | `"all"` or a list of: `meta-ads`, `play-store`, `youtube`, `google-search`, `google-trends`, `reddit`, `google-maps` |
| `metaAds.countries` | `["IN"]` | Ad Library country codes, e.g. `["US", "IN"]` |
| `metaAds.keywords` | `[]` | Searches run per country |
| `metaAds.maxAdsPerKeyword` | `100` | Stop scrolling a keyword once this many ads have loaded |
| `metaAds.maxScrollRounds` | `25` | Hard cap on scrolling per keyword |
| `metaAds.activeOnly` | `true` | Only ads running today |
| `metaAds.sellerTerms` | `[]` | Words a seller *to* this group uses ("your school", "school ERP") — tags advertisers as "sells to the group" |
| `metaAds.selfTerms` | `[]` | Words the group uses advertising *itself* ("admissions open") — tags advertisers as "the group advertising itself"; neither = "noise" |
| `metaAds.concurrency` | `2` | Browser tabs scraping keywords at once (keep ≤3: Meta rate-limits) |
| `playStore.country` / `lang` | `in` / `en` | Store to read (`us`, `in`, `gb`, …) |
| `playStore.searchTerms` | `[]` | Play Store searches used to discover apps |
| `playStore.appIds` | `[]` | Apps always included (e.g. known competitors) |
| `playStore.maxApps` | `30` | Keep this many apps (ordered by `rankBy`) |
| `playStore.rankBy` | `relevance` | `relevance` (search-term words in title/summary, then size; keeps niche B2B tools) or `reviews` (biggest apps first) |
| `playStore.minReviews` | `10` | Drop apps with fewer reviews/ratings (unless listed in `appIds`) |
| `playStore.reviewsPerApp` | `500` | Newest reviews fetched per app |
| `playStore.complaintMaxStars` | `3` | Reviews at or below this are complaints |
| `playStore.excludeGames` | `true` | Drop apps in Play's game categories |
| `playStore.excludeTitles` | `[]` | Case-insensitive title fragments to drop ("simulator", "family link"); dropped apps are listed in the .md |
| `playStore.concurrency` | `4` | Apps whose reviews are fetched at once |
| `youtube.queries` | `[]` | YouTube searches |
| `youtube.videosPerQuery` | `8` | Videos taken per query |
| `youtube.maxCommentsPerVideo` | `500` | Top-level comments per video |
| `youtube.maxRepliesPerThread` | `5` | Replies kept per comment thread |
| `youtube.commentSort` | `"top"` | `"top"` or `"new"` |
| `youtube.minViews` | `0` | Skip videos below this view count (keep 0 for Hindi/regional queries — they have fewer views) |
| `youtube.titleMustMatch` | `false` | Drop videos whose title shares no word with the query |
| `youtube.concurrency` | `3` | Videos whose comments are fetched at once (parallel yt-dlp) |
| `googleSearch.hl` / `gl` | `en` / `in` | Language and country for Google |
| `googleSearch.seeds` | `[]` | Short phrases the group types ("tattoo booking"); each is expanded with a–z and question words |
| `googleSearch.expandAlphabet` | `true` | Also query "<seed> a" … "<seed> z" |
| `googleSearch.questionPrefixes` | how, why, what, best, is, can, which, where | Also query "<word> <seed>" |
| `googleSearch.resultsQueries` | `[]` (= first 5 seeds) | Result pages opened for "People also ask" and related searches (signed-in browser) |
| `googleSearch.maxResultsPages` | `6` | Cap on result pages per run |
| `googleSearch.captchaWaitSeconds` | `180` | On a Google captcha, wait this long for the user to solve it in the Brave window (0 = don't wait) |
| `googleSearch.bingFallback` | `true` | If Google stays blocked, read the remaining pages' "People also ask" from Bing |
| `googleSearch.pageGapSeconds` | `[15, 40]` | Random wait between result pages |
| `googleSearch.expandPeopleAlsoAsk` | `3` | Questions clicked to load more of them |
| `googleTrends.geo` | `IN` | `""` = worldwide, or a country code |
| `googleTrends.timeframe` | `today 5-y` | `today 12-m`, `today 5-y`, `all` |
| `googleTrends.keywords` | `[]` | Compared in batches of 5; the first keyword anchors every batch, so make it the broadest term |
| `googleTrends.regionsResolution` | `REGION` | `COUNTRY`, `REGION` (state), `CITY` |
| `reddit.subreddits` | `[]` | Communities to search, without "r/" |
| `reddit.searchQueries` | `[]` | Searched inside each subreddit (and across Reddit) |
| `reddit.searchAllReddit` | `true` | Also search all of Reddit for each query |
| `reddit.searchSort` | `relevance` | `relevance`, `new`, `top`, `comments` |
| `reddit.searchTimeframe` | `all` | `hour` … `year`, `all`; use `year`/`month` (or `new` sort) when the user wants recent talk |
| `reddit.discoverSubreddits` | `true` | Find communities (with member counts) using `discoveryQueries` |
| `reddit.discoveryQueries` | `[]` | Group terms for discovery ("tattoo artist", "lab owner") — not problem phrases, which return unrelated big subreddits |
| `reddit.postsPerSearch` | `25` | Posts kept per search |
| `reddit.topPostsPerSub` | `25` | Each subreddit's top posts in `topTimeframe` |
| `reddit.topTimeframe` | `year` | hour, day, week, month, year, all |
| `reddit.maxThreads` | `60` | Threads opened to read comments (most relevant, then most-commented first) |
| `reddit.commentsPerThread` | `200` | Comments read per thread |
| `reddit.minPostScore` | `0` | Skip posts below this score |
| `reddit.relevanceFilter` | `true` | Discovered communities and all-of-Reddit posts must mention a group term; the rest are listed as off-topic |
| `reddit.requestGapSeconds` / `searchPageGapSeconds` | `[2, 4]` / `[6, 10]` | Pacing between JSON requests / search pages |
| `reddit.cooldownMinutes` / `maxWaitMinutes` | `[3, 8, 15]` / `45` | Cool-down steps when Reddit rate-limits, and the total budget before stopping (progress saved) |
| `reddit.groupTerms` | `[]` (= words of `discoveryQueries`) | Words or phrases that mark a post or community as on-topic ("lsat", "law school"); each matches as a whole phrase, so avoid generic single words like "school" |
| `googleMaps.hl` | `en` | Maps language |
| `googleMaps.queries` | `[]` | Place types ("tattoo studio", "pathology lab") |
| `googleMaps.locations` | `[]` | Cities/areas; each query runs as "<query> in <location>" |
| `googleMaps.maxPlacesPerSearch` | `40` | Places per search (Maps lists up to ~120) |
| `googleMaps.reviewsPerPlace` | `20` | Reviews read per place; `0` = details only (much faster) |
| `googleMaps.reviewSort` | `lowest` | `lowest`, `newest`, `highest`, `relevant` |
| `googleMaps.maxReviewsPerBrand` | `0` (no cap) | Max reviews read per chain (same first two words of the name), so one chain can't dominate the themes |
| `googleMaps.concurrency` | `3` | Tabs reading places and reviews at once (search lists stay in one tab); 3 is about 3× faster than one tab — raise carefully, Maps can show captchas |

### Choosing good inputs

- **Meta tagging terms:** `sellerTerms` = how vendors address the group ("your school", "for principals", "school ERP"); `selfTerms` = the group's own ads ("admissions open", "book your session"). Then check samples in each tag.
- **Meta keywords:** what a seller would write to *reach* this group: the group's own words ("tattoo artist", "lab owners"), the products sold to them ("tattoo booking", "pathology lab software", "school ERP"), franchise/equipment terms. 15–30 keywords is typical. Use the group's real markets: for global groups add `US`.
- **Play Store search terms:** the software this group (or its customers) uses: "<group> management app", "<group> booking", competitor brand names. Add known competitor package ids to `appIds`.
- **YouTube queries:** how owners talk: "how to start a …", "… business problems", "… profit", "best … software", plus Hindi phrasing for Indian groups ("… kaise khole").
- **Google search seeds:** 3–8 short phrases in the group's words about their problems and tools ("tattoo deposit", "pathology lab software"). `resultsQueries`: a few full questions ("how to stop no shows tattoo").
- **Google Trends keywords:** broad anchor first ("tattoo artist"), then 4–12 topic terms; use the group's main country as `geo`.
- **Reddit:** for Indian groups add Indian communities (r/india, r/StartUpIndia, city subreddits) and set `groupTerms`. 2–6 subreddits where the group talks shop (r/TattooArtists, r/medicallaboratory, r/Teachers); set `discoveryQueries` to group terms to find more communities. Queries are problem phrases ("no show", "deposit", "booking app", "software", "pricing").
- **Google Maps:** the place type as people search it ("tattoo studio", "pathology lab", "CBSE school") and 3–10 cities where the group lives (big metros + a few tier-2 cities for India). For group size only, set `reviewsPerPlace: 0` and raise `maxPlacesPerSearch` to 120.
- **Limits:** quick look = defaults. Deep run = `maxAdsPerKeyword` 200, `reviewsPerApp` 1500, `maxCommentsPerVideo` 1000. Mention roughly how long it will take: Meta ~30–60 s per keyword per country, YouTube ~10–40 s per video, Google search ~25 s per seed plus ~10 s per result page, Trends ~10 s per keyword, Reddit ~5 s per page (searches + threads), Google Maps ~5–7 s per place with reviews using 3 tabs (~2 s without).

## 3. Collect

```bash
cd scripts/collect
node run.mjs <slug>                 # every platform enabled in config.json, in two parallel lanes
node run.mjs <slug> youtube         # just one (or several) platforms
node run.mjs <slug> --serial        # one platform at a time (slower; use if the machine struggles)
```

Lanes: Meta, Play Store, YouTube and Trends run at once; the signed-in platforms (Google search → Reddit → Maps) run one after another alongside them. Every line is prefixed with its platform and saved to `raw/<platform>/run.log`; the summary prints each platform's time and its kept/dropped counts. Long runs: start in the background and wait for completion; don't poll. If a Google captcha appears, tell the user to solve it in the Brave window (the run waits `captchaWaitSeconds`, then switches to Bing). Each collector writes `raw/<platform>/*.json` and regenerates `<platform>.md` with tables and samples, ending with an empty **Insights** section. A failed platform is reported in the summary and the others still run; read its error, fix config or report it — never invent its data.

## 4. Analyse and write the Insights

For each platform file, replace the placeholder under `## Insights` with your analysis. Read the raw JSON (use `node -e` one-liners to count, filter and sample; read real samples, don't rely on keyword counts alone). Every number you write must come from the data; label anything inferred as such.

- **meta-ads.md**
  - Start from the rule-based tags (seller / self / noise) and check samples of each; separate real sellers *to this group* from noise by reading ad text. Use the Ad language table for the reachability verdict.
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
- **google-search.md**
  - Group autocomplete and "People also ask" questions into themes (problems, price questions, tool comparisons, how-to); list the exact phrasings worth reusing in ads and landing pages.
  - Note commercial intent ("best … app", "… software price") vs informational ("how to …").
- **google-trends.md**
  - Is interest growing or shrinking (12-month comparison), which regions lead, and rising related searches. Weekly values are noisy for niche terms; say so rather than over-reading them.
- **reddit.md**
  - Recurring pains with counts and real quotes (comments are often the richest source), tools people name and their complaints about them, prices mentioned, and which communities matter most (members, activity).
  - Reddit skews US/global; say so for India-focused groups. Mention configured subreddits that didn't exist or were private, and how many posts were set aside as off-topic. Scan the "discovered but off-topic" list: the filter is strict, so a useful community (e.g. r/education) can land there — add it to `subreddits` and re-run Reddit.
- **google-maps.md**
  - Group size and reach per city (places found; "hit the limit" means more exist), how digitally mature they are (website share, owner reply rate). "Reviews off" is Google's choice, not 0 reviews. Check the Chains table: if one chain owns a big share of low reviews, report it separately.
  - What their customers complain about in low-rated reviews, themed with counts — often what the owner struggles with (e.g. waiting, rescheduling, no-shows, pricing).

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
| Google search (autocomplete + People also ask + related) | `google-search.mjs` | Ready (autocomplete via plain HTTP; result pages typed into Google in signed-in Brave; waits for a person on captcha, then Bing fallback) |
| Google Trends | `google-trends.mjs` | Ready (`google-trends-api`) |
| Reddit | `reddit.mjs` | Ready and resilient: signed-in Brave session (needs `node login.mjs` once); searches use the normal search pages when Reddit forbids search JSON; every request is paced; rate limits/blocks trigger automatic cool-downs (3 → 8 → 15 min, up to 45 min) and retries; progress is checkpointed after every step and a re-run of the same config resumes (`--fresh` to start over) |
| Google Maps | `google-maps.mjs` | Ready (signed-in Brave; search lists in one tab, places + sorted reviews in 3 tabs; checkpoints every 5 places) |
| LinkedIn | — | Planned (see docs/platform.md). If config lists it, skip it and note it under Data gaps. |

## Reliability built in

- Every item (keyword, app, video, page, place, thread) is retried and isolated: one failure is logged as "failed, skipped" and the run continues. Mention skipped items under Data gaps.
- Google search: a captcha pauses the run for the user to solve it, then falls back to Bing. Elsewhere, a captcha, block, rate limit or sign-out stops that platform cleanly and keeps what was already collected (the `.md` says "stopped early" and why).
- Google Maps writes its raw data every 5 places, so a stopped run still leaves usable data.
- Every .md lists what was filtered or skipped and why (dropped apps, videos found vs kept, off-topic Reddit posts and communities, missing subreddits, Maps "reviews off" places, skipped result pages). Report these under Data gaps.
- Long loops log progress with an ETA ("[48/180, ~30 min left]").

## Rules

- Read-only collection, human-paced, small batches; never solve or bypass a captcha automatically — wait for the user or switch source.
- Raw data stays in `raw/` (gitignored). Commit `config.json` and the `.md` files.
- No invented numbers, quotes or competitors. Quote real text; say "estimate" when you estimate.
- Commit and push the analysis to main when done (user preference).

## Keeping this skill current

This skill must match `scripts/collect/`. Whenever a collector is added or changed (new platform, new config key, new output file), update in the same change: the config reference table, the platform status table, `lib/config.mjs` DEFAULTS, `analyses/_template/config.json`, and docs/platform.md.
