// The people behind each stuck project, from MahaRERA's public project page.
//
//   node rera-people.mjs [--count 50]
//
// MahaRERA's project page asks for a captcha; a person types it in the window this opens
// (we never solve or bypass captchas). After each one the page is read and the next project
// opens, so a sitting of 50 projects takes ~10–15 minutes.
// Saves per project: promoter type and name, official communication address, partners /
// directors, authorised signatories, single point of contact, and project professionals
// (the CA, engineer and architect). Checkpoints to analyses/rera-leads/raw/people.json.
// Picks one project per promoter: verified/likely leads first (rera-verify.mjs), then
// companies with the most stuck projects in the target districts.

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { ANALYSES_DIR, log, writeJson } from "./lib/config.mjs";

const P = "rera-people";
const RAW = path.join(ANALYSES_DIR, "rera-leads", "raw");
const OUT = path.join(RAW, "people.json");
const DISTRICTS = ["Pune", "Thane", "Mumbai Suburban", "Mumbai City", "Palghar", "Raigarh", "Nashik", "Nagpur"];
const COMPANY = /\b(developers?|builders?|infra|realty|estates?|constructions?|llp|pvt|private|ltd|limited|homes|properties|associates|group|enterprises|promoters|housing|spaces|ventures|buildcon|landmarks?)\b/i;
const TABS = ["Partner Details", "Director Details", "Proprietor Details", "Member Details", "Authorised Signatory", "Single Point of Contact", "Project Professionals"];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function pickProjects(count) {
  const promoters = JSON.parse(fs.readFileSync(path.join(RAW, "promoters.json"), "utf8"));
  const verdicts = fs.existsSync(path.join(RAW, "verdicts.json")) ? JSON.parse(fs.readFileSync(path.join(RAW, "verdicts.json"), "utf8")) : {};
  const score = { verified: 0, likely: 1 };
  return promoters
    .flatMap((p) => p.districts.filter((d) => DISTRICTS.includes(d)).map((d) => ({ promoter: p.promoter, district: d, projects: p.projects.filter((x) => x.district === d) })))
    .filter((c) => COMPANY.test(c.promoter) && verdicts[`${c.promoter}|${c.district}`]?.verdict !== "rejected")
    .sort((a, b) => (score[verdicts[`${a.promoter}|${a.district}`]?.verdict] ?? 2) - (score[verdicts[`${b.promoter}|${b.district}`]?.verdict] ?? 2) || b.projects.length - a.projects.length)
    .slice(0, count)
    .map((c) => ({ ...c.projects[0], promoter: c.promoter, stuck: c.projects.length }));
}

// The public page id comes from the search results row that carries this registration number.
async function findViewUrl(page, project) {
  await page.goto(`https://maharera.maharashtra.gov.in/projects-search-result?project_name=${encodeURIComponent(project.project)}&op=Search`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(2500);
  return page.evaluate((cert) => {
    const links = [...document.querySelectorAll('a[href*="/public/project/view/"]')];
    const row = (a) => a.closest("tr, li, .row, .card, div")?.innerText ?? "";
    return (links.find((a) => row(a).includes(cert)) ?? (links.length === 1 ? links[0] : null))?.href ?? null;
  }, project.certificate);
}

const between = (text, start, ends) => {
  const i = text.indexOf(start);
  if (i < 0) return "";
  const rest = text.slice(i + start.length);
  const cut = Math.min(...ends.map((e) => rest.indexOf(e)).filter((n) => n >= 0), rest.length);
  return rest.slice(0, cut).trim();
};

// Table rows come through as tab-separated lines starting with a row number.
function rows(text) {
  return text.split("\n").map((l) => l.split("\t").map((c) => c.trim())).filter((c) => /^\d+$/.test(c[0]) && c[1]);
}

async function readPeople(page) {
  const text = await page.evaluate(() => document.body.innerText);
  const result = {
    status: between(text, "Project Status", ["Certificate Download"]).split("\n")[0],
    promoterType: between(text, "Promoter Type", ["Name of", "Promoter Official"]).split("\n")[0],
    address: between(text, "Promoter Official Communication Address", TABS).replace(/\n+/g, ", "),
    people: [],
    professionals: [],
  };
  for (const tab of TABS) {
    const el = page.getByText(tab, { exact: true }).first();
    if (!(await el.count())) continue;
    await el.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const body = await page.evaluate(() => document.body.innerText);
    const section = between(body, "SRO Details", ["Document Library", "Promoter Landowner"]);
    for (const r of rows(section)) {
      if (tab === "Project Professionals") result.professionals.push({ type: r[1], name: r[2] });
      else result.people.push({ name: r[1], role: r[2] || tab.replace(/ Details$/, ""), section: tab });
    }
  }
  return result;
}

async function main() {
  const count = Number(arg("count", "50"));
  const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const todo = pickProjects(count).filter((p) => !done[p.certificate]);
  log(P, `${todo.length} projects to read (${Object.keys(done).length} already saved). Type each captcha in the window; the next page opens by itself.`);
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 900 } })).newPage();
  try {
    for (const [i, p] of todo.entries()) {
      const url = await findViewUrl(page, p).catch(() => null);
      if (!url) {
        done[p.certificate] = { ...p, error: "not found in MahaRERA search" };
        writeJson(OUT, done);
        log(P, `[${i + 1}/${todo.length}] ${p.project}: not found in search — skipped`);
        continue;
      }
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
      log(P, `[${i + 1}/${todo.length}] ${p.promoter} — ${p.project}: waiting for captcha…`);
      const start = Date.now();
      let solved = false;
      while (Date.now() - start < 10 * 60_000) {
        if ((await page.evaluate(() => document.body.innerText.length).catch(() => 0)) > 1500) {
          solved = true;
          break;
        }
        await page.waitForTimeout(1500);
      }
      if (!solved) {
        log(P, "no captcha typed for 10 minutes — stopping. Re-run to continue.");
        break;
      }
      await page.waitForTimeout(3000);
      const info = await readPeople(page);
      done[p.certificate] = { ...p, url, ...info, readAt: new Date().toISOString() };
      writeJson(OUT, done);
      const ca = info.professionals.find((x) => /chartered/i.test(x.type))?.name ?? "—";
      log(P, `    saved: ${info.people.length} people (${info.people.slice(0, 2).map((x) => x.name).join(", ")}…), CA ${ca}`);
    }
  } finally {
    await browser.close();
  }
  log(P, `done: ${Object.keys(done).length} projects in ${OUT}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
