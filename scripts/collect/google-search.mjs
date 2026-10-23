// Google search intent: what the group actually types into Google.
//
//   node google-search.mjs <group-slug>
//
// 1. Autocomplete — Google's suggest endpoint, for every seed, "<seed> a…z"
//    and "<question word> <seed>". Plain HTTP, no browser.
// 2. "People also ask" + related searches — result pages opened in the
//    signed-in Brave profile (signed-out headless browsers get a captcha).
//    Typed into google.com like a person, with long random gaps. On a captcha
//    it waits for the person at the computer to solve it, then (optionally)
//    reads the remaining pages from Bing, which rarely shows captchas.

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
    if (line && line.length > 3 && !stop.test(line) && !/^(page \d+|\d+|more)$/i.test(line)) out.push(line);
    if (out.length >= max) break;
  }
  return out;
}

const gap = (c) => pause(c.pageGapSeconds[0] * 1000, c.pageGapSeconds[1] * 1000);

// A captcha: leave the window open and give the person at the computer time to solve it.
async function waitForHuman(page, query, seconds) {
  if (!seconds) return false;
  log(P, `captcha on "${query}" — solve it in the Brave window (waiting up to ${seconds} s)`);
  const until = Date.now() + seconds * 1000;
  while (Date.now() < until) {
    await page.waitForTimeout(3000);
    if (!(await isBlocked(page).catch(() => true))) {
      log(P, "captcha cleared, continuing");
      return true;
    }
  }
  return false;
}

// Type the query into Google's search box like a person; fall back to the URL.
async function googleSearch(page, query, c) {
  const box = page.locator('textarea[name="q"], input[name="q"]').first();
  if (!page.url().includes("google.") || !(await box.isVisible().catch(() => false))) {
    await page.goto(`https://www.google.com/?hl=${c.hl}&gl=${c.gl}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500 + Math.random() * 2000);
  }
  if (await box.isVisible().catch(() => false)) {
    await box.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await box.pressSequentially(query, { delay: 60 + Math.random() * 90 });
    await page.waitForTimeout(400 + Math.random() * 600);
    await Promise.all([page.waitForLoadState("domcontentloaded"), page.keyboard.press("Enter")]);
  } else {
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=${c.hl}&gl=${c.gl}`, { waitUntil: "domcontentloaded" });
  }
  await page.waitForTimeout(2500);
}

async function readGooglePage(page, query, c) {
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
  return { query, source: "google", peopleAlsoAsk: [...new Set(peopleAlsoAsk)], related: [...new Set(related)] };
}

// Bing's "People also ask" loads as you scroll; related searches sit in .b_rs.
async function readBingPage(page, query, c) {
  const cc = c.gl.toUpperCase();
  await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=${c.hl}&cc=${cc}`, { waitUntil: "domcontentloaded" });
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(700);
  }
  if (await isBlocked(page)) throw new Error("Bing showed a captcha");
  const { paa, related } = await page.evaluate(() => {
    const box = document.querySelector("#relatedQnAListDisplay, .rqnaContainerwithfeedback");
    const paa = box ? box.innerText.split("\n").map((l) => l.trim()).filter((l) => /\?$/.test(l)) : [];
    const related = [...document.querySelectorAll(".b_rs a")].map((a) => a.innerText.trim()).filter(Boolean);
    return { paa, related };
  });
  return { query, source: "bing", peopleAlsoAsk: [...new Set(paa)], related: [...new Set(related)] };
}

async function collectResultsPages(queries, c) {
  if (queries.length === 0) return { pages: [], blocked: false, skipped: [] };
  const { context, page } = await openProfileBrowser();
  const pages = [];
  const skipped = [];
  let blocked = false; // Google blocked us; later pages go to Bing (if allowed)
  try {
    const list = queries.slice(0, c.maxResultsPages);
    for (const [i, query] of list.entries()) {
      try {
        if (!blocked) {
          await googleSearch(page, query, c);
          if ((await isBlocked(page)) && !(await waitForHuman(page, query, c.captchaWaitSeconds))) {
            blocked = true;
            log(P, `Google still blocked${c.bingFallback ? " — switching to Bing for the remaining pages" : " — stopping result pages"}`);
          }
        }
        if (!blocked) pages.push(await readGooglePage(page, query, c));
        else if (c.bingFallback) pages.push(await readBingPage(page, query, c));
        else {
          skipped.push(...list.slice(i).map((q) => ({ query: q, reason: "Google captcha" })));
          break;
        }
        const p = pages.at(-1);
        log(P, `[${i + 1}/${list.length}] "${query}" (${p.source}): ${p.peopleAlsoAsk.length} questions, ${p.related.length} related`);
      } catch (error) {
        skipped.push({ query, reason: error.message.split("\n")[0] });
        log(P, `result page "${query}" failed, skipped: ${error.message.split("\n")[0]}`);
      }
      if (i < list.length - 1) await gap(c);
    }
    if (queries.length > list.length) skipped.push(...queries.slice(list.length).map((q) => ({ query: q, reason: "over maxResultsPages" })));
  } finally {
    await closeProfileBrowser(context);
  }
  return { pages, blocked, skipped };
}

function buildMarkdown(config, suggestions, results) {
  const c = config.googleSearch;
  const questions = suggestions.filter((s) => /^(how|why|what|which|where|when|can|is|does|do|should)\b/i.test(s.text));
  const allPaa = [...new Set(results.pages.flatMap((p) => p.peopleAlsoAsk))];
  const allRelated = [...new Set(results.pages.flatMap((p) => p.related))];
  const top = [...suggestions].sort((a, b) => b.hits - a.hits || a.text.localeCompare(b.text));
  const fromBing = results.pages.filter((p) => p.source === "bing").length;
  const skipped = results.skipped ?? [];
  const pageRows = results.pages.map((p) => [p.query, p.source, p.peopleAlsoAsk.length, p.related.length]);

  return `# Google search — ${config.group}

Collected ${today()} · ${c.hl}-${c.gl.toUpperCase()} · ${c.seeds.length} seeds · ${suggestions.length} autocomplete suggestions · ${results.pages.length} result pages${fromBing ? ` (${fromBing} from Bing — Google showed a captcha)` : results.blocked ? " (stopped early: captcha)" : ""}${skipped.length ? ` · ${skipped.length} skipped` : ""}

Raw data: \`raw/google-search/autocomplete.json\`, \`raw/google-search/results.json\`

Autocomplete shows what people commonly type, not how often (Google gives no volumes here). "Hits" = how many different probes returned the suggestion — a rough signal of how central it is.

## Question-style searches

${questions.length ? questions.sort((a, b) => b.hits - a.hits).slice(0, 60).map((s) => `- ${s.text}`).join("\n") : "_None._"}

## People also ask

${pageRows.length ? mdTable(["Result page", "Source", "Questions", "Related"], pageRows) + "\n\n" : ""}${allPaa.length ? allPaa.map((q) => `- ${q}`).join("\n") : results.blocked ? "_Blocked by captcha — re-run later, or run `node login.mjs` and sign in to Google first._" : "_None found._"}

## Related searches

${allRelated.length ? allRelated.map((q) => `- ${q}`).join("\n") : "_None found._"}

${skipped.length ? `## Skipped result pages\n\n${skipped.map((x) => `- ${x.query} — ${x.reason}`).join("\n")}\n\n` : ""}## All autocomplete suggestions (top 150)

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
