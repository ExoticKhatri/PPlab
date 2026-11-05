// Deep dive for "Accreditation evidence desk: NAAC, NBA, NIRF from one record" (idea id col-accred).
// Research done 5 Nov 2026: web sources below, plus analyses/private-colleges (collected 2 Nov 2026).

import type { IdeaDetail } from "./details";

export const COL_ACCRED: IdeaDetail = {
  status: "Deep dive in progress",
  updated: "2026-11-05",
  summary:
    "To earn and keep NAAC accreditation, NBA programme accreditation and a NIRF rank, a college has to collect evidence all year from every department (faculty activities, events, research, feedback, placements, marks for outcome calculations) and pour it into different formats for each body. Faculty do this work by hand, usually in the IQAC cell. Only about a quarter of colleges hold NAAC accreditation today. NAAC is replacing grades with an Accredited / Not Accredited decision plus five maturity levels, moving colleges to online-only assessment, and the government plans a single 'One Nation One Data' upload. That makes clean, verifiable evidence more valuable, but accreditation is still voluntary and about nine software vendors already sell accreditation modules.",
  sections: [
    {
      id: "coverage",
      title: "How many are accredited",
      facts: [
        { kind: "confirmed", text: "11,829 institutions had completed their first NAAC cycle by 14 August 2025: 11,268 colleges and 561 universities. Grades: 2,533 A (21%), 7,850 B, 1,446 C.", source: "Careers360 (Oct 2025)", url: "https://news.careers360.com/naac-accreditation-grade-a-11829-university-college-cycle-1-sharp-rise-participation-online-rating-report-mmttc-2025" },
        { kind: "confirmed", text: "Repeat cycles thin out fast: 5,505 institutions reached a second cycle, 2,745 a third, 811 a fourth and 25 a fifth.", source: "Careers360 (Oct 2025)", url: "https://news.careers360.com/naac-accreditation-grade-a-11829-university-college-cycle-1-sharp-rise-participation-online-rating-report-mmttc-2025", caveat: "Shows how many fall away after the first accreditation lapses (5 years)." },
        { kind: "confirmed", text: "Only 561 of 1,074 universities and 11,268 of 43,796 colleges have valid NAAC accreditation (about 52% and 26%).", source: "India TV (Nov 2025)", url: "https://www.indiatvnews.com/education/news/not-al-falah-around-50-of-universities-don-t-have-valid-naac-accreditation-exclusive-2025-11-28-1018593", caveat: "NAAC's chairman put it at ~40% of universities and 18% of colleges coming forward." },
        { kind: "confirmed", text: "NAAC's chairman says accreditation is voluntary and no regulator has made it mandatory, although UGC's 2012 regulations require it after two batches or six years and link it to 12B grants.", source: "India TV; CAG audit report (2025)", url: "https://cag.gov.in/uploads/download_audit_report/2025/7_Chapter-3-069c28a55774a91.64621433.pdf" },
        { kind: "confirmed", text: "Only NAAC-accredited (or NIRF-ranked) universities may offer UGC-approved online degrees.", source: "Careers360 explainer on UGC online-degree rules", url: "https://www.careers360.com/courses-certifications/articles/unaccredited-universities-offering-online-degree-in-india", caveat: "Secondary source; check the UGC (ODL and Online) regulations." },
        { kind: "confirmed", text: "NIRF 2025: 7,692 unique institutions submitted 14,163 applications across 17 categories, up from 2,426 institutions in 2016.", source: "NIRF India Rankings 2025 report", url: "https://www.nirfindia.org/nirfpdfcdn/2025/pdf/Report/IR2025_Report.pdf" },
      ],
    },
    {
      id: "changes",
      title: "What is changing",
      facts: [
        { kind: "confirmed", text: "NAAC's new model (announced February 2025): a binary Accredited / Not Accredited outcome replaces A++…C grades, followed by optional Maturity-Based Graded Levels L1–L5 (L4 national excellence, L5 international).", source: "Careers360 interview with NAAC chairman Anil Sahasrabudhe (Sep 2025)", url: "https://news.careers360.com/naac-grade-binary-accreditation-anil-sahasrabudhe-university-one-nation-one-data-netf-nba-nirf-2025-ranking-klef-apaar-nep-iit-nit", caveat: "Rollout date unclear; a July 2026 guide said the portal had not launched." },
        { kind: "confirmed", text: "After the February 2025 bribery case, NAAC moved colleges to online-only peer assessment and universities to hybrid. False data can cost accreditation for up to five years or a three-year ranking ban.", source: "Careers360 (Oct 2025; Sep 2025)", url: "https://news.careers360.com/naac-accreditation-grade-a-11829-university-college-cycle-1-sharp-rise-participation-online-rating-report-mmttc-2025" },
        { kind: "confirmed", text: "In February 2025 the CBI arrested a NAAC inspection committee's chairman and members, including a JNU professor, and KLEF officials, alleging cash, gold and laptops were paid for an A++ grade.", source: "ThePrint; Careers360", url: "https://theprint.in/india/naac-inspection-committee-chairman-jnu-professor-among-10-held-by-cbi-for-graft/2475514" },
        { kind: "confirmed", text: "'One Nation One Data': a central portal where institutions submit data once a year for AISHE, NAAC, NBA, NIRF, UGC and AICTE. NAAC operates on trust and checks data when complaints arise; AI anomaly checks are being built.", source: "Careers360 interview (Sep 2025)", url: "https://news.careers360.com/naac-grade-binary-accreditation-anil-sahasrabudhe-university-one-nation-one-data-netf-nba-nirf-2025-ranking-klef-apaar-nep-iit-nit", caveat: "Launch has slipped since 2023-24; full rollout not confirmed." },
        { kind: "confirmed", text: "The Viksit Bharat Shiksha Adhishthan Bill (introduced 15 Dec 2025, sent to a standing committee) would replace UGC, AICTE and NCTE with one regulator that has its own Accreditation Council.", source: "PRS India; Vision IAS", url: "https://prsindia.org/billtrack/prs-products/prs-bill-summary-1765905039", caveat: "Not passed as of November 2026; NAAC's future under it is unclear." },
        { kind: "confirmed", text: "NBA moves to GAPC 4.0 from 2026 (Washington Accord); NBA registration costs ₹1,00,000 + tax and an appeal ₹1,50,000 per programme.", source: "Careers360 interview; NBA fee page", url: "https://www.nbaind.org/Accreditation/AccreditationFeesandRefundPolicy" },
      ],
    },
    {
      id: "cost",
      title: "What accreditation costs a college today",
      facts: [
        { kind: "confirmed", text: "NAAC fees for colleges (2021 schedule): IIQA ₹1,00,000 + 18% GST, half with the SSR and the rest within 15 days, plus a logistics deposit for the peer team.", source: "College fee schedule published by DHE Odisha", url: "https://dhe.odisha.gov.in/sites/default/files/2021-01/DocPath_8.pdf", caveat: "An older NAAC slide caps fees at ₹7.5 lakh + GST per institution; check NAAC's current schedule." },
        { kind: "confirmed", text: "Consultants advertise full NAAC cycles (IIQA to peer visit) at roughly ₹2–10 lakh, excluding GST.", source: "RAYSolute (a consultancy), via search snippet", url: "https://www.raysolute.com/naac-accreditation-cost.html", caveat: "Self-reported by a firm that sells the service; its detailed page is paywalled." },
        { kind: "confirmed", text: "An affiliating university (CSJMU, Kanpur) offered colleges ₹15,000 as an incentive to apply for NAAC, a sign of how hard it is to get small colleges to start.", source: "Careers360", url: "https://news.careers360.com/naac-accreditation-nirf-csjmu-announces-rs-15000-incentive-first-25-affiliated-colleges-apply-quality-of-education-care-scheme" },
      ],
    },
    {
      id: "demand",
      title: "What our research found",
      lead: "From the private colleges analysis (analyses/private-colleges, collected 2 Nov 2026).",
      facts: [
        { kind: "our-data", text: "Google: 243 IQAC suggestions and 70 NAAC-process suggestions (\"naac binary accreditation manual 2025\", \"criteria 1 to 10 pdf\", \"nba accreditation sar\")." },
        { kind: "our-data", text: "YouTube: faculty voice the work: \"lost in CO-PO mapping and attainment\"; \"help me out NAAC criteria B-8.3\"; \"faculties… made to do admin/clerical work\"." },
        { kind: "our-data", text: "Meta: 90 ads from 35 institutions show their NAAC grade to students; no focused accreditation-software advertiser appeared." },
        { kind: "our-data", text: "Reddit: \"NAAC is an absolute joke\" (⬆222), \"NIRF is rigged\" (⬆180): students distrust ratings." },
        { kind: "our-data", text: "Trends (counter-signal): interest fell over 12 months for NAAC (-47%), NIRF (-30%) and AISHE (-39%)." },
      ],
    },
    {
      id: "market",
      title: "Market size",
      facts: [
        { kind: "confirmed", text: "AISHE 2023-24: 1,289 universities and 48,246 colleges; private unaided colleges were 65.2% of colleges in 2021-22.", source: "AISHE reports, via Careers360", url: "https://news.careers360.com/aishe-2023-24-higher-education-enrolment-reaches-4-50-crore-female-enrolment-rises-42-percentage-since-2014-15" },
        { kind: "assumption", text: "Buyers: ~11,000 accredited colleges that must renew every 5 years (about 2,200 a year), plus the share of ~32,000 unaccredited colleges that will apply under the new binary model, plus ~7,700 NIRF participants.", caveat: "pplab estimate from the counts above." },
        { kind: "assumption", text: "Willingness to pay is concentrated in private universities and autonomous or NBA-seeking engineering, management and pharmacy colleges; small affiliated degree colleges spend little.", caveat: "To test in interviews." },
      ],
    },
  ],
  competitors: [
    { product: "Kramah (Ki-OBE, Ki-NIRF)", what: "AI generation of SSR, SAR and AQAR; CO-PO-PSO attainment; NAAC, NBA, NIRF, AISHE; 200+ institutions (BITS Pilani, Symbiosis)", price: "Not public (demo)", source: "kramah.com", url: "https://www.kramah.com" },
    { product: "iCloudEMS", what: "ERP with NAAC, NBA and AISHE evidence collection and one-click reports; CO→PO→PSO; 150+ institutions (Galgotias, Sharda)", price: "Not public (demo)", source: "icloudems.com", url: "https://www.icloudems.com" },
    { product: "vmedulife", what: "30+ module ERP with OBE and IQAC reports; 800+ institutes", price: "Not public", source: "vmedulife.com", url: "https://vmedulife.com" },
    { product: "PI-360", what: "Evidence repository, AQAR and NIRF templates, OBE workflows (Univ. of Jammu, Adani Univ.)", price: "Not public", source: "pi360.net", url: "https://pi360.net" },
    { product: "Linways", what: "Academic management with accreditation, CO-PO and Bloom's mapping (Christ, REVA)", price: "Lite / Professional / Enterprise, no amounts; 6-month minimum", source: "linways.com/pricing", url: "https://linways.com/pricing" },
    { product: "MasterSoft (iitms)", what: "NAAC SSR automation: ~300 reports, 100 data-entry forms", price: "Price on request", source: "iitms.co.in", url: "https://www.iitms.co.in/products/naac-accreditation" },
    { product: "Camu, Creatrix, Academia ERP, Biyani eVidya, Eklavvya", what: "ERPs or tools with NAAC/NBA modules", price: "Not public", source: "Vendor sites; competitor-pricing.md" },
    { product: "NAAC consultants", what: "SSR writing, mock visits, criteria coaching", price: "≈₹2–10 lakh per cycle (vendor-reported)", source: "RAYSolute", url: "https://www.raysolute.com/naac-accreditation-cost.html" },
  ],
  product: {
    features: [
      "Evidence inbox: faculty add events, publications, FDPs and feedback from their phones; each item is tagged to NAAC criteria, NBA criteria and NIRF parameters once.",
      "CO-PO attainment from marks uploaded by Excel or from the ERP, with the NBA SAR tables.",
      "Generate the AQAR every year and the SSR / binary-accreditation submission, NBA SAR and NIRF data from the same records.",
      "Verification folder: every number links to its proof document, ready for online-only assessment and data checks.",
      "Readiness score against the binary model's essential criteria and the maturity levels.",
      "Later: export for One Nation One Data and AISHE; reputation and admissions reporting.",
    ],
    pricing: [
      { kind: "assumption", text: "₹20,000/month to start (NAAC + NIRF); ₹40,000/month with NBA for several programmes, fee ledger and review responses." },
      { kind: "assumption", text: "For ₹50 Cr/year: 2,084 colleges at ₹20,000 (7.0% of ~29,700) or 1,042 at ₹40,000 (3.5%)." },
      { kind: "assumption", text: "Price check: a consultant's ₹2–10 lakh per 5-year cycle is ≈₹3,000–17,000/month; ₹20,000/month only works if the tool also replaces faculty hours and covers NBA and NIRF every year." },
    ],
  },
  openQuestions: [
    "If accreditation stays voluntary, how many unaccredited private colleges will ever apply? Only 25 colleges have reached a fifth cycle.",
    "Will One Nation One Data make a private evidence tool redundant, or create demand for clean data to upload?",
    "Does a binary Accredited / Not Accredited outcome lower the pressure that today pushes colleges to pay for a better grade?",
    "Who pays: the management (owner) or the principal's budget? Faculty do the work but don't buy.",
    "How do Kramah, iCloudEMS and vmedulife price, and what do IQAC coordinators dislike about them?",
    "Will the VBSA Bill's new Accreditation Council keep NAAC's criteria, or reset formats again?",
  ],
  nextSteps: [
    { text: "Research coverage, rule changes, costs and competitors (this page).", done: true },
    { text: "Read NAAC's binary/MBGL manual and current fee schedule directly.", done: false },
    { text: "Get quotes from Kramah, iCloudEMS and vmedulife by requesting demos.", done: false },
    { text: "List colleges whose NAAC accreditation expires in 2026–2028 (renewal prospects) from NAAC's accredited list.", done: false },
    { text: "Interview 5 IQAC coordinators and 3 college owners on hours spent, tools used and what they would pay.", done: false },
    { text: "Decide between this and the admissions CRM for the college group.", done: false },
  ],
};
