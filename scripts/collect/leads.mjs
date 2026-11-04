// Contact list for buyer conversations, built from Google Maps runs.
//
//   node leads.mjs <group-slug> [more-slugs…] [--out <name>] [--emails]
//
// Reads analyses/<slug>/raw/google-maps/places.json for every slug given,
// keeps open businesses with a phone, drops duplicates and non-target
// categories, normalises Indian numbers (+91, mobile vs landline) and adds a
// WhatsApp link for mobiles. Best fits first: target categories, mobiles,
// a website, then more reviews.
//
// --emails also visits each website (homepage + contact page, plain HTTP) and
// adds the email addresses it lists; results are cached in emails.json.
//
// Writes analyses/<first-slug>/raw/google-maps/<name>.csv (default "leads").
// raw/ is gitignored, so phone numbers never reach the repo.
//
// Category filters come from the first slug's config.json:
//   leads.excludeCategories  — fragments to drop (e.g. "distributor", "store")
//   leads.preferCategories   — fragments ranked first (e.g. "manufacturer")

import fs from "node:fs";
import path from "node:path";
import { groupDir, loadConfig, log, mapLimit, rawDir } from "./lib/config.mjs";

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

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
// Template, tracking and image addresses that are not a business contact.
const JUNK_EMAIL = /example\.|domain\.com|yourdomain|email\.com|sentry|wixpress|godaddy|\.(png|jpe?g|gif|svg|webp)$|^(noreply|no-reply)@/i;

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(12_000) });
  return res.ok ? res.text() : "";
}

// Cloudflare hides emails as data-cfemail="<hex>": the first byte is the XOR key.
function cfDecode(hex) {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

function emailsIn(html) {
  const found = [...(html.match(EMAIL) ?? []), ...[...html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)].map((m) => cfDecode(m[1]))];
  return found.map((e) => e.toLowerCase()).filter((e) => !JUNK_EMAIL.test(e));
}

// Homepage, then its contact link (or /contact-us, /contact). Emails on the site's own domain rank first.
async function findEmails(website) {
  let origin;
  try {
    origin = new URL(website.startsWith("http") ? website : `http://${website}`).origin;
  } catch {
    return [];
  }
  const home = await fetchHtml(origin).catch(() => "");
  const contactHref = home.match(/href="([^"]*contact[^"]*)"/i)?.[1];
  const candidates = [contactHref && new URL(contactHref, origin).href, `${origin}/contact-us`, `${origin}/contact`].filter(Boolean);
  const pages = [home];
  for (const url of candidates) {
    if (emailsIn(pages.join(" ")).length || pages.length >= 3) break;
    const html = await fetchHtml(url).catch(() => "");
    if (html) pages.push(html);
  }
  const host = new URL(origin).hostname.replace(/^www\./, "");
  const emails = [...new Set(pages.flatMap(emailsIn))];
  return emails.sort((a, b) => Number(b.endsWith(host)) - Number(a.endsWith(host))).slice(0, 3);
}

function cityOf(search) {
  return String(search ?? "").split(/\sin\s/i).pop()?.trim() ?? "";
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outName = outIdx >= 0 ? args[outIdx + 1] : "leads";
  const withEmails = args.includes("--emails");
  const slugs = args.filter((a, i) => !a.startsWith("--") && (outIdx < 0 || i !== outIdx + 1));
  if (slugs.length === 0) throw new Error("Usage: node leads.mjs <group-slug> [more-slugs…] [--out <name>]");

  const config = loadConfig(slugs[0]);
  const exclude = (config.leads?.excludeCategories ?? DEFAULT_EXCLUDE).map((s) => s.toLowerCase());
  const prefer = (config.leads?.preferCategories ?? ["manufacturer", "workshop", "factory", "industries", "fabricat", "machining", "moulding", "molding", "forging", "casting", "packaging"]).map((s) => s.toLowerCase());

  const byPhone = new Map();
  let read = 0;
  for (const [sourceRank, slug] of slugs.entries()) {
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
        sourceRank, // earlier slugs on the command line rank first
      });
    }
  }

  const leads = [...byPhone.values()];

  const dir = rawDir(slugs[0], "google-maps");
  if (withEmails) {
    const cacheFile = path.join(dir, "emails.json");
    const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
    const todo = leads.filter((l) => l.website && !(l.website in cache));
    log(P, `looking up emails on ${todo.length} websites (${Object.keys(cache).length} cached)…`);
    let done = 0;
    await mapLimit(todo, 6, async (l) => {
      cache[l.website] = await findEmails(l.website).catch(() => []);
      if (++done % 20 === 0) log(P, `  ${done}/${todo.length}`);
    });
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 1));
    // Keep emails on the site's own domain or a free provider owners use; others are usually the
    // web designer's or theme vendor's address (e.g. info@peacefulthemes.com on a factory site).
    const FREE = /@(gmail|yahoo|rediffmail|hotmail|outlook|live|ymail|icloud)\.(com|co\.in|in)$/;
    for (const l of leads) {
      let host = "";
      try {
        host = new URL(l.website.startsWith("http") ? l.website : `http://${l.website}`).hostname.replace(/^www\./, "");
      } catch {
        host = "";
      }
      const base = host.split(".").slice(-2)[0] ?? "";
      l.emails = (cache[l.website] ?? []).filter((e) => FREE.test(e) || (base && e.split("@")[1]?.includes(base)));
    }
  }

  // Best first: targeted runs, target categories, an email (outreach starts by email), a mobile, a website, more reviews.
  leads.sort(
    (a, b) =>
      a.sourceRank - b.sourceRank ||
      (a.fit === "target" ? 0 : 1) - (b.fit === "target" ? 0 : 1) ||
      Number(Boolean(b.emails?.length)) - Number(Boolean(a.emails?.length)) ||
      Number(b.mobile) - Number(a.mobile) ||
      Number(Boolean(b.website)) - Number(Boolean(a.website)) ||
      b.reviews - a.reviews,
  );

  // Columns for calling: status/notes are blank for the caller to fill in.
  const headers = ["#", "name", "category", "city", "phone", "mobile", "whatsapp", "email", "website", "rating", "reviews", "fit", "status", "notes", "address", "maps"];
  const rows = leads.map((l, i) => [i + 1, l.name, l.category, l.city, l.phone, l.mobile ? "yes" : "no", l.whatsapp, (l.emails ?? []).join(" "), l.website, l.rating, l.reviews, l.fit, "", "", l.address, l.maps]);
  const out = path.join(dir, `${outName}.csv`);
  // BOM so Excel opens Hindi/₹ text correctly.
  fs.writeFileSync(out, "﻿" + [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n") + "\n");

  const mobiles = leads.filter((l) => l.mobile).length;
  const targets = leads.filter((l) => l.fit === "target").length;
  const perCity = Object.entries(leads.reduce((m, l) => ({ ...m, [l.city]: (m[l.city] ?? 0) + 1 }), {}));
  const withEmail = leads.filter((l) => l.emails?.length).length;
  log(P, `${read} places read · ${leads.length} unique contacts · ${targets} target fit · ${mobiles} mobile (WhatsApp)${withEmails ? ` · ${withEmail} with email` : ""}`);
  log(P, `per city: ${perCity.map(([c, n]) => `${c} ${n}`).join(", ")}`);
  log(P, `wrote ${out}`);
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
