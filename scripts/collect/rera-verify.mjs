// Check that each RERA lead really is the developer of its stuck project (run after rera-leads.mjs).
//
//   node rera-verify.mjs
//
// A wrong contact ignores us, so every lead gets a verdict:
//   verified   — the developer's own website names the stuck project or its MahaRERA number
//   likely     — exact company-name match on Maps, but the website doesn't confirm it (or there is none)
//   unverified — partial name match or project-listing match with no website proof: check by hand
//   rejected   — Maps listed a residents' society or a government office: never contact
// Reads raw/lookups.json + raw/promoters.json, fetches websites over plain HTTP (home page and a
// projects/ongoing page), writes raw/leads-verified.csv sorted best first. raw/ is gitignored.

import fs from "node:fs";
import path from "node:path";
import { ANALYSES_DIR, log, mapLimit, writeJson } from "./lib/config.mjs";

const P = "rera-verify";
const RAW = path.join(ANALYSES_DIR, "rera-leads", "raw");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const REJECT = /society|government|municipal|authority|resident|association|apartment owners/i;
const GENERIC = new Set(["phase", "wing", "tower", "towers", "building", "apartment", "apartments", "residency", "park", "heights", "city", "homes", "project", "the", "and", "new", "shree", "shri", "sai"]);

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return "";
    return (await res.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  } catch {
    return "";
  }
}

// Home page plus up to two linked pages about projects.
async function siteText(website) {
  let origin;
  try {
    origin = new URL(website).origin;
  } catch {
    return "";
  }
  const res = await fetch(origin, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(12_000) }).catch(() => null);
  const html = res?.ok ? await res.text().catch(() => "") : "";
  const links = [...html.matchAll(/href="([^"#]*(project|ongoing|completed|residential|portfolio|rera)[^"#]*)"/gi)].map((m) => m[1]).slice(0, 2);
  const pages = await Promise.all(links.map((l) => fetchText(new URL(l, origin).href)));
  const home = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  return [home, ...pages].join(" ");
}

// The project counts as named when its registration number appears, or all its distinctive words do.
function names(text, project) {
  if (!text) return false;
  if (text.includes(project.certificate.toLowerCase())) return true;
  const words = project.project.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !GENERIC.has(w));
  return words.length > 0 && words.every((w) => text.includes(w));
}

function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const lookups = JSON.parse(fs.readFileSync(path.join(RAW, "lookups.json"), "utf8"));
  const promoters = JSON.parse(fs.readFileSync(path.join(RAW, "promoters.json"), "utf8"));
  const projectsOf = new Map(promoters.flatMap((p) => p.districts.map((d) => [`${p.promoter}|${d}`, p.projects.filter((x) => x.district === d)])));
  const leads = Object.entries(lookups).filter(([, v]) => v.contact).map(([key, v]) => ({ key, promoter: key.split("|")[0], district: key.split("|")[1], projects: projectsOf.get(key) ?? [], ...v }));
  log(P, `${leads.length} leads to verify`);

  await mapLimit(leads, 5, async (l) => {
    if (REJECT.test(l.found?.category ?? "") || REJECT.test(l.found?.name ?? "")) {
      l.verdict = "rejected";
      l.reason = `Maps lists "${l.found?.name}" as ${l.found?.category}`;
      return;
    }
    const text = l.found?.website ? await siteText(l.found.website) : "";
    const hit = l.projects.find((p) => names(text, p));
    if (hit) {
      l.verdict = "verified";
      l.reason = `website names ${hit.project} (${hit.certificate})`;
    } else if (l.found?.confidence === "exact") {
      l.verdict = "likely";
      l.reason = l.found?.website ? "exact name; website doesn't mention the stuck project" : "exact name; no website";
    } else {
      l.verdict = "unverified";
      l.reason = `${l.found?.confidence} match ("${l.found?.name}"); check MahaRERA before contacting`;
    }
  });

  const order = { verified: 0, likely: 1, unverified: 2, rejected: 3 };
  leads.sort((a, b) => order[a.verdict] - order[b.verdict] || Number(Boolean(b.emails.length)) - Number(Boolean(a.emails.length)) || b.projects.length - a.projects.length);
  const headers = ["#", "verdict", "reason", "promoter", "district", "stuck_projects", "projects", "problem", "maps_name", "category", "phone", "mobile", "whatsapp", "email", "website", "address", "status", "notes", "maps"];
  const rows = leads.map((l, i) => [i + 1, l.verdict, l.reason, l.promoter, l.district, l.projects.length, l.projects.map((p) => `${p.project} (${p.certificate})`).join("; "), [...new Set(l.projects.flatMap((p) => p.problems.map((x) => x.why)))].join("; "), l.found?.name, l.found?.category, l.phone?.e164, l.phone?.mobile ? "yes" : "no", l.phone?.mobile ? `https://wa.me/${l.phone.e164.slice(1)}` : "", l.emails.join(" "), l.found?.website, l.found?.address, "", "", l.found?.url]);
  fs.writeFileSync(path.join(RAW, "leads-verified.csv"), "﻿" + [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n");
  writeJson(path.join(RAW, "verdicts.json"), Object.fromEntries(leads.map((l) => [l.key, { verdict: l.verdict, reason: l.reason }])));
  const count = (v) => leads.filter((l) => l.verdict === v).length;
  log(P, `verified ${count("verified")} · likely ${count("likely")} · unverified ${count("unverified")} · rejected ${count("rejected")} → raw/leads-verified.csv`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
