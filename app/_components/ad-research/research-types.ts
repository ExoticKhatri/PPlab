export type Verdict = "crowded" | "busy" | "open";

export interface Category {
  id: string;
  name: string;
  advertisers: number;
  longestDays: number;
  longestBy: string;
  examples: string;
  verdict: Verdict;
}

export interface Quote {
  text: string;
  by: string;
}

export interface Idea {
  rank: number;
  title: string;
  evidence: string;
  why: string;
  risk: string;
}

export interface ReviewTheme {
  name: string;
  count: number;
  highlight?: boolean;
}

export interface QuoteSection {
  label: string;
  takeaway: string;
  quotes: Quote[];
}

/** Everything one group's analysis page shows. */
export interface Research {
  audience: string;
  scan: { date: string; keywords: number; adsScanned: number; sellers: number; sellersLabel: string; longestDays: number };
  takeaways: string[];
  categories: Category[];
  pains: Quote[];
  reviews: {
    label: string;
    takeaway: string;
    themes: ReviewTheme[];
    quotes: Quote[];
  };
  extra?: QuoteSection;
  ideas: Idea[];
}
