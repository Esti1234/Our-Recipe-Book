// בודק את הפרטים של ה-PR עצמו: כותרת, תיאור, שם ה-branch וה-checklist.
// ב-CI הערכים מגיעים ממשתני סביבה: PR_TITLE, PR_BODY, PR_BRANCH.

const title = (process.env.PR_TITLE || "").trim();
const body = process.env.PR_BODY || "";
const branch = (process.env.PR_BRANCH || "").trim();

const errors = [];

// שם ה-branch: recipe/<שם באנגלית באותיות קטנות>
if (!/^recipe\/[a-z0-9]+(-[a-z0-9]+)*$/.test(branch)) {
  errors.push(`שם ה-branch "${branch}" לא בפורמט הנכון. צריך recipe/<שם-באנגלית>, לדוגמה recipe/dina-pancakes`);
}

// כותרת
if (title.length < 8) {
  errors.push("כותרת ה-PR קצרה מדי (לפחות 8 תווים). לדוגמה: Add pancakes recipe");
}

// תיאור: מסירים הערות HTML, כותרות, שורות checklist ושורות ריקות, ומה שנשאר הוא מה שנכתב בפועל
const written = body
  .replace(/<!--[\s\S]*?-->/g, "")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#") && !/^- \[[ xX]\]/.test(l))
  .join(" ");

if (written.length < 20) {
  errors.push(`תיאור ה-PR ריק או קצר מדי (${written.length} תווים, צריך לפחות 20). ספרו מה המתכון ולמה כדאי לטעום אותו.`);
}

// checklist: כל התיבות חייבות להיות מסומנות
const unchecked = body.split("\n").filter((l) => /^\s*- \[ \]/.test(l));
if (unchecked.length) {
  errors.push(`נשארו ${unchecked.length} פריטים לא מסומנים ב-checklist. עברו על כל הרשימה וסמנו [x].`);
}

if (errors.length) {
  errors.forEach((e) => console.log(`::error::${e}`));
  process.exit(1);
}
console.log("פרטי ה-PR תקינים");
