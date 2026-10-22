# Meta Ad Library scraper

Collects active ads shown in India for a set of keywords. Used for the "Ad research" tab.

```bash
cd scripts/ad-library
npm i playwright@1.48.2 && npx playwright install chromium
node scrape.mjs "school ERP" "school fee" "school admission"   # writes raw/*.txt
node parse.mjs                                                 # writes ads.json (deduped)
```

To look at a different group, change the keywords and the country code in `scrape.mjs`.
Meta doesn't show spend or targeting for commercial ads in India, so `days` (how long an ad has been running) is the signal to use.
