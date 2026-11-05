// Every product idea from the group analyses (analyses/<group>/README.md, section 5),
// rated on the same scale so they can be ranked. Ticket = suggested entry price per
// business per month; "estimated" marks prices set after the analysis was written.
// Build and marketing difficulty: 1 = easy … 5 = hard. Competitors = direct competitors
// seen in the data (not the crowded first-degree market around them).

import { customersFor, INR_PER_USD, TARGET_PER_YEAR } from "../idea-guide/guide-data";

export type Level = 1 | 2 | 3 | 4 | 5;

export interface Idea {
  id: string;
  idea: string;
  group: string;
  ticket: number;
  ticketEstimated?: boolean;
  build: Level;
  bodies: number;
  bodiesLabel: string;
  marketing: Level;
  competitors: number;
  competitorNote: string;
  note: string;
}

export const IDEAS: Idea[] = [
  { id: "dev-milestone", idea: "Project milestone desk: RERA reports + buyer demand letters", group: "Real estate developers", ticket: 15_000, build: 4, bodies: 50_000, bodiesLabel: "~50K", marketing: 3, competitors: 2, competitorNote: "Buildesk, ReraDesk", note: "8,212 MahaRERA projects got notices for missed quarterly reports" },
  { id: "dev-cp", idea: "Channel-partner management and payouts", group: "Real estate developers", ticket: 8_000, build: 2, bodies: 50_000, bodiesLabel: "~50K", marketing: 3, competitors: 5, competitorNote: "CRM add-ons (Buildesk, Leadrat)", note: "111 channel-partner searches, mostly brokers" },
  { id: "dev-site", idea: "Site cost and material control", group: "Real estate developers", ticket: 6_000, build: 3, bodies: 50_000, bodiesLabel: "~50K", marketing: 4, competitors: 10, competitorNote: "Powerplay, Onsite, RDash, Nway…", note: "Crowded; Powerplay Pro ₹71,999/yr" },
  { id: "exp-desk", idea: "Export money-and-compliance desk: shipping bill to eBRC, EDPMS, RoDTEP, refunds", group: "Exporters", ticket: 8_000, build: 4, bodies: 1_50_000, bodiesLabel: "~1.5 lakh", marketing: 3, competitors: 4, competitorNote: "Axodian (free beta), Seasaw (₹18K/mo), EXIM Shift, OptiEXIM", note: "Realisation cut to 9 months from Oct 2026; small-bill closure now ₹25–100" },
  { id: "exp-docs", idea: "Export documentation generator", group: "Exporters", ticket: 2_000, build: 2, bodies: 1_50_000, bodiesLabel: "~1.5 lakh", marketing: 3, competitors: 5, competitorNote: "Expodite, Shipzy, Focus, EximDoc…", note: "Cheap tools and Excel templates already exist" },
  { id: "exp-recv", idea: "Export receivables and buyer-payment protection", group: "Exporters", ticket: 5_000, build: 3, bodies: 1_50_000, bodiesLabel: "~1.5 lakh", marketing: 3, competitors: 4, competitorNote: "Credlix, M1 NXT, RBK, Skydo", note: "\"Stop waiting 60–90 days for export payments\"" },
  { id: "msme-recv", idea: "Receivables and 45-day-rule collections", group: "MSME manufacturers", ticket: 5_000, build: 2, bodies: 3_00_000, bodiesLabel: "~3 lakh", marketing: 3, competitors: 1, competitorNote: "Only govt MSME Samadhaan", note: "45-day rule Breakout in Trends; \"₹6.5 Cr payment stuck\"" },
  { id: "msme-labour", idea: "Factory labour attendance, overtime, advances and PF", group: "MSME manufacturers", ticket: 1_500, ticketEstimated: true, build: 2, bodies: 3_00_000, bodiesLabel: "~3 lakh", marketing: 3, competitors: 6, competitorNote: "PagarBook, SalaryBox, Workex…", note: "Cheap and crowded (₹799 one-time tools)" },
  { id: "msme-prod", idea: "Light production tracker beside Tally", group: "MSME manufacturers", ticket: 3_000, ticketEstimated: true, build: 3, bodies: 3_00_000, bodiesLabel: "~3 lakh", marketing: 4, competitors: 45, competitorNote: "~45 ERP vendors (TranZact…)", note: "TranZact charges ₹8,333–30,000/mo" },
  { id: "school-fee", idea: "Fee collection autopilot", group: "Private K-12 schools", ticket: 4_000, build: 2, bodies: 3_40_000, bodiesLabel: "~3.4 lakh", marketing: 3, competitors: 5, competitorNote: "Jodo, ERP fee modules, Collexo…", note: "Fee collection the #1 pain on 4 platforms" },
  { id: "school-adm", idea: "Admissions enquiry-to-enrolment CRM", group: "Private K-12 schools", ticket: 2_500, ticketEstimated: true, build: 2, bodies: 3_40_000, bodiesLabel: "~3.4 lakh", marketing: 3, competitors: 6, competitorNote: "MCB, ERP add-ons…", note: "Seasonal (Nov–Apr)" },
  { id: "school-app", idea: "Reliable parent app on top of the school's ERP", group: "Private K-12 schools", ticket: 1_500, ticketEstimated: true, build: 3, bodies: 3_40_000, bodiesLabel: "~3.4 lakh", marketing: 4, competitors: 85, competitorNote: "~85 ERP advertisers", note: "Half of Play complaints are basic reliability" },
  { id: "hosp-tpa", idea: "Insurance, TPA and Ayushman claims desk", group: "Small hospitals", ticket: 8_000, build: 5, bodies: 60_000, bodiesLabel: "~60K", marketing: 3, competitors: 3, competitorNote: "Nimblefin, WinSkill, RCM firms", note: "Top pain on 5 platforms; no TPA/NHA APIs" },
  { id: "hosp-hms", idea: "ABDM/NABH-ready lightweight HMS", group: "Small hospitals", ticket: 3_000, ticketEstimated: true, build: 4, bodies: 60_000, bodiesLabel: "~60K", marketing: 4, competitors: 25, competitorNote: "~25 HMS vendors", note: "Very crowded and price-competitive" },
  { id: "hosp-opd", idea: "OPD queue and discharge-status updates", group: "Small hospitals", ticket: 2_000, ticketEstimated: true, build: 2, bodies: 60_000, bodiesLabel: "~60K", marketing: 3, competitors: 5, competitorNote: "HMS add-ons", note: "Waiting is 18% of low Maps reviews" },
  { id: "dealer-service", idea: "Service-desk updates and follow-up", group: "Car & two-wheeler dealers", ticket: 10_000, build: 3, bodies: 60_000, bodiesLabel: "~60K", marketing: 4, competitors: 4, competitorNote: "AutoSherpa, Groweon, OEM apps", note: "Service is 68% of low two-wheeler reviews; OEM lock-in" },
  { id: "dealer-used", idea: "Independent used-car dealer toolkit", group: "Car & two-wheeler dealers", ticket: 3_000, ticketEstimated: true, build: 4, bodies: 50_000, bodiesLabel: "~50K (estimate)", marketing: 4, competitors: 5, competitorNote: "Cars24, Spinny, CarDekho tools", note: "Needs VAHAN and challan data" },
  { id: "dealer-leads", idea: "Showroom lead follow-up", group: "Car & two-wheeler dealers", ticket: 5_000, ticketEstimated: true, build: 2, bodies: 60_000, bodiesLabel: "~60K", marketing: 4, competitors: 8, competitorNote: "LeadSquared, HelloLeads, Dave.AI…", note: "CRMs cost ₹334–5,000 per user" },
  { id: "dist-credit", idea: "Retailer credit and collections", group: "Distributors", ticket: 3_000, build: 2, bodies: 6_00_000, bodiesLabel: "~6 lakh", marketing: 4, competitors: 1, competitorNote: "Credflow", note: "Deprioritised: their tools cost ₹290–1,150/mo" },
  { id: "dist-orders", idea: "Offline order taking for multi-brand distributors", group: "Distributors", ticket: 1_500, build: 3, bodies: 6_00_000, bodiesLabel: "~6 lakh", marketing: 4, competitors: 10, competitorNote: "Bizom, FieldAssist, Marg eOrder…", note: "Brands give their apps free" },
  { id: "dist-stock", idea: "Stock, expiry and brand-claim tracking", group: "Distributors", ticket: 1_500, build: 3, bodies: 6_00_000, bodiesLabel: "~6 lakh", marketing: 4, competitors: 5, competitorNote: "Marg, Tally, Busy", note: "Billing ERPs partly cover it" },
  { id: "gc-money", idea: "Contract money desk: EMD, deposits, guarantees, running bills", group: "Government contractors", ticket: 3_000, build: 3, bodies: 3_00_000, bodiesLabel: "~3 lakh (estimate)", marketing: 4, competitors: 1, competitorNote: "AxiTrust (adjacent)", note: "Paid tools seen cost only ₹200–600/mo" },
  { id: "gc-bid", idea: "Tender eligibility and bid preparation", group: "Government contractors", ticket: 1_500, build: 3, bodies: 3_00_000, bodiesLabel: "~3 lakh (estimate)", marketing: 3, competitors: 12, competitorNote: "BidAssist, Tender247, Tendingo…", note: "Alerts cost ₹200–600/mo and draw complaints" },
  { id: "col-accred", idea: "Accreditation evidence desk: NAAC, NBA, NIRF from one record", group: "Private colleges", ticket: 20_000, build: 4, bodies: 29_700, bodiesLabel: "~29.7K", marketing: 4, competitors: 4, competitorNote: "ERP modules (Linways, Camu, MCB)", note: "35 colleges advertise their NAAC grade; staff voice thin" },
  { id: "col-adm", idea: "Admissions conversion CRM", group: "Private colleges", ticket: 25_000, build: 3, bodies: 29_700, bodiesLabel: "~29.7K", marketing: 4, competitors: 8, competitorNote: "LeadSquared, Meritto, MCB…", note: "LeadSquared ₹2,500–5,000 per counsellor" },
  { id: "col-fee", idea: "Fee ledger and reputation desk", group: "Private colleges", ticket: 8_000, build: 2, bodies: 29_700, bodiesLabel: "~29.7K", marketing: 4, competitors: 2, competitorNote: "ERP fee modules", note: "316 of 1,051 low reviews are about fees and refunds" },
  { id: "ff-portal", idea: "Client status and charges portal for forwarders and CHAs", group: "Freight forwarders", ticket: 10_000, build: 4, bodies: 25_000, bodiesLabel: "~25K (estimate)", marketing: 3, competitors: 6, competitorNote: "CargoWise, Logi-Sys, Shipthis, Freightify…", note: "No response is the top client complaint; group small for India" },
  { id: "ff-dnd", idea: "Detention and demurrage tracker", group: "Freight forwarders", ticket: 4_000, build: 3, bodies: 25_000, bodiesLabel: "~25K (estimate)", marketing: 3, competitors: 4, competitorNote: "Container trackers (GoComet, Lynktrac…)", note: "215 detention searches; could also sell to importers" },
  { id: "ff-docs", idea: "Document-to-job automation (BL, invoice into the forwarding system)", group: "Freight forwarders", ticket: 10_000, build: 3, bodies: 25_000, bodiesLabel: "~25K (estimate)", marketing: 3, competitors: 8, competitorNote: "AI document tools, CargoWise add-ons", note: "Manual job entry; many AI tools compete" },
  { id: "ph-gmp", idea: "Lightweight GMP compliance desk: documents, logbooks, CAPA, training, Schedule M", group: "Pharma manufacturers", ticket: 15_000, build: 4, bodies: 10_500, bodiesLabel: "~10.5K", marketing: 4, competitors: 3, competitorNote: "AmpleLogic, Caliber, consultants", note: "Only ~26% of MSME units had Schedule M upgrade plans before the deadline" },
  { id: "ph-ebmr", idea: "Electronic batch records for small plants", group: "Pharma manufacturers", ticket: 25_000, build: 5, bodies: 10_500, bodiesLabel: "~10.5K", marketing: 4, competitors: 4, competitorNote: "AmpleLogic, Caliber, Körber…", note: "Paper batch records cause data-integrity findings" },
  { id: "ph-gdp", idea: "Training and document-control module for QA staff", group: "Pharma manufacturers", ticket: 5_000, build: 2, bodies: 10_500, bodiesLabel: "~10.5K", marketing: 3, competitors: 5, competitorNote: "QMS modules, LMS tools", note: "Entry module; fails India math alone" },
  { id: "ca-status", idea: "Client status and document collection", group: "CA firms", ticket: 2_500, build: 2, bodies: 1_00_000, bodiesLabel: "~1 lakh", marketing: 3, competitors: 5, competitorNote: "Zoho Practice, ICAI tool…", note: "Below the ₹50 Cr math at this price" },
];

// The same idea sold worldwide: ticket in USD per business per month, businesses
// worldwide and direct competitors abroad. Mostly estimates (group counts and spend
// from group-finder/group-data.ts where it has them). null = India-only: the problem
// comes from an Indian rule or system (RERA, EDPMS/RoDTEP, TPA/Ayushman, EMD/PWD).
export interface GlobalMarket {
  ticket: number;
  bodies: number;
  bodiesLabel: string;
  competitors: number;
  note?: string;
}

export const GLOBAL: Record<string, GlobalMarket | null> = {
  "dev-milestone": { ticket: 400, bodies: 300_000, bodiesLabel: "~300K", competitors: 10, note: "RERA part is India-only; milestone billing and buyer updates travel" },
  "dev-cp": { ticket: 200, bodies: 300_000, bodiesLabel: "~300K", competitors: 8, note: "Channel partners matter mostly in India and the Gulf" },
  "dev-site": { ticket: 300, bodies: 300_000, bodiesLabel: "~300K", competitors: 30, note: "Procore, Buildertrend and many more" },
  "exp-desk": null,
  "exp-docs": { ticket: 100, bodies: 1_000_000, bodiesLabel: "~1M (estimate)", competitors: 15 },
  "exp-recv": { ticket: 150, bodies: 1_000_000, bodiesLabel: "~1M (estimate)", competitors: 15 },
  "msme-recv": { ticket: 200, bodies: 3_000_000, bodiesLabel: "~3M", competitors: 20, note: "45-day rule is India-only; collections tools exist abroad (Chaser, Upflow)" },
  "msme-labour": { ticket: 100, bodies: 3_000_000, bodiesLabel: "~3M", competitors: 30 },
  "msme-prod": { ticket: 200, bodies: 3_000_000, bodiesLabel: "~3M", competitors: 50 },
  "school-fee": { ticket: 150, bodies: 1_500_000, bodiesLabel: "~1.5M", competitors: 20 },
  "school-adm": { ticket: 150, bodies: 1_500_000, bodiesLabel: "~1.5M", competitors: 20 },
  "school-app": { ticket: 100, bodies: 1_500_000, bodiesLabel: "~1.5M", competitors: 40 },
  "hosp-tpa": null,
  "hosp-hms": { ticket: 500, bodies: 250_000, bodiesLabel: "~250K", competitors: 50 },
  "hosp-opd": { ticket: 150, bodies: 250_000, bodiesLabel: "~250K", competitors: 15 },
  "dealer-service": { ticket: 300, bodies: 300_000, bodiesLabel: "~300K", competitors: 15 },
  "dealer-used": { ticket: 200, bodies: 300_000, bodiesLabel: "~300K (estimate)", competitors: 20 },
  "dealer-leads": { ticket: 300, bodies: 300_000, bodiesLabel: "~300K", competitors: 25 },
  "dist-credit": { ticket: 150, bodies: 2_000_000, bodiesLabel: "~2M", competitors: 15 },
  "dist-orders": { ticket: 150, bodies: 2_000_000, bodiesLabel: "~2M", competitors: 25 },
  "dist-stock": { ticket: 150, bodies: 2_000_000, bodiesLabel: "~2M", competitors: 25 },
  "gc-money": null,
  "gc-bid": { ticket: 250, bodies: 500_000, bodiesLabel: "~500K (estimate)", competitors: 15 },
  "col-accred": { ticket: 800, bodies: 25_000, bodiesLabel: "~25K (estimate)", competitors: 8, note: "Accreditation exists everywhere; frameworks differ by country" },
  "col-adm": { ticket: 1_000, bodies: 25_000, bodiesLabel: "~25K (estimate)", competitors: 15 },
  "col-fee": { ticket: 300, bodies: 25_000, bodiesLabel: "~25K (estimate)", competitors: 10 },
  "ff-portal": { ticket: 300, bodies: 150_000, bodiesLabel: "~150K (estimate)", competitors: 10 },
  "ff-dnd": { ticket: 150, bodies: 150_000, bodiesLabel: "~150K (estimate)", competitors: 8 },
  "ff-docs": { ticket: 300, bodies: 150_000, bodiesLabel: "~150K (estimate)", competitors: 15 },
  "ph-gmp": { ticket: 500, bodies: 60_000, bodiesLabel: "~60K (estimate)", competitors: 15, note: "Small GMP plants worldwide; entry eQMS costs ≈$1,460/mo" },
  "ph-ebmr": { ticket: 800, bodies: 60_000, bodiesLabel: "~60K (estimate)", competitors: 10 },
  "ph-gdp": { ticket: 200, bodies: 60_000, bodiesLabel: "~60K (estimate)", competitors: 20 },
  "ca-status": { ticket: 100, bodies: 1_500_000, bodiesLabel: "~1.5M", competitors: 20, note: "TaxDome, Karbon and others" },
};

export type MarketId = "india" | "global";

export function customersForUsd(ticketUsd: number): number {
  return Math.ceil(TARGET_PER_YEAR / INR_PER_USD / (ticketUsd * 12));
}

// Score out of 100. Ticket size weighs most (ability to pay is the main filter),
// then the share of the group needed for ₹50 Cr/year, then competition and effort.
export const WEIGHTS = { ticket: 0.35, share: 0.2, competitors: 0.2, build: 0.1, marketing: 0.15 };

export function shareNeeded(idea: Idea, market: MarketId = "india"): number | null {
  if (market === "india") return customersFor(idea.ticket) / idea.bodies;
  const g = GLOBAL[idea.id];
  return g ? customersForUsd(g.ticket) / g.bodies : null;
}

// null when the idea has no global market. Global tickets are converted to rupees
// so both markets use the same ₹1K → ₹30K ticket scale.
export function scoreOf(idea: Idea, market: MarketId = "india"): number | null {
  const g = market === "global" ? GLOBAL[idea.id] : null;
  if (market === "global" && !g) return null;
  const ticketInr = g ? g.ticket * INR_PER_USD : idea.ticket;
  const ticket = Math.min(1, Math.max(0, Math.log10(ticketInr / 1_000) / Math.log10(30))); // ₹1K → 0, ₹30K → 1
  const share = Math.min(1, Math.max(0, (0.15 - (shareNeeded(idea, market) ?? 1)) / 0.13)); // ≤2% → 1, ≥15% → 0
  const competitors = 1 / (1 + (g ? g.competitors : idea.competitors) / 3);
  const easy = (level: Level) => (5 - level) / 4;
  const total =
    WEIGHTS.ticket * ticket +
    WEIGHTS.share * share +
    WEIGHTS.competitors * competitors +
    WEIGHTS.build * easy(idea.build) +
    WEIGHTS.marketing * easy(idea.marketing);
  return Math.round(total * 100);
}
