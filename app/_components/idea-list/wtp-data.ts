// Willingness to pay for the task ALONE: does anyone already pay a service or a standalone
// tool for exactly this job? This is the test a wedge must pass. Two parts:
//   paidAlone — scored by hand from the deep dives and group analyses (evidence below).
//   scan      — public signals from scripts/collect/wtp-scan.mjs (wtp-scan.json): Naukri jobs for
//               the role that does the task, Google ads/prices on buyer searches, buying-intent
//               autocomplete suggestions.
// Levels: 3 = people pay for exactly this alone today (priced services or standalone tools, or a
// penalty that forces it); 2 = paid alone but cheap or partial; 1 = only inside bigger products
// or a free alternative exists; 0 = no sign anyone pays.

import SCAN from "./wtp-scan.json";

export type PaidLevel = 0 | 1 | 2 | 3;

export interface PaidAlone {
  level: PaidLevel;
  evidence: string;
}

export const PAID_ALONE: Record<string, PaidAlone> = {
  "dev-milestone": { level: 3, evidence: "CAs charge ~₹15,000/month per project for RERA work; ReraDesk sells QPR filing alone at ₹29,999/project/yr; ₹50,000 MahaRERA penalty per missed QPR" },
  "dev-cp": { level: 1, evidence: "Sold inside real estate CRMs (Buildesk, Leadrat, Sell.Do), not alone" },
  "dev-site": { level: 3, evidence: "Powerplay (₹71,999/yr) and Onsite (₹60,000+/yr) sell site control alone, 1M+ downloads each" },
  "exp-desk": { level: 3, evidence: "Refund consultants work on success fees; Legal Suvidha sells RoDTEP handling from ₹6,999/month; Seasaw listed at ₹18,000/month. Small-bill EDPMS closure itself is now ₹25–100" },
  "exp-docs": { level: 2, evidence: "Expodite ₹1,180 and Excel templates: paid alone, but cheap" },
  "exp-recv": { level: 2, evidence: "Factoring firms (Credlix, M1 NXT) and Skydo ($19–29 per payment) are paid per transaction" },
  "msme-recv": { level: 1, evidence: "Credflow ₹3,499–6,999/yr; the government ODR portal is free; lawyer fees for recovery not published" },
  "msme-labour": { level: 2, evidence: "PagarBook ₹499/yr, SalaryBox: paid alone, but very cheap" },
  "msme-prod": { level: 3, evidence: "TranZact ₹8,333–30,000/month; Zoho Inventory ₹999–7,499/month (bought as an ERP)" },
  "school-fee": { level: 2, evidence: "Jodo and Collexo take fees on payments; mostly bought as ERP modules" },
  "school-adm": { level: 2, evidence: "Meritto claims 1,000+ schools and preschools on its CRM" },
  "school-app": { level: 1, evidence: "Comes with the school ERP" },
  "hosp-tpa": { level: 3, evidence: "Hospitals staff TPA desks; billing/RCM outsourcing is commonly priced at 5–10% of collections (global benchmark, India rates not published)" },
  "hosp-hms": { level: 3, evidence: "HMS sold alone (~25 vendors; NiftyHMS ₹1,500/user/month)" },
  "hosp-opd": { level: 1, evidence: "HMS add-ons" },
  "dealer-service": { level: 2, evidence: "AutoSherpa, Groweon (₹2,999/month); OEM tools often free" },
  "dealer-used": { level: 2, evidence: "Platform tools from Cars24, Spinny, CarDekho" },
  "dealer-leads": { level: 2, evidence: "HelloLeads ₹334–584/user/month; LeadSquared" },
  "dist-credit": { level: 1, evidence: "Credflow ~₹1,000/month is the only one; billing apps include reminders" },
  "dist-orders": { level: 2, evidence: "Marg eOrder ₹330–830/month; brands give apps free" },
  "dist-stock": { level: 1, evidence: "Inside billing ERPs (Marg, Tally, Busy)" },
  "gc-money": { level: 1, evidence: "No tool or service found that tracks EMD, deposits and guarantees alone" },
  "gc-bid": { level: 2, evidence: "BidAssist ₹200–600/month (50,000+ businesses); filing consultants ₹500–2,200 per job" },
  "col-accred": { level: 2, evidence: "Consultants ≈₹2–10 lakh per 5-year cycle; tools (Kramah, iCloudEMS) demo-priced; accreditation voluntary" },
  "col-adm": { level: 3, evidence: "Meritto averages ₹9.8 lakh per customer a year; LeadSquared ₹2,500–5,000/user/month" },
  "col-fee": { level: 1, evidence: "ERP fee modules" },
  "ff-portal": { level: 1, evidence: "Part of forwarding systems (CargoWise, Logi-Sys, Shipthis)" },
  "ff-dnd": { level: 2, evidence: "Container trackers (GoComet, Lynktrac) sold alone" },
  "ff-docs": { level: 2, evidence: "Several AI document-extraction tools sold alone" },
  "ph-gmp": { level: 3, evidence: "Entry eQMS ≈$1,460/month; GMP gap-assessment from ₹24,999; Schedule M upgrades cost MSMEs ₹50 lakh–2.5 Cr" },
  "ph-ebmr": { level: 3, evidence: "AmpleLogic, Caliber and Körber sell eBMR alone" },
  "ph-gdp": { level: 2, evidence: "QMS training modules and LMS tools" },
  "ca-status": { level: 2, evidence: "Zoho Practice, TaxDome-style tools sold alone to CA firms" },
};

export interface ScanResult {
  jobs: number | null;
  ads: number;
  prices: number;
  intent: number;
}

export const SCAN_RESULTS = SCAN as Record<string, ScanResult>;

// 0–100: the hand score counts most; the scan adds evidence of money already moving.
export function wtpScore(id: string): number {
  const paid = (PAID_ALONE[id]?.level ?? 0) / 3;
  const s = SCAN_RESULTS[id];
  const jobs = s?.jobs ? Math.min(1, Math.log10(s.jobs + 1) / 4) : 0; // 10,000 jobs → 1
  const market = s ? Math.min(1, (s.ads > 0 ? 0.5 : 0) + Math.min(0.5, s.prices / 10)) : 0;
  const intent = s ? Math.min(1, s.intent / 20) : 0;
  // Naukri matches words loosely ("export collection" → 40K jobs), so jobs count least.
  return Math.round((0.65 * paid + 0.1 * jobs + 0.1 * market + 0.15 * intent) * 100);
}
