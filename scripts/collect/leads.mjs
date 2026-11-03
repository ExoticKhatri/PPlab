// Contact list for buyer conversations, built from Google Maps runs.
//
//   node leads.mjs <group-slug> [more-slugs…] [--out <name>]
//
// Reads analyses/<slug>/raw/google-maps/places.json for every slug given,
// keeps open businesses with a phone, drops duplicates and non-target
// categories, normalises Indian numbers (+91, mobile vs landline) and adds a
// WhatsApp link for mobiles. Best fits first: target categories, mobiles,
// a website, then more reviews.
//
// Writes analyses/<first-slug>/raw/google-maps/<name>.csv (default "leads").
// raw/ is gitignored, so phone numbers never reach the repo.
//
// Category filters come from the first slug's config.json:
//   leads.excludeCategories  — fragments to drop (e.g. "distributor", "store")
//   leads.preferCategories   — fragments ranked first (e.g. "manufacturer")

import fs from "node:fs";
import path from "node:path";
import { groupDir, loadConfig, log, rawDir } from "./lib/config.mjs";

const P = "leads";
const DEFAULT_EXCLUDE = ["distributor", "wholesaler", "dealer", "store", "shop", "corporate office", "consultant", "government office", "school", "college", "bank", "atm"];

// "079860 35053" → { e164: "+917986035053", mobile: true }; landlines keep their STD code.
export function normalisePhone(raw) {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length < 8) return null;
  const mobile = digits.length === 10 && /^[6-9]/.test(digits);
  return { e164: `+91${digits}`, mobile };
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function cityOf(search) {
  return String(search ?? "").split(/\sin\s/i).pop()?.trim() ?? "";
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outName = outIdx >= 0 ? args[outIdx + 1] : "leads";
  const slugs = args.filter((a, i) => !a.startsWith("--") && (outIdx < 0 || i !== outIdx + 1));
  if (slugs.length === 0) throw new Error("Usage: node leads.mjs <group-slug> [more-slugs…] [--out <name>]");

  const config = loadConfig(slugs[0]);
  const exclude = (config.leads?.excludeCategories ?? DEFAULT_EXCLUDE).map((s) => s.toLowerCase());
  const prefer = (config.leads?.preferCategories ?? ["manufacturer", "workshop", "factory", "industries", "fabricat", "machining", "moulding", "molding", "forging", "casting", "packaging"]).map((s) => s.toLowerCase());

  const byPhone = new Map();
  let read = 0;
  for (const slug of slugs) {
    const file = path.join(groupDir(slug), "raw", "google-maps", "places.json");
    if (!fs.existsSync(file)) {
      log(P, `${slug}: no places.json (run google-maps first) — skipped`);
      continue;
    }
    for (const place of JSON.parse(fs.readFileSync(file, "utf8"))) {
      read++;
      if (place.closed || !place.phone) continue;
      const category = String(place.category ?? "");
      const text = `${category} ${place.name ?? ""}`.toLowerCase();
      if (exclude.some((x) => category.toLowerCase().includes(x))) continue;
      const phone = normalisePhone(place.phone);
      if (!phone || byPhone.has(phone.e164)) continue;
      byPhone.set(phone.e164, {
        name: place.name,
        category,
        city: cityOf(place.search),
        phone: phone.e164,
        mobile: phone.mobile,
        whatsapp: phone.mobile ? `https://wa.me/${phone.e164.slice(1)}` : "",
        website: place.website ?? "",
        rating: place.rating ?? "",
        reviews: place.reviewCount ?? 0,
        fit: prefer.some((x) => text.includes(x)) ? "target" : "maybe",
        address: place.address ?? "",
        maps: place.url,
        search: place.search,
      });
    }
  }

  const leads = [...byPhone.values()].sort(
    (a, b) =>
      (a.fit === "target" ? 0 : 1) - (b.fit === "target" ? 0 : 1) ||
      Number(b.mobile) - Number(a.mobile) ||
      Number(Boolean(b.website)) - Number(Boolean(a.website)) ||
      b.reviews - a.reviews,
  );

  // Columns for calling: status/notes are blank for the caller to fill in.
  const headers = ["#", "name", "category", "city", "phone", "mobile", "whatsapp", "website", "rating", "reviews", "fit", "status", "notes", "address", "maps"];
  const rows = leads.map((l, i) => [i + 1, l.name, l.category, l.city, l.phone, l.mobile ? "yes" : "no", l.whatsapp, l.website, l.rating, l.reviews, l.fit, "", "", l.address, l.maps]);
  const out = path.join(rawDir(slugs[0], "google-maps"), `${outName}.csv`);
  // BOM so Excel opens Hindi/₹ text correctly.
  fs.writeFileSync(out, "﻿" + [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n");

  const mobiles = leads.filter((l) => l.mobile).length;
  const targets = leads.filter((l) => l.fit === "target").length;
  const perCity = Object.entries(leads.reduce((m, l) => ({ ...m, [l.city]: (m[l.city] ?? 0) + 1 }), {}));
  log(P, `${read} places read · ${leads.length} unique contacts · ${targets} target fit · ${mobiles} mobile (WhatsApp)`);
  log(P, `per city: ${perCity.map(([c, n]) => `${c} ${n}`).join(", ")}`);
  log(P, `wrote ${out}`);
}

try {
  main();
} catch (error) {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
}
