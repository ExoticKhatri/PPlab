// Contact helpers for lead lists: phone normalising and emails from a business website
// findEmails reads the homepage and its contact page (or /contact-us, /contact) over plain HTTP. Used by leads.mjs and rera-leads.mjs.

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
// Template, tracking and image addresses that are not a business contact.
const JUNK_EMAIL = /example\.|domain\.com|yourdomain|email\.com|sentry|wixpress|godaddy|\.(png|jpe?g|gif|svg|webp)$|^(noreply|no-reply)@/i;
// Owners often use these instead of an address on their own domain.
export const FREE_EMAIL = /@(gmail|yahoo|rediffmail|hotmail|outlook|live|ymail|icloud)\.(com|co\.in|in)$/;

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

export function hostOf(website) {
  try {
    return new URL(website.startsWith("http") ? website : `http://${website}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Up to 3 addresses, the site's own domain first.
export async function findEmails(website) {
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

// Keep addresses on the site's own domain or a free provider; others are usually the web
// designer's or theme vendor's (e.g. info@peacefulthemes.com on a factory site).
export function ownEmails(emails, website) {
  const base = hostOf(website).split(".").slice(-2)[0] ?? "";
  return emails.filter((e) => FREE_EMAIL.test(e) || (base && e.split("@")[1]?.includes(base)));
}

// "079860 35053" → { e164: "+917986035053", mobile: true }; landlines keep their STD code.
export function normalisePhone(raw) {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length < 8) return null;
  const mobile = digits.length === 10 && /^[6-9]/.test(digits);
  return { e164: `+91${digits}`, mobile };
}
