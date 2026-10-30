// Content of docs/product-degrees.md ("Idea selection guide"), shaped for the Idea guide tab.
// Keep the two in sync: when the guide changes, update this file in the same commit.

export const TARGET_PER_YEAR = 50_00_00_000; // ₹50 Cr revenue per year
export const INR_PER_USD = 84;

export function customersFor(pricePerMonth: number): number {
  return Math.ceil(TARGET_PER_YEAR / (pricePerMonth * 12));
}

export function formatInr(value: number): string {
  if (value >= 1_00_00_000) return `₹${+(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000) return `₹${+(value / 1_00_000).toFixed(1)} lakh`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export const PRICE_POINTS = [1_000, 2_000, 4_000, 5_000, 8_000, 10_000, 15_000, 25_000, 50_000, 1_00_000];

export const GROUP_SIZES = [
  { label: "1 lakh businesses", size: 1_00_000 },
  { label: "3 lakh businesses", size: 3_00_000 },
];

export const MILESTONES = [
  { label: "First proof", perYear: 1_00_00_000 },
  { label: "", perYear: 5_00_00_000 },
  { label: "", perYear: 20_00_00_000 },
  { label: "Target", perYear: 50_00_00_000 },
];

export const MILESTONE_PRICES = [5_000, 12_000];

export const LEVERS = [
  { title: "Price per customer", body: "Start with a wedge, then expand into the full system so revenue per customer grows (e.g. ₹5,000 → ₹12,000/month)." },
  { title: "Number of customers", body: "Pick groups with several lakh businesses, so the customers needed stay under ~5% of the group." },
  { title: "More products, same customers", body: "Add a second and third module once the first is trusted." },
];

export type DegreeId = 1 | 2 | 3;

export const DEGREES: {
  id: DegreeId;
  name: string;
  term: string;
  definition: string;
  example: string;
  meters: { price: number; build: number; competition: number; willingness: number; switching: number };
}[] = [
  {
    id: 1,
    name: "The system",
    term: "System of record",
    definition: "The management system the business runs on",
    example: "HMS/HIS: OPD, IPD, billing, pharmacy, lab",
    meters: { price: 5, build: 5, competition: 5, willingness: 5, switching: 5 },
  },
  {
    id: 2,
    name: "One job",
    term: "Point solution",
    definition: "Software that owns one function end to end",
    example: "Insurance/TPA desk: pre-auth, claims, deductions",
    meters: { price: 3, build: 3, competition: 3, willingness: 3, switching: 2 },
  },
  {
    id: 3,
    name: "A fix",
    term: "\"A feature, not a product\"",
    definition: "An add-on that fixes one task inside an existing tool",
    example: "A helper for the Ayushman claims portal",
    meters: { price: 1, build: 1, competition: 2, willingness: 1, switching: 1 },
  },
];

export const METER_LABELS: { key: keyof (typeof DEGREES)[number]["meters"]; label: string }[] = [
  { key: "price", label: "Ticket price" },
  { key: "willingness", label: "Willingness to pay" },
  { key: "build", label: "Build effort" },
  { key: "competition", label: "Competition" },
  { key: "switching", label: "Switching needed" },
];

export const APPROACHES = [
  { id: "A", title: "New idea", what: "Build something that doesn't exist yet", risk: "The pain may not be worth paying for", lands: "Degree 3, sometimes 2", preferred: false },
  { id: "B", title: "Better rebuild", what: "Rebuild an existing tool with the fixes users ask for", risk: "Customers won't switch unless the pain is severe; must be clearly (often 10×) better", lands: "Degree 1 or 2", preferred: false },
  { id: "C", title: "Wedge, then expand", what: "Enter with a 2nd-degree product that runs beside the existing system, then grow into the full system", risk: "Choosing a wedge that doesn't lead anywhere", lands: "Starts at 2, grows into 1", preferred: true },
];

export const WEDGE_PROPERTIES = [
  "Severe, frequent pain, ideally tied to cash or compliance",
  "No switching: works alongside the current system and data",
  "An expand path: its data leads toward the full system",
];

export const WEDGE_EXAMPLES = ["Toast: payments → restaurant software", "ServiceTitan: dispatch → trades software", "Veeva: pharma CRM → industry cloud"];

export const RULES = [
  { title: "Prefer a wedge over the full system", body: "The 1st degree is crowded in every group researched (25–85 vendors)." },
  { title: "Follow the money", body: "Rank pains by how directly they affect cash coming in, or by whether a rule forces them." },
  { title: "First revenue before the biggest revenue", body: "A cash-linked wedge sells faster; the full system is the expansion." },
  { title: "Work beside, don't replace", body: "Avoid products whose first step makes the customer abandon their system." },
  { title: "Evidence from 3+ platforms", body: "A pain seen on one source is a hypothesis, not a finding." },
  { title: "The price must reach the target", body: "Customers needed for ₹50 Cr/year must be under ~5% of the group." },
  { title: "Talk to 5 buyers before building", body: "Ask what the pain costs today: staff hours, consultants, money lost." },
];

export const CRITERIA = [
  { name: "Cash or compliance link", weight: 4, high: "Directly brings money in or is legally required", low: "Nice to have" },
  { name: "Pain evidence", weight: 4, high: "Top pain on 4+ platforms with counts and quotes", low: "One weak source" },
  { name: "No switching needed", weight: 3, high: "Works beside current tools", low: "Replaces the core system" },
  { name: "Competition gap", weight: 3, high: "No or few focused competitors", low: "Crowded, price war" },
  { name: "Price vs target", weight: 2, high: "Under 2% of the group needed", low: "Over 10% needed" },
  { name: "Reachability", weight: 2, high: "Paid channel plus a community", low: "No proven channel" },
  { name: "Speed to first revenue", weight: 1, high: "Sellable MVP in ~1 month", low: "6+ months" },
  { name: "Expand path", weight: 1, high: "Data leads to the full system", low: "Dead end" },
];

export const SCORE_BANDS = [
  { from: 0, to: 60, label: "Drop", tone: "rose" },
  { from: 60, to: 75, label: "Research more", tone: "amber" },
  { from: 75, to: 100, label: "Shortlist", tone: "emerald" },
] as const;

export const SIGNALS = [
  { signal: "\"Free download\", \"price\", \"cheapest\" searches", meaning: "Price-sensitive buyers and a crowded 1st degree", kind: "warn" },
  { signal: "Dozens of new, near-identical Meta advertisers", meaning: "Crowded category; avoid a head-on product", kind: "warn" },
  { signal: "Meta ads running 200+ days", meaning: "A message or offer that pays off for that seller", kind: "good" },
  { signal: "Demo videos: many views, no comments", meaning: "Buyers research quietly; find pain in reviews, search, Reddit", kind: "info" },
  { signal: "Paperwork that blocks cash", meaning: "The recurring hidden pain in Indian B2B groups; usually the best wedge", kind: "good" },
  { signal: "Government schemes or rules rising in Trends", meaning: "Sudden demand (Ayushman/ABHA, MSME 45-day rule, NABH, ABDM)", kind: "good" },
  { signal: "Maps and customer-app reviews", meaning: "Where the business fails its customers; points at the owner's gap", kind: "info" },
  { signal: "Reddit", meaning: "The customer's view of Indian businesses; owners rarely post", kind: "info" },
  { signal: "YouTube comments, Meta ad copy, searches", meaning: "The best sources of the Indian owner's voice", kind: "info" },
] as const;

export const PROCESS = [
  { title: "Pick the group", body: "India groups paying ₹2,000+/month" },
  { title: "Collect", body: "node run.mjs <group> — 7 platforms, ~40 min" },
  { title: "Map the degrees", body: "Name the system, list 2nd/3rd-degree pains" },
  { title: "Filter", body: "3+ platforms, tied to cash or compliance" },
  { title: "Score", body: "Weighted rubric, out of 100" },
  { title: "Check the math", body: "Customers needed for ₹50 Cr/year" },
  { title: "Validate", body: "5 buyer conversations" },
  { title: "Record", body: "Candidates table and change log" },
];

export type CandidateStatus = "shortlist" | "conditional" | "below";

export interface Candidate {
  group: string;
  firstDegree: string;
  wedge: string;
  degree: DegreeId;
  cashLink: string;
  wedgePrice: number;
  expandedPrice: number;
  expansion: string;
  groupSize: number;
  groupSizeLabel: string;
  evidence: string[];
  status: CandidateStatus;
  statusNote: string;
}

export const CANDIDATES: Candidate[] = [
  {
    group: "Distributors & wholesalers",
    firstDegree: "Billing ERP (Tally/Marg) + brand SFA apps",
    wedge: "Retailer credit and collections",
    degree: 2,
    cashLink: "Money owed by retailers collected",
    wedgePrice: 3_000,
    expandedPrice: 8_000,
    expansion: "+ order taking, retailer credit score",
    groupSize: 6_00_000,
    groupSizeLabel: "~6 lakh",
    evidence: ["\"Don't start without bouncers and extra capital\" (⬆527 on Reddit)", "64 payment-reminder searches on Google", "Collections tools barely advertised on Meta"],
    status: "shortlist",
    statusNote: "Shortlist (smallest share needed)",
  },
  {
    group: "MSME manufacturers",
    firstDegree: "Manufacturing ERP (~45 vendors)",
    wedge: "Receivables and 45-day-rule collections",
    degree: 2,
    cashLink: "Dues collected",
    wedgePrice: 5_000,
    expandedPrice: 12_000,
    expansion: "+ production, labour",
    groupSize: 3_00_000,
    groupSizeLabel: "~3 lakh",
    evidence: ["\"MSME 45 days payment rule\" Breakout in Trends", "\"₹6.5 Cr payment stuck\" (⬆1,400 on Reddit)", "No software competitor seen"],
    status: "shortlist",
    statusNote: "Shortlist",
  },
  {
    group: "Private K-12 schools",
    firstDegree: "School ERP (~85 advertisers)",
    wedge: "Fee collection autopilot",
    degree: 2,
    cashLink: "Fees collected",
    wedgePrice: 4_000,
    expandedPrice: 10_000,
    expansion: "+ admissions, parent app",
    groupSize: 3_40_000,
    groupSizeLabel: "~3.4 lakh",
    evidence: ["Fee collection the #1 pain on 4 platforms", "Schools still on registers and Excel"],
    status: "shortlist",
    statusNote: "Shortlist (WhatsApp dependency)",
  },
  {
    group: "Small hospitals",
    firstDegree: "HMS/HIS (~25 vendors on Meta)",
    wedge: "Insurance / TPA / Ayushman desk",
    degree: 2,
    cashLink: "Claims paid faster and in full",
    wedgePrice: 8_000,
    expandedPrice: 20_000,
    expansion: "+ HMS modules",
    groupSize: 60_000,
    groupSizeLabel: "~60K",
    evidence: ["Top pain on 5 platforms", "Only 2–3 claim-management sellers", "Ayushman Bharat +114% YoY"],
    status: "conditional",
    statusNote: "Shortlist (needs expansion)",
  },
  {
    group: "Car & two-wheeler dealerships",
    firstDegree: "OEM-mandated DMS (locked in)",
    wedge: "Service-desk communication and follow-up",
    degree: 2,
    cashLink: "Service revenue retained",
    wedgePrice: 10_000,
    expandedPrice: 25_000,
    expansion: "+ lead follow-up, used-car module",
    groupSize: 60_000,
    groupSizeLabel: "~60K",
    evidence: ["Service = 68% of low two-wheeler reviews, 41% of car showrooms", "Owners reply to 55% of reviews", "Dealer software barely advertised on Meta"],
    status: "conditional",
    statusNote: "Research more (OEM lock-in)",
  },
  {
    group: "CA firms",
    firstDegree: "Practice management (Zoho, ICAI entering)",
    wedge: "Client status and document collection",
    degree: 2,
    cashLink: "Indirect (client retention)",
    wedgePrice: 2_500,
    expandedPrice: 6_000,
    expansion: "+ practice tools",
    groupSize: 1_00_000,
    groupSizeLabel: "~1 lakh",
    evidence: ["Communication the top Maps complaint", "GST reconciliation the top search cluster"],
    status: "below",
    statusNote: "Below target math",
  },
];

export const CHANGELOG = [
  { date: "2026-10-27", text: "Guide created: product degrees, entry approaches, selection rules, scoring, signal guide, process" },
  { date: "2026-10-27", text: "Candidates added from 4 business groups: small hospitals, MSME manufacturers, K-12 schools, CA firms" },
  { date: "2026-10-29", text: "Exam-aspirant groups removed: they were collector test runs, not target groups" },
  { date: "2026-10-29", text: "Target changed to ₹50 Cr revenue per year (≈ ₹4.17 Cr/month); customer math and expansion pricing updated" },
  { date: "2026-10-29", text: "Car & two-wheeler dealerships added: service-desk follow-up wedge; passes the math only at ~₹25,000/month after expansion" },
  { date: "2026-10-30", text: "Distributors & wholesalers added: retailer credit and collections wedge; smallest share needed (0.9% after expansion); shortlisted" },
];
