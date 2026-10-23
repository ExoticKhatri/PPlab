# Data platforms

Where we pull data from to understand a group (how big it is, how to reach it, what hurts), what each source gives us, and how we collect it.
Updated 23 Oct 2026. All scrapers run locally with Node.js; raw data stays out of git.

**Run them through the `group-analysis` Claude skill** ([.claude/skills/group-analysis/SKILL.md](../.claude/skills/group-analysis/SKILL.md)): collectors live in [scripts/collect/](../scripts/collect/), each group's settings in `analyses/<group>/config.json`, results in `analyses/<group>/*.md`. The older one-off scripts under `scripts/ad-library`, `scripts/play-reviews` and `scripts/youtube-comments` are superseded.

## At a glance

| Platform | What we get | Whose voice | How | Status |
| --- | --- | --- | --- | --- |
| Meta Ad Library | Live ads aimed at a group | Sellers (what they think hurts buyers) | Playwright, signed out | ✅ Working |
| Google Play Store | App details (downloads, price, ratings) + reviews | End users, some staff | `google-play-scraper` + Playwright search | ✅ Working (details + reviews) |
| YouTube | Comments on "how to start/run X" videos | Owners and would-be owners | `yt-dlp` (all comments) | ✅ Working |
| Google Maps | Businesses per city + their reviews | Customers of small independent businesses | Playwright, signed-in profile | 🔧 Rebuild with signed-in profile |
| Reddit | Communities, posts + comments from professionals | Staff and owners (mostly global) | Playwright, signed-in Brave profile | ✅ Working (needs one-time sign-in) |
| LinkedIn | People counts by job title, posts | Owners, managers, decision makers | Playwright, signed-in profile | 🆕 Planned (account risk, see below) |
| Google search (autocomplete, "People also ask", related) | What the group types into Google | Owners and would-be owners | HTTP + signed-in Brave profile | ✅ Working |
| Google Trends | Search interest over time and by region | Everyone searching | `google-trends-api` | ✅ Working |

**Removed:** software review sites (Capterra, SoftwareSuggest, TechJockey). Capterra blocks automation, and the rest have 5–10 mostly vendor-solicited reviews per product, so the volume is too low to be useful.

**Not useful here:** Google Search Console only reports searches that reached *our own* website, so it can't show what a group searches for in general. Google autocomplete, "People also ask" and Trends answer that question instead.

**Dropped:** Apple App Store (not now) and Google Ads Keyword Planner (needs an ad account with spend).

## Signed-in browser profile (Reddit, Google result pages; later Maps, LinkedIn)

These sites hide data from signed-out automated browsers, so we use one persistent Playwright browser profile:

1. Run `node login.mjs` in `scripts/collect`. Your Brave opens with a separate automation profile (`~/.pplab-browser-profile`), on Google and Reddit sign-in tabs.
2. Sign in by hand, then close the window. The session is saved in that profile (it holds session cookies; it lives outside the repo and must never be committed). It's separate from your everyday Brave profile.
3. Collectors launch Brave with that profile (`lib/browser.mjs`), visible rather than headless, so pages behave as they do for a person.

How we keep it safe:

- Human pace: random 2–6 second pauses, a limited number of pages per run, stop at the first sign of a captcha or "unusual activity" warning.
- Read-only: the scripts never post, like, message or connect.
- Small batches per group (hundreds of items, not hundreds of thousands).

**Risk:** automation breaks the terms of service of LinkedIn, and to a lesser degree Google and Reddit. LinkedIn is the strictest: it restricts or bans accounts it thinks are automated. Use it sparingly, and accept that the account could be restricted.

## Meta Ad Library

- **What it is:** Meta's public library of every active ad on Facebook and Instagram, searchable by keyword and country.
- **How we pull it:** [scripts/ad-library/](../scripts/ad-library/). Headless Playwright opens the library search for each keyword (`COUNTRY=US` or `IN`), scrolls, saves the page text, and `parse.mjs` turns that into one record per ad.
- **Data per ad:** advertiser, ad text, start date (so days running), whether it has multiple versions, which keywords matched.
- **What it tells us:** whether Meta reaches the group (companies keep paying to target them), what's already sold to them and how crowded each category is, the pain sellers lead with, and which ads last (running for months is the best available sign an ad pays off).
- **Limits:** no spend or targeting data for non-political ads; keyword search is loose, so advertisers are checked by hand; a snapshot of the day it runs.
- **Cost:** free.

## Google Play Store

- **What it is:** the Android apps a group (or its customers) uses: who the competitors are, how big they are, and what users complain about.
- **How we pull it:** [scripts/play-reviews/](../scripts/play-reviews/). `playsearch.mjs` finds app IDs through the Play Store website (the library's own search is broken), `reviews.mjs` fetches reviews, `themes.mjs` tags complaints by theme.
- **Data per app** (`google-play-scraper`, or the app page itself when the library can't parse an app):
  - downloads (`minInstalls` / `maxInstalls`, e.g. "1M+")
  - free or paid, price, currency
  - in-app purchases and their price range, contains ads
  - rating, number of ratings, number of reviews, star histogram (1–5)
  - category, developer, developer website and email
  - released date, last updated, current version, content rating
- **Data per review:** star rating, date, text, thumbs-up count, whether the developer replied.
- **What it tells us:** the competitor landscape with sizes (downloads) and business models (free / paid / in-app purchases), plus what breaks in tools the group already pays for.
- **Limits:** reviewers are mostly end users, not buyers; B2B apps have few reviews; theme counts come from keyword rules, so read a sample.
- **Cost:** free.

## YouTube

- **What it is:** comments under videos like "pathology lab kaise khole" or "tattoo artist no-shows". Owners and would-be owners ask questions and complain there, often in Hindi.
- **How we pull it:** [scripts/collect/youtube.mjs](../scripts/collect/youtube.mjs). `yt-dlp ytsearchN:` finds videos per query, then `yt-dlp --write-comments` pulls every comment and reply (limits set in config), no API key or login. Replaced the old Playwright scroller that only got ~20 comments per video.
- **Data per video:** title, channel, views, likes, upload date, duration, description, comment count.
- **Data per comment:** text, author, likes, date, whether it's a reply, whether the creator pinned or hearted it.
- **What it tells us:** the owner's own voice, which Play Store lacks; video titles and view counts also show which topics this group cares about.
- **Fallback:** the official YouTube Data API (free key, 10,000 units/day) if `yt-dlp` gets rate-limited.
- **Cost:** free.

## Google Maps

- **What it is:** the best source for **small independent businesses**, which chain apps don't cover. It serves two jobs:
  1. **Group size and reach:** how many businesses of a type exist per city, with phone and website.
  2. **Customer pain:** reviews of those businesses (what their customers complain about = what the owner struggles with).
- **Why it failed before:** signed out, Google shows automated browsers a limited view without reviews.
- **Plan:** Playwright with the signed-in profile. Search "pathology lab in Lucknow" (etc.), scroll the results list to the end, open each place, sort reviews by lowest rating and scroll.
- **Data per place:** name, category, rating, review count, address, phone, website, opening hours, price level.
- **Data per review:** stars, text, date, whether the owner replied (and the reply).
- **Limits:** Maps stops listing after ~120 results per search, so we search per city or neighbourhood; Google is quick to show captchas, so runs stay small.
- **Cost:** free (no Places API).

## Reddit

- **What it is:** communities of professionals (r/TattooArtists, r/medicallaboratory, r/Teachers). Staff and owners vent there in detail, mostly outside India.
- **How we pull it:** [scripts/collect/reddit.mjs](../scripts/collect/reddit.mjs), inside the signed-in Brave profile, reading Reddit's own JSON (the data the site itself loads) with the session's cookies. Signed-out requests get 403, and old.reddit now redirects logged-in users to the redesign, so page scraping was fragile. It discovers subreddits for group terms (`discoveryQueries`), searches each subreddit and all of Reddit for problem phrases, takes each subreddit's top posts, then reads comments on the most-commented threads.
- **Data per subreddit:** name, members, description. **Per post:** subreddit, title, score, comment count, date, link. **Per thread:** post body and comments (author, score, depth, text, date).
- **Setup:** run `node login.mjs` once and sign in to Reddit. If the session expires the collector stops with a clear message.
- **Limits:** human-paced (~5 s per page); Reddit skews US/global.
- **Cost:** free.

## LinkedIn (planned, use sparingly)

- **What it gives us:**
  1. **Group size:** people search by job title ("tattoo studio owner", "laboratory director", "school principal") with location filters shows how many members match — a real count of reachable decision makers.
  2. **Voice:** posts from owners and managers about their problems.
  3. **Competitors:** company pages (size, followers, recent posts).
- **How:** Playwright with the signed-in profile, a handful of searches per group, read-only.
- **Limits:** free accounts see limited search results per month; LinkedIn actively restricts automated accounts (see Risk above).
- **Cost:** free.

## Google search: autocomplete, "People also ask", related searches

- **What it is:** what people actually type into Google about a topic, e.g. "is it normal to pay a deposit for a tattoo", "pathology lab software price".
- **How we pull it:** [scripts/collect/google-search.mjs](../scripts/collect/google-search.mjs).
  - Autocomplete: Google's suggest endpoint (plain HTTP, no browser) for each seed, "<seed> a…z" and "<question word> <seed>".
  - "People also ask" and related searches: result pages opened in the signed-in Brave profile (a signed-out headless browser gets a captcha). It clicks a few questions to load more, and stops at the first captcha.
- **What it tells us:** the problems and questions the group searches for, in their own words — for pain points and later for ad and landing-page wording.
- **Limits:** autocomplete has no search volumes; "hits" (how many probes returned a suggestion) is only a rough centrality signal.
- **Cost:** free.

## Google Trends

- **What it is:** relative search interest (0–100) over time and by region, plus related and rising searches.
- **How we pull it:** [scripts/collect/google-trends.mjs](../scripts/collect/google-trends.mjs) with the `google-trends-api` package. Keywords are compared in batches of 5 sharing an anchor keyword; growth = last 12 months vs the 12 months before.
- **Limits:** relative values, not search counts; weekly values are noisy for niche terms; related queries are often empty for small topics.
- **Cost:** free.

**Dropped:** Google Ads Keyword Planner. Real search volumes need an active Google Ads account with spend.

## Other sources worth adding later

| Source | What it adds | Notes |
| --- | --- | --- |
| Facebook Groups | Owner communities (e.g. "Tattoo Artists India", lab owner groups) — very candid | Signed-in profile; only groups you've joined |
| Instagram | Tattoo artists live here: how many exist per city, their bios (booking links = which tools they use) | Signed-in profile; strict on automation |
| JustDial / IndiaMART | Indian business counts and contacts per city and category | Signed out works; good for group size in India |
| Trustpilot | Reviews of big competitors (Booksy, Vagaro, Fresha, Tattoodo) written by paying businesses | Signed out works; competitor-level, not per-group |
| Job posts (Naukri, Indeed) | Which tasks businesses hire people for = manual work software could replace | Signed out works |
| Public registries (NABL labs, UDISE+ schools) | Official counts to replace estimates | Downloadable lists, no scraping needed |
| Competitor pricing pages | What competitors charge and how it changes | Signed out; snapshot monthly |

## Rules we follow

- Read-only: never post, message, like or connect from automation.
- Human pace and small batches; stop at the first captcha or warning.
- The signed-in browser profile and raw scraped data stay local (gitignored). Only summaries go into pplab.
- Numbers shown in pplab are labelled as estimates unless they come from a sourced count.
