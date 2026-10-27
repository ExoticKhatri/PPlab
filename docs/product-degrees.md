# Main learnings — choosing what to build

Our goal is to earn money as fast as possible. The research picks the industry well, but turning that research into one product idea is where we get stuck. This file is the single place for our main learnings: the principles we've agreed on, the framework behind them, what the research has taught us, and a dated log. Add to it whenever we learn something that changes how we decide.

## Agreed principles (27 Oct 2026)

1. **Enter through a wedge, not the full system.** Build a 2nd-degree product with severe pain that runs *beside* the system the group already uses (no switching), then expand toward the 1st-degree system from inside.
2. **Follow the money.** Prefer pains tied directly to cash coming in (claims, receivables, fees) or to forced compliance. Willingness to pay follows money, not feature count or degree.
3. **First rupee before biggest rupee.** A cash-linked wedge gets paid sooner. The 1st-degree system is where the biggest revenue comes later, once we're inside.
4. **Don't fight the crowded 1st degree head-on.** In every business group we've studied, the 1st degree already has dozens of vendors competing on price.
5. **No build without buyer conversations.** Before building, talk to 5 buyers about what the pain costs them today (staff hours, consultants, money lost).

## The three degrees

Every idea we find inside a group falls into one of three degrees.

| | 1st degree — the system | 2nd degree — one job inside the system | 3rd degree — a fix on top of a tool |
| --- | --- | --- | --- |
| What it is | The management tool that runs the whole business | Software that handles one specific function end to end | An extension or add-on that fixes a single task or pain point |
| Hospital example | HMS/HIS (OPD, IPD, billing, pharmacy, lab, records) | Insurance/TPA desk software, OPD queue, NABH documentation | An Ayushman-portal helper, a TPA query-reply template tool |
| Ticket price | Highest (₹8,000+/month) | Drops sharply | Drops further |
| Difficulty to build | Hardest | Medium | Easiest |
| Competitors | Many established players | Many, competitive pricing | Often zero, or someone has already tried it |
| Willingness to pay | Highest (it runs the business) | Medium | Lowest ("is this painful enough to pay for?") |

**The pattern:** as the degree goes up, the ticket price goes down, the build gets easier, and **willingness to pay drops**. The number of competitors varies.

## The two ways to choose what to build

1. **Build something that doesn't exist yet.** These ideas almost always land in degree 3 (sometimes 2), because if a big painful gap existed in degree 1, someone would already fill it. Risk: the pain may not be worth paying for.
2. **Rebuild an existing tool, with the fixes and improvements users ask for.** The market is already validated. Risk: switching. It only matters in degrees 1 and 2, because those tools run the business, and people only move when the pain we fix is severe.

## Does this framework already exist? Yes — under other names

- **System of record vs point solution vs feature.** Degree 1 = *system of record* (the software a business runs on). Degree 2 = *point solution*. Degree 3 = what investors call *"a feature, not a product"*: likely to be copied by the system of record or never paid for.
- **Painkiller vs vitamin.** This is the willingness-to-pay axis: degree 3 ideas are often vitamins. Ideas tied directly to **money coming in** behave like painkillers in any degree.
- **Switching costs / 10x better.** Our option 2 risk. A replacement has to be clearly (often "10x") better on the pain that matters, or come with migration done for the customer.
- **Wedge strategy / land and expand** (the important one). Many large vertical SaaS companies entered through a 2nd-degree product with sharp pain, then expanded into the full 1st-degree system once they were inside: Toast (restaurant payments → full POS/restaurant OS), ServiceTitan (dispatch → full trade business software), Veeva (pharma CRM → the industry's cloud).

## What the existing frameworks add to ours

1. **There is a third path: the wedge.** Enter through a 2nd-degree product that (a) solves a severe pain, (b) needs no switching away from the existing system, because it works *beside* it, and (c) touches data that later lets us grow into the 1st-degree system. It avoids option 1's "not worth paying" risk and option 2's switching risk.
2. **Willingness to pay depends on the pain, not only the degree.** A 2nd- or even 3rd-degree tool can command a high price when it is **directly tied to cash** (getting paid faster, recovering money lost) or to compliance someone is forced into. Ticket price follows money, not feature count.
3. **"Fastest money" is not automatically degree 1.** Degree 1 has the biggest ticket, but also the longest sales cycle, migration work and many competitors. A cash-linked degree-2 wedge usually gets the *first* rupee sooner. Degree 1 is where the *biggest* rupee comes from later.

## Our groups, mapped

| Group | 1st degree (crowded) | 2nd degree (candidate wedge) | 3rd degree | Evidence for the wedge |
| --- | --- | --- | --- | --- |
| Small hospitals | HMS/HIS: ~25 small vendors on Meta, "₹20K" pricing, "free download" searches | **Insurance/TPA/Ayushman desk**: pre-auth, queries, claims, deductions | Ayushman portal helper | Top pain on 5 platforms; only 2–3 sellers; scheme growth +114% YoY; tied to cash collection |
| MSME manufacturers | Manufacturing ERP: ~45 vendors on Meta | **Receivables / 45-day-rule collections**, labour attendance and overtime | Job-work challan + GST helper | "45 days payment rule" Breakout; ₹6.5 Cr "payment stuck" (⬆1,400); no software competitor seen; tied to cash |
| K-12 schools | School ERP: ~85 advertisers | **Fee collection autopilot** | WhatsApp fee reminders | Fee collection the #1 pain on 4 platforms; tied to cash |
| CA firms | Practice management: 9+ small vendors, Zoho/ICAI entering | Client status and document collection, GST reconciliation | Notice tracker | Client communication top complaint on Maps; reconciliation the biggest search cluster |
| LSAT aspirants (consumers) | Prep platforms (7Sage, Demon, Blueprint) | Automatic mistake review / plateau breaker on top of LawHub | Wrong-answer journal | Plateau the top pain; ⬆151 post with "thousands" of DMs |

**The pattern across groups:** the 1st degree is crowded in every B2B group, and the strongest 2nd-degree pain is usually **about money coming in** (claims, receivables, fees). That is also where willingness to pay is highest.

## What the research has taught us

Patterns that held across 5 groups (K-12 schools, CA firms, LSAT aspirants, small hospitals, MSME manufacturers):

- **Demo videos get views but no discussion.** Practice-management, HMS and ERP demos have thousands to lakhs of views and almost no comments. Buyers watch quietly; their pains show up elsewhere (reviews, Reddit, search).
- **"Free download", "price" and "cheapest" searches signal a price-sensitive, crowded 1st degree.** We saw them for school ERP, CA software, hospital software and manufacturing ERP.
- **Paperwork that blocks cash is the recurring hidden pain.** Fees (schools), TPA/Ayushman claims (hospitals), 45-day receivables (MSMEs), GST reconciliation (CAs).
- **Government schemes and rules create sudden demand.** Ayushman/ABHA growth (+114% / +41% YoY), the MSME 45-day payment rule (Breakout), NABH and ABDM mandates. Trends picks these up early; watch the "rising" lists.
- **Reviews mostly show the group's customers, not the owner.** Maps and patient/parent apps show where the business fails *its* customers (communication, waiting, status updates). That often points at the owner's operational gap.
- **Owners rarely post on Reddit in India.** Reddit is strong for consumer groups (LSAT) and for the customer's view of Indian businesses. Owners' voices come from YouTube comments, Meta ad copy and search queries.
- **Meta ad copy is a cheap map of what sellers think hurts.** Long-running ads (200+ days) show what pays off; dozens of new, near-identical advertisers show a crowded category.

## How to decide, per group

1. Find the 1st-degree system the group already runs on (it exists in every group we've studied).
2. List 2nd-degree pains with evidence from at least 3 platforms.
3. Keep only pains that are tied to cash or forced compliance (painkillers).
4. Prefer pains the current system handles badly *and* that can be solved beside it (no switching).
5. Check that the data we'd hold leads naturally toward the 1st-degree system (the expand path).
6. Before building: talk to 5 buyers and ask what they pay today to handle it (staff hours, consultants, losses).

## Log

Add a dated line whenever a learning changes how we decide.

- **2026-10-27** — Defined the three degrees (system / one job / fix) and the two build options (new idea vs rebuild). Agreed on the wedge path, follow-the-money and first-rupee-before-biggest-rupee. Mapped 5 groups: the strongest wedges so far are the hospital insurance/TPA desk, MSME receivables (45-day rule) and school fee collection.
