// Google Trends: is interest in this group's topics growing, and where?
//
//   node google-trends.mjs <group-slug>
//
// Uses the google-trends-api package (the same JSON the Trends website
// loads). Trends only compares up to 5 terms at once and scales each
// comparison to its own peak (100), so keywords are compared in batches
// that all include the first keyword as a shared anchor.

import googleTrends from "google-trends-api";
import { loadConfig, log, mdTable, pause, rawDir, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "google-trends";

function timeframeToStart(timeframe) {
  const now = new Date();
  const back = { "today 12-m": 1, "today 5-y": 5 }[timeframe];
  if (back) return new Date(now.getFullYear() - back, now.getMonth(), now.getDate());
  if (timeframe === "all") return new Date("2004-01-01");
  return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
}

async function call(fn, options) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const raw = await fn(options);
      if (raw.trim().startsWith("<")) throw new Error("Trends returned an HTML page (rate limited)");
      return JSON.parse(raw);
    } catch (error) {
      if (attempt === 2) throw error;
      await pause(5000, 10000);
    }
  }
}

function batches(keywords) {
  const [anchor, ...rest] = keywords;
  if (rest.length === 0) return [[anchor]];
  const out = [];
  for (let i = 0; i < rest.length; i += 4) out.push([anchor, ...rest.slice(i, i + 4)]);
  return out;
}

// Average over the last 12 months vs the 12 months before (by date, so it
// works for weekly and monthly series alike).
function trendOf(points) {
  const now = Date.now();
  const year = 365 * 86_400_000;
  const avg = (list) => (list.length ? list.reduce((s, p) => s + p.value, 0) / list.length : 0);
  const recent = points.filter((p) => p.time > now - year);
  const before = points.filter((p) => p.time <= now - year && p.time > now - 2 * year);
  const r = avg(recent);
  const b = avg(before);
  return { recentAvg: Math.round(r * 10) / 10, previousAvg: Math.round(b * 10) / 10, change: b ? Math.round(((r - b) / b) * 100) : null };
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.googleTrends;
  if (c.keywords.length === 0) throw new Error("googleTrends.keywords is empty in config.json");
  const dir = rawDir(config.slug, P);
  const startTime = timeframeToStart(c.timeframe);
  const base = { geo: c.geo || undefined, startTime };

  const series = {}; // keyword → [{ date, value }] (scaled within its batch, anchored by keywords[0])
  for (const batch of batches(c.keywords)) {
    try {
      const data = await call(googleTrends.interestOverTime, { ...base, keyword: batch });
      for (const [i, keyword] of batch.entries()) {
        if (series[keyword] && i === 0) continue; // anchor already recorded from the first batch
        series[keyword] = data.default.timelineData
          .filter((p) => !p.isPartial)
          .map((p) => ({ date: p.formattedAxisTime, time: Number(p.time) * 1000, value: p.value[i] }));
      }
      log(P, `interest over time: ${batch.join(" | ")}`);
    } catch (error) {
      log(P, `interest over time failed for ${batch.join(", ")}: ${error.message}`);
    }
    await pause(2500, 5000);
  }

  const regions = {};
  const related = {};
  for (const keyword of c.keywords) {
    try {
      const data = await call(googleTrends.interestByRegion, { ...base, keyword, resolution: c.regionsResolution });
      regions[keyword] = data.default.geoMapData.filter((r) => r.value[0] > 0).map((r) => ({ name: r.geoName, value: r.value[0] }));
    } catch (error) {
      log(P, `regions failed for "${keyword}": ${error.message}`);
    }
    await pause(2000, 4000);
    try {
      const data = await call(googleTrends.relatedQueries, { ...base, keyword });
      const [topList, risingList] = data.default.rankedList;
      related[keyword] = {
        top: (topList?.rankedKeyword ?? []).map((k) => ({ query: k.query, value: k.value })),
        rising: (risingList?.rankedKeyword ?? []).map((k) => ({ query: k.query, value: k.formattedValue })),
      };
    } catch (error) {
      log(P, `related failed for "${keyword}": ${error.message}`);
    }
    log(P, `"${keyword}": regions + related`);
    await pause(2500, 5000);
  }

  writeJson(`${dir}/trends.json`, { geo: c.geo, timeframe: c.timeframe, series, regions, related });

  const anchor = c.keywords[0];
  const rows = Object.entries(series).map(([keyword, points]) => {
    const values = points.map((p) => p.value);
    const t = trendOf(points);
    return [keyword, Math.max(...values), t.recentAvg, t.previousAvg, t.change === null ? "—" : `${t.change > 0 ? "+" : ""}${t.change}%`];
  });
  const markdown = `# Google Trends — ${config.group}

Collected ${today()} · geo: ${c.geo || "worldwide"} · ${c.timeframe} · ${c.keywords.length} keywords

Raw data: \`raw/google-trends/trends.json\`

Values are relative (0–100), not search counts. Each batch of up to 5 terms is scaled to its own peak and shares the anchor "${anchor}", so compare terms against the anchor. Very niche terms show 0 (too little data).

## Interest: last 12 months vs the 12 months before

${mdTable(["Keyword", "Peak", "Last 12 months avg", "Previous 12 months avg", "Change"], rows)}

## Where interest is highest

${Object.entries(regions).map(([k, list]) => `- **${k}:** ${list.sort((a, b) => b.value - a.value).slice(0, 8).map((r) => `${r.name} (${r.value})`).join(", ") || "not enough data"}`).join("\n") || "_No data._"}

## Related searches (Trends)

${Object.entries(related).map(([k, r]) => `- **${k}** — top: ${r.top.slice(0, 6).map((q) => q.query).join(", ") || "—"} · rising: ${r.rising.slice(0, 6).map((q) => `${q.query} (${q.value})`).join(", ") || "—"}`).join("\n") || "_No data._"}

## Insights

_To be written by the group-analysis skill: is interest growing or shrinking, which regions to target first, and rising searches worth watching._
`;
  const file = writeMarkdown(config.slug, P, markdown);
  log(P, `wrote ${file}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
