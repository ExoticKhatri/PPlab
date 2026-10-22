# Reddit data (via reddit-universal-scraper)

Reddit blocks automated requests, so we collect with the
[reddit-universal-scraper](https://github.com/ksanjeev284/reddit-universal-scraper) browser extension
while signed in to Reddit, then analyse the export here.

## Collect (you, ~20 minutes)

1. Get the extension folder: `git clone https://github.com/ksanjeev284/reddit-universal-scraper` → `extension/`.
2. Chrome → `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → select `extension/`.
3. Sign in to Reddit. In the extension popup, set keywords (optional) and press **Start capture**.
4. Browse and scroll: r/TattooArtists, r/tattooartist, r/TattooApprentice, r/tattoo. Use Reddit search inside each
   subreddit for: `no show`, `deposit`, `booking app`, `porter`, `consent form`, `pricing`, `instagram`, `booth rent`.
   Open the busiest threads so their comments load.
5. Press **Export → JSON**. Put the file(s) in `scripts/reddit/data/` (gitignored).

The extension only reads what is already on the page. It does not read cookies and only talks to `127.0.0.1`.

## Analyse

```bash
node analyze.mjs data/*.json
```

## API route (not used)

The scraper also supports Reddit's official OAuth API, but it needs Reddit's approval. Reddit stops accepting new
public API requests on 31 Oct 2026.
