# Data platforms

Where we pull data from to find a group's pain points, what each source gives us, and its limits.
Status as of 22 Oct 2026. All scrapers run locally with Node.js; raw data stays out of git.

## At a glance

| Platform | What we get | Whose voice | Volume so far | Status |
| --- | --- | --- | --- | --- |
| Meta Ad Library | Live ads aimed at a group | Sellers (what they think hurts buyers) | 2,131 school ads · 1,176 lab ads | ✅ Working |
| Google Play Store | App reviews, 1–5 stars | End users (parents, patients, some staff) | 20,672 school · 15,173 lab reviews | ✅ Working |
| YouTube | Comments on "how to start/run X" videos | Owners and would-be owners | Labs: in progress | ✅ Working (slow) |
| Google Maps | Reviews of local businesses | Customers of small independent businesses | 0 | ❌ Reviews hidden from automated browsers |
| Reddit | Posts and comments from professionals | Staff and owners (mostly global) | 0 | ❌ Blocked (403); evaluating `reddit-universal-scraper` |
| Software review sites | Reviews of B2B software | Admins and owners (the buyers) | — | ⚠️ Capterra blocks; SoftwareSuggest too thin |

## Meta Ad Library

- **What it is:** Meta's public library of every active ad on Facebook and Instagram, searchable by keyword and country.
- **How we pull it:** [scripts/ad-library/](../scripts/ad-library/). A headless Chromium browser (Playwright) opens the library search page for each keyword, scrolls and saves the page text. `parse.mjs` turns that into one record per ad.
- **Data per ad:** advertiser, ad text, start date (so how many days it has run), whether it has multiple versions, which keywords matched.
- **What it tells us:**
  - **Can we reach the group?** If many companies keep paying to target them, Meta works for that group.
  - **What is already sold to them**, and how crowded each category is.
  - **The pain sellers lead with:** their bet on what hurts the buyer.
  - **What lasts:** an ad running for months is the best available sign it pays off.
- **Limits:**
  - Meta doesn't show spend, reach or targeting for ordinary ads in India, only for political ads. The official API is limited to those too, which is why we use the website.
  - Keyword search is loose, so a lot of noise comes back (real estate "near school", yoga "teacher training"). The final advertiser list is checked by hand.
  - It's a snapshot of ads active on the day we scrape.
- **Cost:** free.

## Google Play Store

- **What it is:** reviews of Android apps used by the group or its customers.
- **How we pull it:** [scripts/play-reviews/](../scripts/play-reviews/).
  - `playsearch.mjs` searches the Play Store website with Playwright to find app IDs. The library's own search function is broken.
  - `reviews.mjs` uses `google-play-scraper` to fetch the newest reviews per app (up to ~1,500 each).
  - `themes.mjs` tags complaints (1–3 stars) by theme and guesses the reviewer's role.
- **Data per review:** app, star rating, date, text, thumbs-up count, whether the developer replied.
- **What it tells us:** what breaks in the tools the group (or its customers) already pays for, in their own words, counted by theme.
- **Limits:**
  - Reviewers are mostly **end users, not buyers**: parents rather than school owners, patients rather than lab owners. Under 2% of school reviews read like staff.
  - B2B apps have very few reviews (lab software apps: 2–200 each).
  - Theme tagging is keyword rules, so counts are approximate. Always read a sample.
- **Cost:** free.

## YouTube

- **What it is:** comments under videos like "pathology lab kaise khole" or "lab owner problems". Owners and would-be owners ask questions and complain there, often in Hindi.
- **How we pull it:** `yt.mjs`, not yet moved into the repo. Playwright searches YouTube, takes the top videos per query, scrolls each page so the comments load, and saves them.
- **Data per comment:** video, video title, search query, comment text.
- **What it tells us:** the owner's own voice, which is the one thing Play Store lacks. The video titles are a signal too, for example "Hidden problems of offline pathology software".
- **Limits:**
  - Only the top ~20 comments per video load without logging in.
  - It's slow (about 25 seconds per video) and needs careful scrolling or no comments load.
  - Lots of noise ("nice video", "call me").
  - The official YouTube Data API would be faster and more complete, but it needs an API key (free quota).
- **Cost:** free.

## Google Maps

- **What it is:** reviews of local businesses. This is the best source for **small independent** businesses, which chain apps don't cover.
- **Status:** ❌ The scraper (`gmaps.mjs`) finds places, but Google shows a limited view with no reviews to an automated browser that isn't signed in.
- **Options:**
  - The Google Places API (paid, returns only 5 reviews per place).
  - A paid scraping service.
  - Collecting a sample by hand for a few cities.

## Reddit

- **What it is:** communities of professionals, such as r/medicallaboratory, r/pathology and r/Teachers. Staff and owners vent there in detail, but mostly outside India.
- **Status:** ❌ Both Reddit's JSON endpoints and old.reddit.com return 403 or "blocked by network security" to our requests.
- **Next:** evaluate [ksanjeev284/reddit-universal-scraper](https://github.com/ksanjeev284/reddit-universal-scraper).

## Software review sites

- **Capterra:** blocked by Cloudflare.
- **SoftwareSuggest / TechJockey:** load fine, but have only about 5–10 reviews per product, nearly all positive (likely vendor-solicited). Not worth scraping at scale.

## Rules we follow

- Only public pages, no logins, slow request rates.
- Raw scraped data stays local (gitignored). Only summaries go into pplab.
- Numbers shown in pplab are labelled as estimates unless they come from a sourced count.
