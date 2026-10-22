import fs from "node:fs";
const all = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
const low = all.filter((r) => r.score <= 3 && r.text.length >= 15);

export const THEMES = {
  login: /log ?in|login|password|otp|sign ?in|invalid|authentication|logs? (me )?out|school code/i,
  crash: /crash|not (open|opening|working|responding|load)|doesn'?t (open|work)|keeps? stopping|server|error|glitch|bug|hang|stuck|blank/i,
  updates: /update/i,
  slow: /slow|lag|loading|takes? (a )?(lot of |long )?time|ages to/i,
  notifications: /notification|not (get|getting|receiv)|sms|alerts?|messages? (not|are not)|don'?t (get|receive)/i,
  multiChild: /two (kids|children|child|students)|2 (kids|children|child)|multiple (kids|children|child|students)|switch(ing)? (between|account|child|student)|second (child|kid)|siblings?/i,
  fees: /\bfees?\b|payment|pay |paid|gateway|receipt|late fee|transaction|refund/i,
  bus: /\bbus\b|gps|tracking|transport/i,
  results: /result|report card|marksheet|marks|exam/i,
  attendance: /attendance|absent|present/i,
  homework: /homework|assignment|attachment|pdf|download|class ?work|notes/i,
  communication: /two way|one way|contact (the )?(school|teacher)|ask (the )?(school|teacher)|query|enquir|interact|reply|chat with/i,
  support: /support|customer care|no response|helpline|complain(t|ed)|email(ed)? (them|you)/i,
  photos: /photo|image|gallery|video/i,
  paidApp: /subscription|charge|paid app|premium|money|scam|fraud/i,
  ui: /user ?friendly|interface|\bui\b|ux|design|font|confusing|complicated/i,
};
const ROLES = {
  teacher: /\b(as a teacher|i am a teacher|my students|marks entry|enter (the )?marks|teachers? (have|has) to|we teachers|staff)\b/i,
  admin: /\b(my school|our school|implement|admin(istrator)?|principal|we purchased|purchase(d)? (a |the )?plan|our institution|management (team|side))\b/i,
  parent: /\b(my (child|kid|son|daughter|ward)|parents?|children)\b/i,
};
const counts = {}, roleCounts = { teacher: 0, admin: 0, parent: 0, unknown: 0 };
const out = [];
for (const r of low) {
  const themes = Object.entries(THEMES).filter(([, re]) => re.test(r.text)).map(([k]) => k);
  const role = Object.entries(ROLES).find(([, re]) => re.test(r.text))?.[0] ?? "unknown";
  roleCounts[role]++;
  for (const t of themes) { const c = (counts[t] ??= { total: 0, teacher: 0, admin: 0, parent: 0, unknown: 0 }); c.total++; c[role]++; }
  out.push({ ...r, themes, role });
}
fs.writeFileSync("themed.json", JSON.stringify(out));
console.log("complaints", low.length, "roles", roleCounts);
for (const [k, v] of Object.entries(counts).sort((p, q) => q[1].total - p[1].total)) console.log(k.padEnd(14), v.total, `(${(v.total / low.length * 100).toFixed(1)}%)`, "teacher", v.teacher, "admin", v.admin, "parent", v.parent);
