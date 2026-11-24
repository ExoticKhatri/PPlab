// Projects whose MahaRERA registration is about to lapse: the freshest RERA leads.
//
//   node rera-deadlines.mjs [--from 2026-06-01] [--to 2027-03-31]
//
// MahaRERA's public project search filters by exact completion date and lists project,
// promoter, taluka, pincode, last-modified date and whether an extension certificate exists
// (no captcha on the search page). For every day in the window it reads all result pages,
// statewide. Effective deadline = completion date + 4 months when the date is on or after
// 28 Feb 2026 (MahaRERA's automatic force-majeure extension, Order 66/2026, 7 Aug 2026).
// A project with no extension certificate must extend or upload its occupancy certificate
// before that deadline, or it lapses into abeyance.
// Checkpoints per day in analyses/rera-leads/raw/deadlines.json.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { ANALYSES_DIR, log, pause, writeJson } from "./lib/config.mjs";

const P = "rera-deadlines";
const OUT = path.join(ANALYSES_DIR, "rera-leads", "raw", "deadlines.json");
const ORDER_66_FROM = "2026-02-28";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function days(from, to) {
  const out = [];
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) out.push(d.toISOString().slice(0, 10));
  return out;
}

export function effectiveDeadline(completion) {
  if (completion < ORDER_66_FROM) return completion;
  const d = new Date(`${completion}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 4);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}

// One results page: each project block starts with "# P5…".
async function readPage(page, date, n) {
  const url = `https://maharera.maharashtra.gov.in/projects-search-result?project_name=&project_location=&project_completion_date=${date}&project_state=27&project_district=&page=${n}&op=Search`;
  // Retry network drops (sleep, Wi-Fi changes) with growing waits before giving up.
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
      break;
    } catch (error) {
      if (attempt >= 6) throw error;
      log(P, `  ${date} page ${n}: ${error.message.split("\n")[0]}; retry ${attempt} in ${attempt * 30}s`);
      await page.waitForTimeout(attempt * 30_000);
    }
  }
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const text = document.body.innerText;
    const total = Number((text.match(/Showing Final ([\d,]+) Result/) ?? ["", "0"])[1].replace(/,/g, ""));
    const blocks = text.split(/\n#\s*(?=P\d{8,})/).slice(1);
    const field = (b, name) => b.match(new RegExp(`${name}\\s*\\n\\s*([^\\n]+)`))?.[1]?.trim() ?? "";
    const rows = blocks.map((b) => {
      const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
      return {
        certificate: lines[0],
        project: lines[1] ?? "",
        promoter: lines[2] ?? "",
        taluka: (lines[3] ?? "").replace(/Find Route/i, "").trim(),
        pincode: field(b, "Pincode"),
        district: field(b, "District"),
        lastModified: field(b, "Last Modified"),
        // "N/A" when there is no extension; a certificate shows as an icon with no text.
        extension: /Extension Certificate\s*\n\s*N\/A/.test(b) ? "none" : "yes",
      };
    });
    return { total, rows };
  });
}

async function main() {
  const from = arg("from", "2026-06-01");
  const to = arg("to", "2027-03-31");
  const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const todo = days(from, to).filter((d) => !done[d]);
  log(P, `${todo.length} days to read (${Object.keys(done).length} done)`);
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36" })).newPage();
  try {
    for (const date of todo) {
      const first = await readPage(page, date, 0);
      const rows = [...first.rows];
      for (let n = 1; rows.length < first.total && n < 200; n++) {
        const next = await readPage(page, date, n);
        if (!next.rows.length) break;
        rows.push(...next.rows);
        await pause(400, 900);
      }
      done[date] = rows.map((r) => ({ ...r, completion: date, deadline: effectiveDeadline(date) }));
      writeJson(OUT, done);
      log(P, `${date}: ${rows.length}/${first.total} projects (${rows.filter((r) => r.extension === "none").length} without extension)`);
      await pause(500, 1000);
    }
  } finally {
    await browser.close();
  }
  const all = Object.values(done).flat();
  log(P, `${all.length} projects with completion dates ${from} → ${to} → ${OUT}`);
}

if (process.argv[1]?.endsWith("rera-deadlines.mjs")) {
  main().catch((error) => {
    console.error(`[${P}] ${error.message}`);
    process.exit(1);
  });
}
