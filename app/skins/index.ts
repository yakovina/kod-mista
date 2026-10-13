// Скіни тесту. Рушій (app/useQuiz.ts) і контент (data/quiz.ts) спільні,
// скін визначає лише вигляд: розмітку екранів і свій CSS.
//
// Як додати скін (наприклад, з варіантів на концепт-полотні):
//   1. скопіювати app/skins/vitrazh → app/skins/<назва>, переписати розмітку і CSS;
//      кореневий клас — .<назва> (див. vitrazh.css, де все під .vitrazh);
//   2. зареєструвати його в SKINS нижче;
//   3. зібрати з NEXT_PUBLIC_SKIN=<назва> npm run build.
import * as book from "./book";
import * as memphis from "./memphis";
import * as vitrazh from "./vitrazh";

const SKINS = { vitrazh, memphis, book } as const;

export type SkinName = keyof typeof SKINS;

const wanted = (process.env.NEXT_PUBLIC_SKIN ?? "vitrazh") as SkinName;

export const skinName: SkinName = wanted in SKINS ? wanted : "vitrazh";
const active = SKINS[skinName];
export const { Skin, ResultPage } = active;
/** Сторінка 404 — зі скіна, якщо він її має; інакше — з «Вітража». */
export const NotFound = "NotFound" in active ? active.NotFound : vitrazh.NotFound;
