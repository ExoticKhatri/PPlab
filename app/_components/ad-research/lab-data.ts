import type { Research } from "./research-types";

// Meta Ad Library scan: active ads shown in India, 22 Oct 2026, 25 lab-related keywords.
// Play Store: 33 apps (lab chain patient apps + lab software / partner / phlebotomist apps).
// Advertisers were checked by hand: each one sells TO lab owners or would-be lab owners.

export const LABS_RESEARCH: Research = {
  audience: "Diagnostic labs",
  scan: {
    date: "22 Oct 2026",
    keywords: 25,
    adsScanned: 1176,
    sellers: 49,
    sellersLabel: "companies selling to labs",
    longestDays: 1441,
  },
  takeaways: [
    "Meta reaches lab owners. About 49 companies pay to target them, mostly in Hindi and Hinglish. Labs also run their own patient ads: one has run the same ad for 1,441 days. Lab owners already use Meta as advertisers.",
    "Lab software is busy but cheap and fragmented. 17 sellers, many sold as offline desktop installs, competing on '10-minute support' and 'works without internet'. That is a sign incumbents fail at support and reliability.",
    "Big chains recruit franchise and collection-centre partners heavily (14 advertisers). Independent labs face chains that offer home collection, apps and fast reports. Small labs have to match that or lose patients.",
  ],
  categories: [
    { id: "lims", name: "Lab software / LIMS", advertisers: 17, longestDays: 288, longestBy: "Zebricon", examples: "Labsmart, OneLABz, My Smart Lab, Labsystem, SpeciGo, Medical Baba Ji", verdict: "busy" },
    { id: "franchise", name: "Franchise & collection centres", advertisers: 14, longestDays: 132, longestBy: "The Lab Experts", examples: "Healthians, Thyrocare, Max Lab, Chandan, Torrent, Suburban", verdict: "busy" },
    { id: "equipment", name: "Analyzers, equipment & reagents", advertisers: 11, longestDays: 151, longestBy: "Unicare Biomedical", examples: "Transasia (Erba), Mobilab, Accurex, Medikabazaar, Furuno", verdict: "busy" },
    { id: "growth", name: "Patient growth & bookings", advertisers: 5, longestDays: 145, longestBy: "SunFox (ECG add-on)", examples: "Grexa.AI, AyusLab, Flabs website, Techtaru SmartLab", verdict: "open" },
    { id: "expo", name: "Trade expos", advertisers: 2, longestDays: 52, longestBy: "Medical Expo India", examples: "Medical Expo India, WHX Dubai", verdict: "open" },
  ],
  pains: [
    { text: "Roz ka ₹200–₹300 ka chhota fraud… saal bhar mein lakhon ka nuksaan ban sakta hai.", by: "Labsmart (staff billing leakage)" },
    { text: "Software liya tha kaam kam karne ke liye. Phir bhi register roz khulta hai.", by: "SpeciGo LIMS" },
    { text: "Lab software issue and waiting hours for support?", by: "Medical Baba Ji" },
    { text: "Offline LIMS – no internet, no downtime.", by: "OneLABz" },
    { text: "Their problem was simple. No repeat patients.", by: "Grexa.AI" },
    { text: "Patients walk into your lab for checkups… why send them elsewhere for ECG?", by: "SunFox (revenue per patient)" },
    { text: "Are you losing time on slow CBC machines?", by: "Accurex Biomedical" },
    { text: "Others are already minting money with Thyrocare. Zero operations.", by: "Thyrocare franchise" },
  ],
  reviews: {
    label: "Play Store · 33 lab apps · 5,088 complaints from 15,173 reviews",
    takeaway:
      "Most reviews are patients of lab chains, so they describe a lab's operations from the outside: reports that are late or hard to get, home collection that doesn't show up, samples lost or mixed up, refunds not processed. The ~100 reviews from lab staff are about lab software that breaks after updates, with no support once it's paid for.",
    themes: [
      { name: "App bugs / login", count: 997 },
      { name: "Can't get / download report", count: 888, highlight: true },
      { name: "Slot booking & cancellations", count: 520, highlight: true },
      { name: "Support doesn't respond", count: 503 },
      { name: "Report delayed", count: 445, highlight: true },
      { name: "Rude / unprofessional staff", count: 163 },
      { name: "Refund / payment not settled", count: 151 },
      { name: "Wrong report / lost sample", count: 114, highlight: true },
      { name: "Collector didn't show up / late", count: 105, highlight: true },
    ],
    quotes: [
      { text: "Report should not take more than 24hrs. My report is delayed over 60 hrs. No call back.", by: "Patient · Orange Health" },
      { text: "Payment taken for home collection but did not arrange for technician and not refunding money.", by: "Patient · CrelioHealth lab" },
      { text: "They missed the collected sample.", by: "Patient · Orange Health" },
      { text: "Not working after last update. This is affecting my business.", by: "Lab staff · CrelioHealth" },
      { text: "Worst lab software, no customer support once full payment received.", by: "Lab owner · Drlogy" },
      { text: "Healthians have not updated my partner app where I had given them referrals of patients.", by: "Referral partner · Healthians" },
    ],
  },
  extra: {
    label: "YouTube · 54 lab business videos · 409 comments",
    takeaway:
      "The comments are mostly would-be owners asking about licences, setup cost (₹5–6 lakh) and franchise vs own lab. Owners who already run a lab talk about growth: marketing that doesn't reach break-even, dependence on doctors, and franchise collection centres where 'the income goes to the company'. Software comments are about price (around ₹3,000 a year), offline use and support.",
    quotes: [
      { text: "We are running a diagnostic centre… done lot of marketing strategy but still we are not reaching at break even.", by: "Lab owner · YouTube" },
      { text: "Can the lab earn income without the support of a doctor?", by: "Lab owner · YouTube" },
      { text: "Mera sample collection lab hai… only income company ka milega, hum ko kuch nahi hai.", by: "Collection centre owner · YouTube" },
      { text: "I am lab technician, have own lab. How marketing do? Please help.", by: "Lab owner · YouTube" },
      { text: "Software log in nahi ho raha hai… important update pending aisa notice aa raha hai.", by: "Lab software user · YouTube" },
      { text: "Is starting price 3k per year, and how many users?", by: "Lab owner asking about LIMS · YouTube" },
    ],
  },
  ideas: [
    {
      rank: 1,
      title: "Lab money guard: billing leakage & daily close",
      evidence: "Ads + lab staff reviews",
      why: "Sellers lead with staff skimming ₹200–300 a day and labs still using paper registers next to their software. A simple owner app that matches tests run against bills, flags discounts and cancellations, and sends a daily close, sold on rupees saved.",
      risk: "Matching against analyzer counts may need machine interfacing. Start with manual counts and register photos.",
    },
    {
      rank: 2,
      title: "Home collection OS for independent labs",
      evidence: "Patient reviews + ads",
      why: "Patients complain about no-shows, missed fasting slots, lost samples and no tracking. Chains win on home collection. Booking slots, a phlebotomist route app, live status and sample hand-over tracking let a small lab compete.",
      risk: "Needs a mobile app and maps. Phlebotomists' phones and network may be poor.",
    },
    {
      rank: 3,
      title: "Patient retention & report delivery",
      evidence: "Patient reviews + ads",
      why: "The largest complaint group is reports that are late or hard to get, and sellers say labs get no repeat patients. A report-status link (no app, no OTP), recall reminders for repeat tests (HbA1c, thyroid, lipids), and review requests.",
      risk: "SMS costs and DLT registration. Labs may see it as a feature of their LIMS.",
    },
  ],
};
