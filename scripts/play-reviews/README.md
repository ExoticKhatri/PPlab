# Play Store complaint miner

Finds the apps a group uses and counts what their 1–3 star reviews complain about.

```bash
cd scripts/play-reviews
npm init -y && npm pkg set type=module
npm i google-play-scraper@10.0.1 playwright@1.48.2 && npx playwright install chromium
node playsearch.mjs   # Play Store search -> ids.json (the library's own search is broken)
node reviews.mjs      # edit APPS first -> reviews.json
node themes.mjs       # edit THEMES / ROLES -> theme counts + themed.json
```

Reviews come from end users. For a group's buyers (owners), weight the role tags more than the raw counts.
