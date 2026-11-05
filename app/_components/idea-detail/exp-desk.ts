// Deep dive for "Export money-and-compliance desk" (idea id exp-desk).
// Research done 5 Nov 2026: web sources below, plus analyses/exporters (collected 2 Nov 2026).

import type { IdeaDetail } from "./details";

export const EXP_DESK: IdeaDetail = {
  status: "Deep dive in progress",
  updated: "2026-11-05",
  summary:
    "Every export shipment leaves a trail of money to collect and boxes to tick: the buyer's payment must arrive within a deadline and be matched to the shipping bill in RBI's EDPMS, the eBRC must be generated, and RoDTEP, drawback and the IGST refund must be claimed. Exporters track this in Excel, banks charge per bill to fix it, and consultants take a success fee to chase refunds. The product is one row per shipping bill, from shipment to cash, with deadline alerts and the paperwork prepared. New RBI rules from 1 October 2026 cut the realisation period to 9 months, which makes tracking more urgent, but they also make closing small bills cheap, so the value has to come from deadlines and refunds rather than closure fees.",
  sections: [
    {
      id: "scale",
      title: "The money involved",
      facts: [
        { kind: "confirmed", text: "India's merchandise exports were US$441.78 billion in FY 2025-26, up 0.93% from US$437.70 billion; goods and services together about US$860 billion.", source: "Ministry of Commerce press release (Apr 2026)", url: "https://www.commerce.gov.in/ministryofcommerce/sites/default/files/d-m-y/PIBRelease.pdf" },
        { kind: "confirmed", text: "MSMEs made 48.55% of merchandise exports in 2024-25, up from 45.74% in 2023-24.", source: "Lok Sabha reply cited by IMPRI (2026)", url: "https://www.impriindia.com/insights/policy-update/trade-connect-e-platform-information/", caveat: "Seen in a secondary write-up; reply text not read." },
        { kind: "confirmed", text: "RoDTEP had about ₹18,232 crore in FY 2025-26. The FY 2026-27 Budget gave ₹10,000 crore; the Commerce Ministry asked for ₹23,000 crore and a five-year extension.", source: "Angel One; Plutus IAS", url: "https://www.angelone.in/news/economy/commerce-ministry-proposes-23-000-crore-rodtep-outlay-for-fy27-seeks-five-year-extension", caveat: "News reports, not the Budget documents." },
        { kind: "confirmed", text: "By December 2019 CBIC had paid over ₹1.12 lakh crore of IGST refunds to more than 83,500 exporters.", source: "BloombergQuint / CBIC", url: "https://www.bloombergquint.com/business/igst-refunds-worth-rs-1-12-lakh-cr-paid-to-exporters-cbic", caveat: "Latest cumulative figure found; no FY 2025-26 total located." },
      ],
    },
    {
      id: "law",
      title: "The rules, as of November 2026",
      lead: "RBI replaced its 2015 export regulations on 1 October 2026. Several figures changed within weeks, so every number below should be checked against the RBI text before it goes into the product.",
      facts: [
        { kind: "confirmed", text: "New regulations: Foreign Exchange Management (Export and Import of Goods and Services) Regulations, 2026, notification FEMA 23(R)/2026-RB of 13 January 2026, in force from 1 October 2026.", source: "LEXI; TaxGuru", url: "https://www.lexiplatform.com/articles/money-home/rbi-export-import-regulations-1-october-2026-what-changed" },
        { kind: "confirmed", text: "Realisation period: 9 months from shipment for goods (from the invoice date for services; from the sale date for overseas-warehouse goods), or 12 months if invoiced or settled in rupees. Set by the amendment FEMA 23(R)/(1)/2026-RB of 22 September 2026.", source: "LEXI; TaxGuru (Oct 2026); CorpLaw Updates", url: "https://www.corplawupdates.in/updates/fema-export-realisation-period-9-months-first-amendment-2026", caveat: "Before this, the January 2026 text and a November 2025 amendment gave 15 months (18 for rupee trade); some October articles still quote 15. RBI notification not read directly." },
        { kind: "confirmed", text: "The exporter's bank (AD bank) can extend the period on request with reasons; the regulations set no cap. Banks must publish their extension policy.", source: "LEXI", url: "https://www.lexiplatform.com/articles/money-home/rbi-export-import-regulations-1-october-2026-what-changed" },
        { kind: "confirmed", text: "If proceeds stay unrealised more than one year past the due date (or extension), the exporter may ship only against full advance payment or an irrevocable letter of credit.", source: "LEXI; TaxGuru; KPMG flash", url: "https://www.lexiplatform.com/articles/money-home/rbi-export-import-regulations-1-october-2026-what-changed" },
        { kind: "confirmed", text: "EDPMS closure for small bills: a shipping bill or services invoice up to ₹10 lakh can be closed on the exporter's own declaration, singly or in a quarterly bulk declaration. The limit is per bill, not per unpaid balance.", source: "TaxGuru (17 Oct 2026)", url: "https://taxguru.in/finance/rbi-edpms-rs-10-lakh-export-bill-closure-2026-declarations-realisation-gst-accounting.html" },
        { kind: "confirmed", text: "Short payment or no payment on a bill up to ₹10 lakh can also be accepted on the exporter's declaration; above ₹10 lakh the bank must accept the reasons.", source: "TaxGuru; LEXI", url: "https://taxguru.in/finance/rbi-edpms-rs-10-lakh-export-bill-closure-2026-declarations-realisation-gst-accounting.html" },
        { kind: "confirmed", text: "Services exporters must file the export declaration (EDF) within 30 days from the end of the invoice month; one monthly EDF can cover all invoices.", source: "LEXI; TaxGuru; KPMG flash", url: "https://www.lexiplatform.com/articles/money-home/rbi-export-import-regulations-1-october-2026-what-changed" },
        { kind: "confirmed", text: "eBRC: since 15 November 2023 exporters generate eBRCs themselves on the DGFT portal by matching bank-sent inward remittances (IRMs) to shipping bills (Trade Notice 33/2023-24).", source: "TaxScan", url: "https://www.taxscan.in/dgft-notifies-launch-of-revamped-electronic-bank-realisation-certificate-ebrc-system-for-self-certification-by-exporters/341608" },
        { kind: "confirmed", text: "RoDTEP is extended to 31 December 2026 for DTA, Advance Authorisation, SEZ and EOU exports, at unchanged rates (DGFT Notification 41/2026-27, 30 September 2026). Nothing is notified beyond that date.", source: "TaxGuru; TaxScan", url: "https://taxguru.in/dgft/rodtep-scheme-extended-december-31-2026-dta-aa-sez-eou-exports.html" },
        { kind: "confirmed", text: "RoDTEP is credited as an e-scrip in the exporter's ICEGATE ledger; it can be used to pay import duty or transferred to another IEC holder. Validity was one year from generation under Customs Circular 23/2021.", source: "Customs Circular 23/2021 via TaxGuru", url: "https://taxguru.in/?p=789287", caveat: "Some guides say a 2022 change made it two years; check the current ledger regulations." },
        { kind: "confirmed", text: "IGST refunds on exports are paid automatically from the shipping bill, but any mismatch blocks them. SB005 (invoice in the shipping bill differs from GSTR-1) is the most common error; the shipping bill cannot be amended after the EGM is filed.", source: "VJM Global; TaxGuru", url: "https://www.vjmglobal.com/blog/refund-for-invoice-mismatch-cases" },
        { kind: "confirmed", text: "Exporting without IGST needs a Letter of Undertaking (LUT, form RFD-11) filed every financial year; without it, IGST is due on the export and has to be claimed back.", source: "Tally; TaxScan", url: "https://tallysolutions.com/gst/lut-filing-guide-exporters-gst/" },
      ],
    },
    {
      id: "fees",
      title: "What banks charge per shipping bill",
      lead: "From the banks' own schedules of charges. Excludes GST.",
      facts: [
        { kind: "confirmed", text: "SBI (from 1 Oct 2026): export bill handling where documents go directly to the buyer, ₹500 flat per shipping bill for export-credit customers; for others 0.12% of the bill, minimum ₹500, maximum ₹20,000 per shipping bill. Extension or write-off ₹50 per bill up to ₹10 lakh, ₹1,000 above. e-BRC free.", source: "SBI schedule of forex charges, 01.10.2026", url: "https://sbi.bank.in/documents/16012/22770835/01102026_FOREIGN+EXCHANGFE+TRANSACTION+RELATED+SERVICEW+CHARGES.pdf" },
        { kind: "confirmed", text: "Bandhan Bank (Jul 2026): regularisation ₹100 flat per shipping bill up to ₹10 lakh, 0.05% (min ₹1,000) above; extension ₹500; write-off ₹1,000–1,200; e-BRC ₹100; follow-up charge ₹500 per quarter for shipping bills not regularised beyond 270 days.", source: "Bandhan Bank trade finance charges, 07.07.2026", url: "https://bandhan.bank.in/sites/default/files/2026-07/Schedule-of-Charges-for-Trade-Finance-07072026.pdf" },
        { kind: "confirmed", text: "Union Bank: closure of small shipping bills on self-declaration ₹25 per bill up to ₹1 lakh and ₹100 per bill up to ₹10 lakh; write-off approval free up to ₹10 lakh.", source: "Union Bank forex service charges", url: "https://www.unionbankofindia.bank.in/pdf/service-charges-foreign-exchange-transaction.pdf", caveat: "Effective date not stated in the PDF." },
        { kind: "confirmed", text: "HDFC Bank: export bill regularisation 0.0625% (min ₹1,500); BRC ₹150 per shipping bill; extension ₹1,000; write-off ₹1,000 plus 0.25% commission (min ₹2,000).", source: "HDFC export trade fees page", url: "https://v.hdfcbank.com/htdocs/amp/sme/trade/export-trade-services/fees-and-charges.html", caveat: "Page headed 2014 and 2021 revisions; may be out of date." },
        { kind: "confirmed", text: "Under the 2026 regulations a bank may not charge an exporter a penalty for the exporter's own regulatory delay.", source: "LEXI (regulation 19(3))", url: "https://www.lexiplatform.com/articles/money-home/rbi-export-import-regulations-1-october-2026-what-changed" },
        { kind: "confirmed", text: "Customs charges ₹1,000 per shipping bill to process an SB005 IGST-refund correction through the alternative mechanism.", source: "Customs public notice (2024), via VJM Global", url: "https://www.vjmglobal.com/blog/refund-for-invoice-mismatch-cases", caveat: "Applies to specific shipping-bill periods named in circulars." },
      ],
    },
    {
      id: "demand",
      title: "What our research found",
      lead: "From the exporters analysis (analyses/exporters, collected 2 Nov 2026: 1,189 ads, 9,015 YouTube comments, 1,296 Google suggestions, 856 Reddit posts).",
      facts: [
        { kind: "our-data", text: "Reddit: a bank demanded closure of \"50 lakh worth of open shipping bills… Rs 400 per shipping bill… That is 16% of my turnover\" (⬆1,168); \"Closure of shipping bills (Rs 200 to Rs 1000 per bill)\" (⬆43).", caveat: "Posts predate the October 2026 ₹10 lakh declaration route, which makes small-bill closure much cheaper." },
        { kind: "our-data", text: "YouTube: 70 comments about eBRC and EDPMS (\"My 5 shipping bills are pending in EDPMS… bank is not clearing\") and 89 about RoDTEP (\"how to look… is that we receiving RoDTEP or not\")." },
        { kind: "our-data", text: "Google: 216 EDPMS/BRC autocomplete suggestions and 505 RoDTEP/drawback suggestions, 25 of them \"not received\" or \"pending status\"." },
        { kind: "our-data", text: "Reddit: \"How much Bribe do you pay for GST Refund\" (⬆77); \"₹15.77 lakh GST demand… because I never filed an LUT\" (⬆20)." },
        { kind: "our-data", text: "Meta: only 4 advertisers sell compliance or refund help to exporters (Axodian, Y2kexim, Mygstrefund, an export institute), against about 80 sellers of export courses." },
        { kind: "our-data", text: "Maps: 76% of exporters found in 5 hubs (Tiruppur, Surat, Moradabad, Ludhiana, Rajkot) have a website." },
      ],
    },
    {
      id: "market",
      title: "Market size",
      facts: [
        { kind: "confirmed", text: "The government's Trade Connect platform targets more than 6 lakh IEC holders.", source: "Lok Sabha reply (2026) cited by IMPRI", url: "https://www.impriindia.com/insights/policy-update/trade-connect-e-platform-information/", caveat: "IEC holders, not active exporters." },
        { kind: "confirmed", text: "FIEO says it represents over 2 lakh exporters directly and indirectly; third-party guides put its direct membership at about 30,000.", source: "FIEO", url: "https://fieo.org/view_section.php?lang=0&id=0%2C2596%2C2597" },
        { kind: "confirmed", text: "More than 83,500 exporters had received IGST refunds by December 2019, a floor for exporters who ship goods with tax paid.", source: "BloombergQuint / CBIC", url: "https://www.bloombergquint.com/business/igst-refunds-worth-rs-1-12-lakh-cr-paid-to-exporters-cbic" },
        { kind: "assumption", text: "About 1.5 lakh active goods exporters, of whom perhaps 40,000–60,000 ship often enough (5+ shipping bills a month) to pay ₹8,000/month.", caveat: "pplab estimate. No published count of active exporters was found; DGFT's planned exporter performance index may give one." },
      ],
    },
  ],
  competitors: [
    { product: "Axodian OneCompliance", what: "EDPMS reconciliation and closure, eBRC from DGFT APIs, shipping bill validation, AA/EPCG tracking; for exporters with 5+ shipments a month. No RoDTEP or IGST features listed.", price: "Free during beta; later price not public", source: "axodian.com (read 5 Nov 2026)", url: "https://www.axodian.com/export-compliance-edpms-ebrc" },
    { product: "Seasaw AI", what: "Shipping bills to EDPMS, settlements to eBRC, IGST refund (ICEGATE-GSTN matching); aimed at e-commerce and D2C exporters", price: "₹18,000/month listed (same listing also says $200/month); 7-day trial", source: "SoftwareSuggest listing (Feb 2026)", url: "https://www.softwaresuggest.com/seasaw-ai" },
    { product: "EXIM Shift (FnShift)", what: "RoDTEP, RoSCTL, drawback, EPCG and AA tracking; ICEGATE–ERP reconciliation; claims 30+ enterprises and ₹50 Cr+ recovered", price: "Custom pricing", source: "fnshiftsolutions.com", url: "https://www.fnshiftsolutions.com/exim-shift" },
    { product: "OptiEXIM (Innoval)", what: "SAP add-on: export documents, ICEGATE filing, incentives, realisation; 300+ enterprises (Welspun, Dr. Reddy's)", price: "Not public (demo)", source: "ivldsp.com", url: "https://ivldsp.com/products/optiexim/" },
    { product: "Legal Suvidha", what: "Managed RoDTEP/RoSCTL claims, eBRC and FIRC reconciliation (service, not software)", price: "From ₹6,999 for up to 12 shipping bills/month; then retainer or per bill; success fee on scrip sale", source: "legalsuvidha.com", url: "https://legalsuvidha.com/services/export-incentive-claims-rodtep-rosctl" },
    { product: "Y2K Exim, Mygstrefund", what: "Consultants for stuck IGST refunds (SB001–SB009 errors) and incentives", price: "Success fee; % not public", source: "y2kexim.com; Meta ads", url: "https://www.y2kexim.com/" },
    { product: "AD banks", what: "EDPMS closure, extension, write-off, eBRC", price: "₹25–₹20,000 per shipping bill depending on bank and value (see fees above)", source: "Bank schedules of charges" },
    { product: "Skydo", what: "Receives export payments, auto FIRA; no shipping-bill tracking", price: "$19/payment up to $2K, $29 up to $10K, 0.3% above", source: "Published", url: "https://www.skydo.com/compare/skydo-vs-payoneer" },
  ],
  product: {
    features: [
      "One row per shipping bill, imported from ICEGATE downloads or the CHA's files: value, buyer, port, LEO date.",
      "Realisation clock on every bill (9 months, or 12 for rupee trade) with alerts at 6, 8 and 9 months and a ready extension request for the bank.",
      "Pull IRMs through the DGFT eBRC API (exporter-authorised) and match them to bills; generate eBRCs in bulk.",
      "Prepare the quarterly ₹10 lakh EDPMS declaration and the reduction declarations, so small bills close for ₹25–100 instead of per-bill fees.",
      "RoDTEP and drawback: expected vs credited per bill, scrip balance and expiry, and a list of buyers for unused scrips.",
      "IGST refund status per bill with the SB error code explained and the fix (GSTR-1 amendment or concordance).",
      "Yearly LUT and services EDF (30-day) reminders; CA and CHA logins.",
    ],
    pricing: [
      { kind: "assumption", text: "₹8,000/month to start (up to 100 shipping bills/month), ₹4,000 for up to 20; ₹20,000/month after expansion (documents, buyer-payment tracking, multiple entities and banks)." },
      { kind: "assumption", text: "For ₹50 Cr/year: 5,209 customers at ₹8,000 (3.5% of ~1.5 lakh) or 2,084 at ₹20,000 (1.4%)." },
      { kind: "assumption", text: "Price check: Seasaw is listed at ₹18,000/month and Legal Suvidha's service starts at ₹6,999, so ₹8,000 sits between a done-for-you service and the dearest listed software." },
      { kind: "assumption", text: "Option to test: a lower fee plus a share of RoDTEP and IGST refunds recovered that were stuck." },
    ],
  },
  openQuestions: [
    "With small bills now closed by declaration for ₹25–100, is EDPMS closure still a pain worth paying for, or only for bills above ₹10 lakh?",
    "Does the cut to a 9-month realisation period create real deadline stress, especially for exporters with 90–180 day buyer terms?",
    "Will exporters authorise our software on the DGFT eBRC API, and is there any ICEGATE access beyond manual downloads?",
    "Will RoDTEP survive past 31 December 2026, and at what rates? Budget support fell from ₹18,232 crore to ₹10,000 crore.",
    "How many exporters ship 5+ bills a month? That decides the real market, not the 6 lakh IEC count.",
    "Who buys: the owner, the accountant, or the CA who handles 20 exporters? CA-led sales may be the cheaper channel.",
    "How fast are Axodian (free in beta) and Seasaw growing, and what do their users complain about?",
  ],
  nextSteps: [
    { text: "Research the rules, bank charges, competitors and market (this page).", done: true },
    { text: "Read the RBI notifications (FEMA 23(R)/2026-RB and the 22 Sep 2026 amendment) and DGFT Notification 41/2026-27 directly.", done: false },
    { text: "Register for the DGFT eBRC API sandbox and list what data it returns; check ICEGATE download formats.", done: false },
    { text: "Try Axodian (free beta) and Seasaw (7-day trial) as a user.", done: false },
    { text: "Build an exporter contact list from Maps (Tiruppur, Surat, Moradabad, Rajkot, Ludhiana) and email 50, as for MSME receivables.", done: false },
    { text: "Interview 5 exporters and 3 CAs on realisation deadlines, RoDTEP and IGST refunds.", done: false },
  ],
};
