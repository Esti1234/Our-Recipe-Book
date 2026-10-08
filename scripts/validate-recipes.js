// בודק ש-index.html תקין: בלי סימני קונפליקט, תגיות מאוזנות, וכל כרטיס מתכון בנוי נכון.
// הרצה מקומית: node scripts/validate-recipes.js

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "index.html");
const ROOT = path.join(__dirname, "..");
const IMAGE_EXT = /\.(svg|png|jpe?g|webp)$/i;
const MAX_IMAGE_BYTES = 500 * 1024;
const VOID = new Set(["meta", "link", "br", "img", "hr", "input"]);

const errors = [];
const fail = (line, message) => errors.push(`index.html:${line} - ${message}`);

const raw = fs.readFileSync(FILE, "utf8");
const lineOf = (index) => raw.slice(0, index).split("\n").length;

// 1. סימני קונפליקט שנשארו בקובץ
raw.split("\n").forEach((line, i) => {
  if (/^(<{7}|={7}|>{7})(\s|$)/.test(line)) {
    fail(i + 1, "נשאר סימן של קונפליקט (<<<<<<<, ======= או >>>>>>>). פתרו את הקונפליקט ומחקו את הסימנים.");
  }
});

// מחליפים הערות ברווחים (שומרים על אורך ועל מספרי שורות)
const html = raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));

// 2. תגיות מאוזנות + איתור כרטיסים
const stack = [];
const cards = [];
const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
let m;
while ((m = tagRe.exec(html))) {
  const [full, closing, rawName, selfClose] = m;
  const name = rawName.toLowerCase();
  if (VOID.has(name) || selfClose) continue;
  if (!closing) {
    stack.push({ name, index: m.index, tag: full });
    continue;
  }
  const top = stack.pop();
  if (!top) {
    fail(lineOf(m.index), `תגית סוגרת </${name}> בלי תגית פותחת.`);
  } else if (top.name !== name) {
    fail(lineOf(top.index), `התגית <${top.name}> נפתחה ולא נסגרה כמו שצריך (במקומה נסגרה </${name}> בשורה ${lineOf(m.index)}).`);
    break;
  } else if (name === "article") {
    cards.push({ start: top.index, end: m.index + full.length, openTag: top.tag });
  }
}
if (stack.length && !errors.some((e) => e.includes("נפתחה ולא נסגרה"))) {
  const top = stack[stack.length - 1];
  fail(lineOf(top.index), `התגית <${top.name}> נפתחה ולא נסגרה.`);
}

// 3. בדיקת כל כרטיס
const text = (s) => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const items = (block) => [...block.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map((x) => text(x[1])).filter(Boolean);
const seenIds = new Map();

if (!cards.length) fail(1, "לא נמצא אף כרטיס מתכון (<article class=\"recipe\">).");

cards.forEach(({ start, end, openTag }) => {
  const line = lineOf(start);
  const card = html.slice(start, end);
  const where = (msg) => fail(line, `כרטיס המתכון: ${msg}`);

  if (!/class\s*=\s*"[^"]*\brecipe\b[^"]*"/.test(openTag)) where('חסר class="recipe" על ה-<article>.');

  const id = (openTag.match(/\bid\s*=\s*"([^"]*)"/) || [])[1];
  if (!id) where('חסר id על הכרטיס, למשל id="recipe-dina-hummus".');
  else if (!/^recipe-[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) where(`ה-id "${id}" לא בפורמט הנכון (recipe- ואחריו אנגלית קטנה ומקפים).`);
  else if (seenIds.has(id)) where(`ה-id "${id}" כבר קיים בשורה ${seenIds.get(id)}. כל כרטיס צריך id ייחודי.`);
  else seenIds.set(id, line);

  const img = card.match(/<img\b[^>]*class\s*=\s*"[^"]*\brecipe-img\b[^"]*"[^>]*>/);
  if (!img) {
    where('חסרה תמונה: <img class="recipe-img" src="images/..." alt="...">.');
  } else {
    const src = (img[0].match(/\bsrc\s*=\s*"([^"]*)"/) || [])[1] || "";
    const alt = (img[0].match(/\balt\s*=\s*"([^"]*)"/) || [])[1] || "";
    if (!alt.trim()) where("לתמונה חסר alt, תיאור קצר של מה שרואים בה.");
    if (!/^images\/[A-Za-z0-9._-]+$/.test(src)) where(`ה-src של התמונה ("${src}") חייב להיות בתיקיית images/ ובשם קובץ באנגלית.`);
    else if (!IMAGE_EXT.test(src)) where("סוג התמונה חייב להיות svg, png, jpg או webp.");
    else {
      const file = path.join(ROOT, src);
      if (!fs.existsSync(file)) where(`קובץ התמונה ${src} לא נמצא. הוסיפו אותו לתיקיית images/.`);
      else if (fs.statSync(file).size > MAX_IMAGE_BYTES) where(`התמונה ${src} כבדה מדי (מעל 500KB). כווצו אותה לפני העלאה.`);
    }
  }

  const h2 = card.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
  if (!h2 || !text(h2[1])) where("חסרה כותרת <h2> עם שם המתכון.");

  const meta = card.match(/<p\b[^>]*class\s*=\s*"[^"]*\bmeta\b[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  if (!meta || !text(meta[1])) where('חסרה שורת פרטים <p class="meta"> (מי הכינה, זמן, מנות).');

  const h3s = [...card.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((x) => text(x[1]));
  if (h3s.length < 2) where("צריכות להיות לפחות שתי כותרות <h3>: מצרכים והוראות הכנה.");

  const ul = card.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/);
  if (!ul || items(ul[1]).length < 2) where("חסרה רשימת מצרכים <ul> עם לפחות 2 פריטי <li>.");

  const ol = card.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/);
  if (!ol || items(ol[1]).length < 2) where("חסרה רשימת הוראות <ol> עם לפחות 2 שלבי <li>.");

  // אבטחה: כרטיס מתכון הוא תוכן בלבד
  if (/<\s*(script|iframe|object|embed)\b/i.test(card)) where("אסור להשתמש ב-<script>, <iframe>, <object> או <embed> בתוך כרטיס.");
  if (/\son[a-z]+\s*=/i.test(card)) where("אסור להשתמש במאפייני אירועים כמו onclick בתוך כרטיס.");
});

if (errors.length) {
  errors.forEach((e) => console.log(`::error::${e}`));
  console.log(`\nנמצאו ${errors.length} בעיות ב-index.html`);
  process.exit(1);
}
console.log(`index.html תקין (${cards.length} כרטיסי מתכון)`);
