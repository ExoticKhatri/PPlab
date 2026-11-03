# Freight forwarders & customs brokers (India): group analysis

Collected 3 Nov 2026 across all 8 sources in 39 minutes ([config.json](config.json)). Per-platform detail: [Meta ads](meta-ads.md) · [Play Store](play-store.md) · [YouTube](youtube.md) · [Reddit](reddit.md) · [Google search](google-search.md) · [Google Trends](google-trends.md) · [Google Maps](google-maps.md) · [Competitor pricing](competitor-pricing.md).

**Data collected:**
- Meta: 520 ads from 303 advertisers
- Play Store: 35 apps (mostly trucking and courier apps, so off-target)
- YouTube: 70 relevant videos, 1,210 comments, after dropping "Chak De India" and US truck-broker videos
- Google search: 1,804 autocomplete suggestions, 6 result pages
- Google Trends: 8 terms (mostly too small)
- Reddit: 913 posts, 1,325 comments (mostly US and global)
- Google Maps: 132 firms in Mumbai, Chennai, Delhi, Ahmedabad and Kolkata
- Competitor pricing: 9 vendors

## 1. The group

Freight forwarders, NVOCCs and licensed customs brokers (CHAs) who book ocean and air freight, file shipping bills and bills of entry on ICEGATE, and coordinate shipping lines, ports and transporters for importers and exporters. They run on CargoWise, Logi-Sys, Magaya, local ERPs or Excel and email.

**Size: estimate.** **~25K firms** (unsourced; licensed customs brokers plus forwarders). It is the **smallest group analysed so far**. Maps searches hit their caps in every port city.

**Digital maturity:** 89% have a website; owners reply to 37% of reviews.

## 2. Can we reach them? Not through Meta or Play; through port clusters and associations

- **Meta:** forwarders advertise *their services* to importers. Software vendors barely advertise (Avaal AFM, a few rate marketplaces).
- **Play:** not relevant (trucking and courier apps); forwarding software is desktop and web based.
- **Clusters:** Mumbai/Nhava Sheva, Chennai, Delhi, Ahmedabad/Mundra and Kolkata, plus FFFAI and customs broker associations.

## 3. Top pain points (ranked by evidence)

| # | Pain | Evidence |
| --- | --- | --- |
| 1 | **Client communication: shipment status and updates** | **Maps:** no response / no updates is the top complaint (57 of 164 low reviews). **Google:** 284 bill-of-entry status searches ("status check online", "status at icegate"). **Reddit:** "The one thing I value most in a freight forwarder is transparency." |
| 2 | **Surprise charges: detention, demurrage, extra fees** | **Google:** 215 detention/demurrage suggestions; PAA "How to avoid detention charges?", "How many free days before demurrage?". **Maps:** "They lure you with low quotes, then double the charges post-service" (18 extra-charge complaints). |
| 3 | **Clunky, costly core systems** | **Reddit:** CargoWise is "a super clunky seemingly early '80's era user interface"; "Anyone *actually* switched from CargoWise?"; complaints about its per-transaction "Automation Fee". **Google:** "Who competes with CargoWise?", "freight forwarding software for small business". |
| 4 | **Quote workload with low win rates** | **Reddit:** "you will lose 98 percent of the quotes… They throw out request for quotes to a billion people." **Meta:** rate marketplaces (FindRates AI, Globy) push more quote requests at forwarders. |
| 5 | **Getting clients** | **YouTube:** "how freight forwarders get clients" 423K views; **Google PAA:** "What is the fastest way to get clients?" |

## 4. Competitors and pricing

Prices were checked on 3 Nov 2026 by the competitor-pricing collector ([competitor-pricing.md](competitor-pricing.md)). Prices exclude GST.

| Product | What it does | Plan and price | Source |
| --- | --- | --- | --- |
| **Shipthis** | Full forwarding suite (shipments, quotes, accounting, warehouse) | **$89 per user/month** (≈₹7,500), all modules | Published |
| **CargoWise** | Global industry-standard forwarding system | Quote-only; per-transaction "Automation Fee" under the Value Pack model | Techjockey / Reddit |
| **Logi-Sys** | Indian forwarding and customs ERP | Not public | Demo-led |
| **Magaya, GoFreight, Freightify** | Forwarding systems and rate management | Not public | Demo-led |
| **Freightbro, Cogoport** | Freight booking platforms | Not public | Checked |
| FindRates AI, Globy | Rate and lead marketplaces | Not public | Meta ads |

**What this means:** forwarders pay per user. A 5-person firm on Shipthis would pay ≈₹37,500/month (estimate from the published $89). Core systems are expensive, quote-only and disliked. The gap is the **client-facing layer**: status, surprise charges and quotes.

## 5. Opportunities spotted in the data

Customers needed are for **₹50 Cr/year** (₹50 Cr ÷ (price × 12)), as a share of the ~25K estimated firms.

1. **Client status and charges portal for small forwarders and CHAs:** each shipment's milestones (booking, shipping bill / bill of entry status, out of charge, vessel ETA) sent to the client on WhatsApp and email, with free-day countdowns before detention and demurrage, and every charge shown up front against the quote.
   - **Suggested price: ₹10,000/month to start; ₹25,000/month after expansion** (+ quote desk, job costing and client billing).
     - **Customers needed:** 4,167 (16.7%) at the entry price; 1,667 (6.7%) after expansion.
     - **Why this price:** it costs about one Shipthis seat (₹7,500), and it sits beside the core system instead of replacing it.
   - **Risk:** **the group is too small** for ₹50 Cr in India at this price.
     - Shipment data needs ICEGATE and shipping-line feeds (no official APIs for most).
     - CargoWise and Logi-Sys may add client portals.
2. **Detention and demurrage tracker** (free days, alerts, dispute letters).
   - Could be sold to importers as well as forwarders.
   - **Suggested price: ₹4,000/month.**
     - **Customers needed:** 10,417 (41.7% of forwarders alone).
   - Fails the math unless importers buy it too.
3. **Document-to-job automation:** read bills of lading, invoices and packing lists, and fill the job in CargoWise or Logi-Sys.
   - **Suggested price: ₹10,000/month.**
     - **Customers needed:** 4,167 (16.7%).
   - Many AI document tools compete. Same group-size problem.

**Verdict: below target math in India.** The pain is real (communication and surprise charges, and disliked core systems) and forwarders pay per seat. But ~25K firms is too few for ₹50 Cr a year at ₹10,000–25,000/month. It becomes viable only as a **global product**: forwarders everywhere use CargoWise-style systems, and Shipthis sells worldwide at $89 per user. That would be a different market to research. A second route is to sell the status portal to the exporters and importers themselves; exporters are already a shortlisted group.

## 6. Data gaps

- **Group size:** unsourced. CBIC's licensed customs broker list and FFFAI membership should be counted.
- **Indian voices:** Reddit and YouTube are mostly US/global, and Play is off-target.
- **Pricing:** all core systems except Shipthis hide prices.
- **Global market:** not researched. Run a US/global forwarder analysis if the global route is considered.
