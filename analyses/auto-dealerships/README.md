# Car & two-wheeler dealerships (India) — group analysis

Collected 29 Oct 2026 across 7 platforms in 56 minutes ([config.json](config.json)). Per-platform detail: [Meta ads](meta-ads.md) · [Play Store](play-store.md) · [YouTube](youtube.md) · [Google search](google-search.md) · [Google Trends](google-trends.md) · [Reddit](reddit.md) · [Google Maps](google-maps.md).

**Data collected:** 974 Meta ads (400 advertisers) · 35 apps / 31,015 Play reviews · 65 videos / 7,742 YouTube comments · 1,211 Google autocomplete searches + 5 result pages · 8 Trends terms · 839 Reddit posts / 3,980 comments · 172 dealerships / 1,100 Maps reviews (Pune, Jaipur, Lucknow, Indore, Coimbatore).

## 1. The group

Three sub-groups with different economics:
- **Authorised new-car showrooms** (Maruti, Tata, Hyundai, Mahindra, Kia…): large businesses with sales, service workshops, finance and insurance desks. They run on systems mandated by the manufacturer.
- **Authorised two-wheeler showrooms** (Hero, Honda, TVS, Bajaj, Yamaha, Suzuki, plus new EV brands): smaller, high volume, with service as a major revenue line.
- **Independent used-car dealers:** the unorganised majority, profitable while Cars24 and Spinny lose ₹400+ Cr a year each. They depend on auction platforms for stock.

pplab's estimate is ~60K dealerships (`group-data.ts`, unsourced estimate). Every Maps search hit its cap. The used-car market is growing (+20% YoY searches).

## 2. Can we reach them? Directly yes, through Meta barely

- **Meta:** almost no software vendor targets dealers (Excellon DMS, Dave.AI, Autorox). Ads are dominated by OEMs and platforms selling to buyers, and EV brands recruiting dealers (~22). An empty channel is cheap to enter but unproven.
- **Maps:** dealerships are very visible (median 1,860 reviews, 99% list a phone, 81% websites) and **owners reply to 55% of reviews**, so they care about reputation.
- Sales are likely field and partner-driven (dealer associations, OEM vendor lists, used-car dealer clusters). That's slower than Meta.

## 3. Top pain points (ranked by evidence)

| # | Pain | Evidence |
| --- | --- | --- |
| 1 | **After-sales service operations** (slow work, no status updates, unclear bills, no follow-up) | Maps: service is **68%** of low two-wheeler reviews and **41%** of new-car reviews. Reddit: 77 service-centre mentions. Search: dealer CRM for **post-service follow-up (PSF)** is a named category (AutoSherpa, Groweon). |
| 2 | **Lead follow-up and sales conversion** | Meta: "Spending lakhs on leads. But how many actually get followed up within the first hour? That's your leak" (Dave.AI). Maps: 21–23% "no response". Reddit (US): dealers run on CRM and BDC follow-up; Indian dealers mostly don't. |
| 3 | **Used-car dealers' stock sourcing through platforms they distrust** | Play: Cars24 Partners 3.9★ with **494/1,000 complaints**: hidden charges and deposits 283, inspection misses 108, opaque bidding 100. OLX Autos dealers 3.3★: "don't provide us car registration no". |
| 4 | **Buyer trust and pricing transparency** | Reddit: "cab driver saved me ₹75,000" (⬆10,070), insurance markups (⬆729), forced insurance (⬆183). YouTube: used-car trust in 390 comments. Platforms advertise "Blind trust mat karo dealer pe". |
| 5 | **Thin margins and OEM inventory pressure** | YouTube: "least returns per sq. ft.", "dealers full of unsold cars". Trends: "cars24 fires 600 employees". |

## 4. Competitors and prices

- **DMS (1st degree):** OEM-mandated systems at authorised dealers, plus Excellon and similar vendors. Locked in and sold top-down through manufacturers (context; ad data shows only Excellon).
- **Dealer CRM / service follow-up:** AutoSherpa, Groweon, Dave.AI AutoNgage, Zoho CRM, Lark, HelloLeads. Some competition exists.
- **Garage/workshop software:** Autorox, ARI, Repairing Shop Manager.
- **Used-car platforms** (Cars24, Spinny, OLX Autos, CarDekho, Droom): channel and competitor at once for independent dealers.
- Pricing is not public in the ads (demo-led).

## 5. Opportunities spotted in the data

1. **Service-desk communication and follow-up for two-wheeler and car showrooms.** It would cover job status updates on WhatsApp/SMS, estimate approval, bill transparency, service reminders and post-service follow-up, beside the OEM DMS. Evidence: pain #1 (68% / 41% of complaints); service is the dealer's recurring profit; owners actively manage reviews.
   - Risk: OEM DMS lock-in and OEM-run apps (e.g. Hero App, 3.7★); PSF CRMs already exist (AutoSherpa); WhatsApp Business API costs.
2. **Independent used-car dealer toolkit:** stock sourcing with verified history (challans, registration, inspection), pricing, listing to all platforms, and lead follow-up. Evidence: pain #3; independents stay profitable against loss-making platforms; growing used-car demand.
   - Risk: fragmented, price-sensitive buyers; data access (VAHAN/registration and challan APIs); the platforms may copy it.
3. **Lead follow-up for showrooms** (first-hour response, missed-lead alerts). Evidence: pain #2.
   - Risk: Dave.AI and CRMs already pitch this; OEM CRMs cover part of it.

## 6. Data gaps

- **Group size:** not sourced. FADA dealer/outlet counts and used-car dealer counts are needed to confirm the target math.
- **Meta:** dealer software barely advertises, so competitor pricing is unknown.
- **Play Store:** consumer apps crowded out dealer tools in discovery.
- **Google:** one result page timed out; "car dealership" is polluted by a simulator game.
- **Reddit:** buyer-side in India; operations insight comes from US dealer staff.
- **Not collected:** OEM DMS policies per brand, dealer association forums, LinkedIn (dealer principals, GMs).
