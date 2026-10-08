# ספר המתכונים שלנו 🍰

פרויקט אימון ל-Git ול-HTML: כל תלמידה כותבת כרטיס מתכון משלה, על שמה, דרך branch ו-Pull Request.

- **רוצה להוסיף מתכון?** התחילי ב-[CONTRIBUTING.md](CONTRIBUTING.md).
- **הכרטיסים עצמם** נמצאים ב-[index.html](index.html). הכרטיס של חוי הוא הדוגמה.
- **לראות את האתר מקומית:**

  ```bash
  python3 -m http.server 8000
  ```

  ולפתוח את http://localhost:8000.

## מה קורה אוטומטית

| מתי | מה רץ | קובץ |
| --- | --- | --- |
| נפתח או עודכן Pull Request | בדיקת כותרת, תיאור, שם branch, checklist, תוכן ה-diff ותקינות ה-HTML | [pr-check.yml](.github/workflows/pr-check.yml) |
| נעשה merge ל-`main` | בדיקה חוזרת ופרסום האתר ב-GitHub Pages | [deploy.yml](.github/workflows/deploy.yml) |

## מבנה הפרויקט

```
index.html     הדף עם כל כרטיסי המתכונים (הקובץ שכולן עורכות)
style.css      העיצוב (מותר רק להוסיף)
scripts/       בדיקות ה-CI (Node, בלי תלויות)
.github/       workflows, תבנית PR, CODEOWNERS
```
