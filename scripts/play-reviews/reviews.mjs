import gplay from "google-play-scraper";
import fs from "node:fs";
const APPS = ["com.campuscare.entab.ui","com.entab.learninglab","com.entab.campuskidz","com.mcb.myclassboard.activity","com.mcb.teacherapp","com.ibee.myclassboard.activity","com.next.nlp","com.teachnext","com.nskparent","com.leadschool.parentapp","org.school.mitra","com.edunext.tsmv10","in.helloparent.parent","com.buzzyears.ibuzz","com.twobasetechnologies.skoolbeep","com.iitms.sdcloud","com.classon.parentapp","com.avrsh.cybrainschool","com.kranti.android.edumarshal","io.nexquare.parent","com.xseededucation.teacher","com.xseededucation.universal","com.teachmint.teachmint","app.ssms.erpsonline","com.oneflawless.school_app","in.schoolconsole.portal","com.vedmarg","com.eskooly.app","net.schoolearth.schooleartherp","gescis.webschool","com.app.mschooling","com.expentor.educianapp","com.littlesoldiers.kriyoschool","com.littlesoldiers.kriyo","com.onfees.chat","com.ibee.mcbdse.activity","com.mcb.parentsilverOaks","com.mcb.spsparent.activity"];
const all = [];
for (const appId of APPS) {
  let token, got = [];
  try {
    for (let page = 0; page < 6; page++) {
      const r = await gplay.reviews({ appId, country: "in", lang: "en", sort: gplay.sort.NEWEST, num: 200, paginate: true, nextPaginationToken: token });
      got.push(...r.data); token = r.nextPaginationToken; if (!token) break;
    }
  } catch (e) { console.error(appId, e.message); }
  for (const x of got) if (x.text) all.push({ appId, score: x.score, date: x.date, thumbs: x.thumbsUp, text: x.text, reply: !!x.replyText });
  console.log(appId, got.length);
}
fs.writeFileSync("reviews.json", JSON.stringify(all));
console.log("total", all.length, "low(1-3)", all.filter((r) => r.score <= 3).length);
