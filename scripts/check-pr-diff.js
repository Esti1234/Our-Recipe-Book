// בודק מה ה-PR שינה: כרטיס אחד חדש ב-index.html, ואפשר להוסיף (רק להוסיף) CSS ב-style.css.
// שימוש: node scripts/check-pr-diff.js <base-ref>   (לדוגמה: origin/main)

const { execFileSync } = require("child_process");

const base = process.argv[2];
if (!base) {
  console.error("חסר base ref. שימוש: node scripts/check-pr-diff.js origin/main");
  process.exit(2);
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
const errors = [];
const ALLOWED = ["index.html", "style.css"];
const isNewImage = (f) => /^images\/[^/]+$/.test(f);

const changes = git("diff", "--name-status", `${base}...HEAD`).split("\n").filter(Boolean)
  .map((l) => { const [status, ...rest] = l.split("\t"); return { status, file: rest[rest.length - 1] }; });
const files = changes.map((c) => c.file);

const extra = changes.filter((c) => !ALLOWED.includes(c.file) && !(isNewImage(c.file) && c.status === "A"));
if (extra.length) {
  errors.push(`ה-PR שינה קבצים שהוא לא אמור לגעת בהם: ${extra.map((c) => c.file).join(", ")}. מותר לשנות רק את index.html ואת style.css, ולהוסיף קבצים חדשים לתיקיית images/.`);
}
if (!files.includes("index.html")) {
  errors.push("ה-PR לא שינה את index.html. איפה הכרטיס שלכן?");
}

const diffOf = (file) => {
  const lines = git("diff", "-U0", `${base}...HEAD`, "--", file).split("\n");
  return {
    added: lines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)),
    removed: lines.filter((l) => l.startsWith("-") && !l.startsWith("---")),
  };
};

for (const file of files.filter((f) => ALLOWED.includes(f))) {
  const { added, removed } = diffOf(file);
  if (removed.length) {
    errors.push(`${file}: ה-PR מחק או שינה ${removed.length} שורות קיימות. מוסיפים קוד חדש בלבד, ולא נוגעים בקוד של אחרות.`);
  }
  if (file === "index.html") {
    const code = added.filter((l) => l.trim());
    const opens = code.join("\n").match(/<article\b/g) || [];
    if (opens.length !== 1) {
      errors.push(`index.html: ה-PR הוסיף ${opens.length} כרטיסי <article>. צריך להוסיף בדיוק כרטיס אחד.`);
    } else if (!code[0].trim().startsWith("<article") || !code[code.length - 1].trim().endsWith("</article>")) {
      errors.push("index.html: כל מה שנוסף חייב להיות הכרטיס בלבד, מה-<article> הפותח ועד ה-</article> הסוגר, בלי שורות נוספות מסביב.");
    }
  }
}

if (errors.length) {
  errors.forEach((e) => console.log(`::error::${e}`));
  process.exit(1);
}
console.log("ה-PR מוסיף כרטיס אחד, ובלי למחוק קוד קיים");
