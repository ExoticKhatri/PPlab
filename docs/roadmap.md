# Roadmap: from goal to first customers

Where the search for our business stands, what we have learned, and what comes next. Written 26 Nov 2026. The detailed method lives in [product-degrees.md](product-degrees.md) (the selection guide and change log); this file is the map.

```
Step 1  Goal and rules ............................ done
Step 2  Strategy: degree-2 wedge → degree-1 product  done
Step 3  Pick the industry and the wedge ........... IN PROGRESS (stuck on validation)
Step 4  Validate without a product ................ next
Step 5  Build the MVP for the validated wedge
Step 6  First 10 paying customers, then expand to degree 1
```

---

## Step 1. Goal and rules (done)

- **Goal:** ₹50 Cr of revenue per year (≈ ₹4.17 Cr a month), from a stable business. See [the target](product-degrees.md#1-the-target) for the customer math.
- **Form:** a SaaS product, sold as a recurring subscription.
- **Customers:** high-paying business groups only. A cheap ticket needs a huge share of the market (₹5,000/month needs 8,334 customers).
- **Working rules:** research before building; no money spent until a test justifies it; personal data (phones, emails) never committed; no captchas bypassed; every change committed and pushed.

## Step 2. Strategy (done)

Enter with a **degree-2 product**, one painful job that is close to the money or to compliance, and expand into the **degree-1 product**, the system the business runs on. See [product degrees](product-degrees.md#2-product-degrees).

## Step 3. Pick the industry and the wedge (in progress)

### What we did

1. **Researched 12 business groups** with the collectors (Meta ads, Play Store, YouTube, Google, Trends, Reddit, Maps, competitor prices): `analyses/<group>/README.md`.
2. **Ranked 33 ideas** on the Ideas tab: ticket, group size, competitors, build and marketing difficulty.
3. **Added a "pays alone" test** (Nov 2026): does anyone already pay a service or a tool for exactly this task? It is now 25% of the score (`analyses/wtp-scan/`).
4. **Deep dives** on the top ideas, each with sourced facts (`/ideas/<id>` pages): MSME receivables, real estate milestone desk, exporters' compliance desk, college admissions CRM, college accreditation desk.
5. **First outreach test: MSME receivables.** 25 factories emailed, no replies; the idea was dropped on 6 Nov.
6. **Real estate milestone desk chosen to test next.** We decided the developer is the customer and the CA is a partner (free seat, referral fee); mapped the developer's workflows ([workflow-research.md](../analyses/rera-leads/workflow-research.md)); built lead tools from MahaRERA's public data; wrote a [call guide](../analyses/rera-leads/call-guide.md) around each project's lapse date.

### Where each idea stands

| Idea | Status | Why |
| --- | --- | --- |
| Real estate milestone desk (RERA + demand letters) | **Testing next** | People already pay for it alone (CAs, consultants at ~₹50,000 per extension); public trigger (lapse dates); expands to the developer's full system |
| Exporters' compliance desk | Backup | Paid alone (refund consultants, ₹6,999+/month services); new 9-month rule; no public list of who's struggling |
| College admissions CRM | Strong but crowded | Colleges pay ₹9.8 lakh/yr to Meritto; needs a sharp angle (small colleges) |
| MSME receivables (45-day rule) | **Dropped** | No replies to 25 emails; nobody pays for this alone |
| College accreditation desk | Parked | Accreditation is voluntary; 9 competitors |

### What we learned (the important part)

1. **Pain is not the same as payment.** The loudest pain (MSME delayed payments) had the weakest proof that anyone pays for a fix alone. The better test: someone already pays a person or a tool for exactly this task.
2. **No ads doesn't mean an open market.** Business software in India sells through Google, CAs, field sales and word of mouth, not Meta.
3. **Research can't validate an idea.** It can narrow the choice; only conversations and payment can validate it.
4. **Reaching the right person is the real bottleneck.** Generic and sales inboxes ignore us; the decision-maker or the person who does the work must get the message.
5. **Separate the payer, the user and the channel.** For real estate: the developer pays, the CA uses a seat and refers clients.
6. **Public lists go stale; deadlines don't.** MahaRERA's "lapsed" lists were years old, while live completion dates give an exact, current reason to call.
7. **A specific fact beats a pitch.** "Your project lapses on 30 Nov" earns a conversation; "we built software" doesn't.

## The blocker: validating before there is a product

Validation feels impossible because we try to sell software that doesn't exist to people who don't know us. The way through is to **sell the outcome first and deliver it by hand**, climbing a ladder where each rung costs a little more of the customer's commitment:

| Rung | What we do | Proof it gives | Cost to us |
| --- | --- | --- | --- |
| 0. Public evidence | Collectors, deep dives, "pays alone" scan | People pay for this somewhere | Done |
| 1. Conversations | 10 calls opened with a fact about *their* business | The pain is real for these people, in their words | Time |
| 2. Give first | A free, specific artefact (e.g. a one-page diagnosis of their project) | They engage and reply | A few hours |
| 3. Concierge | Do the job manually for 1–3 customers (we file, chase, prepare) | They let us do the work | Days |
| 4. Payment | A paid pilot, deposit or signed order for the next job | They pay: **validated** | — |
| 5. Build | Software that automates what we did by hand | — | Weeks |

Rules that keep it moving:

- **Timebox each idea to 2 weeks** of rungs 1–4. Run at most two ideas at once.
- **Decide on numbers set in advance:** e.g. 10 conversations → at least 3 want the free artefact → at least 1 agrees to pay. Fewer means drop or change the angle.
- **Concierge first, code later.** Doing the work by hand tells us exactly what to build and gives the first customers before the product exists.

## How to choose the wedge to test (getting unstuck)

Pick the idea that passes all four:

1. **Paid alone today:** a service or tool already charges for exactly this job.
2. **Reachable through a public trigger:** we can find who has the problem *now* and name the right person.
3. **Deliverable by hand:** we can do the first jobs ourselves, without software.
4. **Expands to degree 1:** the wedge leads into the system the customer runs on.

| Idea | 1. Paid alone | 2. Public trigger | 3. By hand | 4. Degree 1 |
| --- | --- | --- | --- | --- |
| Real estate milestone desk | Yes | Yes (lapse dates) | Yes (filings, demand letters) | Yes |
| Exporters' compliance desk | Yes | Weak | Yes | Yes |
| College admissions CRM | Yes | Medium (admission season) | Hard | Yes |

The real estate desk is the only one that passes all four today, so it's the right first test.

## Next actions

1. Finish the lapse-date scan and build the call sheet: projects lapsing soonest without an extension (Pune, Mumbai, Thane first).
2. Warm-up: one call to a RERA consultant to learn their process and price.
3. Rungs 1–2: 10 calls using the [call guide](../analyses/rera-leads/call-guide.md); send the free diagnosis to everyone who engages.
4. Rung 3: file at least one extension or completion upload by hand, with the developer's CA.
5. Rung 4: ask for payment on the next job. Decide by **10 Dec 2026**: continue, change the angle, or switch to the exporters' desk.
