# Collectors TODO

Status 23 Oct 2026: fixes and parallel lanes done (checked below); open items are the optional ones.

From the first full run (K-12 private schools, India, 23 Oct 2026 — all 7 platforms, 2 h 1 min end to end).
Raw numbers: Meta 3,060 ads · Play 40 apps / 38,394 reviews · YouTube 56 videos / 6,045 comments · Google 1,468 autocomplete / 0 "People also ask" pages · Trends 7 terms · Reddit 640 posts / 9,080 comments · Maps 180 schools / 672 reviews.

## 1. Fixes (data quality)

### Google search — "People also ask" blocked
- [x] First result page hit Google's "I'm not a robot" captcha, so 0 result pages were read (autocomplete was fine).
- [x] **Human-in-the-loop captcha:** when a captcha appears, keep the window open, print "solve the captcha in the Brave window", and wait (up to ~3 min) for the page to clear, then continue — instead of stopping immediately.
- [x] Warm up like a person before searching: open google.com, wait, type the query into the search box (instead of loading a `/search?q=` URL directly).
- [x] Longer, random gaps between result pages (15–40 s) and a lower default `maxResultsPages`.
- [x] Fallback when Google blocks: read "People also ask"-style questions from Bing (`bing.com/search`), which rarely shows captchas.

### Google Trends — misleading numbers
- [x] Show "too little data" instead of a % change when the previous 12-month average is below ~2 or the peak is below ~5 (e.g. "fee management software +1667%" was 0.1 → 1).
- [x] Filter related/rising queries that are just logins or brand names ("erp login vivekanand school", "lexicon school erp login") into a separate "navigational" list.
- [x] Note in the output when a keyword returned no regional data.

### Reddit — noise
- [x] **Subreddit relevance filter:** discovery returned r/AbbottElementary, r/AdvaitaVedanta, r/teenagers, r/news. Keep only subreddits whose name or description matches group terms; list the rest separately as "discovered but off-topic".
- [x] **Post relevance filter for all-of-Reddit search:** it pulled r/AITAH, r/politics, r/Superstonk. Keep a post only if its title or body contains a query term (or the subreddit is in the config list).
- [x] Validate configured subreddits exist and report empty/private ones (r/IndianTeachers returned nothing).
- [x] Read threads chosen by relevance, not only by comment count (the most-commented threads can be off-topic drama).
- [x] Add India-focused discovery hints for Indian groups (r/india, r/StartUpIndia, city subreddits) and flag in the output that Reddit skews US.

### YouTube — coverage and relevance
- [x] `minViews: 1000` cut some Hindi queries to 1–2 videos ("school kaise khole": 2, "school fees collection problem": 1). Report per query how many videos were found vs kept, and default `minViews` to 0 for Hindi/regional queries.
- [x] Optional title relevance filter (drop videos whose title shares no word with the query, e.g. "School Principal interview questions" for "school principal challenges").
- [x] Record each comment's video query so the analysis can split by topic.

### Google Maps — reviews switched off
- [x] Google has reviews disabled on many listings (124 of 180 private schools had no Reviews tab or rating). Detect "no Reviews tab" explicitly and record `reviewsDisabled: true`, and show it in the output as "reviews off" (not "0 reviews").
- [x] Rating fallback: read the rating only from the place's own header; never from a nearby-place card (a nearby school's "4.5 stars · 109 reviews" was on the same page).
- [x] Show per city: places, places with reviews, reviews read.
- [x] Bug: when a review has no text but the owner replied, the owner's reply was saved as the review text (37 of 672). Read only the reviewer's own text block.
- [x] Cap reviews per chain/brand (one chain, Orchids, was 140 of 413 low reviews) or flag chains in the output.

### Play Store — irrelevant apps
- [x] App discovery pulled in 7 irrelevant apps (games like "Scary Teacher 3D", "Teacher Simulator", Google Family Link, study planners). Exclude the Games category and add an `excludeTitles` / `excludeGenres` config.

### Meta Ad Library — noise
- [x] Keyword search is loose (1,554 advertisers for 28 keywords). Add a rule-based first pass that tags each advertiser as "sells to the group", "the group advertising itself" (e.g. schools' admission ads) or "noise", using group terms in the ad text; the skill then checks by hand.
- [x] Record the ad's language (Hindi/regional vs English) for the reachability verdict.

### All collectors
- [x] Per-platform log files (`raw/<platform>/run.log`) plus one summary line per platform with counts kept vs dropped.
- [x] Progress with ETA ("Maps 48/180, ~30 min left").
- [ ] (optional) Resume: re-running a platform skips items already in `raw/` (e.g. videos or places already read) unless `--fresh`.
- [x] Each `.md` lists what was skipped or filtered and why, so data gaps are visible.

## 2. Parallelisation (the run took 2 h 1 min serially)

Time per platform in that run: Meta 21 min · Play 7 min · YouTube 38 min · Google search 2 min · Trends 1 min · Reddit 7 min · Maps 45 min.

- [x] **Run platforms in parallel in `run.mjs`.** Two lanes running at the same time:
  - Lane A (no signed-in browser, safe to run together): Meta ads, Play Store, YouTube, Google Trends. (Google search stays in lane B as one collector: autocomplete then result pages.)
  - Lane B (shares the one signed-in Brave profile, so one at a time): Google search result pages → Reddit → Google Maps.
  - Expected wall time ≈ the longest lane (~50 min) instead of ~2 h.
- [x] **YouTube:** fetch 3–4 videos' comments at once (parallel `yt-dlp` processes) — biggest single saving.
- [x] **Play Store:** fetch reviews for several apps at once (3–5 concurrent).
- [x] **Meta ads:** 2–3 browser tabs scraping different keywords at once (watch for rate limits).
- [x] **Google Maps:** read place details in 2 tabs of the same signed-in browser; keep reviews sequential and human-paced (captcha risk).
- [ ] (optional) **Reddit:** 2–3 concurrent JSON requests within Reddit's rate limit (~60/min signed in).
- [x] Config: `concurrency` per platform (default conservative), and `run.mjs` parallel by default / `--serial`.
- [x] Interleaved output must stay readable: prefix every line with the platform (already done) and write per-platform logs.

## 3. Found in later runs (LSAT, small hospitals)

- [ ] **Play Store discovery for B2B groups:** keeping the most-reviewed apps lets consumer apps (banks, Samsung Health, train apps) push out niche business tools with a few hundred ratings. Rank candidates by title/description relevance to the search terms first, then by reviews.
- [ ] **Meta:** 8 of 22 US keywords failed in the LSAT run (likely rate limiting with 2 tabs). Retry failed keywords at the end of the run in a single tab.
- [ ] **Reddit:** retry after a 429 with a long pause instead of stopping (LSAT run stopped at 67/100 threads).

## 4. Later

- [ ] LinkedIn collector (see docs/platform.md — account risk).
- [ ] pplab group pages read `analyses/<group>/README.md` instead of the hand-written research files.
