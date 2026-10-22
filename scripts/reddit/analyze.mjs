// Counts complaint themes in Browser Collector Companion exports (reddit-universal-scraper extension).
// Usage: node analyze.mjs export1.json [export2.json ...]
import fs from "node:fs";

const THEMES = {
  noShowsDeposits: /no.?show|deposit|ghost(ed|ing)?|flak(e|ed|y)|cancel(led|lation)? (last minute|same day)|chargeback/i,
  dmOverload: /\bdms?\b|inbox|messages?|time.?wasters?|price shoppers?|how much (for|would)|repeat(ing)? myself|inquir/i,
  pricingQuotes: /quote|pricing|how (much|to) charge|hourly|day rate|undercharg|lowball/i,
  bookingSoftware: /booking (app|software|system|site|form)|porter|tattoodo|vagaro|square|booksy|fresha|glossgenius|acuity|jotform|google form|calendly|tattoogenda|inkdesk|venue/i,
  softwareFees: /(monthly|subscription|processing) fee|too expensive|per artist|per seat|price (hike|increase)|cut of|commission/i,
  consentWaivers: /consent|waiver|release form|liability|id check/i,
  marketingGrowth: /instagram|algorithm|followers|reach|marketing|new clients|slow (month|season)|dead (week|month)|empty books/i,
  shopRent: /booth rent|chair rent|shop (owner|cut|split)|commission split|50.?50|60.?40|guest spot/i,
  burnout: /burn(ed|t)? ?out|exhausted|mental health|quit tattooing/i,
  admin: /admin|paperwork|emails?|scheduling|calendar|reschedul/i,
};

const files = process.argv.slice(2);
if (!files.length) { console.error("Usage: node analyze.mjs export.json [...]"); process.exit(1); }

const items = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const p of data.posts ?? []) items.push({ kind: "post", sub: p.subreddit, score: p.score ?? 0, text: `${p.title ?? ""}\n${p.selftext ?? ""}`, link: p.permalink });
  for (const c of data.comments ?? []) items.push({ kind: "comment", sub: c.subreddit, score: c.score ?? 0, text: c.body ?? "", link: c.post_permalink });
}

const counts = {};
const examples = {};
for (const it of items) {
  for (const [k, re] of Object.entries(THEMES)) {
    if (!re.test(it.text)) continue;
    counts[k] = (counts[k] ?? 0) + 1;
    (examples[k] ??= []).push(it);
  }
}

console.log(`${items.length} items (${items.filter((i) => i.kind === "post").length} posts)`);
for (const [k, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`\n## ${k}: ${n} (${((n / items.length) * 100).toFixed(1)}%)`);
  for (const ex of examples[k].sort((a, b) => b.score - a.score).slice(0, 3)) {
    console.log(`  [${ex.score}] ${ex.text.replace(/\s+/g, " ").slice(0, 220)}`);
  }
}
