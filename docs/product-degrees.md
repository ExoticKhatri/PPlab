# Idea selection guide

How to go from a researched customer group to the one product worth building, for a specific target: **₹50 Cr in revenue per year, reached as fast as possible.**

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

**Goal: ₹50 Cr of revenue per year** from recurring software subscriptions.

| | India | Global equivalent (≈ ₹84 / $) |
| --- | --- | --- |
| Revenue per year | **₹50 Cr** | ≈ $6M |
| Revenue per month | **≈ ₹4.17 Cr** | ≈ $500K |
| Revenue per day | ≈ ₹13.7 lakh | ≈ $16.4K |

### Customers needed at each price

`customers needed = ₹50 Cr ÷ (monthly price × 12)`

| Price per customer / month | Customers needed | Share of a group of 1 lakh businesses | Share of a group of 3 lakh businesses |
| --- | --- | --- | --- |
| ₹1,000 | 41,667 | 41.7% | 13.9% |
| ₹2,000 | 20,834 | 20.8% | 6.9% |
| ₹4,000 | 10,417 | 10.4% | 3.5% |
| ₹5,000 | 8,334 | 8.3% | 2.8% |
| ₹8,000 | 5,209 | 5.2% | 1.7% |
| ₹10,000 | 4,167 | 4.2% | 1.4% |
| ₹15,000 | 2,778 | 2.8% | 0.9% |
| ₹25,000 | 1,667 | 1.7% | 0.6% |
| ₹50,000 | 834 | 0.8% | 0.3% |
| ₹1,00,000 | 417 | 0.4% | 0.1% |

Global (B2B, per customer per month): $50 → 10,000 customers · $100 → 5,000 · $300 → 1,667 · $500 → 1,000 · $1,000 → 500.

### What the numbers mean

- **At small-business prices (₹2,000–8,000/month), the target needs 5,000–21,000 paying customers.** That only works in a large group (several lakh businesses), with a share of the group under ~5%.
- **A share above ~10% of a group is unrealistic** for a new product. Groups of around 1 lakh businesses need ₹10,000+/month per customer.
- **Three levers reach the target**, usually in combination:
  1. **Price per customer:** start with a wedge, then expand into the full system so revenue per customer grows (for example ₹5,000 → ₹12,000/month).
  2. **Number of customers:** pick groups with several lakh businesses.
  3. **More products to the same customers:** a second and third module once the first is trusted.
- **Example path:** a ₹5,000/month wedge that expands to ₹12,000/month per customer reaches ₹50 Cr with about 3,500 customers.

### Milestones on the way

| Annual revenue | Per month | Customers at ₹5,000/month | Customers at ₹12,000/month |
| --- | --- | --- | --- |
| ₹1 Cr (first proof) | ≈ ₹8.3 lakh | 167 | 70 |
| ₹5 Cr | ≈ ₹41.7 lakh | 834 | 348 |
| ₹20 Cr | ≈ ₹1.67 Cr | 3,334 | 1,389 |
| **₹50 Cr (target)** | **≈ ₹4.17 Cr** | **8,334** | **3,473** |

**Speed matters as much as size.** An idea that reaches its first ₹1 lakh/month in 3 months beats one with a higher ceiling that needs 18 months to sell. Every candidate is judged on both: *can it reach ₹50 Cr*, and *how soon does it earn its first revenue*.

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
6. **The price must reach the target.** At the expected price, including the expansion price, the customers needed for ₹50 Cr/year (section 1) must be under ~5% of the group.
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
| Price vs target | 2 | Under 2% of the group needed for ₹50 Cr/year | Over 10% needed |
| Reachability | 2 | Clear paid channel (Meta, search) plus a community | No proven channel |
| Speed to first revenue | 1 | Sellable MVP in ~1 month | 6+ months to a sellable product |
| Expand path | 1 | Data leads directly toward the full system | Dead end |

**Read the total:** 75+ = shortlist and start buyer conversations · 60–74 = keep, research more · below 60 = drop.

---

## 6. Reading the research signals

What each source reliably shows, based on four business-group analyses (K-12 schools, CA firms, small hospitals, MSME manufacturers).

| Signal | What it means |
| --- | --- |
| "Free download", "price", "cheapest" searches | Price-sensitive buyers and a crowded 1st degree |
| Dozens of new, near-identical Meta advertisers | Crowded category; avoid a head-on product |
| Meta ads running 200+ days | A message or offer that pays off for that seller |
| Demo videos with many views but almost no comments | Buyers research quietly; look for pain in reviews, search and Reddit instead |
| Paperwork that blocks cash (fees, claims, receivables, reconciliation) | The recurring hidden pain in Indian B2B groups; usually the best wedge |
| Government schemes or rules rising in Trends | Sudden demand (Ayushman/ABHA, the MSME 45-day rule, NABH, ABDM); watch the "rising" lists |
| Maps and customer-app reviews | Where the business fails *its* customers (communication, waiting, status), which points at the owner's operational gap |
| Reddit | Useful for the customer's view of Indian businesses; Indian owners rarely post there |
| YouTube comments, Meta ad copy, search queries | The best sources of the Indian business owner's voice |

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

Customer counts are for **₹50 Cr/year**. "Wedge only" uses the entry price; "after expansion" assumes the wedge grows into more of the full system.

| Group | 1st degree (crowded) | Best wedge | Degree | Cash / compliance link | Wedge price | Customers needed (wedge only) | Price after expansion | Customers needed (after expansion) | Share of group (after expansion) | Key evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MSME manufacturers (India) | Manufacturing ERP (~45 vendors) | Receivables and 45-day-rule collections | 2 | Dues collected | ₹5,000/mo | 8,334 (2.8%) | ₹12,000/mo (+ production, labour) | 3,473 | 1.2% of ~3L | 45-day rule Breakout; "₹6.5 Cr payment stuck" (⬆1,400); no software competitor seen | Shortlist |
| Private K-12 schools (India) | School ERP (~85 advertisers) | Fee collection autopilot | 2 | Fees collected | ₹4,000/mo | 10,417 (3.1%) | ₹10,000/mo (+ admissions, parent app) | 4,167 | 1.2% of ~3.4L | Fee collection the #1 pain on 4 platforms | Shortlist (WhatsApp dependency) |
| Small hospitals (India) | HMS/HIS (~25 vendors on Meta) | Insurance/TPA/Ayushman desk | 2 | Claims paid faster and in full | ₹8,000/mo | 5,209 (8.7%) | ₹20,000/mo (+ HMS modules) | 2,084 | 3.5% of ~60K | Top pain on 5 platforms; 2–3 sellers; Ayushman +114% YoY | Shortlist (needs expansion to reach ₹50 Cr) |
| CA firms (India) | Practice management (Zoho, ICAI entering) | Client status and document collection | 2 | Indirect (client retention) | ₹2,500/mo | 16,667 (16.7%) | ₹6,000/mo | 6,945 | 6.9% of ~1L | Communication the top Maps complaint; reconciliation the top search cluster | Below target math: group too small at this price |

Prices and group sizes are estimates until buyer conversations and sourced counts confirm them.

**Pattern across groups:** the 1st degree is crowded in every business group, and the strongest wedge is almost always the step where **money comes in**: claims, receivables, fees.

**What the ₹50 Cr target changes:** no wedge reaches ₹50 Cr on its entry price alone at a realistic share. Every shortlisted path depends on **expanding revenue per customer** (wedge → more of the full system), so the expand path (section 3) is a requirement, not a bonus. Large groups (MSME manufacturers, schools) clear the target math most easily. Small hospitals work only with a strong expansion into HMS. CA firms fall short at current price assumptions.

**Next steps:** score the three shortlisted wedges (section 5) including their expansion price, then run 5 buyer conversations for the top two.

---

## 9. Change log

| Date | Change |
| --- | --- |
| 2026-10-27 | Guide created: product degrees, entry approaches, selection rules, scoring, signal guide, process |
| 2026-10-27 | Candidates added from 4 business groups: small hospitals, MSME manufacturers, K-12 schools, CA firms |
| 2026-10-29 | Exam-aspirant groups (LSAT, MCAT, GMAT) removed: they were collector test runs, not target groups |
| 2026-10-29 | Target changed from a ₹50 Cr valuation to **₹50 Cr revenue per year** (≈ ₹4.17 Cr/month). Customer math, milestones, rule 6, scoring thresholds and candidate counts updated; expansion pricing added to the candidates |
