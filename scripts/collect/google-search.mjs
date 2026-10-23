// Google search intent: what the group actually types into Google.
//
//   node google-search.mjs <group-slug>
//
// 1. Autocomplete — Google's suggest endpoint, for every seed, "<seed> a…z"
//    and "<question word> <seed>". Plain HTTP, no browser.
// 2. "People also ask" + related searches — result pages opened in the
//    signed-in Brave profile (signed-out headless browsers get a captcha).
//    Stops at the first captcha instead of working around it.

import { closeProfileBrowser, isBlocked, openProfileBrowser } from "./lib/browser.mjs";
import { loadConfig, log, mdTable, pause, rawDir, today, writeJson, writeMarkdown } from "./lib/config.mjs";

const P = "google-search";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

async function suggest(query, { hl, gl }) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`suggest ${res.status}`);
  const body = await res.json();
  return Array.isArray(body?.[1]) ? body[1] : [];
}

async function collectAutocomplete(c) {
  const suggestions = new Map(); // text → { text, seeds:Set, hits }
  for (const seed of c.seeds) {
    const probes = [seed];
    if (c.expandAlphabet) probes.push(...LETTERS.map((l) => `${seed} ${l}`));
    probes.push(...c.questionPrefixes.map((p) => `${p} ${seed}`));
    let got = 0;
    for (const probe of probes) {
      try {
        for (const text of await suggest(probe, c)) {
          const key = text.toLowerCase();
          const entry = suggestions.get(key) ?? { text, seeds: new Set(), hits: 0 };
          entry.seeds.add(seed);
          entry.hits++;
          suggestions.set(key, entry);
          got++;
        }
      } catch (error) {
        log(P, `autocomplete "${probe}" failed: ${error.message}`);
      }
      await pause(150, 400);
    }
    log(P, `autocomplete "${seed}": ${probes.length} probes, ${got} suggestions`);
  }
  return [...suggestions.values()].map((s) => ({ ...s, seeds: [...s.seeds] }));
}

// Lines of a section in the results page text, between a heading and the next known heading.
function section(text, startRe, max = 30) {
  const lines = text.split("\n").map((l) => l.trim());
  const start = lines.findIndex((l) => startRe.test(l));
  if (start === -1) return [];
  const stop = /^(Feedback|Show more|More results|People also search for|Related searches|Videos|Images|Footer links|Next|Discussions and forums|Page Navigation|Search Results|Settings|Privacy|Terms)$/i;
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (stop.test(line) && out.length) break;
    if (line && line.length > 3 && !stop.test(line) && !/^(page d+|d+|more)$/i.test(line)) out.push(line);
    if (out.length >= max) break;
  }
  return out;
}

async function collectResultsPages(queries, c) {
  if (queries.length === 0) return { pages: [], blocked: false, signedOutHint: false };
  const { context, page } = await openProfileBrowser();
  const pages = [];
  let blocked = false;
  try {
    for (const query of queries.slice(0, c.maxResultsPages)) {
      try {
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=${c.hl}&gl=${c.gl}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2500);
      if (await isBlocked(page)) {
        blocked = true;
        log(P, `captcha on "${query}" — stopping result pages (autocomplete still saved)`);
        break;
      }
      // Clicking a "People also ask" question loads more questions below it.
      const questions = page.locator('[jsname="Cpkphb"], div[role="button"][aria-expanded]');
      const n = Math.min(await questions.count(), c.expandPeopleAlsoAsk);
      for (let i = 0; i < n; i++) {
        await questions.nth(i).click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(700);
      }
      const text = await page.evaluate(() => document.body.innerText);
      const peopleAlsoAsk = section(text, /^People also ask$/i).filter((l) => /\?$/.test(l));
      const related = section(text, /^(People also search for|Related searches)$/i);
      pages.push({ query, peopleAlsoAsk: [...new Set(peopleAlsoAsk)], related: [...new Set(related)] });
      log(P, `"${query}": ${peopleAlsoAsk.length} questions, ${related.length} related`);
      } catch (error) {
        log(P, `result page "${query}" failed, skipped: ${error.message}`);
      }
      await pause(4000, 9000);
    }
  } finally {
    await closeProfileBrowser(context);
  }
  return { pages, blocked };
}

function buildMarkdown(config, suggestions, results) {
  const c = config.googleSearch;
  const questions = suggestions.filter((s) => /^(how|why|what|which|where|when|can|is|does|do|should)\b/i.test(s.text));
  const allPaa = [...new Set(results.pages.flatMap((p) => p.peopleAlsoAsk))];
  const allRelated = [...new Set(results.pages.flatMap((p) => p.related))];
  const top = [...suggestions].sort((a, b) => b.hits - a.hits || a.text.localeCompare(b.text));

  return `# Google search — ${config.group}

Collected ${today()} · ${c.hl}-${c.gl.toUpperCase()} · ${c.seeds.length} seeds · ${suggestions.length} autocomplete suggestions · ${results.pages.length} result pages${results.blocked ? " (stopped early: captcha)" : ""}

Raw data: \`raw/google-search/autocomplete.json\`, \`raw/google-search/results.json\`

Autocomplete shows what people commonly type, not how often (Google gives no volumes here). "Hits" = how many different probes returned the suggestion — a rough signal of how central it is.

## Question-style searches

${questions.length ? questions.sort((a, b) => b.hits - a.hits).slice(0, 60).map((s) => `- ${s.text}`).join("\n") : "_None._"}

## People also ask

${allPaa.length ? allPaa.map((q) => `- ${q}`).join("\n") : results.blocked ? "_Blocked by captcha — re-run later, or run `node login.mjs` and sign in to Google first._" : "_None found._"}

## Related searches

${allRelated.length ? allRelated.map((q) => `- ${q}`).join("\n") : "_None found._"}

## All autocomplete suggestions (top 150)

${mdTable(["Suggestion", "Hits", "From seed"], top.slice(0, 150).map((s) => [s.text, s.hits, s.seeds.join(", ")]))}

## Insights

_To be written by the group-analysis skill: the problems and questions this group searches for, grouped by theme, and the exact wording worth reusing in ads and landing pages._
`;
}

async function main() {
  const config = loadConfig(process.argv[2]);
  const c = config.googleSearch;
  if (c.seeds.length === 0) throw new Error("googleSearch.seeds is empty in config.json");
  const dir = rawDir(config.slug, P);

  const suggestions = await collectAutocomplete(c);
  writeJson(`${dir}/autocomplete.json`, suggestions);

  const queries = c.resultsQueries.length ? c.resultsQueries : c.seeds.slice(0, 5);
  const results = await collectResultsPages(queries, c);
  writeJson(`${dir}/results.json`, results);

  const file = writeMarkdown(config.slug, P, buildMarkdown(config, suggestions, results));
  log(P, `wrote ${file}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
