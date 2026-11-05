// Deep dive for "Project milestone desk: RERA reports + buyer demand letters" (idea id dev-milestone).
// Research done 5 Nov 2026: web sources below, plus analyses/real-estate-developers (collected 2 Nov 2026).

import type { IdeaDetail } from "./details";

export const DEV_MILESTONE: IdeaDetail = {
  status: "Deep dive in progress",
  updated: "2026-11-05",
  summary:
    "A small developer runs each project as a chain of milestones: plinth, each slab, brickwork, possession. Each one should trigger three things at once: a demand letter to every buyer on a construction-linked plan, a withdrawal from the 70% RERA account backed by architect, engineer and CA certificates, and the quarterly progress report to RERA. Today these are done separately, in Excel and by a CA, and the regulator is punishing misses: MahaRERA flagged 8,212 projects for skipped quarterly reports in 2026 and suspended 4,812 lapsed projects in 2025. The product records each milestone once and produces the buyer demands, the certificates' inputs and the RERA filing from it.",
  sections: [
    {
      id: "enforcement",
      title: "Enforcement is real and rising",
      facts: [
        { kind: "confirmed", text: "MahaRERA flagged 8,212 projects (2,311 in Pune) for not filing the January–March 2026 quarterly progress report, due 20 April 2026. Developers got 60 days; the penalty is ₹50,000, plus possible suspension, frozen accounts and a ban on advertising and sales.", source: "Punekar News; Outlook Money (May 2026)", url: "https://www.punekarnews.in/maharera-crackdown-2311-pune-projects-among-8212-facing-show-cause-notices/" },
        { kind: "confirmed", text: "MahaRERA found 10,773 projects that lapsed without new timelines (Dec 2024). It suspended over 1,950 and froze their accounts in January 2025, and 4,812 by August 2025 (Pune 1,219). Flat sales in those projects are blocked at the registration office.", source: "The Realty Today; Moneylife", url: "https://therealtytoday.com/news/maharera-suspends-4812-housing-projects-freezes-developer-accounts-across-maharashtra" },
        { kind: "confirmed", text: "Karnataka RERA requires quarterly updates within 15 days of quarter end; a February 2026 circular set ₹25,000 for each update missed or filed late (Q2 2017-18 to Q4 2024-25), with a penalty-free window to 31 March 2026.", source: "TeamLease RegTech", url: "https://teamleaseregtech.com/updates/article/53406/krera-issued-a-circular-regarding-the-penalty-for-delay-in-quarterly-updates/" },
        { kind: "confirmed", text: "MahaRERA has ordered about ₹1,037.86 crore of refunds and compensation for 1,531 buyers since 2017 and recovered about ₹369.45 crore; recovery runs through district collectors and is slow.", source: "Free Press Journal (Oct 2026)", url: "https://www.freepressjournal.in/mumbai/maharera-recovers-369-crore-in-homebuyer-compensation-with-help-of-district-collectorates" },
      ],
    },
    {
      id: "rules",
      title: "The money rules the product must follow",
      facts: [
        { kind: "confirmed", text: "RERA section 4(2)(l)(D): 70% of money collected from buyers must sit in a separate project account and be withdrawn only in proportion to completion, certified by an engineer, an architect and a chartered accountant.", source: "RERA Act 2016; summaries", url: "https://open-exam-prep.com/study-guides/in-maharera-agent-coc/project-registration-promoter-duties/promoter-escrow-disclosures" },
        { kind: "confirmed", text: "In Maharashtra, every withdrawal from the separate account needs Form 1 (architect), Form 2 (engineer) and Form 3 (CA) submitted to the bank (Circular 39/2021); Form 5 is the CA's annual audit of project money.", source: "WIRC-ICAI; TaxGuru", url: "https://old.wirc-icai.org/images/law-updates/Maha-Rera-Feb-2022.pdf" },
        { kind: "confirmed", text: "Tamil Nadu RERA made three accounts mandatory for every project from 1 January 2026: all buyer money goes into a collection account (no cheques, cards or UPI out), swept daily 70% to the separate account and 30% to a transaction account. MahaRERA proposed the same system in 2024.", source: "LiveLaw; Outlook Money; Moneylife", url: "https://www.livelaw.in/amp/consumer-cases/tamil-nadu-rera-mandates-promoters-to-maintain-three-bank-accounts-for-registered-real-estate-projects-517017", caveat: "Whether MahaRERA's version was notified is not confirmed." },
        { kind: "confirmed", text: "RERA section 13(1): a developer may not take more than 10% of the price before a registered agreement for sale. The MahaRERA model agreement caps cumulative payments by stage (for example 30% after the agreement, 45% at plinth).", source: "Rustomjee buyer guide; exam-prep summary of the model agreement", url: "https://www.rustomjee.com/blog/rera-payment-schedule-rules-how-maharera-protects-your-instalments/", caveat: "Stage percentages from secondary sources; check Annexure A of the Maharashtra RERA Rules." },
        { kind: "confirmed", text: "Each demand on an under-construction flat carries GST at 5% (1% for affordable homes up to ₹45 lakh), with no input credit; buyers of property worth ₹50 lakh or more must deduct 1% TDS (section 194-IA) on each instalment.", source: "ClearTax; Razorpay", url: "https://cleartax.in/s/gst-on-flat-purchase" },
        { kind: "confirmed", text: "QPR due dates differ by state and source: MahaRERA's January–March 2026 report was due 20 April; guides quote 7 or 20 days after quarter end for Maharashtra and 15 days for Karnataka.", source: "Outlook Money; ReraOne; TeamLease", url: "https://www.outlookmoney.com/invest/maharera-flags-8212-projects-for-missing-qpr-deadline-gives-regulatory-warning", caveat: "Confirm each state's order before building reminders." },
      ],
    },
    {
      id: "demand",
      title: "What our research found",
      lead: "From the real estate developers analysis (analyses/real-estate-developers, collected 2 Nov 2026: 1,858 Meta ads, 996 Maps reviews, 892 Google suggestions).",
      facts: [
        { kind: "our-data", text: "Maps: in 241 low reviews of developers, 46 are payment or refund disputes, 42 possession delays and 59 \"no response\" (\"asking me to pay development fee of 150/- per sqft… baseless\"; \"full payment 12 years ago, registry still not completed\")." },
        { kind: "our-data", text: "Google: ~36 quarterly-compliance suggestions (\"rera quarterly return due date\", \"late fees\", \"penalty\") and 38 demand-letter searches (\"demand letter from builder to customer format\")." },
        { kind: "our-data", text: "Meta: Buildesk advertises \"Still managing payment collections in Excel?… Delayed demand letters… Customer document chaos\"; no RERA-compliance software advertiser appeared, only trainers and CAs." },
        { kind: "our-data", text: "YouTube: 357 RERA comments; \"RERA compliance for builders\" has 1.0M views (mostly buyers watching)." },
        { kind: "our-data", text: "Maps: 84% of developers have a website and owners reply to 30% of reviews, the most digital group analysed." },
      ],
    },
    {
      id: "market",
      title: "Market size",
      facts: [
        { kind: "confirmed", text: "1.43 lakh projects with 1.11 crore units were registered with RERA from January 2017 to January 2025; the top 10 states hold 1.19 lakh (Maharashtra 48,047, Tamil Nadu 19,987, Gujarat 16,265).", source: "PropEquity, via Square Yards and The Realty Today", url: "https://therealtytoday.com/news/market-insights/119-lakh-projects-97-lakh-units-registered-in-8-years-across-top-10-rera-states-propequity-report/" },
        { kind: "confirmed", text: "MahaRERA had 50,162 registered projects by May 2025 and approved over 10,000 in FY 2025-26; new registrations nationally fell 21% between 2022 and 2024.", source: "Rentu; Geosquare; ThePrint", url: "https://theprint.in/economy/rera-project-registrations-drop-21-between-2022-2024-propequity-report/2523060" },
        { kind: "confirmed", text: "CREDAI says it represents 13,000+ developers across 230 city chapters in 20 states.", source: "CREDAI", url: "https://credai.org/" },
        { kind: "confirmed", text: "Housing sales in the top 7 cities fell 14% to about 3.96 lakh units in 2025 while unsold stock rose 4% to about 5.77 lakh units, so developers are selling slower and carrying more stock.", source: "Anarock, via Business Today and Outlook Business", url: "https://www.businesstoday.in/real-estate/story/housing-sales-fall-14-in-2025-amid-sky-high-prices-it-layoffs-anarock-research-508242-2025-12-26" },
        { kind: "assumption", text: "About 50,000 developers with at least one live project; perhaps 20,000–30,000 run construction-linked payment plans (plotted and ready-to-move projects need fewer demands).", caveat: "pplab estimate. Counting distinct promoters with ongoing projects on MahaRERA would give a real number." },
      ],
    },
  ],
  competitors: [
    { product: "ReraDesk", what: "RERA compliance for developers and CAs: QPR filing, CA certification step, 70/30 account alerts, Tally reconciliation. Not a buyer portal; no demand letters", price: "₹2,999 per QPR filing; ₹29,999/project/yr (1–3 projects); ₹44,999/project/yr (4–15); CA bundle ₹2,00,000 for 10 projects/yr; + GST; beta", source: "reradesk.pages.dev (read 5 Nov 2026)", url: "https://reradesk.pages.dev/pricing" },
    { product: "Buildesk", what: "Real estate CRM with post-sales: demand letters, collections, buyer app", price: "≈₹1,000/user/month (annual); also listed ₹11,328–12,000/user/yr", source: "Techjockey listings", url: "https://techjockey.com/detail/buildesk" },
    { product: "StrategicERP", what: "Real estate/construction ERP with customer app (payment tracking, project updates); claims 1,000+ developers", price: "₹4,000/user/month billed yearly; enterprise custom", source: "Published", url: "https://strategicerp.com/pricing.php" },
    { product: "Sell.Do", what: "Real estate CRM with inventory, channel partners and post-sales (Aurum PropTech)", price: "Quote only; per active user, minimum 5 users", source: "sell.do/pricing", url: "https://www.sell.do/pricing" },
    { product: "Farvision (Gamut)", what: "Real estate ERP including sales and collections", price: "From ~₹2,000/user/month hosted (listing)", source: "Listing (pricing page unavailable)" },
    { product: "Leadrat", what: "Pre-sales CRM; 30,000+ realtors claimed; no post-sales or RERA", price: "₹1,499–2,299/user/month billed yearly", source: "Published (Nov 2026 read)", url: "https://leadrat.com/pricing/" },
    { product: "RERA consultants (ReraOne and CA firms)", what: "QPR preparation and filing, Form 1/2/3 checks, extensions", price: "Not public (ReraOne); one Mumbai CA from ₹15,000/month per project", source: "reraone.co.in; Patron Accounting", url: "https://www.patronaccounting.com/construction-and-real-estate-accounting-services/mumbai" },
  ],
  product: {
    features: [
      "Milestone register per project and tower: planned vs actual dates, site photos, and the engineer's sign-off.",
      "On sign-off, demand letters for every buyer on that stage, with GST, 194-IA TDS note, due date, UPI/bank link and WhatsApp reminders.",
      "Collections ledger per buyer: due, received, overdue with interest as per the agreement; feeds the CA's Form 3 and Form 5.",
      "70/30 account tracker (three-account ready for Tamil Nadu): money in, eligible withdrawal by completion %, certificate status.",
      "Quarterly report pack per state with a deadline calendar (Maharashtra and Karnataka first) and a CA login to review and file.",
      "Buyer portal: payments, documents and construction progress, to cut the \"no response\" complaints.",
    ],
    pricing: [
      { kind: "assumption", text: "₹15,000/month for up to 2 active projects, then ~₹5,000 per extra project; ₹30,000/month after expansion (channel-partner payouts, CRM sync, site capture)." },
      { kind: "assumption", text: "Price check: ReraDesk charges ₹29,999 per project per year (≈₹2,500/month) for RERA alone, and Buildesk ≈₹1,000/user/month for post-sales. Our price only holds if the demand-letter and collections side clearly earns it; RERA alone is worth ~₹2,500–4,000 per project per month." },
      { kind: "assumption", text: "For ₹50 Cr/year: 2,778 developers at ₹15,000 (5.6% of ~50,000) or 1,389 at ₹30,000 (2.8%)." },
      { kind: "assumption", text: "Value check: bringing ₹1 Cr of due instalments in one month earlier saves about ₹1 lakh of interest at 12%; one missed MahaRERA QPR costs ₹50,000 plus a possible sales freeze." },
    ],
  },
  openQuestions: [
    "Who in a small developer's office owns collections and RERA: the owner, an accountant, or the CA? Who signs the cheque for software?",
    "Do developers want the CA inside the tool (selling through CAs), or will CAs see it as a threat?",
    "How much of a project's QPR can be filled automatically, given each state's portal and form?",
    "Is ReraDesk's ₹2,500/project/month the ceiling for RERA software, and does bundling demands and a buyer portal justify ₹15,000?",
    "How many developers use construction-linked plans vs down-payment or plotted sales?",
    "With sales down 14% in 2025, are developers cutting software spend or chasing collections harder?",
  ],
  nextSteps: [
    { text: "Research rules, enforcement, competitors and market size (this page).", done: true },
    { text: "Read MahaRERA's QPR order, Circular 39/2021 and the model agreement's payment annexure directly.", done: false },
    { text: "Count distinct promoters with ongoing projects on MahaRERA (the real market size and a prospect list).", done: false },
    { text: "Pull the 8,212 non-compliant projects list and contact 50 developers from it, as for MSME receivables.", done: false },
    { text: "Try ReraDesk's beta and get a Buildesk demo to see what each covers.", done: false },
    { text: "Interview 5 developers and 3 RERA CAs on demand letters, Form 1/2/3 and QPR effort.", done: false },
  ],
};
