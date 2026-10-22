// Meta Ad Library scan: active ads shown in India, 22 Oct 2026, 31 school-related keywords.
// Advertisers below were checked by hand: each one is selling TO schools or school owners.
// Meta does not publish spend or results for these ads, so "days running" is the proxy for "it works".

export const SCAN = {
  date: "22 Oct 2026",
  keywords: 31,
  adsScanned: 2131,
  schoolSellers: 132,
} as const;

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

export const CATEGORIES: Category[] = [
  { id: "erp", name: "ERP & admin software", advertisers: 37, longestDays: 468, longestBy: "EduAutomate", examples: "Next Education, Vedmarg, ScientificStudy, Eduvecta, Classe365", verdict: "crowded" },
  { id: "franchise", name: "Start-a-school franchises", advertisers: 20, longestDays: 216, longestBy: "Bachpan", examples: "School Advisors, EuroKids, Makoons, Shemford, Ryan, Little Millennium", verdict: "busy" },
  { id: "panels", name: "Smart boards & panels", advertisers: 19, longestDays: 285, longestBy: "PeopleLink", examples: "Teachmint, Epson, Extramarks, ViewSonic, Senses", verdict: "crowded" },
  { id: "labs", name: "STEM / AI / robotics labs", advertisers: 15, longestDays: 108, longestBy: "Bharat Drone Systems", examples: "Stemrobo, Robocraze, CognoSpace, TechyGuide, YAGEN", verdict: "busy" },
  { id: "content", name: "Curriculum, LMS & programs", advertisers: 12, longestDays: 558, longestBy: "SchoolMania (books)", examples: "SchoolMania, Navneet TopSchool, LEAD, Super Saarthi, Ms. Curie", verdict: "busy" },
  { id: "infra", name: "Furniture, uniforms & running costs", advertisers: 10, longestDays: 343, longestBy: "Baroda Texway", examples: "Popcorn Furniture, Optimist AC, Univor, Playwahh", verdict: "busy" },
  { id: "admissions", name: "Admissions marketing", advertisers: 7, longestDays: 80, longestBy: "Mediagarh", examples: "Mediagarh, Bitsphere, AdLead, EduVision Junior fair", verdict: "open" },
  { id: "transport", name: "Bus tracking & safety", advertisers: 6, longestDays: 204, longestBy: "SchoolQlik", examples: "NeoTrack, Cool Bus, iTriangle, ProRoute", verdict: "open" },
  { id: "training", name: "Teacher training", advertisers: 4, longestDays: 203, longestBy: "Team Educational", examples: "upEducators, IITED", verdict: "open" },
  { id: "finance", name: "School loans & fee finance", advertisers: 2, longestDays: 422, longestBy: "Varthana", examples: "Varthana, Jodo", verdict: "open" },
];

export interface Quote {
  text: string;
  by: string;
}

/** What sellers lead with: their bet on what hurts school owners most. */
export const PAINS: Quote[] = [
  { text: "100 vacant seats could be costing your school ₹5 Crore every year.", by: "Mediagarh" },
  { text: "Fee follow-ups. Attendance registers. Exam records. Endless parent calls.", by: "EduChanger" },
  { text: "Want to build new infrastructure but lack of steady cashflow coming in the way?", by: "Jodo" },
  { text: "Is your school ready for the CBSE Composite Skill Lab requirement?", by: "Robocraze" },
  { text: "New School Bus Safety Guidelines are here.", by: "SchoolBus-2.0" },
  { text: "Running a school fleet on WhatsApp and phone calls?", by: "Cool Bus" },
  { text: "Every summer, that AC fleet becomes one of your biggest recurring expenses.", by: "Optimist AC" },
  { text: "Stop paying monthly fees for your school ERP!", by: "Multi School ERP (₹10,000 source code)" },
];

export interface Idea {
  rank: number;
  title: string;
  evidence: string;
  why: string;
  risk: string;
}

export const IDEAS: Idea[] = [
  {
    rank: 1,
    title: "School fee collection that just works",
    evidence: "Ads + reviews",
    why: "Sellers lead with fee follow-ups. In app reviews, paying fees is the main thing parents use these apps for, and it keeps breaking: payment taken but not recorded, missing receipts, gateway charges, cash queues.",
    risk: "Fee startups already exist (Zenda, Jodo, GrayQuest). The edge has to be reliability and recovery rate.",
  },
  {
    rank: 2,
    title: "Admission enquiry → enrolment CRM",
    evidence: "Ads only",
    why: "Owners measure empty seats in crores. Agencies sell leads and ERPs store records, but nobody follows up each enquiry until the child is enrolled.",
    risk: "No buyer complaints confirm this yet, and the season is Nov–Apr.",
  },
  {
    rank: 3,
    title: "Two-way parent helpdesk on WhatsApp",
    evidence: "Ads + reviews",
    why: "\"Endless parent calls\" is a seller hook, and parents complain the apps are one-way, with no way to ask the school anything.",
    risk: "Weakest count (~60 reviews). It may be a feature rather than a product.",
  },
];

// Play Store scan: 38 school ERP / parent apps (Entab, MyClassboard, NextOS, Edunext, Neverskip, Skolaro, Teachmint...).
export const REVIEW_SCAN = {
  apps: 38,
  reviews: 20672,
  complaints: 5904,
} as const;

export interface ReviewTheme {
  name: string;
  count: number;
}

export const REVIEW_THEMES: ReviewTheme[] = [
  { name: "Crashes, errors, won't open", count: 1336 },
  { name: "Forced updates", count: 769 },
  { name: "Login / password / OTP", count: 559 },
  { name: "Homework & attachments", count: 465 },
  { name: "Slow / loading", count: 450 },
  { name: "Fee payment", count: 372 },
  { name: "Missing notifications", count: 266 },
  { name: "No support response", count: 162 },
  { name: "Can't talk to the school", count: 61 },
  { name: "Two kids, one account", count: 54 },
];

export const REVIEW_QUOTES: Quote[] = [
  { text: "Payment is successful in bank but not updated in Campus Care. Raised a ticket 2 days ago, no solution.", by: "Parent · CampusCare" },
  { text: "Because of your regular payment failure, we need to pay penalty.", by: "Parent · school fee app" },
  { text: "Only feature available is to pay the fees of school.", by: "Parent · MyClassboard" },
  { text: "My principal has wasted rupees 45000 in this app and got nothing.", by: "Teacher · MCB teacher app" },
  { text: "There is no option to communicate with school teacher or staff. Every time we have a doubt we have to visit school.", by: "Parent · MyClassboard" },
];

export const REVIEW_TAKEAWAY =
  "Reviews come from parents and students, not owners: under 2% read like school staff. They show that school apps are badly built across vendors. They also show that fee payment is the one feature parents depend on, and it often fails.";

export const TAKEAWAYS = [
  "Meta reaches school owners. About 132 companies pay to target \"School Owners & Principals\", in English, Hindi and regional languages. Some have kept the same ad running for over a year.",
  "Generic school ERP is saturated. 37 sellers, half of them started in the last 30 days, with prices down to free, ₹5,000 a year, or ₹10,000 for the source code.",
  "The money goes to hardware and to rules. ₹2 lakh labs and smart panels sell because a board rule or a parent expectation forces the purchase.",
];
