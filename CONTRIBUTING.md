# איך מוסיפים כרטיס מתכון לספר

במשימה הזאת מתרגלים את כל מחזור החיים של עבודה עם Git ו-HTML: branch, כתיבת קוד, commit, push, Pull Request, סקירה, ואם צריך גם פתרון קונפליקטים.

כל אחת מכן כותבת **כרטיס מתכון משלה, על שמה**, ב-`index.html`. הכרטיס של חוי (עוגיות שוקולד צ'יפס) הוא הדוגמה. קראו אותו בעיון, הבינו איך הוא בנוי, ובנו כרטיס משלכן.

## הכלל החשוב

כולנו עורכות **את אותו קובץ**: `index.html`. אם שתיכן הוספתן כרטיס באותו מקום, תקבלו **קונפליקט**, וזה בסדר. ככה לומדים לפתור אותו.

## מה צריך להיות בכרטיס

תפתחו את `index.html` ותראו איך כרטיס נראה. הכרטיס שלכן חייב לכלול:

- אלמנט `<article>` עם `class="recipe"` ועם `id` ייחודי בפורמט `recipe-<שם-באנגלית>`.
- תמונה של המתכון: `<img class="recipe-img">` עם `src` מתיקיית `images/` ועם `alt` שמתאר מה רואים בה. זו הפנים של הכרטיס, אז כדאי להשקיע. צלמו את המנה שלכן, וכל תמונה טובה בפורמט jpg, png, webp או svg מתאימה (עד 500KB).
- כותרת עם שם המתכון.
- שורת פרטים עם `class="meta"`: מי הכינה, כמה זמן, כמה מנות.
- שתי כותרות משנה: מצרכים והוראות הכנה.
- רשימת מצרכים לא ממוספרת, עם לפחות 2 פריטים.
- רשימת הוראות ממוספרת, עם לפחות 2 שלבים.

אסור להשתמש ב-`<script>`, ב-`<iframe>` ובמאפייני אירועים כמו `onclick`.

רוצות לעצב? מותר להוסיף ל-`style.css` ולתיקיית `images/`, אבל **רק להוסיף**. אל תשנו עיצוב קיים. הדרך המומלצת היא להוסיף מחלקה משלכן, למשל `recipe-dina`.

## הצעדים

### 1. הורידו את הריפו (פעם אחת)

```bash
git clone https://github.com/Esti1234/Our-Recipe-Book.git
cd Our-Recipe-Book
```

### 2. פתחו branch חדש

שם ה-branch חייב להיות בפורמט `recipe/<שם-באנגלית>`, באותיות קטנות ועם מקפים.

```bash
git checkout -b recipe/dina-hummus
```

### 3. הוסיפו תמונה וכתבו את הכרטיס

שימו את התמונה בתיקיית `images/` עם שם באנגלית (למשל `images/dina-hummus.jpg`).

פתחו את `index.html` בעורך. הכרטיס החדש נכנס **מעל** שורת ההערה שמסמנת את סוף הכרטיסים. הוסיפו כרטיס אחד בלבד, ואל תיגעו בכרטיסים של אחרות.

כדי לראות איך הוא נראה, פתחו את הקובץ בדפדפן (לחיצה כפולה עליו) או הריצו:

```bash
python3 -m http.server 8000
```

ופתחו את http://localhost:8000.

### 4. בדקו מקומית לפני שדוחפים

```bash
node scripts/validate-recipes.js
```

זו אותה בדיקה שתרוץ ב-CI. אם היא נכשלת, ההודעה תגיד איזו שורה לתקן.

### 5. Commit ו-push

```bash
git add index.html images/
git commit -m "Add hummus recipe"
git push -u origin recipe/dina-hummus
```

אם הוספתן גם CSS, הוסיפו גם `style.css` ל-`git add`.

### 6. פתחו Pull Request

ב-GitHub לחצו על **Compare & pull request**. הכותרת והתיאור הם חובה, ואת ה-checklist צריך לסמן. ה-CI בודק את כל אלה.

### 7. חכו ל-CI ולסקירה

- ה-checks צריכים להיות ירוקים. אם אחד אדום, לחצו על **Details**, קראו מה כתוב, תקנו, ו-push שוב. ה-PR מתעדכן לבד.
- אחרי שה-CI ירוק, המורה סוקרת ומאשרת, ואז עושים merge.
- ברגע שה-PR נכנס ל-`main`, האתר מתעדכן אוטומטית.

## קיבלתי קונפליקט, מה עושים?

מישהי עשתה merge לפניך, ועכשיו GitHub אומר ש-PR שלך "has conflicts".

```bash
git checkout recipe/dina-hummus
git fetch origin
git merge origin/main
```

פתחו את `index.html`. תראו משהו כזה סביב הכרטיסים:

```
<<<<<<< HEAD
      <article class="recipe" id="recipe-dina-hummus"> ... </article>
=======
      <article class="recipe" id="recipe-sara-cake"> ... </article>
>>>>>>> origin/main
```

משאירים **את שני הכרטיסים**, מוחקים את שלוש שורות הסימון, ואז:

```bash
node scripts/validate-recipes.js
git add index.html images/
git commit
git push
```

אם נשארו סימני קונפליקט בקובץ, ה-CI ייכשל ויגיד לך איפה.
