// The roadmap tab: where the search for our business stands. Source: docs/roadmap.md.
// Steps after the current one are not known yet; add them here as they are discovered.

export type StepStatus = "done" | "current";

export interface Step {
  id: string;
  title: string;
  status: StepStatus;
  summary: string;
  points?: string[];
}

export const UPDATED = "2026-11-26";

export const STEPS: Step[] = [
  {
    id: "goal",
    title: "Goal and rules",
    status: "done",
    summary: "₹50 Cr of revenue a year (≈ ₹4.17 Cr a month) from a stable business, built as a SaaS product.",
    points: [
      "High-paying business groups only: a cheap ticket needs a huge share of the market.",
      "Research before building; no money spent until a test justifies it.",
      "Personal data stays out of the repo; no captchas bypassed; every change pushed.",
    ],
  },
  {
    id: "strategy",
    title: "Strategy: degree 2, then degree 1",
    status: "done",
    summary: "Enter with one painful job close to money or compliance (degree 2), then expand into the system the business runs on (degree 1).",
  },
  {
    id: "wedge",
    title: "Pick the industry and the wedge",
    status: "current",
    summary: "Many ideas, each with its own problems. The blocker is validating an idea before a product exists.",
  },
];

export const DID: string[] = [
  "Researched 12 business groups with the collectors (ads, Play Store, YouTube, Google, Trends, Reddit, Maps, competitor prices).",
  "Ranked 33 ideas on the Ideas tab by ticket, group size, competitors and difficulty.",
  "Added the \"pays alone\" test: does anyone already pay a service or tool for exactly this job? It is 25% of the score.",
  "Deep dives with sourced facts on five ideas (MSME receivables, real estate, exporters, admissions CRM, accreditation).",
  "First outreach test: 25 MSME factories emailed, no replies. Idea dropped on 6 Nov.",
  "Real estate milestone desk chosen to test: the developer pays, the CA is a partner; workflows mapped; leads built from MahaRERA's live data; call guide written.",
];

export interface IdeaStatus {
  idea: string;
  status: "testing" | "backup" | "crowded" | "parked" | "dropped";
  why: string;
}

export const IDEA_STATUS: IdeaStatus[] = [
  { idea: "Real estate milestone desk", status: "testing", why: "Paid for alone today (CAs, ~₹50,000 per extension); public trigger in lapse dates; expands to the developer's full system" },
  { idea: "Exporters' compliance desk", status: "backup", why: "Paid for alone (refund consultants, ₹6,999+/month services); new 9-month rule; no public list of who is struggling" },
  { idea: "College admissions CRM", status: "crowded", why: "Colleges pay ₹9.8 lakh/yr to Meritto; needs a sharp angle such as small colleges" },
  { idea: "College accreditation desk", status: "parked", why: "Accreditation is voluntary; 9 competitors" },
  { idea: "MSME receivables (45-day rule)", status: "dropped", why: "No replies to 25 emails; nobody pays for this alone" },
];

export const LESSONS: string[] = [
  "Pain is not the same as payment: test whether someone already pays for exactly this job.",
  "No ads doesn't mean an open market; business software here sells through Google, CAs and word of mouth.",
  "Research can narrow the choice but can't validate it; only conversations and payment can.",
  "Reaching the right person is the bottleneck: sales inboxes ignore us.",
  "Separate the payer, the user and the channel (developer pays, CA uses a seat and refers).",
  "Public lists go stale; deadlines don't. A live date is the best reason to call.",
  "A specific fact about their business beats a pitch.",
];

export const LADDER: { rung: string; what: string; proof: string }[] = [
  { rung: "Public evidence", what: "Collectors, deep dives, the pays-alone scan", proof: "People pay for this somewhere" },
  { rung: "Conversations", what: "10 calls opened with a fact about their business", proof: "The pain is real, in their words" },
  { rung: "Give first", what: "A free, specific artefact (one-page diagnosis)", proof: "They engage and reply" },
  { rung: "Concierge", what: "Do the job by hand for 1–3 customers", proof: "They trust us with the work" },
  { rung: "Payment", what: "Paid pilot, deposit or the next job paid", proof: "Validated" },
];

export const CHOOSER: { idea: string; checks: [boolean | "weak", boolean | "weak", boolean | "weak", boolean | "weak"] }[] = [
  { idea: "Real estate milestone desk", checks: [true, true, true, true] },
  { idea: "Exporters' compliance desk", checks: [true, "weak", true, true] },
  { idea: "College admissions CRM", checks: [true, "weak", "weak", true] },
];

export const CHOOSER_TESTS = ["Paid alone today", "Public trigger", "Deliverable by hand", "Leads to degree 1"];

export const NEXT: string[] = [
  "Build the call sheet from the lapse-date scan: soonest deadlines, no extension, Pune, Mumbai and Thane first.",
  "One warm-up call to a RERA consultant to learn their process and price.",
  "10 calls using the call guide; send the free diagnosis to everyone who engages.",
  "Do at least one extension or completion upload by hand, with the developer's CA.",
  "Ask for payment on the next job. Decide by 10 Dec 2026: continue, change the angle, or switch to exporters.",
];
