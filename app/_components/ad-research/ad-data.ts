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
  why: string;
  risk: string;
}

export const IDEAS: Idea[] = [
  {
    rank: 1,
    title: "Admission enquiry → enrolment CRM",
    why: "Owners measure empty seats in crores. Agencies sell leads, ERPs store records. No ad shows a product that follows up every enquiry until the child joins.",
    risk: "The busy season is seasonal (Nov–Apr). Check whether schools pay all year.",
  },
  {
    rank: 2,
    title: "Fee dues recovery autopilot",
    why: "Nearly every ERP ad names fee follow-ups as the pain, but none sells recovery as its own product. WhatsApp reminders, UPI autopay and a defaulter view can sit on top of any ERP.",
    risk: "ERPs may add the same feature. The edge must be recovery rate, not features.",
  },
  {
    rank: 3,
    title: "Compliance tracker (CBSE, bus rules, UDISE+)",
    why: "Sellers use new rules as their hook (skill labs, bus guidelines, NCF) but sell hardware. Nobody sells the tracking itself.",
    risk: "Smaller market. It may only work as an add-on.",
  },
];

export const TAKEAWAYS = [
  "Meta reaches school owners. About 132 companies pay to target \"School Owners & Principals\", in English, Hindi and regional languages. Some have kept the same ad running for over a year.",
  "Generic school ERP is saturated. 37 sellers, half of them started in the last 30 days, with prices down to free, ₹5,000 a year, or ₹10,000 for the source code.",
  "The money goes to hardware and to rules. ₹2 lakh labs and smart panels sell because a board rule or a parent expectation forces the purchase.",
];
