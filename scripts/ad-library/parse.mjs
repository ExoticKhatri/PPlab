import fs from "node:fs";

const TODAY = new Date();
const ads = new Map();

for (const file of fs.readdirSync("raw")) {
  const keyword = file.replace(/\.txt$/, "").replace(/_/g, " ");
  const text = fs.readFileSync(`raw/${file}`, "utf8");
  const chunks = text.split("Library ID: ").slice(1);
  for (const chunk of chunks) {
    const id = chunk.match(/^\d+/)?.[0];
    if (!id) continue;
    const started = chunk.match(/Started running on (\d{1,2} \w{3} \d{4})/)?.[1];
    const afterDetails = chunk.split(/See (?:ad|summary) details\n/)[1] ?? "";
    const lines = afterDetails.split("\n").map((l) => l.trim());
    const advertiser = lines[0] ?? "";
    const bodyEnd = afterDetails.search(/\n\u200b\nActive\n|\n\u200b\nInactive\n/);
    const body = (bodyEnd > 0 ? afterDetails.slice(0, bodyEnd) : afterDetails)
      .split("\n").slice(2).join("\n")
      .replace(/Sorry, we're having trouble with playing this video\.\n?/g, "")
      .replace(/\u200b/g, "").trim();
    const days = started ? Math.round((TODAY - new Date(started)) / 86400000) : null;
    const prev = ads.get(id);
    if (prev) { prev.keywords.push(keyword); continue; }
    ads.set(id, { id, advertiser, started, days, multiVersion: chunk.includes("multiple versions"), keywords: [keyword], body: body.slice(0, 1500) });
  }
}

const list = [...ads.values()];
fs.writeFileSync("ads.json", JSON.stringify(list, null, 1));
console.log(`${list.length} unique ads, ${new Set(list.map((a) => a.advertiser)).size} advertisers`);
