// Official company record (MCA master data on data.gov.in) for every stuck RERA promoter that is a company.
//
//   node rera-mca.mjs
//
// Needs a free data.gov.in API key in analyses/rera-leads/raw/datagov.key (gitignored).
// For each promoter named "… Pvt Ltd / Limited" in raw/promoters.json it queries the Company
// Master Data API by exact name (and a "PRIVATE LIMITED" spelling variant), and keeps CIN,
// status (Active / Strike Off …), registration date and registered office address.
// The dataset has no email or director fields. Writes raw/mca.json.

import fs from "node:fs";
import path from "node:path";
import { ANALYSES_DIR, log, pause, writeJson } from "./lib/config.mjs";

const P = "rera-mca";
const RAW = path.join(ANALYSES_DIR, "rera-leads", "raw");
const RESOURCE = "ec58dab7-d891-4abb-936e-d5d274a6ce9b";

function variants(name) {
  const base = name.toUpperCase().replace(/\bM\/S\.?\s*/g, "").replace(/[.,]/g, "").replace(/\s+/g, " ").trim();
  const full = base.replace(/\bPVT\b/g, "PRIVATE").replace(/\bLTD\b/g, "LIMITED");
  return [...new Set([base, full, full.replace(/\bPRIVATE LIMITED\b/, "PVT LTD")])];
}

async function byName(key, name, tries = 5) {
  const url = `https://api.data.gov.in/catalog/${RESOURCE}?api-key=${key}&format=json&limit=5&filters[company_name]=${encodeURIComponent(name)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (res.status === 429 && tries > 0) {
    await pause(15_000, 25_000); // rate limited: wait and retry
    return byName(key, name, tries - 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()).records ?? [];
}

async function main() {
  const key = fs.readFileSync(path.join(RAW, "datagov.key"), "utf8").trim();
  const promoters = JSON.parse(fs.readFileSync(path.join(RAW, "promoters.json"), "utf8"));
  const file = path.join(RAW, "mca.json");
  const out = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const companies = promoters.filter((p) => /\b(pvt|private|ltd|limited)\b/i.test(p.promoter) && !(p.promoter in out));
  log(P, `${companies.length} companies to look up (${Object.keys(out).length} done)`);

  for (const [i, p] of companies.entries()) {
    let rec = null;
    let failed = false;
    for (const v of variants(p.promoter)) {
      rec = (await byName(key, v).catch((e) => ((failed = true), log(P, `  ${v}: ${e.message}`), [])))[0] ?? null;
      if (rec) break;
      await pause(1000, 1500);
    }
    if (failed && !rec) continue; // retried next run; never cache a failure as "not found"
    out[p.promoter] = rec ? { cin: rec.corporate_identification_number, name: rec.company_name, status: rec.company_status, registered: rec.date_of_registration?.slice(0, 10), roc: rec.registrar_of_companies, address: rec.registered_office_address } : null;
    if ((i + 1) % 25 === 0) {
      writeJson(file, out);
      log(P, `  ${i + 1}/${companies.length}`);
    }
    await pause(1000, 1500);
  }
  writeJson(file, out);
  const found = Object.values(out).filter(Boolean);
  const status = found.reduce((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {});
  log(P, `${found.length}/${Object.keys(out).length} matched · ${JSON.stringify(status)} → ${file}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
