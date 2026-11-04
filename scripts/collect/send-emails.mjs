// Send outreach emails one at a time through Gmail in the signed-in Brave profile.
//
//   node send-emails.mjs <group-slug> --from you@gmail.com            # dry run: shows who would get what
//   node send-emails.mjs <group-slug> --from you@gmail.com --send     # really sends
//   options: --limit 15  --gap 10 (minutes)  --hours 10-18  --followups  --to someone@x.com (test one address)
//
// Reads the contact sheet analyses/<slug>/raw/google-maps/leads.csv (from leads.mjs --emails)
// and the template analyses/<slug>/raw/outreach-email.json. Each send opens Gmail's compose
// window with To/Subject/Body filled, presses Send and waits for "Message sent".
//
// Safety:
//   - dry run unless --send;
//   - --from must match the Gmail account signed in to the profile;
//   - a log (raw/outreach-log.json) means no address ever gets the same email twice;
//   - follow-ups (--followups) go only to addresses emailed at least followUp.sendAfterDays
//     ago that you haven't marked as replied/declined in the log or the sheet's status column;
//   - one email per company, at most --limit per run, --gap minutes (+0–60 s) apart, only
//     between --hours (local time), Monday to Saturday;
//   - stops at the first send it cannot confirm.

import fs from "node:fs";
import path from "node:path";
import { closeProfileBrowser, isBlocked, openProfileBrowser } from "./lib/browser.mjs";
import { groupDir, log } from "./lib/config.mjs";

const P = "send-emails";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : fallback;
}
const flag = (name) => process.argv.includes(`--${name}`);

// Minimal CSV parser (quoted fields, escaped quotes, commas and newlines inside quotes).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) rows.push([...row, cell]);
  const [headers, ...data] = rows.filter((r) => r.some((c) => c.trim()));
  return data.map((r) => Object.fromEntries(headers.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

function fill(lines, vars) {
  return lines.join("\n").replace(/\{(\w+)\}/g, (m, key) => vars[key] ?? m);
}

function withinHours(range) {
  const [from, to] = range.split("-").map(Number);
  const now = new Date();
  return now.getDay() !== 0 && now.getHours() >= from && now.getHours() < to;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// authuser picks the account when the profile holds several Google accounts.
async function signedInAccount(page, from) {
  await page.goto(`https://mail.google.com/mail/?authuser=${encodeURIComponent(from)}#inbox`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(5000);
  if (/accounts\.google\.com/.test(page.url())) return null;
  const label = await page
    .locator('a[aria-label*="Google Account"]')
    .first()
    .getAttribute("aria-label", { timeout: 15_000 })
    .catch(() => "");
  return label?.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0]?.toLowerCase() ?? null;
}

// Open a pre-filled compose window, send it, and wait for Gmail's confirmation.
async function sendOne(page, from, { to, subject, body }) {
  const url = `https://mail.google.com/mail/?authuser=${encodeURIComponent(from)}&view=cm&fs=1&tf=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  if (await isBlocked(page)) throw new Error("Gmail showed a block or captcha page");
  const send = page.locator('div[role="button"][aria-label^="Send"]').first();
  await send.waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(2000 + Math.random() * 1500);
  // Sent = the compose window closes or Gmail shows "Message sent". The full-page compose view
  // sometimes ignores the click, so fall back to Gmail's own Ctrl+Enter shortcut.
  const sent = () =>
    Promise.race([
      send.waitFor({ state: "detached", timeout: 15_000 }),
      page.getByText(/Message sent/i).first().waitFor({ state: "visible", timeout: 15_000 }),
    ]).then(
      () => true,
      () => false,
    );
  await send.click();
  if (await sent()) return;
  await page.locator('div[role="textbox"][aria-label*="Message Body"]').first().click().catch(() => {});
  await page.keyboard.press("Control+Enter");
  if (await sent()) return;
  throw new Error(`Gmail did not confirm the send to ${to}; check Drafts before re-running`);
}

async function main() {
  const slug = process.argv[2];
  if (!slug || slug.startsWith("--")) throw new Error("Usage: node send-emails.mjs <group-slug> --from you@gmail.com [--send]");
  const from = arg("from", "").toLowerCase();
  const really = flag("send");
  const followups = flag("followups");
  const limit = Number(arg("limit", "15"));
  const gapMin = Number(arg("gap", "10"));
  const hours = arg("hours", "10-18");
  const testTo = arg("to", "");
  if (!from) throw new Error("--from <your Gmail address> is required, so the script can check the signed-in account");

  const raw = path.join(groupDir(slug), "raw");
  const template = JSON.parse(fs.readFileSync(path.join(raw, "outreach-email.json"), "utf8"));
  const logFile = path.join(raw, "outreach-log.json");
  const sentLog = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf8")) : {};
  const saveLog = () => fs.writeFileSync(logFile, JSON.stringify(sentLog, null, 1));
  const leads = parseCsv(fs.readFileSync(path.join(raw, "google-maps", "leads.csv"), "utf8").replace(/^﻿/, ""));

  const kind = followups ? "followUp" : "email";
  const tpl = template[kind];
  const vars = { ...template.sender };
  const done = new Set(["replied", "declined", "interviewed", "bounced", "wrong number", "do not contact"]);
  const cutoff = Date.now() - (template.followUp?.sendAfterDays ?? 3) * 86_400_000;

  const queue = [];
  const seenCompanies = new Set();
  const candidates = testTo ? [{ name: "Test", email: testTo, city: "Test", status: "" }] : leads;
  for (const lead of candidates) {
    const to = (lead.email ?? "").split(/\s+/)[0];
    if (!to || seenCompanies.has(lead.name)) continue;
    const entry = sentLog[to] ?? {};
    if (done.has((lead.status ?? "").toLowerCase()) || done.has(entry.status ?? "")) continue;
    if (!followups && entry.email) continue;
    if (followups && (!entry.email || entry.followUp || Date.parse(entry.email.sentAt) > cutoff)) continue;
    seenCompanies.add(lead.name);
    queue.push({ to, company: lead.name, city: lead.city, subject: fill([tpl.subject], { ...vars, company: lead.name, city: lead.city }), body: fill(tpl.body, { ...vars, company: lead.name, city: lead.city }) });
    if (queue.length >= limit) break;
  }

  log(P, `${really ? "SENDING" : "DRY RUN"} · ${kind} · ${queue.length} to send (limit ${limit}, ${gapMin} min apart, ${hours}h)`);
  for (const [i, q] of queue.entries()) log(P, `  ${i + 1}. ${q.company} <${q.to}> · ${q.city}`);
  if (queue.length) {
    log(P, `--- subject ---\n${queue[0].subject}\n--- body ---\n${queue[0].body}\n---`);
  }
  if (!really || queue.length === 0) {
    if (!really) log(P, "Nothing sent. Add --send to send for real.");
    return;
  }

  const { context, page } = await openProfileBrowser();
  try {
    const account = await signedInAccount(page, from);
    if (!account) throw new Error("Not signed in to Gmail in the automation profile. Run `node login.mjs` and sign in.");
    if (account !== from) throw new Error(`Gmail opened as ${account}, not ${from}. Add ${from} to the profile with \`node login.mjs\` (Google account menu → Add another account), then re-run. Stopping.`);
    log(P, `Gmail account confirmed: ${account}`);

    for (const [i, q] of queue.entries()) {
      while (!withinHours(hours)) {
        log(P, `outside sending hours (${hours}, Mon–Sat): waiting…`);
        await sleep(15 * 60_000);
      }
      await sendOne(page, from, q);
      sentLog[q.to] = { ...(sentLog[q.to] ?? {}), company: q.company, [kind]: { sentAt: new Date().toISOString(), subject: q.subject } };
      saveLog();
      log(P, `[${i + 1}/${queue.length}] sent to ${q.company} <${q.to}>`);
      if (i < queue.length - 1) {
        const wait = gapMin * 60_000 + Math.random() * 60_000;
        log(P, `  next in ${Math.round(wait / 60_000)} min`);
        await sleep(wait);
      }
    }
    log(P, `done: ${queue.length} sent. Log: ${logFile}`);
  } finally {
    await closeProfileBrowser(context);
  }
}

main().catch((error) => {
  console.error(`[${P}] ${error.message}`);
  process.exit(1);
});
