// Скіни тесту. Рушій (app/useQuiz.ts) і контент (data/quiz.ts) спільні,
// скін визначає лише вигляд: розмітку екранів і свій CSS.
//
// Як додати скін (наприклад, з варіантів на концепт-полотні):
//   1. скопіювати app/skins/memphis → app/skins/<назва>, переписати розмітку і CSS;
//      кореневий клас — .<назва> (див. memphis.css, де все під .memphis);
//   2. зареєструвати його в SKINS нижче;
//   3. зібрати з NEXT_PUBLIC_SKIN=<назва> npm run build.
import * as book from "./book";
import * as memphis from "./memphis";

const SKINS = { memphis, book } as const;

export type SkinName = keyof typeof SKINS;

const wanted = (process.env.NEXT_PUBLIC_SKIN ?? "memphis") as SkinName;

export const skinName: SkinName = wanted in SKINS ? wanted : "memphis";
export const { Skin, ResultPage } = SKINS[skinName];
