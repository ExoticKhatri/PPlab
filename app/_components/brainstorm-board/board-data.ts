export type StageStatus = "locked" | "tentative" | "blank";
export type ChipStatus = "resolved" | "unresolved";

export interface Stage {
  id: string;
  label: string;
  title: string;
  detail?: string;
  status: StageStatus;
}

export interface Chip {
  label: string;
  status: ChipStatus;
}

export const PATH: Stage[] = [
  {
    id: "goal",
    label: "Goal",
    title: "₹50 Cr",
    detail: "From a stable business with strong, recurring income — not a one-off hit.",
    status: "locked",
  },
  {
    id: "strategy",
    label: "Current plan",
    title: "Build a SaaS product",
    detail: "Best plan so far — not locked in.",
    status: "tentative",
  },
  {
    id: "decision",
    label: "Current blocker",
    title: "Pick ONE industry out of the 8",
    detail: "Food · Fashion · Land · Education · Healthcare · Transport · Tech · Entertainment",
    status: "blank",
  },
];

export const INDUSTRY_FACTORS: Chip[] = [
  { label: "Easily reachable customers", status: "unresolved" },
  { label: "High money to burn", status: "unresolved" },
];

export const OPEN_QUESTION =
  "Do these two factors decide the INDUSTRY — or the PRODUCT?";

export const PRODUCT_FACTOR: Chip = {
  label: "The problem being solved",
  status: "resolved",
};
