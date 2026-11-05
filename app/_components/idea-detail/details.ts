// Deep-dive content for ideas on the Ideas ranked tab, shown at /ideas/<id>.
// Every fact carries its kind: "confirmed" (official source, news or published
// price, with a link), "our-data" (counted by our collectors, see analyses/), or
// "assumption" (our estimate or proposal, not yet verified).

import { EXP_DESK } from "./exp-desk";

export type FactKind ="confirmed" | "our-data" | "assumption";

export interface Fact {
  text: string;
  kind: FactKind;
  source?: string;
  url?: string;
  caveat?: string;
}

export interface FactSection {
  id: string;
  title: string;
  lead?: string;
  facts: Fact[];
}

export interface PriceRow {
  product: string;
  what: string;
  price: string;
  source: string;
  url?: string;
}

export interface IdeaDetail {
  status: string;
  updated: string;
  summary: string;
  sections: FactSection[];
  competitors: PriceRow[];
  product: { features: string[]; pricing: Fact[] };
  openQuestions: string[];
  nextSteps: { text: string; done: boolean }[];
}

const MSME_RECV: IdeaDetail = {
  status: "Deep dive in progress",
  updated: "2026-11-03",
  summary:
    "Small manufacturers sell to bigger companies and wait months to be paid. Indian law already says buyers must pay micro and small suppliers within 45 days, with penalty interest and a lost tax deduction if they don't. Yet only 14,814 cases had reached the government's dispute portal by March 2026. The product tracks every invoice against the 45-day clock and turns the law into reminders, notices and filings.",
  sections: [
    {
      id: "problem",
      title: "The problem, in numbers",
      facts: [
        { kind: "confirmed", text: "₹7.34 lakh crore of payments to MSMEs were delayed as of March 2024 (inflation-adjusted), down from ₹8.27 lakh crore in 2023 and a ₹10.7 lakh crore peak estimate in 2022.", source: "GAME Delayed Payments Report 3.0 (Nov 2025), via Free Press Journal", url: "https://www.freepressjournal.in/business/quantum-of-delayed-payments-to-msmes-steadily-declines-to-734-lakh-crore-roars-positive-impact-of-policy-measures" },
        { kind: "confirmed", text: "The Economic Survey 2025-26 put delayed payments at ₹8.1 lakh crore, calling them a constraint on MSME growth.", source: "KNN India", url: "https://knnindia.co.in/news/newsdetails/msme/economic-survey-flags-delayed-payments-lack-of-access-to-formal-credit-as-key-challenges-for-msmes", caveat: "Different method from the GAME estimate; treat as a second estimate, not a trend." },
        { kind: "confirmed", text: "Nearly 40% of delayed dues are owed by government agencies and PSUs; micro and small enterprises carry most of the burden.", source: "GAME report, via Storyboard18", url: "https://storyboard18.com/how-it-works/delayed-payments-to-msmes-fall-to-rs-7-34-lakh-crore-report-84822.htm" },
        { kind: "confirmed", text: "Indian MSMEs wait 73 days on average for invoice payments.", source: "Recordent report, via MediaBrief", url: "https://mediabrief.com/recordent-report-highlights-working-capital-stress-for-indian-smes-as-average-overdue-receivables-cross-%E2%82%B93-83-crore/" },
        { kind: "confirmed", text: "Pending applications on the government's MSME Samadhaan portal involved ₹31,039 crore as of December 2025.", source: "KNN India (Dec 2025)", url: "https://knnindia.co.in/news/newsdetails/msme/govt-strengthens-msme-payment-resolution-with-samadhaan-portal-161-facilitation-councils-shobha-karandlaje", caveat: "Figure seen in search results; primary portal dashboard not yet checked." },
      ],
    },
    {
      id: "law",
      title: "The law that gives suppliers leverage",
      lead: "These rules apply to micro and small enterprises registered on Udyam. Medium enterprises and traders are not covered.",
      facts: [
        { kind: "confirmed", text: "MSMED Act, section 15: the buyer must pay by the agreed date, which cannot be more than 45 days from acceptance; with no written agreement, within 15 days.", source: "iPleaders; LiveLaw", url: "https://blog.ipleaders.in/msme-samadhaan-delayed-payment-recovery/" },
        { kind: "confirmed", text: "MSMED Act, section 16: a late buyer owes compound interest at three times the RBI bank rate, with monthly rests. It cannot be waived by contract.", source: "LiveLaw", url: "https://www.livelaw.in/law-firms/law-firm-articles-/the-stringency-of-interest-provisions-under-msmed-act-implementation-and-judicial-interpretation-310929", caveat: "Current RBI bank rate to be checked before quoting a percentage." },
        { kind: "confirmed", text: "Income Tax section 43B(h) (Finance Act 2023): a buyer who pays a micro or small supplier after the 15/45-day limit can deduct that expense only in the year it is actually paid.", source: "ClearTax; Taxmann", url: "https://cleartax.in/s/section-43bh-of-income-tax-act", caveat: "Sources differ on whether it applies from FY 2023-24 or 1 April 2024." },
        { kind: "confirmed", text: "43B(h) does not cover medium enterprises, traders, or buyers on presumptive taxation (sections 44AD/44ADA/44AE).", source: "TaxGuru; ClearTax", url: "https://taxguru.in/income-tax/analysis-section-43b-h-income-tax-act-1961.html" },
        { kind: "confirmed", text: "Under the Income-tax Act, 2025, the same rule moves to section 37(2)(g) from tax year 2026-27.", source: "Single secondary source", caveat: "Needs confirming from the Act text." },
        { kind: "confirmed", text: "Companies must file Form MSME-1 with the MCA every half-year (by 31 October and 30 April) when they owe micro or small suppliers for more than 45 days, supplier by supplier, with PAN.", source: "ClearTax; Tally help", url: "https://cleartax.in/s/form-msme-1" },
        { kind: "confirmed", text: "Every company with turnover above ₹250 crore, and every central PSU, had to join a TReDS invoice-discounting platform by 31 March 2025 (S.O. 4845(E), 7 Nov 2024; earlier threshold ₹500 crore).", source: "Mondaq; KNN India", url: "https://www.mondaq.com/india/corporate-and-company-law/1579460/mandatory-treds-registration-for-companies-above-%e2%82%b9250-crore-turnover" },
      ],
    },
    {
      id: "enforcement",
      title: "How suppliers recover today",
      facts: [
        { kind: "confirmed", text: "The Ministry of MSME launched the MSME ODR (online dispute resolution) portal on 27 June 2025. From 15 October 2025, new delayed-payment cases can only be filed there; Samadhaan keeps only older cases.", source: "Xflow; Sansa Legal", url: "https://www.xflowpay.com/blog/msme-samadhaan-portal", caveat: "Ministry notice itself not yet read." },
        { kind: "confirmed", text: "As of 10 March 2026, 14,814 cases had been registered on the ODR portal and 26 resolved.", source: "Secondary source on the ODR portal", caveat: "Single source; check the portal's own figures." },
        { kind: "confirmed", text: "Enterprises registered as traders (NIC codes 45, 46, 47) cannot file delayed-payment cases.", source: "Guide to the ODR portal", url: "https://righttoinformation.wiki/msme-odr-portal-delayed-payment-complaint-2026" },
        { kind: "confirmed", text: "Five TReDS platforms are authorised: RXIL, M1xchange, Invoicemart, C2treds and DTX. By 31 March 2025, 1,35,093 MSME sellers and 7,937 corporate buyers had registered on the three older ones.", source: "IMPRI study", url: "https://www.impriindia.com/?p=75105" },
        { kind: "confirmed", text: "RXIL alone financed ₹80,457 crore of invoices in FY 2024-25; no platform-wide total is published.", source: "IMPRI study", url: "https://www.impriindia.com/?p=75105" },
      ],
    },
    {
      id: "demand",
      title: "What our research found",
      lead: "From the MSME manufacturers analysis (analyses/msme-manufacturers, collected 27 Oct 2026).",
      facts: [
        { kind: "our-data", text: "Google Trends: \"msme 45 days payment rule\" is a Breakout search, and \"msme payment rule\" rose 2,800%." },
        { kind: "our-data", text: "Reddit: \"Delivered ₹6.5 Cr defence order on time. Payment stuck.\" (⬆1,400); \"tricks big companies use to delay your payments\" (⬆221); \"recovered pending dues using the MSME Act\" (⬆134); 68 payment mentions." },
        { kind: "our-data", text: "Google: 285 MSME-loan searches, mostly about working capital." },
        { kind: "our-data", text: "YouTube: loans are promised but \"बैंक… नहीं देते\" (banks don't give them) — 👍357." },
        { kind: "our-data", text: "Meta: about 45 manufacturing-ERP vendors advertise to factories, but no software focused on MSME receivables appeared in 2,495 ads." },
        { kind: "our-data", text: "Maps: 84% of factories in 6 hubs have a website and 95% list a phone, so they are reachable directly." },
      ],
    },
    {
      id: "market",
      title: "Market size",
      facts: [
        { kind: "confirmed", text: "Udyam registrations passed 7.3 crore by the end of 2025 (all sizes and sectors).", source: "Ministry of MSME year-end review 2025", url: "https://www.aviation-defence-universe.com/year-end-review-2025-ministry-of-micro-small-medium-enterprises/" },
        { kind: "confirmed", text: "National Udyam data records about 1.83 crore manufacturing enterprises.", source: "IndiaStat", url: "https://www.indiastatdemographics.com/data/industries/growth-of-micro-small-and-medium-enterprises-msmes", caveat: "As-on date not stated; most are micro units too small to pay." },
        { kind: "assumption", text: "About 3 lakh owner-run factories (roughly 10–200 workers) that sell on credit to bigger buyers and could pay ₹5,000+/month.", caveat: "pplab estimate, unsourced. The next step is to size this from Udyam (small-category manufacturers) and TReDS seller counts." },
        { kind: "confirmed", text: "1,35,093 MSME sellers already use TReDS, a floor for suppliers who sell to large buyers on invoices.", source: "IMPRI study", url: "https://www.impriindia.com/?p=75105" },
      ],
    },
  ],
  competitors: [
    { product: "Credflow", what: "Receivables reminders from Tally (email, SMS, IVR)", price: "Lite ₹3,499/yr; Saver ₹6,999/yr; Tally Lite ₹4,999/yr", source: "Techjockey listings", url: "https://www.techjockey.com/detail/credflow" },
    { product: "TReDS platforms (RXIL, M1xchange, Invoicemart, C2treds, DTX)", what: "Sell an accepted invoice to a financier for early payment", price: "Not public (discount rate plus fees)", source: "Checked", url: "https://www.impriindia.com/?p=75105" },
    { product: "MSME ODR portal", what: "Government online dispute resolution for delayed payments", price: "Free", source: "Ministry of MSME", url: "https://www.xflowpay.com/blog/msme-samadhaan-portal" },
    { product: "TranZact (manufacturing ERP)", what: "Shows what factories pay for software, not a direct competitor", price: "₹8,333–30,000/mo (billed yearly)", source: "Published", url: "https://letstranzact.com/pricing" },
  ],
  product: {
    features: [
      "Read invoices and payments from Tally or Excel; every invoice gets a 15/45-day clock.",
      "Automatic reminders before and after the due date, on WhatsApp and email, citing section 15 and the interest owed under section 16.",
      "Show each buyer what the delay costs them: interest due and the 43B(h) deduction they lose.",
      "One-click legal notice, then a ready-to-file ODR portal case.",
      "Dashboard of money stuck by buyer, with ageing.",
      "Later: route accepted invoices to TReDS financiers, and check buyers' MSME-1 disclosures.",
    ],
    pricing: [
      { kind: "assumption", text: "₹5,000/month to start; ₹12,000/month after expansion (TReDS routing, multi-entity, CA access)." },
      { kind: "assumption", text: "For ₹50 Cr/year: 8,334 customers at ₹5,000 (2.8% of ~3 lakh); 3,473 at ₹12,000 (1.2%)." },
      { kind: "assumption", text: "An alternative to test: a small fee plus a share of money recovered after the due date." },
    ],
  },
  openQuestions: [
    "Will suppliers send firm reminders to buyers they depend on? (the main risk)",
    "How many target factories are Udyam-registered as micro or small, not medium? Only they are covered.",
    "Can invoices, due dates and receipts be read from Tally reliably (TDL, ODBC or exports)?",
    "Does a legal-notice and ODR flow actually speed up payment, given only 26 of 14,814 ODR cases were resolved by March 2026?",
    "What do TReDS platforms charge, and would they partner rather than compete?",
    "Does a buyer's 43B(h) exposure change behaviour in practice? CA and buyer interviews needed.",
  ],
  nextSteps: [
    { text: "Confirm the legal facts from primary sources (Act text, CBDT, Ministry ODR notice, RBI bank rate).", done: false },
    { text: "Size the market from Udyam (small-category manufacturers) and TReDS seller data.", done: false },
    { text: "Map competitors in depth: Credflow, Khatabook/Vyapar reminders, Tally add-ons, TReDS fees.", done: false },
    { text: "Check Tally integration options.", done: false },
    { text: "Write the interview script and pick 10–15 suppliers from the Maps and Meta data.", done: false },
    { text: "Decide go / no-go in analyses/msme-manufacturers/deep-dive.md.", done: false },
  ],
};

export const DETAILS: Record<string, IdeaDetail> = {
  "msme-recv": MSME_RECV,
  "exp-desk": EXP_DESK,
};
