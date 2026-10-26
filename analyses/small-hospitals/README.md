# Small hospitals & nursing homes (India) — group analysis

Collected 26 Oct 2026 across 7 platforms ([config.json](config.json)). Per-platform detail: [Meta ads](meta-ads.md) · [Play Store](play-store.md) · [YouTube](youtube.md) · [Google search](google-search.md) · [Google Trends](google-trends.md) · [Reddit](reddit.md) · [Google Maps](google-maps.md).

**Data collected:** 1,465 Meta ads (760 advertisers) · 35 apps / 24,423 Play reviews · 71 videos / 3,340 YouTube comments · 1,281 Google autocomplete searches + 6 result pages · 8 Trends terms · 682 Reddit posts / 2,953 comments · 199 hospitals and nursing homes / 1,944 Maps reviews (Lucknow, Jaipur, Indore, Nagpur, Patna).

## 1. The group

Privately owned hospitals of roughly 10–100 beds and nursing homes, often doctor-owned, in tier-2/3 cities. They run OPD, IPD, a pharmacy, a lab, an insurance/TPA desk and, increasingly, an Ayushman Bharat (PMJAY) desk. pplab's estimate is ~60,000 in India at ₹8,000/month software spend (`group-data.ts`, unsourced estimate). Every Maps search in 5 tier-2 cities hit its 20-place cap.

## 2. Can we reach them? Yes — Meta works, and hospitals are visible online

- **Meta:** about 45 advertisers really sell to hospitals, including **about 25 hospital-software vendors**, NABH consultants, marketing agencies and an HR-rostering tool. All are small (1–6 ads) and mostly under 30 days old: a crowded field of small players, none dominant. 10% of ads are Hindi/Hinglish.
- Hospitals advertise themselves heavily on Meta (91 advertisers tagged "self", NABH used as a trust badge).
- **Maps:** 93% of independent multispeciality hospitals have websites, and owners reply to 37% of reviews. They are reachable and digitally active.
- YouTube reaches would-be founders ("hospital kaise khole": 1–1.5 lakh views) and hospital staff (NHA's Ayushman onboarding video: 2.1 lakh views).

## 3. Top pain points (ranked by evidence)

| # | Pain | Evidence |
| --- | --- | --- |
| 1 | **Insurance, TPA and government-scheme paperwork** (cashless pre-auth, claims, deductions, Ayushman/PMJAY empanelment and portal) | YouTube: the top comment theme, 382 of 2,471. Ayushman portal comments: "asking admin code for 4 months", "keeps logging out", "TMS 2.0 very bad". Google: 188 TPA-claim searches (forms, status, TPA phone numbers) and 34 on Ayushman empanelment. Reddit: 123 cashless/TPA and 110 claim-rejection mentions. Maps: discharge–mediclaim delays, "no cashless claim policy". Meta: only 2–3 claim-management sellers. |
| 2 | **Government schemes are growing fast, so compliance pressure is too** | Trends: "ayushman bharat" **+114% YoY**, "abha" +41%. Meta: "Your HMS must be ABDM-ready", "NABH Mandatory 2026? Small Hospitals Must Act NOW". Google: 201 NABH searches, mostly "what is / is it mandatory / guidelines". |
| 3 | **Fragmented or paper-based operations** (billing, pharmacy and records in separate systems) | Meta: "Still running your hospital across paper registers, spreadsheets, and scattered software?"; "disconnected software". Play: EMR "hangs at the last step of saving prescription… embarrassing in front of patients" (HealthPlix, 2.8★). |
| 4 | **Patient flow: OPD waiting, beds, discharge** | Maps (independent hospitals): waiting/delays 18%, billing transparency 12%, discharge delays 4%. "After waiting for nearly 3 hours…", "no bed in general ward". |
| 5 | **Patient acquisition through referrals and middlemen** | YouTube: "patients don't come without a broker" (👍20). Reddit: referral cuts of 20–50% on beds, visits and tests (⬆771). Meta: 4 marketing sellers ("increase OPD footfall"). |
| 6 | **Staffing cost and rostering** | Reddit: AYUSH doctors hired as cheaper duty doctors (⬆3,155). Meta: Kasturi HR (23 ads) on doctors' shift swaps. Billing/TPA staff-training ads indicate a shortage of those staff. |

## 4. Competitors and prices

- **Hospital software (HMS/HIS/EMR):** about 25 small vendors on Meta (Healthray, Shivam Medisoft NeoSoft, Qiaben Ciyex, Myopd, TatvaCare, HS14, Olympus HIS, OrbHMS, Medyclix, HOSPi+, Ektos, Drucare…), YouTube demo channels (Adroit eHospital, NiftyHMS, AroBuddy), and EMRs (Eka Care, HealthPlix). **Prices:** "Software Only On 20K" (TatvaCare); free trials and "low cost ABDM software". Google is full of "free download", "price in india" and "source code".
- **NABH consulting:** entry-level certification "for just ₹65,000" (Healthbridge).
- **Claims/RCM:** Nimblefin (insurance desk, audit, recoveries), WinSkill (cashless claim management). Google asks "top 5 RCM companies in India". Few visible players.
- **Government:** NHA's free HEM/TMS portals for Ayushman, which staff struggle to use.

## 5. Opportunities spotted in the data

1. **Insurance & scheme desk software for small hospitals:** cashless pre-auth, TPA query replies, claim tracking and deductions, Ayushman/PMJAY case submission and discharge-to-claim in one queue across TPAs and the NHA portal. Evidence: pain #1 on 5 platforms, thin supply (2–3 sellers on Meta), and scheme growth (+114%). Clear ROI: faster, fuller claim payments.
   - Risk: integrating with many TPA portals and NHA's TMS (no public APIs; may need assisted/manual workflows); high-stakes data.
2. **ABDM/NABH-ready lightweight HMS for nursing homes** (OPD, IPD, billing, pharmacy), sold on compliance. Evidence: pain #2 and #3, ABDM-ready messaging everywhere.
   - Risk: **very crowded and price-competitive** (~25 vendors, "₹20K", free downloads); hard to differentiate.
3. **OPD queue and discharge-status tool** (patient-facing updates). Evidence: Maps waiting 18% and discharge complaints.
   - Risk: lower willingness to pay; often bundled into an HMS.

Option 1 has the strongest evidence and the least competition. It also fits the ₹8,000/month spend estimate, because it ties directly to cash collection.

## 6. Data gaps

- **Owner/administrator voice is thin:** Reddit is patients and junior doctors; YouTube is founders, staff and patients. Talking to 5 hospital administrators about their TPA desk is the next step.
- **Play Store:** hospital tools aren't on Play. Discovery kept consumer apps even after a focused re-run (logged in [docs/collectors-todo.md](../../docs/collectors-todo.md)).
- **YouTube:** US "nursing home" (elderly care) videos were excluded.
- **Maps:** the "nursing home" search mixed in 29 home-care agencies; the "multispeciality" search included 19 corporate hospitals (reported separately).
- **Google:** no related searches were returned on the result pages.
- **Not collected:** claim-rejection rates by TPA, actual software spend per hospital, LinkedIn (hospital administrators).
