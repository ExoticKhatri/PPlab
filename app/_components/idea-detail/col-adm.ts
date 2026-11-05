// Deep dive for "Admissions conversion CRM" for private colleges (idea id col-adm).
// Research done 5 Nov 2026: web sources below, plus analyses/private-colleges (collected 2 Nov 2026).

import type { IdeaDetail } from "./details";

export const COL_ADM: IdeaDetail = {
  status: "Deep dive in progress",
  updated: "2026-11-05",
  summary:
    "Private colleges live on tuition fees, so every unfilled seat is lost revenue. They buy enquiries from Google, Meta and portals like Shiksha and Collegedunia, then lose most of them to slow or missed follow-up: Meritto's data on 4.3 crore enquiries shows only about 1 in 100 enrolls, and same-day replies convert twice as well as replies after a week. An admissions CRM gives every enquiry an owner, a call and a WhatsApp follow-up, and shows which source and counsellor actually produce admissions. Colleges clearly pay for this (Meritto averages ₹9.8 lakh per customer a year), but the market is crowded, so a newcomer needs a sharp angle.",
  sections: [
    {
      id: "problem",
      title: "The problem, in numbers",
      facts: [
        { kind: "confirmed", text: "Across 4.3 crore student enquiry journeys, only 1.06% of leads became enrolments; digital channels averaged 0.94%.", source: "Meritto Enrollment Index 2026 (Jul 2026)", url: "https://www.meritto.com/blog/the-enrollment-index-2026-what-changed-and-what-it-means-for-indian-higher-education/", caveat: "Vendor research by the market leader; method not published." },
        { kind: "confirmed", text: "Institutions that reply on the same day convert at 2× the rate of those that reply after a week; leads that got at least one successful call converted at 2.29% vs 0.75% for leads never reached.", source: "Meritto Enrollment Index 2026", url: "https://www.meritto.com/blog/the-enrollment-index-2026-what-changed-and-what-it-means-for-indian-higher-education/" },
        { kind: "confirmed", text: "Students who enquire again are 14% of leads but 40% of enrolments, converting at 3.00% vs 0.74% for first-time enquirers.", source: "Meritto Enrollment Index 2026", url: "https://www.meritto.com/blog/the-enrollment-index-2026-what-changed-and-what-it-means-for-indian-higher-education/" },
        { kind: "confirmed", text: "Digital channels brought 71.78% of leads but 61.55% of enrolments; the top five paid platforms together gave 20.03% of enrolments (Google 10.13%, Shiksha 3.84%, Collegedunia 3.47%, CollegeDekho 1.81%, GetMyUni 0.78%).", source: "Meritto Enrollment Index 2025 (Feb 2025)", url: "https://nopaperforms.com/press-release/new-delhi-february-12-2025-as-indias-education-sector-undergoes-a-rapid-digital-transformation-merittos-industry-first-enrollment-index-2025-reveals-that-digital-chann" },
        { kind: "confirmed", text: "From 2019-20 to 2023-24, 64.9 lakh undergraduate engineering seats were sanctioned but only 45.5 lakh filled: about 30% empty. AICTE closed 58 engineering and technical colleges in 2025-26, almost all private.", source: "ThePrint; Telangana Today", url: "https://theprint.in/india/education/indias-engineering-courses-are-losing-their-sheen-low-enrolment-placement-rates-present-grim-picture/2538476", caveat: "Engineering only; other courses not measured." },
        { kind: "confirmed", text: "Undergraduate enrolment fell by 93,000 (0.27%) between 2022-23 and 2023-24 even as total enrolment grew to 4.50 crore.", source: "The Wire, on AISHE 2023-24", url: "https://m.thewire.in/article/education/enrolment-of-students-in-undergraduate-programmes-decline-in-india-aishe-findings" },
        { kind: "confirmed", text: "Colleges buy leads by the lead (CPL) or pay per admission: Collegedunia and Shiksha sell leads; CollegeDekho mainly takes a share of fees per admitted student.", source: "StartupTalky; business-model write-ups", url: "https://startuptalky.com/collegedunia-startup-story/", caveat: "Per-lead prices are not published; agencies quote ₹150–800 per Meta lead and ₹5,000–8,000 per admission (unverified)." },
      ],
    },
    {
      id: "demand",
      title: "What our research found",
      lead: "From the private colleges analysis (analyses/private-colleges, collected 2 Nov 2026: 1,107 Meta ads, 1,214 Maps reviews, 1,737 Google suggestions).",
      facts: [
        { kind: "our-data", text: "Meta: Meritto ran 41 ads, the longest for 96 days (\"Generic CRMs were never designed for… student recruitment\"); MCB ran 10 (\"Enquiries are coming in. Admissions aren't.\")." },
        { kind: "our-data", text: "Meta: a long tail of agencies and small CRMs sells the same pain: Dumosh (ad running 139 days: \"Your admission team is bleeding money after the lead comes in\"), Mediagarh (92 days: \"ads bring leads, not admissions\"), Sphyx, BrainMine, HelloGrowth (₹899/user/month), Educrafters, Anantya.ai." },
        { kind: "our-data", text: "Meta: 90 ads from 35 institutions advertise their NAAC grade, so colleges market themselves hard." },
        { kind: "our-data", text: "Maps: of 1,201 one- and two-star reviews, 179 mention admission, 39 complain of false promises or being misled, and 36 say nobody answers calls (\"No one attends the call. Specially admission cell.\")." },
        { kind: "our-data", text: "Google: 113 admission-related suggestions, including \"admission crm\", \"college admission crm\" and \"student admission crm\"." },
        { kind: "our-data", text: "Maps: median college has 863 Google reviews but owners reply to only 10%." },
      ],
    },
    {
      id: "market",
      title: "Market size",
      facts: [
        { kind: "confirmed", text: "AISHE 2023-24 registered 1,289 universities and 48,246 colleges; higher-education enrolment was 4.50 crore.", source: "AISHE 2022-23 and 2023-24 reports (released 8 Jul 2026), via Careers360", url: "https://news.careers360.com/aishe-2023-24-higher-education-enrolment-reaches-4-50-crore-female-enrolment-rises-42-percentage-since-2014-15" },
        { kind: "confirmed", text: "In AISHE 2021-22, private unaided colleges were 65.2% of colleges and 44.6% of enrolment; there were 392 state private universities (up from 263 in 2017-18).", source: "AISHE 2021-22; Lok Sabha answer", url: "https://education.gov.in/sites/upload_files/mhrd/files/statistics-new/AISHE%20Book_2021-22_4.pdf" },
        { kind: "assumption", text: "About 31,000 private unaided colleges in 2023-24 (65% of 48,246), plus ~400 private universities.", caveat: "Applies the 2021-22 share to the 2023-24 count." },
        { kind: "assumption", text: "Only colleges that recruit students directly need a CRM. Many fill seats through state counselling (engineering, medical), and small affiliated degree colleges have no counselling team. Perhaps 8,000–12,000 colleges run real enquiry funnels.", caveat: "pplab estimate; to test by sampling colleges' websites for enquiry forms and counsellor numbers." },
      ],
    },
    {
      id: "rules",
      title: "Rules that shape the product",
      facts: [
        { kind: "confirmed", text: "DPDP Rules were notified on 14 November 2025; most obligations apply from about 14 May 2027. Consent, notice and erasure apply to every student enquiry.", source: "EY; Mondaq", url: "https://www.ey.com/en_in/insights/cybersecurity/transforming-data-privacy-digital-personal-data-protection-rules-2025" },
        { kind: "confirmed", text: "Data of anyone under 18 needs verifiable parental consent. Educational institutions are exempt only for purposes listed in the Rules, so marketing to under-18 school leavers may still need it.", source: "Mondaq; ORF", url: "https://www.mondaq.com/india/data-protection/1775140/from-draft-to-reality-key-changes-in-indias-dpdp-rules-2025", caveat: "Check the Fourth Schedule's exact purposes." },
        { kind: "confirmed", text: "TRAI (Feb 2025): promotional calls must come from the 140 series and service calls from 1600; ordinary 10-digit numbers are barred for commercial calls; repeat violators lose outgoing service.", source: "TRAI press release 11/2025", url: "https://cms.trai.gov.in/sites/default/files/2025-02/PR_No.11of2025.pdf", caveat: "Penalty details from secondary sources." },
        { kind: "confirmed", text: "WhatsApp Business API in India costs about ₹0.86 per marketing message and ₹0.115 per utility message (plus 18% GST); replies within the customer's 24-hour window are free.", source: "Provider rate guides (2026)", url: "https://chatmaxima.com/whatsapp-api-pricing/india/", caveat: "Meta's own rate card not read; providers add markups." },
      ],
    },
  ],
  competitors: [
    { product: "Meritto (NoPaperForms)", what: "Education CRM, applications, Collexo fee payments; universities, colleges, schools. FY26 revenue ₹115.6 Cr, profit ₹11.9 Cr, 1,183 customers (91.2% of revenue from India); filed for a ₹375 Cr+ IPO", price: "Not public; average ₹9.8 lakh per customer per year (≈₹82,000/month)", source: "Inc42 on the UDRHP (Sep 2026)", url: "https://inc42.com/buzz/meritto-parent-nopaperforms-files-updated-drhp-for-%e2%82%b9375-cr-ipo/" },
    { product: "LeadSquared", what: "Sales CRM with a big education vertical (~20% of revenue, per its COO); FY25 revenue ₹326 Cr", price: "₹2,500 / ₹5,000 per user/month, billed yearly", source: "Published pricing; Inc42", url: "https://www.leadsquared.com/sales-crm-pricing/" },
    { product: "Salesforce Education Cloud", what: "Recruitment and admissions for large universities (BITS, REVA, ISB)", price: "$87–363 per user/month, yearly contract", source: "Published pricing", url: "https://www.salesforce.com/in/education/pricing/" },
    { product: "ExtraaEdge", what: "Admissions CRM for Indian institutions", price: "About $30–31 per user/month (directory listings); custom in India", source: "Capterra; SourceForge", url: "https://www.capterra.com/p/184015/ExtraaEdge/" },
    { product: "MCB Admission CRM / HigherEd", what: "Admissions CRM inside a college ERP", price: "Not public; 40-day free trial", source: "Meta ads; mcbapp.com" },
    { product: "TeleCRM", what: "Generic calling CRM with lead capture from ads and portals", price: "₹799/user/month yearly, ₹1,099 quarterly; WhatsApp setup ₹1,999", source: "Published pricing", url: "https://www.telecrm.in/pricing" },
    { product: "HelloGrowth, Sphyx, BrainMine IMS", what: "Small enquiry CRMs for coaching and institutes", price: "HelloGrowth ₹899/user/month + GST; others not public", source: "Meta ads" },
    { product: "Agencies (Dumosh, Mediagarh, Educrafters, Intent Farm)", what: "Lead generation plus CRM setup and counselling process", price: "Not public; Educrafters says it manages ₹2.2 lakh+ ad spend a day", source: "Meta ads; educrafters.in", url: "https://www.educrafters.in" },
    { product: "Lead portals (Shiksha, Collegedunia, CollegeDekho)", what: "Sell enquiries per lead or take a share per admission", price: "Not published", source: "Business-model write-ups", url: "https://startuptalky.com/collegedunia-startup-story/" },
  ],
  product: {
    features: [
      "Capture every enquiry (website, Meta, Google, Shiksha/Collegedunia exports, walk-ins, calls) into one list without duplicates.",
      "Speed-to-lead: auto-assign to a counsellor, a WhatsApp reply within a minute, and a call task the same day; alerts for any enquiry untouched by evening.",
      "Re-enquiry detection: flag a returning student to the original counsellor, since they convert about 4× better.",
      "Calling from 140/1600-compliant numbers with recording, and DPDP consent captured on every form.",
      "Source-to-admission report: cost per admission by portal and campaign, so the college stops paying for leads that never enroll.",
      "Counsellor scorecard: response time, calls, applications and fee-paid admissions per person.",
      "Later: application form and fee collection, then hand-off to the college ERP.",
    ],
    pricing: [
      { kind: "assumption", text: "₹25,000/month for a college with up to 10 counsellors (a LeadSquared team of 10 costs ₹25,000–50,000; Meritto averages ≈₹82,000)." },
      { kind: "assumption", text: "A ₹10,000/month starter for small colleges with 2–3 counsellors, the segment Meritto and Salesforce price out." },
      { kind: "assumption", text: "For ₹50 Cr/year: 1,667 colleges at ₹25,000 (5.6% of ~29,700; ~15–20% of the 8,000–12,000 that run enquiry funnels). Meritto, after 9 years, has roughly 1,100 customers in India across all segments." },
      { kind: "assumption", text: "Value check: a college charging ₹1 lakh a year that converts 1.06% of 20,000 enquiries enrolls 212 students; lifting that to 1.3% adds 48 students, about ₹48 lakh of first-year fees." },
    ],
  },
  openQuestions: [
    "Which colleges actually run enquiry funnels (management quota, private universities, B-schools, nursing, pharmacy) and how many are there?",
    "Why would a college switch from Meritto, LeadSquared or ExtraaEdge? Price, simplicity, regional language, or results-based pricing?",
    "Will colleges pay per admission instead of per seat? That aligns with how they already pay CollegeDekho.",
    "How many counsellors does a typical private college have, and who owns the budget: the owner, the registrar or the marketing head?",
    "How will DPDP (from May 2027) and parental consent for under-18s change lead buying from portals?",
    "Admissions are seasonal (roughly Nov–Aug); will colleges pay all year?",
  ],
  nextSteps: [
    { text: "Research competitors, market size, rules and conversion data (this page).", done: true },
    { text: "Read Meritto's DRHP for customer mix, churn and pricing by segment.", done: false },
    { text: "Sample 100 private colleges' websites in 5 cities: enquiry forms, WhatsApp, counsellor numbers, CRM in use.", done: false },
    { text: "Mystery-shop 30 colleges: submit an enquiry and time the first call and WhatsApp reply.", done: false },
    { text: "Interview 5 admission heads at mid-size colleges on what they use and what it costs.", done: false },
    { text: "Decide the angle: small-college starter, results-based pricing, or skip in favour of the accreditation desk.", done: false },
  ],
};
