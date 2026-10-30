# Distributors & wholesalers (India) — group analysis

Collected 30 Oct 2026 across 7 platforms ([config.json](config.json)). Per-platform detail: [Meta ads](meta-ads.md) · [Play Store](play-store.md) · [YouTube](youtube.md) · [Google search](google-search.md) · [Google Trends](google-trends.md) · [Reddit](reddit.md) · [Google Maps](google-maps.md).

**Data collected:** 996 Meta ads (622 advertisers) · 35 B2B apps / ~6,000 relevant Play reviews (after the relevance re-run) · 73 videos / 5,461 YouTube comments · 971 Google autocomplete suggestions + 6 result pages · 8 Trends terms · 663 Reddit posts / 1,415 comments · 138 distributors / 1,009 Maps reviews (Indore, Jaipur, Lucknow, Ahmedabad, Nagpur).

## 1. The group

Owner-run distributors, stockists, super stockists and wholesalers who buy from brands (FMCG, pharma, electricals, building materials) and supply kirana stores, chemists and retailers. They run on Tally/Marg/Busy billing, salesmen with order-booking apps (often brand-mandated), and **credit to retailers**. Margins are thin (2–8%). pplab's estimate is ~6 lakh businesses (`group-data.ts`, unsourced estimate). Every Maps search hit its cap. This is the **least digital** group analysed so far: 39% have websites and the median listing has 26 reviews.

## 2. Can we reach them? Not easily through ads, but they are a dense, findable network

- **Meta:** brands spend to *recruit* distributors ("Become a Super Stockist"), and wholesale platforms target them (Amazon Business, Flipkart Wholesale with "7 days FREE credit", METRO). **Almost no software is advertised to distributors**: an empty channel, cheap to test but unproven.
- **Field and network:** distributors cluster by city and category, and brands know every one of their distributors. Brand partnerships and associations are a likely route.
- **Low web presence** (39% websites) means WhatsApp and phone-first products and outreach.

## 3. Top pain points (ranked by evidence)

| # | Pain | Evidence |
| --- | --- | --- |
| 1 | **Retailer credit and collections: money stuck in the market** | Reddit: "Don't start if you don't have bouncers and extra capital" (⬆527); pharma distributors "go bankrupt… 90 days payment… extended to a year" (⬆75); "₹1.40 crore market outstanding" after a brand exit (⬆88); 76 credit/payment mentions. YouTube: "paisa market me fas jata hai" (money gets stuck in the market); 66 credit mentions. Google: 64 outstanding-payment reminder searches (letter, email, WhatsApp, SMS formats). Meta: Credflow is the one collections pitch. |
| 2 | **No shared information about bad-paying retailers** | Reddit: owners keep selling "even after knowing that the retailer has already scammed someone else" (⬆56); "Everyone thinks, he won't scam me". |
| 3 | **Thin margins, brand targets and stock risk** | Reddit: "margins are really thin… at least 40% short [of target]… definitely in a loss"; stock stuck at brand exit (₹3.7 Cr). YouTube: ITC "2 se 3% profit… payment 3 mahine me". Maps: near-expiry stock complaints. |
| 4 | **Salesman order taking on clunky apps** | Play: FieldAssist and Bizom (3.5★) complaints about slowness, crashes and offline failures (229), GPS (190), login (324) in 2,127 complaints. |
| 5 | **Cash leakage through salesmen and staff** | YouTube: workers pocketing collected cash. Play: collection apps are small or lender-owned. |

## 4. Competitors and prices

- **Sales-force automation (sold mostly to brands):** FieldAssist, Bizom, FieldSense, SalesOn, many tracking apps.
- **Distributor billing and ordering:** Marg (eOrder, eRetail: 100K+ each), Tally/Busy, Vyapar/myBillBook/Khatabook (generic).
- **Collections:** Credflow (receivables automation), a few small collection apps. **No dominant collections product for distributors.**
- **B2B platforms competing for retailer orders:** Udaan, JioMart (Campa's distribution push), Flipkart Wholesale, ElasticRun, quick commerce.
- Prices are not public in the data (demo-led); generic billing apps are cheap or free.

## 5. Opportunities spotted in the data

1. **Retailer credit and collections for distributors.** It would show live outstanding per retailer and ageing, send automatic WhatsApp reminders with UPI pay links, let salesmen collect with instant digital receipts (stopping cash leakage), set credit limits and hold supply, and sync with Tally/Marg. Later it could add an opt-in **retailer payment-behaviour score** shared across distributors. Evidence: pains #1, #2 and #5; nearly no competitor advertising; tied directly to cash.
   - Risk: relationship-driven collection (distributors fear losing retailers); low digital maturity; a shared credit score needs scale and careful legal design.
2. **Lightweight order taking that works offline,** beside brand apps, for multi-brand distributors. Evidence: pain #4.
   - Risk: crowded SFA market; brands mandate their own apps.
3. **Stock and expiry management with brand settlement tracking.** Evidence: pain #3.
   - Risk: narrower pain; billing ERPs partly cover it.

## 6. Data gaps

- **Group size:** unsourced (~6 lakh estimate). FMCG/pharma distributor counts should be confirmed.
- **Play Store:** the first run kept consumer apps. Fixed with relevance ranking (`playStore.rankBy`) and re-run.
- **Google:** the first run lost 3 result pages to a typing timeout. Fixed (keyboard typing with URL fallback) and re-run.
- **Maps:** reviewers are retailers and walk-in buyers, not distributor owners.
- **Not collected:** distributor association forums, WhatsApp trade groups, Marg/Tally user communities.
