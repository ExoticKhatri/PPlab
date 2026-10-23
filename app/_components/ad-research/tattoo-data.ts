import type { Research } from "./research-types";

// Meta Ad Library scan: active ads shown in the US (+ India), 22 Oct 2026, 20 tattoo keywords.
// Play Store (US): booking apps tattoo artists use (Booksy, Fresha, Setmore, Acuity, Goldie, StyleSeat, Mindbody)
// plus Tattoodo and Tattoo Studio Pro. Tattoo-specific business apps barely exist on Android.

export const TATTOO_RESEARCH: Research = {
  audience: "Tattoo studios & artists",
  scan: {
    market: "US + India",
    date: "22 Oct 2026",
    keywords: 20,
    adsScanned: 1869,
    sellers: 300,
    sellersLabel: "companies selling to artists (US)",
    longestDays: 3216,
  },
  takeaways: [
    "Meta reaches tattoo artists easily. In the US alone ~440 studios and artists run their own client ads (one for 3,216 days), and ~300 companies sell to artists: supplies, courses, conventions, software, marketing.",
    "Tattoo-specific booking software is a young, busy niche. About a dozen tools advertise right now, and most compete on 'free / no fees / no cuts' (CO:CREATE, Venue Ink) or one sharp feature (Wavrr consent forms, Keep The Fees commission payouts).",
    "The pains sellers lead with are the same everywhere: chasing deposits and no-shows, time-wasters in the DMs, legally signed consent forms, and Instagram not filling the calendar.",
  ],
  categories: [
    { id: "supplies", name: "Supplies, machines & aftercare", advertisers: 150, longestDays: 1230, longestBy: "Dallas Tattoo Supplies", examples: "Painless Tattoo, cartridge & machine brands, numbing creams", verdict: "crowded" },
    { id: "education", name: "Courses & training", advertisers: 50, longestDays: 790, longestBy: "Bloodborne Pathogens course", examples: "Procreate Brushworks, PMU academies, apprenticeship courses", verdict: "busy" },
    { id: "convention", name: "Conventions & expos", advertisers: 30, longestDays: 194, longestBy: "Golden Wave Tattoo Invitational", examples: "Palm Beach Tattoo Expo, Ink Masters Tattoo Show", verdict: "busy" },
    { id: "software", name: "Booking, forms & studio software", advertisers: 12, longestDays: 171, longestBy: "Tattoodo booking", examples: "Wavrr, Porter, CO:CREATE, Venue Ink, Vagaro, InkSchedule, Keep The Fees", verdict: "busy" },
    { id: "marketing", name: "Marketing for artists", advertisers: 6, longestDays: 192, longestBy: "Unseen Level", examples: "Malfas Marketing, Ink Marketing, Brand Buzzed, TattooNOW", verdict: "open" },
    { id: "stencil", name: "Stencil & design apps", advertisers: 3, longestDays: 6, longestBy: "StencilStudio", examples: "StencilStudio, InkCut", verdict: "open" },
    { id: "insurance", name: "Shop insurance", advertisers: 1, longestDays: 296, longestBy: "InkShopGuard", examples: "InkShopGuard", verdict: "open" },
  ],
  pains: [
    { text: "Tired of repeating yourself, dealing with time-wasters & chasing payments?", by: "Tattoodo booking" },
    { text: "Every tattoo artist is responsible for having properly signed consent forms… missing this can lead to serious legal problems.", by: "Wavrr.app (39 ads)" },
    { text: "No fees. No subscriptions. No weird cuts. 100% free for artists.", by: "CO:CREATE" },
    { text: "If your tattoo studio has 3 or more artists and runs on commission, this is for you.", by: "Keep The Fees" },
    { text: "Posting every day and hoping Instagram fills your calendar is not a marketing strategy.", by: "Brand Buzzed" },
    { text: "80% of talented tattoo artists will fail in the next 2 years… competing for the same small pool of walk-ins and referrals.", by: "Malfas Marketing" },
    { text: "Guest spotting just got that much easier.", by: "Venue Ink (artist testimonial)" },
    { text: "Stop manual tracing, save hours of prep time.", by: "InkCut" },
  ],
  reviews: {
    label: "Play Store (US) · 9 booking apps · 3,138 complaints from 11,785 reviews",
    takeaway:
      "These are the general booking apps artists use today (Booksy, Fresha, Setmore, Acuity, Goldie, StyleSeat, Mindbody). Beyond bugs, the complaints are about money: per-artist fees, free plans turned paid, features moved behind paywalls, no-show 'protection' that fails to chargebacks, and marketplaces taking a cut of the shop's own clients.",
    themes: [
      { name: "Bugs, sync & updates", count: 998 },
      { name: "Pricing creep & per-artist fees", count: 634, highlight: true },
      { name: "Support doesn't help", count: 389 },
      { name: "Login / locked out", count: 311 },
      { name: "Payments, tips & POS", count: 267 },
      { name: "Reminders not delivered", count: 173, highlight: true },
      { name: "Calendar views", count: 156 },
      { name: "Can't cancel / still billed", count: 107 },
      { name: "No-shows, deposits & chargebacks", count: 94, highlight: true },
      { name: "Marketplace takes a cut of own clients", count: 66, highlight: true },
    ],
    quotes: [
      { text: "Downloaded this to schedule tattoo appointments for my shop… $29.99 plus $20 per employee! Over $120 a month to schedule appointments is crazy!", by: "Tattoo shop owner · Booksy Biz" },
      { text: "No Show Protection is FALSE ADVERTISEMENT! Had a no-show, used the protection, and the client did a CHARGEBACK.", by: "Artist · Booksy Biz" },
      { text: "They are constantly stealing your referrals in their boost program to take your money.", by: "Business owner · Booksy Biz" },
      { text: "Will remove features you have been using for years to force you to pay more for them.", by: "Business owner · Fresha" },
      { text: "More than half of our clients report not receiving the reminder texts, which is the reason for paying for this app.", by: "Business owner · Goldie" },
      { text: "They don't support all artists, only their own close friends.", by: "Artist · Tattoodo" },
    ],
  },
  ideas: [
    {
      rank: 1,
      title: "Your booking tool: deposits that can't be charged back",
      evidence: "Ads + reviews",
      why: "Deposits, no-shows and chargebacks come up in competitors' ads and in reviews. Signed consent plus deposit terms, captured in the same flow, gives the artist evidence to win a chargeback. That's a sharper promise than 'no-show protection'.",
      risk: "Payment processors decide chargebacks. You can provide evidence but can't guarantee the outcome.",
    },
    {
      rank: 2,
      title: "Flat price, no per-artist fees, no marketplace cut",
      evidence: "Reviews + ads",
      why: "The second-largest complaint is pricing creep and per-artist fees. Free tools win attention with 'no fees, no cuts'. A flat, honest studio price, with the shop's own clients never routed elsewhere, is a positioning edge.",
      risk: "Free competitors (CO:CREATE, Venue Ink) set price expectations low.",
    },
    {
      rank: 3,
      title: "Studio add-on: commission & guest-artist payouts",
      evidence: "Ads",
      why: "Multi-artist studios run on commission and guest spots. Keep The Fees and Venue Ink advertise exactly this, so studios pay for it. Your studio profiles plus the cost calculator could extend to payouts.",
      risk: "Only 3+ artist studios need it, which is a smaller slice of the market.",
    },
  ],
};
