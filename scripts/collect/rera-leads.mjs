// Contact sheet for developers with stuck MahaRERA projects (run rera-lists.mjs first).
//
//   node rera-leads.mjs [--target 200] [--max 600] [--districts Pune,Thane,…]
//
// Picks promoters from raw/promoters.json (target districts, company-like names, most stuck
// projects first), finds each on Google Maps ("<promoter> <district>") in the signed-in Brave
// profile, keeps the match only if the place name shares the promoter's distinctive words,
// reads phone and website, then looks for emails on the website (plain HTTP).
// Stops once --target leads have an email or phone. Checkpoints after every promoter.
// Writes analyses/rera-leads/raw/leads.csv (gitignored: phones and emails never reach the repo).

import fs from "node:fs";
import path from "node:path";
import { closeProfileBrowser, isBlocked, openProfileBrowser } from "./lib/browser.mjs";
import { ANALYSES_DIR, log, pause, writeJson } from "./lib/config.mjs";
import { findEmails, normalisePhone, ownEmails } from "./lib/contacts.mjs";

const P = "rera-leads";
const RAW = path.join(ANALYSES_DIR, "rera-leads", "raw");
const STATE = path.join(RAW, "lookups.json");
const COMPANY = /\b(developers?|builders?|infra|infrastructure|realty|realtors?|estates?|constructions?|llp|pvt|private|ltd|limited|homes|properties|associates|group|enterprises|promoters|housing|spaces|ventures|corporation|buildcon|landmarks?)\b/i;
const STOP = new Set(["developers", "developer", "builders", "builder", "infra", "infrastructure", "realty", "pvt", "private", "ltd", "limited", "llp", "and", "the", "co", "company", "construction", "constructions", "associates", "enterprises", "group", "properties", "estate", "estates", "homes", "m", "s", "shree", "shri", "sri", "new"]);

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const tokens = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));

// The Maps place must contain the promoter's distinctive words (e.g. "Bhagvati" of "Bhagvati Infra").
function matches(promoter, placeName) {
  const want = tokens(promoter);
  if (!want.length) return false;
  const have = new Set(tokens(placeName));
  const hit = want.filter((w) => have.has(w)).length;
  return hit / want.length >= 0.6;
}

// "exact" when the place name holds every word of the name (generic words included), else "partial".
function confidence(name, placeName) {
  const all = String(name).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !/^(pvt|private|ltd|limited|llp)$/.test(w));
  const have = String(placeName ?? "").toLowerCase();
  return all.every((w) => have.includes(w)) ? "exact" : "partial";
}

async function lookup(page, promoter, district, { project = false } = {}) {
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(`${promoter} ${district}`)}?hl=en`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (await isBlocked(page)) throw new Error("captcha");
  // Either a results list or (for a single match) the place itself loads.
  await page.waitForSelector('div[role="feed"], h1.DUwDvf', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1500 + Math.random() * 1000);
  if (await page.locator('div[role="feed"]').count()) {
    const first = page.locator('div[role="feed"] a.hfpxzc[aria-label]').first();
    if (!(await first.count())) return null;
    const name = await first.getAttribute("aria-label");
    if (!matches(promoter, name)) return { matched: false, name };
    await first.click();
    await page.waitForSelector("h1.DUwDvf", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  if (!(await page.locator("h1.DUwDvf").count())) return null;
  const d = await page.evaluate(() => {
    const strip = (s) => (s ?? "").replace(/^(Address|Phone|Website):\s*/i, "").trim() || null;
    return {
      name: document.querySelector("h1.DUwDvf")?.textContent?.trim() ?? null,
      category: document.querySelector('button[jsaction*="category"]')?.textContent?.trim() ?? null,
      address: strip(document.querySelector('button[data-item-id="address"]')?.getAttribute("aria-label")),
      phone: strip(document.querySelector('button[data-item-id^="phone"]')?.getAttribute("aria-label")),
      website: document.querySelector('a[data-item-id="authority"]')?.href ?? null,
    };
  });
  // Same name is not enough ("Triveni Geetanjali" is a building, not Triveni Developers):
  // the place must be listed as a real estate or construction business.
  // A project's own listing is a building or complex; that only counts when searching the project name.
  const business = /real estate|builder|construction|developer|property|housing|contractor|consultant|corporate office|office/i;
  const residence = /apartment|residential|complex|condominium|building|society|bungalow|villa|township/i;
  const realEstate = business.test(d.category ?? "") || (project && residence.test(d.category ?? ""));
  return { ...d, matched: matches(promoter, d.name) && realEstate, url: page.url().split("?")[0] };
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(rows) {
  const headers = ["#", "promoter", "district", "stuck_projects", "projects", "problem", "match", "maps_name", "category", "phone", "mobile", "whatsapp", "email", "website", "address", "status", "notes", "maps"];
  const lines = rows.map((r, i) => [i + 1, r.promoter, r.district, r.projects.length, r.projects.map((p) => `${p.project} (${p.certificate})`).join("; "), [...new Set(r.projects.flatMap((p) => p.problems.map((x) => x.why)))].join("; "), r.found?.confidence, r.found?.name, r.found?.category, r.phone?.e164, r.phone?.mobile ? "yes" : "no", r.phone?.mobile ? `https://wa.me/${r.phone.e164.slice(1)}` : "", r.emails.join(" "), r.found?.website, r.found?.address, "", "", r.found?.url]);
  fs.writeFileSync(path.join(RAW, "leads.csv"), "﻿" + [headers, ...lines].map((l) => l.map(csvCell).join(",")).join("\n") + "\n");
}

async function main() {
  const target = Number(arg("target", "200"));
  const max = Number(arg("max", "600"));
  const districts = arg("districts", "Pune,Thane,Mumbai Suburban,Mumbai City,Palghar,Raigarh,Nashik,Nagpur").split(",").map((s) => s.trim());
  const promoters = JSON.parse(fs.readFileSync(path.join(RAW, "promoters.json"), "utf8"));
  const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : {};

  // One row per promoter and district: same-named firms in different districts are usually different firms.
  const candidates = promoters
    .flatMap((p) => p.districts.map((d) => ({ promoter: p.promoter, district: d, projects: p.projects.filter((x) => x.district === d) })))
    .filter((c) => districts.includes(c.district) && COMPANY.test(c.promoter) && tokens(c.promoter).length)
    .sort((a, b) => b.projects.length - a.projects.length || districts.indexOf(a.district) - districts.indexOf(b.district))
    .slice(0, max);

  const key = (c) => `${c.promoter}|${c.district}`;
  const done = () => candidates.filter((c) => state[key(c)]?.contact).length;
  log(P, `${candidates.length} candidates in ${districts.join(", ")}; ${done()} leads already found`);

  const { context, page } = await openProfileBrowser();
  try {
    for (const c of candidates) {
      if (done() >= target) break;
      if (state[key(c)]) continue;
      let found = null;
      try {
        found = await lookup(page, c.promoter, c.district);
        // Not on Maps under its own name: the stuck project's listing usually has the sales office phone.
        if (!found?.matched && c.projects[0]) {
          await pause(2000, 4000);
          const viaProject = await lookup(page, c.projects[0].project, c.district, { project: true });
          if (viaProject?.matched) found = { ...viaProject, via: "project" };
        }
        if (found?.matched) found.confidence = found.via === "project" ? "project" : confidence(c.promoter, found.name);
      } catch (e) {
        if (/captcha/.test(e.message)) {
          log(P, "Google showed a captcha — stopping. Solve it and re-run to resume.");
          break;
        }
        log(P, `  ${c.promoter}: ${e.message.split("\n")[0]}`);
      }
      const ok = found?.matched ? found : null;
      const emails = ok?.website ? ownEmails(await findEmails(ok.website).catch(() => []), ok.website) : [];
      const phone = ok?.phone ? normalisePhone(ok.phone) : null;
      state[key(c)] = { found: ok, seen: found?.name ?? null, emails, phone, contact: Boolean(emails.length || phone) };
      writeJson(STATE, state);
      log(P, `[${done()}/${target}] ${c.promoter} (${c.district}, ${c.projects.length}): ${ok ? `${ok.name} · ${phone?.e164 ?? "no phone"} · ${emails[0] ?? "no email"}` : `no match${found?.name ? ` ("${found.name}")` : ""}`}`);
      await pause(2500, 5000);
    }
  } finally {
    await closeProfileBrowser(context);
  }

  const rows = candidates.filter((c) => state[key(c)]?.contact).map((c) => ({ ...c, ...state[key(c)] }));
  const rank = { exact: 0, project: 1, partial: 2 };
  rows.sort((a, b) => Number(Boolean(b.emails.length)) - Number(Boolean(a.emails.length)) || (rank[a.found?.confidence] ?? 3) - (rank[b.found?.confidence] ?? 3) || b.projects.length - a.projects.length);
  writeCsv(rows);
  const withEmail = rows.filter((r) => r.emails.length).length;
  const looked = candidates.filter((c) => state[key(c)]).length;
  log(P, `${looked} looked up · ${rows.length} leads (${withEmail} with email, ${rows.filter((r) => r.phone?.mobile).length} mobile) → ${path.join(RAW, "leads.csv")}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
