export type Region = "india" | "global";

export interface RegionConfig {
  label: string;
  /** Recurring revenue per year we need from this region. */
  targetPerYear: number;
  currency: "₹" | "$";
}

// ₹5 Cr/yr recurring ≈ ₹50 Cr valuation at ~10x. Global target is the same amount in USD (~₹84/$).
export const REGIONS: Record<Region, RegionConfig> = {
  india: { label: "India", targetPerYear: 5_00_00_000, currency: "₹" },
  global: { label: "Global", targetPerYear: 600_000, currency: "$" },
};

export interface Market {
  /** How easy it is for us to reach this group, 1 (hard) to 5 (easy). */
  reach: number;
  /** Businesses in this group that could become customers. */
  count: number;
  /** Realistic monthly software spend per business, in the region's currency. */
  payPerMonth: number;
  /** True when the count is backed by a published source (see `source`). */
  sourced?: boolean;
}

export type IdeaStatus = "new" | "parked" | "testing" | "building";

export interface GroupIdea {
  slug: string;
  title: string;
  /** How easy it is for us to build, 1 (hard) to 5 (easy). */
  easeToBuild: number;
  /** What we believe a customer will pay per month, in ₹. */
  payPerMonth: number;
  status: IdeaStatus;
  note: string;
}

export interface Group {
  id: string;
  name: string;
  india: Market;
  global: Market;
  source?: string;
  ideas?: GroupIdea[];
}

// Rough estimates to start from, not facts. Sourced counts are marked; everything else is a best estimate.
export const GROUPS: Group[] = [
  { id: "pharmacy", name: "Independent pharmacies", india: { reach: 5, count: 1_000_000, payPerMonth: 800, sourced: true }, global: { reach: 3, count: 1_800_000, payPerMonth: 60 }, source: "Market reports: ~1M regulated pharmacies in India" },
  { id: "coaching", name: "Coaching & tuition centres", india: { reach: 5, count: 190_000, payPerMonth: 2_500, sourced: true }, global: { reach: 3, count: 700_000, payPerMonth: 50 }, source: "poidata.io: 192,867 coaching centres in India (Aug 2025)" },
  { id: "labs", name: "Diagnostic labs", india: { reach: 4, count: 100_000, payPerMonth: 2_500, sourced: true }, global: { reach: 3, count: 350_000, payPerMonth: 150 }, source: "Ken Research: 100k+ lab players (estimates range 50k–300k)", ideas: [
    { slug: "lab-money-guard", title: "Lab money guard: billing leakage & daily close", easeToBuild: 4, payPerMonth: 1_500, status: "new", note: "Stops staff skimming; owner sees tests vs bills every evening." },
    { slug: "lab-home-collection", title: "Home collection OS for independent labs", easeToBuild: 3, payPerMonth: 3_000, status: "new", note: "Slots, phlebotomist routes, live status and sample hand-over." },
    { slug: "lab-patient-retention", title: "Patient retention & report delivery", easeToBuild: 3, payPerMonth: 1_500, status: "new", note: "Report-status links without an app, repeat-test reminders." },
  ] },
  { id: "gyms", name: "Gyms & fitness studios", india: { reach: 5, count: 46_500, payPerMonth: 2_000, sourced: true }, global: { reach: 4, count: 200_000, payPerMonth: 100 }, source: "Deloitte via industry press: 46,500 facilities in India (2024)" },
  { id: "dental", name: "Dental clinics", india: { reach: 4, count: 120_000, payPerMonth: 2_000 }, global: { reach: 4, count: 900_000, payPerMonth: 150 } },
  { id: "clinics", name: "Small doctor clinics", india: { reach: 4, count: 300_000, payPerMonth: 2_000 }, global: { reach: 3, count: 3_000_000, payPerMonth: 150 } },
  { id: "physio", name: "Physiotherapy clinics", india: { reach: 4, count: 30_000, payPerMonth: 1_500 }, global: { reach: 3, count: 300_000, payPerMonth: 100 } },
  { id: "schools", name: "Private K-12 schools", india: { reach: 3, count: 340_000, payPerMonth: 4_000 }, global: { reach: 2, count: 1_500_000, payPerMonth: 150 }, ideas: [{ slug: "k12-school-ops", title: "All-in-one school ops app: fees, admission leads, parent comms", easeToBuild: 2, payPerMonth: 5_000, status: "parked", note: "Clear demand, but WhatsApp integration makes it hard to build." }] },
  { id: "restaurants", name: "Restaurants & cloud kitchens", india: { reach: 5, count: 500_000, payPerMonth: 1_500 }, global: { reach: 4, count: 15_000_000, payPerMonth: 70 } },
  { id: "salons", name: "Salons & spas", india: { reach: 5, count: 600_000, payPerMonth: 800 }, global: { reach: 4, count: 3_000_000, payPerMonth: 40 } },
  { id: "brokers", name: "Real estate brokers", india: { reach: 5, count: 200_000, payPerMonth: 1_500 }, global: { reach: 5, count: 2_500_000, payPerMonth: 60 } },
  { id: "ca", name: "CA / accounting firms", india: { reach: 4, count: 100_000, payPerMonth: 2_500 }, global: { reach: 4, count: 1_500_000, payPerMonth: 100 } },
  { id: "lawyers", name: "Lawyers & small law firms", india: { reach: 3, count: 500_000, payPerMonth: 1_000 }, global: { reach: 3, count: 3_000_000, payPerMonth: 100 } },
  { id: "interior", name: "Interior designers", india: { reach: 4, count: 150_000, payPerMonth: 1_500 }, global: { reach: 4, count: 1_000_000, payPerMonth: 50 } },
  { id: "events", name: "Event planners & caterers", india: { reach: 4, count: 200_000, payPerMonth: 1_000 }, global: { reach: 3, count: 1_500_000, payPerMonth: 50 } },
  { id: "photographers", name: "Wedding photographers", india: { reach: 5, count: 100_000, payPerMonth: 800 }, global: { reach: 5, count: 1_000_000, payPerMonth: 30 } },
  { id: "hotels", name: "Small hotels & homestays", india: { reach: 4, count: 100_000, payPerMonth: 2_000 }, global: { reach: 4, count: 1_500_000, payPerMonth: 80 } },
  { id: "workshops", name: "Car & bike repair workshops", india: { reach: 4, count: 700_000, payPerMonth: 700 }, global: { reach: 2, count: 5_000_000, payPerMonth: 60 } },
  { id: "fleet", name: "Small truck fleet owners", india: { reach: 3, count: 500_000, payPerMonth: 1_000 }, global: { reach: 2, count: 3_000_000, payPerMonth: 60 } },
  { id: "kirana", name: "Kirana & small retail stores", india: { reach: 5, count: 12_000_000, payPerMonth: 300 }, global: { reach: 1, count: 50_000_000, payPerMonth: 20 } },
  { id: "tattoo", name: "Tattoo studios & independent artists", india: { reach: 5, count: 12_000, payPerMonth: 1_000 }, global: { reach: 5, count: 150_000, payPerMonth: 40 }, source: "Est. India: ~25k tattoo artists (Daily Pioneer), ~3k studios + ~9k solo artists billing for themselves. Global: US alone 23,774 tattoo businesses (IBISWorld 2025), ~40% of the market. Price: TattooGenda €16–45/mo, Vagaro $24/mo." },
];

export const STEPS = [
  { n: 1, title: "Reachability gate", body: "Only groups you can contact 10 of this week make the list." },
  { n: 2, title: "Count the bodies", body: "How many businesses could become customers?" },
  { n: 3, title: "Spending capacity", body: "What can each one realistically pay per month?" },
  { n: 4, title: "Shortlist 3–5", body: "Lowest share of the group needed is the easiest path to the target." },
  { n: 5, title: "Talk to 5 each", body: "What's the most annoying task in your week, and what do you pay to handle it?" },
] as const;

export function customersNeeded(market: Market, region: Region): number {
  return Math.ceil(REGIONS[region].targetPerYear / (market.payPerMonth * 12));
}

export function shareNeeded(market: Market, region: Region): number {
  return customersNeeded(market, region) / market.count;
}

export function formatCount(value: number, region: Region): string {
  if (region === "india") {
    if (value >= 1_00_00_000) return `${+(value / 1_00_00_000).toFixed(1)} Cr`;
    if (value >= 1_00_000) return `${+(value / 1_00_000).toFixed(1)} L`;
    return `${+(value / 1_000).toFixed(1)}K`;
  }
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  return `${+(value / 1_000).toFixed(0)}K`;
}

export function formatMoney(value: number, region: Region): string {
  const { currency } = REGIONS[region];
  return `${currency}${value.toLocaleString(region === "india" ? "en-IN" : "en-US")}`;
}

export function formatShare(share: number): string {
  if (share >= 1) return ">100%";
  return `${(share * 100).toFixed(4)}%`;
}
