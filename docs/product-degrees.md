# Product degrees — how ideas form inside a group

Our goal is to earn money as fast as possible. The research picks the industry well, but turning that research into one product idea is where we get stuck. This note records the framework we've arrived at, so every group analysis ends with a decision instead of a list.

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

## How to decide, per group

1. Find the 1st-degree system the group already runs on (it exists in every group we've studied).
2. List 2nd-degree pains with evidence from at least 3 platforms.
3. Keep only pains that are tied to cash or forced compliance (painkillers).
4. Prefer pains the current system handles badly *and* that can be solved beside it (no switching).
5. Check that the data we'd hold leads naturally toward the 1st-degree system (the expand path).
6. Before building: talk to 5 buyers and ask what they pay today to handle it (staff hours, consultants, losses).
