# YouTube comment scraper

Pulls top comments from the first videos for each search query.

```bash
npm i playwright@1.48.2 && npx playwright install chromium
OUT=comments.json PER_QUERY=6 node yt.mjs "pathology lab kaise khole" "lab owner problems"
```

Only ~20 comments per video load without signing in. About 1 minute per video.
