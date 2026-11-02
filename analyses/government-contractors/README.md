# Government contractors (India): group analysis

Collected 2 Nov 2026 across all 8 sources in 45 minutes ([config.json](config.json)). Per-platform detail: [Meta ads](meta-ads.md) · [Play Store](play-store.md) · [YouTube](youtube.md) · [Reddit](reddit.md) · [Google search](google-search.md) · [Google Trends](google-trends.md) · [Google Maps](google-maps.md) · [Competitor pricing](competitor-pricing.md).

**Data collected:**
- Meta: 1,004 ads from 525 advertisers
- Play Store: 35 apps, 8,343 reviews
- YouTube: 79 videos, 5,814 comments
- Google search: 1,706 autocomplete suggestions, 6 result pages
- Google Trends: 8 terms
- Reddit: 872 posts, 2,973 comments
- Google Maps: 122 places, 1,121 reviews (Lucknow, Patna, Bhopal, Jaipur, Raipur; mostly house builders)
- Competitor pricing: 9 products

## 1. The group

Civil, electrical and supply contractors who win work through government e-tenders (CPWD, state PWD, railways IREPS, municipal bodies) and GeM. For each job they:
- pay an EMD (bid deposit) and, once they win, a performance bank guarantee or security deposit;
- raise running (RA) bills against measurements;
- wait for the department to pass and pay them, with TDS and GST deducted.

**Size: estimate.** Lakhs of registered contractors across CPWD and state PWD enlistments, and 20 lakh+ sellers on GeM (mostly suppliers, not works contractors). **~3 lakh active works contractors** is used as an unsourced estimate. **Maps cannot see this group:** the searches returned house builders.

## 2. Can we reach them? Partly: Meta in Hindi, and portals

- **Meta:** ~30 GeM-registration and tender-filing services, 7 tender-alert services and 2 EMD/guarantee products advertise, mostly in Hindi and regional languages. Most target **new entrants**, not running contractors.
- **Search:** heavy operational searching ("EMD refund letter format", "bank guarantee format", "RA bill format in excel"): cheap content and SEO.
- **Where they gather:** tender portals, GeM, CPWD/PWD offices, contractor associations, and the CAs who handle their GST.

## 3. Top pain points (ranked by evidence)

| # | Pain | Evidence |
| --- | --- | --- |
| 1 | **GST and TDS on government works** (rates, notices, refunds, reconciling deductions) | **YouTube:** 337 GST/TDS comments, 407K views on "contractor GST on government work" ("tender came before 18% GST, payment after…"; "notice to pay tax"). |
| 2 | **Money locked in deposits and guarantees** (EMD, security deposit, FDR, performance BG) | **Google:** 295 bank-guarantee and 122 EMD-refund suggestions; PAA "How do I refund an EMD?", "Can I get a bank guarantee without collateral?". **YouTube:** "earnest money abhi tak nhi mili 6 month ho gaye" (EMD still not back after 6 months); "FDR… refund tab hoga, jab license cancel hoga" (the FD comes back only when the licence is cancelled). **Meta:** AxiTrust (12 ads): "bidding doesn't have to stop when your bank limit is full… No FD margin". |
| 3 | **Bills and payments from departments** | **Reddit:** "Delivered ₹6.5 Cr defence order on time. Payment stuck." (⬆1,400). **Google:** PAA "How to check payment status on GeM?", "payment time period for GeM bills". **YouTube:** "bill pass krane ke liye kaya karna padta hai" (what does it take to get a bill passed); 29 payment-delay comments. |
| 4 | **Bribes and commissions** | **YouTube:** 161 comments ("10 percent to department ka fixed h", 10% to the department is fixed). **Reddit:** "15% commissions in Telangana government tenders" (⬆128). **Not solvable by software.** |
| 5 | **Finding and filing tenders** | **Meta:** ~37 alert and filing services. **Play:** BidAssist, Tender247, TenderNews (complaints about missing tenders and misleading plans); the GeM Seller app is rated 2.0★. |

## 4. Competitors and pricing

Prices were checked on 2 Nov 2026 by the competitor-pricing collector ([competitor-pricing.md](competitor-pricing.md)) and from ads. Prices exclude GST.

| Product | What it does | Plan and price | Source |
| --- | --- | --- | --- |
| **BidAssist** | Tender alerts and documents (50,000+ businesses) | 1 state ₹5,000 / 2 years; all India ₹14,000 / 2 years (≈₹200–600/mo); ₹299 per tender; GeM advisory from ₹499 | Published |
| TenderTiger, Tender247, TendersOnTime, TenderDetail | Tender alerts | Not public | Checked |
| **AxiTrust (surety bonds)** | Collateral-free alternative to a bank guarantee for EMD | Not public (premium-based) | Meta ads |
| GeM / tender-filing consultants | Registration and bid filing | Low-ticket services (DSC ₹1,300–2,200; registrations ~₹500–1,000) | Meta ads |
| **Onsite** | Site, billing and labour management | ₹12,000–15,000 per user/year; minimum ₹60,000–75,000/year | Published |
| **Powerplay** | Site and material management | From ₹71,999/year | Techjockey |
| **StrategicERP** | Construction ERP | ₹4,000/user/month (billed yearly) | Published |
| Newton | BOQ and bar-bending schedules from drawings | Not public (Diwali 20% off) | Meta ads |

**What this means:** contractors pay little for tender *information* (₹200–600/month) and complain even about that. They pay ₹5,000–10,000/month for site and billing tools. **No product tracks a won contract's money end to end** (EMD, security deposit, guarantees, RA bills, deductions, payments).

## 5. Opportunities spotted in the data

Customers needed are for **₹50 Cr/year** (₹50 Cr ÷ (price × 12)), as a share of the ~3 lakh estimated active works contractors.

1. **Contract money desk:** one record per tender or contract, tracking:
   - EMD paid and refunded (with auto-drafted refund letters);
   - security deposit, retention and performance BG (expiry alerts, release follow-ups);
   - each RA bill from submission to passing to payment;
   - deductions (TDS, GST TDS, labour cess) reconciled against Form 26AS and GSTR-7;
   - a dashboard of all money locked with each department.

   Later it could add surety and BG partners (referral revenue) and RA bill/measurement book generation.
   - **Suggested price: ₹3,000/month to start; ₹8,000/month after expansion** (+ RA bill/MB generation, CA access, surety/BG referrals).
     - **Customers needed:** 13,889 (4.6%) at the entry price; 5,209 (1.7%) after expansion.
     - **Why this price:** it sits between tender alerts (₹200–600/month) and site apps (₹5,000–10,000/month). The value is money released: a contractor with ₹50 lakh in deposits and guarantees who gets it back 3 months sooner saves about ₹1.5 lakh in interest at 12% (estimate).
   - **Risks:**
     - No evidence yet that contractors pay for back-office tools (their only paid software seen is cheap alerts).
     - Departments' and GeM's payment data is not available through any API.
     - Corruption shapes bill passing more than paperwork does.
     - The group size is unsourced, and Maps can't measure it.
2. **Tender eligibility and bid preparation** (read the tender, check eligibility, assemble documents).
   - **Suggested price: ₹1,500/month.**
     - **Customers needed:** 27,778 (9.3%).
     - **Why this price:** alerts cost ₹200–600/month, and bid preparation is more work.
   - Crowded: alert apps, AI tender summaries (Tendingo), filing consultants. Fails the target math.
3. **EMD and bank-guarantee financing marketplace** (surety bonds, collateral-free guarantees).
   - Revenue would be a share of premiums, not a subscription.
   - AxiTrust is already advertising. Better as a partner inside opportunity 1.

**Verdict:** opportunity 1 is a real gap, but the evidence that contractors will pay ₹3,000–8,000/month is weak. Every paid tool they use costs less, and the loudest pains (bribes, GST rules) aren't software problems. **Research more:** 5 conversations with mid-size contractors (₹5–50 Cr turnover) should test whether locked-up deposits and bill tracking are worth paying for.

## 6. Data gaps

- **Group size:** unsourced. CPWD/state PWD enlistment lists and GeM seller statistics should be counted.
- **Maps:** does not reach government contractors (it returned house builders), so reviews are about private home construction.
- **Owner voice:** YouTube has some running contractors; Reddit has mostly newcomers and corruption talk. Contractor associations and WhatsApp groups were not collected.
- **Competitor pricing:** "Highrise construction ERP" matched a game website and is excluded.
