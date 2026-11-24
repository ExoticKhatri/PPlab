# How a small developer runs a project today: money, RERA and where it breaks

Research for the RERA milestone desk (customer: the real estate developer; the CA is a partner, not the buyer). Written 24 Nov 2026 from public sources, practitioner guides, bank guides and our own collected data (`analyses/real-estate-developers/raw`). **Bold "hypothesis"** marks what we must confirm on calls. Companion to [README.md](README.md).

## 1. The people involved

| Who | Inside / outside | What they do in this flow |
| --- | --- | --- |
| Owner / MD / partners | Inside | Decide, sign, chase money, own the RERA registration |
| Site engineer / project manager | Inside | Knows real progress (which slab, which floor) |
| Post-sales / CRM executive | Inside (mid-size firms; the owner or an accountant in small ones) | Demand letters, receipts, reminders, loan paperwork, registration, possession ([job listing](https://app.qureos.com/jobs/crm-executive-real-estate-post-sales-possession-management-1761379507083): "generating demand letters", "sending reminders", "MIS reports on payment collections, pending dues") |
| Accounts executive | Inside | Receipts and GST in Tally, bank reconciliation |
| Architect | Outside | Stage certificates for buyers' banks; % of physical completion for RERA (Form 1) |
| Engineer | Outside or inside | Cost actually incurred (Form 2) |
| CA (project) | Outside | Cost and the amount allowed out of the 70% account (Form 3); often prepares the QPR |
| CA (annual auditor) | Outside, **must be a different firm from the Form 3 CA** | Form 5 annual audit of project money ([ICAI-linked summary](https://www.bajajfinserv.in/what-is-rera-form-5)) |
| Buyers and their banks | Outside | Pay each instalment; banks send a technical officer and disburse against the demand letter |

Sources for the certificate roles: [Patron Accounting](https://www.patronaccounting.com/blog/rera-70-percent-escrow-rule) ("Architect: certifies the percentage of physical completion. Engineer: certifies the cost actually incurred… Chartered accountant: certifies the cost and the amount that may be withdrawn").

## 2. Flow A: a construction milestone turns into money

1. **Slab or stage completed** on site (site engineer).
2. **Architect issues a stage certificate.** Banks will not release a home-loan tranche without it ([Kotak](https://www.kotak.bank.in/en/stories-in-focus/loans/home-loan/home-loan-disbursement-process-guide.html): "delays occur when builders lack stage completion certificates or provide incorrect ones").
3. **Demand letter to every buyer on that stage** (post-sales): stage, % due, amount, GST (5%, or 1% for affordable homes, on two-thirds of the value), a TDS note, due date, bank details. Typically made in Word/Excel from the booking sheet. One documented case: "demand letters were generated manually in Word, often weeks late" ([GoClixy case study](https://saas.goclixy.com/blog/real-estate-builder-payment-schedule-management-india), vendor source).
4. **Buyer pays:** self-funded buyers transfer directly; loan buyers send the demand letter + architect certificate (+ approved plan) to their bank, which inspects and disburses in **10–20 working days per stage when papers are in order** ([Kotak](https://www.kotak.bank.in/en/stories-in-focus/loans/home-loan/home-loan-disbursement-process-guide.html); disbursement is legally tied to construction stages under RBI/NHB norms).
5. **Receipt issued; accounts post it in Tally;** 70% must move to the project's designated RERA account.
6. **Follow-ups:** reminders by phone/WhatsApp; late buyers owe interest at **SBI's highest MCLR + 2%** (the same rate the developer owes for its own delay, Maharashtra Rule 18; [Moneylife](https://moneylife.in/article/in-a-first-maharera-penalises-homebuyer-for-payment-delay-to-builder/61800.html)).
7. **TDS:** for flats of ₹50 lakh or more the buyer must deduct 1% on every instalment, file Form 26QB and hand the developer Form 16B; mismatches with the developer's 26AS are common and cost the developer tax credit ([Income Tax Dept](https://incometaxindia.gov.in/Tutorials/69.TDS-from-sum-paid-to-buy-an-Immovable-Property.pdf); [TaxBuddy](https://www.taxbuddy.com/blog/tds-refund-process-for-form-16b-discrepancies-and-implications-for-property-sellers)).
8. **MIS for the owner:** who has paid, who is overdue, cash expected this month (usually an Excel sheet).

## 3. Flow B: getting construction money out of the 70% account

- Every buyer payment lands first in a collection account; 70% must sit in a **separate account per project or phase**, usable only for land and construction ([Patron](https://www.patronaccounting.com/blog/rera-70-percent-escrow-rule)). Tamil Nadu made a three-account system mandatory from 1 Jan 2026; MahaRERA proposed the same.
- **Each withdrawal needs three certificates** (architect % complete, engineer cost incurred, CA allowed amount); the bank then releases funds. Withdrawals can only keep pace with construction: "You can take money out of the designated account only as fast as you build" ([Patron](https://www.patronaccounting.com/blog/rera-70-percent-escrow-rule)). Worked example: ₹50 Cr project, ₹20 Cr cost certified (40%), ₹21 Cr deposited, ₹5 Cr already taken → ₹3.4 Cr releasable.
- **Known friction:** the CA relies on the architect and engineer for completion, while they rely on the CA's numbers, so one professional can stall the money ([practitioner slides](https://fr.slideshare.net/SandeepJ99/rera-key-practical-aspects-and-compliances-sandeep-jhunjhunwala)). Banks also ask for promoter undertakings and indemnities. Breaking the deposit/withdrawal rules can cost up to **5% of the project cost**.

## 4. Flow C: the RERA compliance calendar (Maharashtra)

| When | What | Who | Penalty if missed |
| --- | --- | --- | --- |
| Every quarter, by the 20th of Jan/Apr/Jul/Oct (MahaRERA 2026 dates; older guides say 7 days) | **QPR** on MahaCRITI: construction progress, Forms 1/2/3, flats and parking booked, money received, money spent, plan or professional changes ([Outlook Money](https://www.outlookmoney.com/invest/maharera-flags-8212-projects-for-missing-qpr-deadline-gives-regulatory-warning); [CAclubindia](https://www.caclubindia.com/articles/avoid-penalties-under-rera-quarterly-compliance-guide-52880.asp)) | Developer + architect + engineer + CA | ₹50,000, abeyance, frozen account, sales ban (8,212 projects flagged in May 2026) |
| Every withdrawal | Forms 1/2/3 to the bank | Architect, engineer, CA | Up to 5% of project cost |
| Within 6 months of year-end (≈30 Sep) | **Form 5** annual audit of project money; a group statutory audit does not count ([Patron](https://www.patronaccounting.com/blog/rera-70-percent-escrow-rule)) | A second, independent CA | Penalty (amount unconfirmed) |
| Before the completion date | **Extension** (Section 6 up to 1 year; 7(3) with buyers' consent) | Developer, usually via consultant | Lapse → abeyance (4,237 projects listed) |
| At completion | **OC + Form 4** uploaded to close the project | Architect, developer | Project stays "open" and can lapse |
| Ongoing since May 2026 | Everything on the new **MahaCRITI** portal (old portal closed 10 May 2026) | Developer | Pending old applications were closed |

## 5. Where it breaks (evidence)

1. **The same milestone is typed four or more times:** stage certificate, every buyer's demand letter, each bank's disbursement pack, Forms 1/2/3 and the QPR, all from the same fact ("slab 7 done"). Nobody holds it in one place. *(Our synthesis of flows A–C.)*
2. **Demand letters go out late:** manual Word/Excel; competitors advertise exactly this ("Still managing payment collections in Excel? … Delayed demand letters", Buildesk on Meta); Google shows 37 searches like "builder demand letter format for hdfc home loan" and "demand letter generator" (our data).
3. **Collections are invisible:** receipts live in Tally with accounts, while sales and the owner can't see who is overdue; one vendor case study estimated ₹38 lakh a year of leakage at a township developer (vendor claim).
4. **Bank disbursements wait on paperwork:** missing or wrong stage certificates delay each tranche; pre-EMI interest keeps running for buyers ([Piramal](https://www.piramalrealty.com/blogs/construction-linked-payment-plan-how-clp-works)).
5. **Deadlines are missed at scale:** 8,212 QPR notices (May 2026), 4,237 lapsed projects, 1,632 suspended for QPRs; a developer on Reddit: "Didn't file Form 5 RERA for 3 years in a row. What can I do?"
6. **Withdrawals stall in the three-certificate loop** (practitioner slides above).
7. **Buyers hear nothing:** in our Maps data, of 241 low reviews of developers, 59 are "no response", 46 payment/refund disputes, 42 possession delays.
8. **Rules keep moving:** new portal (MahaCRITI), the 4-month force-majeure extension (Order 66/2026), three-account rules in other states.

## 6. What they use and pay for today

| Need | Today's answer | Price seen |
| --- | --- | --- |
| RERA filings and certificates | Their CA or a RERA consultant | One Mumbai CA from ₹15,000/month per project ([Patron](https://www.patronaccounting.com/construction-and-real-estate-accounting-services/mumbai)); RERA Vision: registration/extension/correction at a **₹50,000 flat fee** (Diwali 2026 offer, Meta); Grow RERA sells quarterly and annual compliance (Meta, price not public) |
| QPR software | ReraDesk (beta) | ₹2,999 per filing or ₹29,999 per project per year |
| Demand letters, collections, buyer app | Buildesk, Sell.Do post-sales, StrategicERP customer app, Farvision | Buildesk ≈₹1,000/user/month; StrategicERP ₹4,000/user/month; Sell.Do quote-only |
| Accounts, GST | Tally / Busy | Tally Silver ₹22,500 one-time (+₹4,500/yr) |
| Everything in between | Excel and WhatsApp | Staff time |

**The gap:** compliance tools don't send demand letters, post-sales tools don't file RERA, and neither turns a milestone into both. The CA does the RERA certificates but depends on data the developer has no system to produce.

## 7. What this means for the product

- **Wedge:** one milestone record per project/tower ("slab 7 done, architect signed"), producing (1) demand letters for every buyer on that stage, with GST and the TDS note, (2) the bank disbursement pack for loan buyers, (3) the numbers for Forms 1/2/3 and the QPR, ready for the CA to certify, (4) a buyer update. Plus a deadline calendar (QPR, Form 5, extension, OC).
- **Entry offer for stuck projects:** restore from abeyance (diagnosis free, restoration at a fixed fee). The market anchor is ~₹50,000 per extension/registration job (RERA Vision's discounted price).
- **The CA's seat:** a login to review and certify, so the CA spends less time chasing and recommends us.

## 8. Questions only the calls can answer

1. Who in the firm makes demand letters, how long does each round take, and how late do they go out?
2. How many buyers are on loans, and how long do bank disbursements take per stage? What causes the delays?
3. How do they track who has paid and who is overdue? Do they charge late interest?
4. Who prepares the QPR: their CA, a consultant or staff? What do they pay per quarter?
5. How often do withdrawals from the 70% account stall, and why?
6. (Stuck projects) Is the project actually finished (paperwork only) or still under construction? What has the abeyance cost them so far?
7. What software do they use today, and what did they stop using?
