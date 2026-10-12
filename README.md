# Код міста

Тест для «Хмарочоса»: вісім зупинок про будівлі, назви вулиць і пам’ятники.
Скін «Маршрут» — тест як прогулянка містами з листівками на кожній зупинці.

- Прод (GitHub Pages): https://yakovina.github.io/kod-mista/
- Концепт-полотно з усіма варіантами дизайну: https://claude.ai/artifact/FQLSs6gbndW6bUuZrhcAE3

## Команди

```bash
npm run dev            # локально, http://localhost:3000
npm run build          # статична збірка в out/ під /kod-mista
npm run build:partner  # збірка під hmarochos.kiev.ua/partner/kod-mista
npm run deploy         # збірка + публікація в гілку gh-pages
npm run art            # перегенерувати заглушки ілюстрацій
npm run og             # перегенерувати OG-картинки (потрібен Google Chrome)
```

## Будова

- `data/quiz.ts` — увесь контент: питання, пояснення, джерела, рівні. Від скіна не залежить.
- `app/useQuiz.ts` — рушій: екрани, бали, перехід між зупинками, статистика.
- `app/skins/` — скіни. Зараз один, `route`. Скін — лише розмітка екранів і CSS.
- `app/r/[level]/` — шер-сторінки результатів з OG-картинками.
- `app/stats.ts` — відправлення статистики в Google Form (вимкнено, доки не заповнено `FORM`).

### Новий скін

1. Скопіювати `app/skins/route` у `app/skins/<назва>`, переписати розмітку й CSS (корінь — клас `.<назва>`).
2. Додати його в `SKINS` у `app/skins/index.ts` і підключити CSS у `app/layout.tsx`.
3. Зібрати з `NEXT_PUBLIC_SKIN=<назва> npm run build`.

Ідеї скінів чекають на полотні: «Авангард», «Калька», «Слово», чисті кольори, вулична табличка.

## Ілюстрації

Зараз у `public/art/` заглушки. Справжні класти під тими самими іменами:

- `postcard-1.svg` … `postcard-8.svg` — лицьові боки листівок, 16:9, по одній на зупинку;
- `char-tourist.svg`, `char-citizen.svg`, `char-keeper.svg` — персонажі результатів, 1:1.

Інший формат (png/jpg) — поміняти шляхи в `postcardArt` і `character` у `data/quiz.ts`.
Після заміни — `npm run og`, щоб оновити картинки для соцмереж.
