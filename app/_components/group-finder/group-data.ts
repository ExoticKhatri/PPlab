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

export interface Group {
  id: string;
  name: string;
  india: Market;
  global: Market;
  source?: string;
}

// Rough estimates to start from, not facts. Sourced counts are marked; everything else is a best estimate.
// Only groups that can realistically pay ₹2,000+/month (India) are listed.
export const GROUPS: Group[] = [
  { id: "coaching", name: "Coaching & tuition centres", india: { reach: 5, count: 190_000, payPerMonth: 2_500, sourced: true }, global: { reach: 3, count: 700_000, payPerMonth: 50 }, source: "poidata.io: 192,867 coaching centres in India (Aug 2025)" },
  { id: "labs", name: "Diagnostic labs", india: { reach: 4, count: 100_000, payPerMonth: 2_500, sourced: true }, global: { reach: 3, count: 350_000, payPerMonth: 150 }, source: "Ken Research: 100k+ lab players (estimates range 50k–300k)" },
  { id: "gyms", name: "Gyms & fitness studios", india: { reach: 5, count: 46_500, payPerMonth: 2_000, sourced: true }, global: { reach: 4, count: 200_000, payPerMonth: 100 }, source: "Deloitte via industry press: 46,500 facilities in India (2024)" },
  { id: "dental", name: "Dental clinics", india: { reach: 4, count: 120_000, payPerMonth: 2_000 }, global: { reach: 4, count: 900_000, payPerMonth: 150 } },
  { id: "clinics", name: "Small doctor clinics", india: { reach: 4, count: 300_000, payPerMonth: 2_000 }, global: { reach: 3, count: 3_000_000, payPerMonth: 150 } },
  { id: "schools", name: "Private K-12 schools", india: { reach: 3, count: 340_000, payPerMonth: 4_000 }, global: { reach: 2, count: 1_500_000, payPerMonth: 150 } },
  { id: "ca", name: "CA / accounting firms", india: { reach: 4, count: 100_000, payPerMonth: 2_500 }, global: { reach: 4, count: 1_500_000, payPerMonth: 100 } },
  { id: "hotels", name: "Small hotels & homestays", india: { reach: 4, count: 100_000, payPerMonth: 2_000 }, global: { reach: 4, count: 1_500_000, payPerMonth: 80 } },
  { id: "hospitals", name: "Small hospitals & nursing homes", india: { reach: 3, count: 60_000, payPerMonth: 8_000 }, global: { reach: 2, count: 250_000, payPerMonth: 500 } },
  { id: "vets", name: "Veterinary clinics", india: { reach: 4, count: 12_000, payPerMonth: 2_000 }, global: { reach: 4, count: 120_000, payPerMonth: 200 } },
  { id: "preschools", name: "Preschools & daycares", india: { reach: 4, count: 100_000, payPerMonth: 2_000 }, global: { reach: 4, count: 1_000_000, payPerMonth: 100 } },
  { id: "architects", name: "Architecture firms", india: { reach: 4, count: 40_000, payPerMonth: 2_500 }, global: { reach: 4, count: 500_000, payPerMonth: 100 } },
  { id: "advisors", name: "Mutual fund distributors & financial advisors", india: { reach: 4, count: 150_000, payPerMonth: 2_000 }, global: { reach: 4, count: 300_000, payPerMonth: 200 } },
  { id: "travel", name: "Travel agencies & tour operators", india: { reach: 4, count: 50_000, payPerMonth: 2_500 }, global: { reach: 4, count: 700_000, payPerMonth: 100 } },
  { id: "agencies", name: "Digital marketing agencies", india: { reach: 5, count: 50_000, payPerMonth: 3_000 }, global: { reach: 5, count: 1_000_000, payPerMonth: 150 } },
  { id: "jewellers", name: "Jewellery stores", india: { reach: 4, count: 300_000, payPerMonth: 2_000 }, global: { reach: 3, count: 300_000, payPerMonth: 100 } },
  { id: "distributors", name: "Distributors & wholesalers", india: { reach: 3, count: 600_000, payPerMonth: 3_000 }, global: { reach: 2, count: 2_000_000, payPerMonth: 150 } },
  { id: "manufacturers", name: "Small manufacturers (MSME factories)", india: { reach: 3, count: 300_000, payPerMonth: 5_000 }, global: { reach: 2, count: 3_000_000, payPerMonth: 200 } },
  { id: "dealers", name: "Car & two-wheeler dealerships", india: { reach: 3, count: 60_000, payPerMonth: 5_000 }, global: { reach: 3, count: 300_000, payPerMonth: 300 } },
  { id: "developers", name: "Small real estate developers", india: { reach: 3, count: 50_000, payPerMonth: 8_000 }, global: { reach: 3, count: 300_000, payPerMonth: 400 } },
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
