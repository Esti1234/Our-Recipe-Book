// בודק את הפרטים של ה-PR עצמו: כותרת ותיאור.
// ב-CI הערכים מגיעים ממשתני סביבה: PR_TITLE, PR_BODY.

const title = (process.env.PR_TITLE || "").trim();
const body = process.env.PR_BODY || "";

const errors = [];

// כותרת
if (title.length < 8) {
  errors.push("כותרת ה-PR קצרה מדי (לפחות 8 תווים). לדוגמה: Add pancakes recipe");
}

// תיאור: מסירים את הטקסט של התבנית (הערות, כותרות ושורות checklist), ומה שנשאר הוא מה שנכתב בפועל
const written = body
  .replace(/<!--[\s\S]*?-->/g, "")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#") && !/^- \[[ xX]\]/.test(l))
  .join(" ");

if (!written) {
  errors.push("חסר תיאור ל-PR. כתבו משפט או שניים: איזה מתכון הוספתם?");
}

if (errors.length) {
  errors.forEach((e) => console.log(`::error::${e}`));
  process.exit(1);
}
console.log("כותרת ותיאור ה-PR תקינים");
