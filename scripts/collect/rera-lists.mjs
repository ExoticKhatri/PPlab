// MahaRERA's public lists of projects in trouble, merged by promoter.
//
//   node rera-lists.mjs
//
// Reads three tables from maharera.maharashtra.gov.in (headless Chromium, read-only):
//   - due-lapse-completion-date             projects past their completion date, in abeyance
//   - due-non-compliance-qpr                projects suspended for missed quarterly reports
//   - district-wise-non-compliance-qpr      recent quarterly-report defaulters
// Writes analyses/rera-leads/raw/lists.json (every row) and raw/promoters.json (grouped by
// promoter, worst first). raw/ is gitignored.

import path from "node:path";
import { chromium } from "playwright";
import { ANALYSES_DIR, log, writeJson } from "./lib/config.mjs";

const P = "rera-lists";
const BASE = "https://www.maharera.maharashtra.gov.in";
const LISTS = [
  { key: "lapsed", path: "/due-lapse-completion-date", why: "Completion date lapsed: project in abeyance, flat sales blocked until it is extended or updated" },
  { key: "qpr-suspended", path: "/due-non-compliance-qpr", why: "Suspended for missed quarterly progress reports" },
  { key: "qpr-recent", path: "/index.php/district-wise-non-compliance-qpr-projects", why: "Recent quarterly progress report missed" },
];
const RAW = path.join(ANALYSES_DIR, "rera-leads", "raw");

// Column positions differ by table, so map them from the header row.
function mapRow(headers, cells) {
  const find = (re) => headers.findIndex((h) => re.test(h));
  const at = (re) => cells[find(re)]?.trim() ?? "";
  return {
    promoter: at(/promoter/i),
    project: at(/project/i),
    certificate: at(/certificate/i),
    district: at(/district/i),
    since: [at(/month/i), at(/year/i)].filter(Boolean).join(" "),
  };
}

async function readTable(page, list) {
  await page.goto(BASE + list.path, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForSelector("table tr", { timeout: 60_000 });
  const rows = await page.evaluate(() => [...document.querySelectorAll("table tr")].map((tr) => [...tr.querySelectorAll("th,td")].map((c) => c.innerText.replace(/\s+/g, " ").trim())));
  const [headers, ...data] = rows;
  const updated = (await page.evaluate(() => document.body.innerText.match(/Last Updated\s*:\s*([\d/]+)/i)?.[1])) ?? "";
  return { updated, rows: data.filter((r) => r.length >= 4).map((r) => ({ ...mapRow(headers, r), list: list.key })) };
}

function normalise(name) {
  return name.toUpperCase().replace(/\b(M\/S\.?|MESSRS)\b/g, "").replace(/[^A-Z0-9 ]/g, " ").replace(/\b(PVT|PRIVATE|LTD|LIMITED|LLP)\b/g, "").replace(/\s+/g, " ").trim();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36" })).newPage();
  const all = [];
  try {
    for (const list of LISTS) {
      const { updated, rows } = await readTable(page, list);
      log(P, `${list.key}: ${rows.length} projects (updated ${updated})`);
      all.push(...rows.map((r) => ({ ...r, why: list.why, updated })));
    }
  } finally {
    await browser.close();
  }
  writeJson(path.join(RAW, "lists.json"), all);

  const byPromoter = new Map();
  for (const r of all) {
    const key = normalise(r.promoter);
    if (!key) continue;
    const p = byPromoter.get(key) ?? { promoter: r.promoter, districts: new Set(), projects: new Map() };
    p.districts.add(r.district);
    const proj = p.projects.get(r.certificate) ?? { certificate: r.certificate, project: r.project, district: r.district, problems: [] };
    proj.problems.push({ list: r.list, why: r.why, since: r.since });
    p.projects.set(r.certificate, proj);
    byPromoter.set(key, p);
  }
  const promoters = [...byPromoter.values()]
    .map((p) => ({ promoter: p.promoter, districts: [...p.districts], projects: [...p.projects.values()] }))
    .sort((a, b) => b.projects.length - a.projects.length || a.promoter.localeCompare(b.promoter));
  writeJson(path.join(RAW, "promoters.json"), promoters);
  const multi = promoters.filter((p) => p.projects.length > 1).length;
  log(P, `${all.length} rows · ${promoters.length} promoters · ${multi} with 2+ stuck projects → ${RAW}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
