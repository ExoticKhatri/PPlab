# Idea selection guide

How to go from a researched customer group to the one product worth building, for a specific target: **a ₹50 Cr company, reached as fast as possible.**

This is the central reference for idea selection in pplab. Group research lives in `analyses/<group>/`. This guide explains how to turn that research into a decision, and records what the research has shown so far.

## Contents

1. [The target](#1-the-target)
2. [Product degrees](#2-product-degrees)
3. [Three ways to enter a market](#3-three-ways-to-enter-a-market)
4. [Selection rules](#4-selection-rules)
5. [Scoring a candidate idea](#5-scoring-a-candidate-idea)
6. [Reading the research signals](#6-reading-the-research-signals)
7. [Process: from group to decision](#7-process-from-group-to-decision)
8. [Current candidates](#8-current-candidates)
9. [Change log](#9-change-log)

---

## 1. The target

| | India | Global |
| --- | --- | --- |
| Valuation goal | ₹50 Cr | ≈ $6M |
| Recurring revenue needed (≈10× multiple) | **₹5 Cr / year** | **$600K / year** |
| Per month | ≈ ₹4.2 lakh | ≈ $50K |

**Paying customers needed at a given price** (India):

| Price per customer / month | Customers needed |
| --- | --- |
| ₹2,000 | 2,084 |
| ₹4,000 | 1,042 |
| ₹8,000 | 521 |
| ₹15,000 | 278 |

Global (consumer or B2B): $30/month → 1,667 paying at any time; $100/month → 500.

**Speed matters as much as size.** An idea that reaches its first ₹1 lakh/month in 3 months beats one with a higher ceiling that needs 18 months to sell. Every candidate is judged on both: *can it reach the target*, and *how soon does it earn its first revenue*.

---

## 2. Product degrees

Every idea found inside a group falls into one of three degrees.

| | 1st degree — the system | 2nd degree — one job | 3rd degree — a fix |
| --- | --- | --- | --- |
| Definition | The management system the business runs on | Software that owns one function end to end | An add-on or extension that fixes one task inside an existing tool |
| Industry term | System of record | Point solution | "A feature, not a product" |
| Example (small hospitals) | HMS/HIS: OPD, IPD, billing, pharmacy, lab | Insurance/TPA desk: pre-auth, claims, deductions | A helper for the Ayushman claims portal |
| Ticket price | Highest | Much lower | Lowest |
| Build effort | Highest | Medium | Lowest |
| Competition | Many established vendors | Many, competitive pricing | Often none, or a past attempt |
| Willingness to pay | Highest (it runs the business) | Medium | Lowest (pain may not be worth paying for) |
| Switching needed | Yes, a full migration | Partial | None (works beside existing tools) |

**General pattern:** as the degree rises, price, build effort and switching cost fall, and so does willingness to pay.

**The exception that matters:** willingness to pay follows *money*, not degree. A 2nd- or 3rd-degree product that directly brings cash in (claims paid, dues collected, fees received) or satisfies a forced compliance rule can command a 1st-degree price. In "painkiller vs vitamin" terms, cash-linked pains are painkillers at any degree.

---

## 3. Three ways to enter a market

| Approach | What it means | Main risk | Where it usually lands |
| --- | --- | --- | --- |
| **A. New idea** | Build something that doesn't exist yet | The pain may not be worth paying for | Degree 3, sometimes 2 |
| **B. Better rebuild** | Rebuild an existing tool with the fixes users ask for | Customers won't switch unless the pain is severe; the new tool must be clearly better (often "10×") | Degree 1 or 2 |
| **C. Wedge, then expand** | Enter with a 2nd-degree product that fixes a severe pain and runs *beside* the existing system, then grow into the full system from inside | Choosing a wedge that doesn't lead anywhere | Starts at degree 2, grows into degree 1 |

**Approach C is preferred.** It avoids A's "not worth paying for" risk, because the pain is severe and cash-linked, and B's switching risk, because nothing is replaced on day one. Many large vertical-software companies grew this way: Toast (payments → full restaurant software), ServiceTitan (dispatch → full trades software), Veeva (pharma CRM → industry cloud).

A good wedge has three properties:
1. **Severe, frequent pain**, ideally tied to cash or compliance.
2. **No switching:** it works alongside the current system and data.
3. **An expand path:** the data it holds naturally leads toward the full system.

---

## 4. Selection rules

1. **Prefer a wedge over the full system.** In every business group researched so far, the 1st degree is crowded (25–85 vendors competing on price).
2. **Follow the money.** Rank pains by how directly they affect cash coming in, or by whether a rule forces them.
3. **First revenue before the biggest revenue.** A cash-linked wedge sells faster; the full system is the expansion, not the entry.
4. **Work beside, don't replace.** Avoid any product whose first step requires the customer to abandon their current system.
5. **Evidence from at least 3 platforms.** A pain seen on only one source is a hypothesis, not a finding.
6. **The price must reach the target.** At the expected price, the customers needed (section 1) must be a small share of the group (under ~2%).
7. **Talk to 5 buyers before building.** Ask what the pain costs today in staff hours, consultants, money lost or late payments.

---

## 5. Scoring a candidate idea

Score each criterion 1–5. Weight × score, summed; maximum 100.

| Criterion | Weight | 5 means | 1 means |
| --- | --- | --- | --- |
| Cash or compliance link | 4 | Directly brings money in or is legally required | Nice to have |
| Pain evidence | 4 | Top pain on 4+ platforms with counts and quotes | One weak source |
| No switching needed | 3 | Works beside current tools | Requires replacing the core system |
| Competition gap | 3 | No or few focused competitors | Crowded, price war |
| Price vs target | 2 | Under 1% of the group needed | Over 5% needed |
| Reachability | 2 | Clear paid channel (Meta, search) plus a community | No proven channel |
| Speed to first revenue | 1 | Sellable MVP in ~1 month | 6+ months to a sellable product |
| Expand path | 1 | Data leads directly toward the full system | Dead end |

**Read the total:** 75+ = shortlist and start buyer conversations · 60–74 = keep, research more · below 60 = drop.

---

## 6. Reading the research signals

What each source reliably shows, based on six group analyses.

| Signal | What it means |
| --- | --- |
| "Free download", "price", "cheapest" searches | Price-sensitive buyers and a crowded 1st degree |
| Dozens of new, near-identical Meta advertisers | Crowded category; avoid a head-on product |
| Meta ads running 200+ days | A message or offer that pays off for that seller |
| Demo videos with many views but almost no comments | Buyers research quietly; look for pain in reviews, search and Reddit instead |
| Paperwork that blocks cash (fees, claims, receivables, reconciliation) | The recurring hidden pain in Indian B2B groups; usually the best wedge |
| Government schemes or rules rising in Trends | Sudden demand (Ayushman/ABHA, the MSME 45-day rule, NABH, ABDM); watch the "rising" lists |
| Maps and customer-app reviews | Where the business fails *its* customers (communication, waiting, status), which points at the owner's operational gap |
| Reddit | Strong for consumer groups and for the customer's view of Indian businesses; Indian owners rarely post there |
| YouTube comments, Meta ad copy, search queries | The best sources of the Indian business owner's voice |
| Third-party tools that sit inside an official tool, rising in Trends | Demand for a 3rd-degree helper (e.g. Jack Westin's AAMC extension, +800%) |

---

## 7. Process: from group to decision

1. **Pick the group** from the group list (India groups paying ₹2,000+/month, or a clear global group).
2. **Collect** with the group-analysis skill (`node run.mjs <group>`; all 7 platforms, about 40 minutes).
3. **Map the degrees:** name the 1st-degree system the group runs on, then list 2nd- and 3rd-degree pains.
4. **Filter:** keep pains with evidence from 3+ platforms that are tied to cash or compliance.
5. **Score** the remaining ideas (section 5).
6. **Check the target math** (section 1) for the top idea.
7. **Validate:** 5 buyer conversations on what the pain costs and what they pay today.
8. **Record** the result in section 8 and the change log.

---

## 8. Current candidates

Prices are estimates until buyer conversations confirm them. "Share needed" = customers needed ÷ estimated group size.

| Group | 1st degree (crowded) | Best wedge | Degree | Cash / compliance link | Est. price | Customers needed | Share needed | Key evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Small hospitals (India) | HMS/HIS (~25 vendors on Meta) | Insurance/TPA/Ayushman desk | 2 | Claims paid faster and in full | ₹8,000/mo | 521 | 0.9% of ~60K | Top pain on 5 platforms; 2–3 sellers; Ayushman +114% YoY | Shortlist |
| MSME manufacturers (India) | Manufacturing ERP (~45 vendors) | Receivables and 45-day-rule collections | 2 | Dues collected | ₹5,000/mo | 834 | 0.3% of ~3L | 45-day rule Breakout; "₹6.5 Cr payment stuck" (⬆1,400); no software competitor seen | Shortlist |
| Private K-12 schools (India) | School ERP (~85 advertisers) | Fee collection autopilot | 2 | Fees collected | ₹4,000/mo | 1,042 | 0.3% of ~3.4L | Fee collection the #1 pain on 4 platforms | Shortlist (WhatsApp dependency) |
| CA firms (India) | Practice management (Zoho, ICAI entering) | Client status and document collection | 2 | Indirect (client retention) | ₹2,500/mo | 1,667 | 1.7% of ~1L | Communication the top Maps complaint; reconciliation the top search cluster | Research more |
| MCAT aspirants, CARS (global) | Full prep platforms | CARS mistake-pattern coach beside official AAMC material | 3 | Score → admission; replaces ~$350/hr tutoring | $30/mo | 1,667 active | — (seasonal, 3–6 month use) | 124–127 plateau; tutoring regret; extension trend +800%; new competitor CARSBooster | Research more |
| LSAT aspirants (global) | Prep platforms (7Sage, Demon, Blueprint) | Automatic mistake review on top of LawHub | 3 | Score → scholarships | $30/mo | 1,667 active | — (seasonal) | Plateau the top pain; ⬆151 post with "thousands" of DMs | Research more |

**Pattern across groups:** the 1st degree is crowded in every business group, and the strongest wedge is almost always the step where **money comes in**: claims, receivables, fees. In consumer test-prep groups, the strongest wedge is **turning practice mistakes into score gains**, the job tutors charge most for.

**Next steps:** score the three shortlisted B2B wedges (section 5), then run 5 buyer conversations for the top two.

---

## 9. Change log

| Date | Change |
| --- | --- |
| 2026-10-27 | Guide created: product degrees, entry approaches, selection rules, scoring, signal guide, process |
| 2026-10-27 | Candidates added from 5 groups: small hospitals, MSME manufacturers, K-12 schools, CA firms, LSAT |
| 2026-10-27 | MCAT (CARS) added: the clearest consumer pain so far; new CARS competitor seen on Meta the same week |
