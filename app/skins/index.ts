// Скіни тесту. Рушій (app/useQuiz.ts) і контент (data/quiz.ts) спільні,
// скін визначає лише вигляд: розмітку екранів і свій CSS.
//
// Як додати скін (наприклад, «Авангард» з концепт-полотна):
//   1. скопіювати app/skins/route → app/skins/<назва>, переписати розмітку і CSS;
//      кореневий клас — .<назва> (див. route.css, де все під .route);
//   2. зареєструвати його в SKINS нижче;
//   3. зібрати з NEXT_PUBLIC_SKIN=<назва> npm run build.
import * as route from "./route";

const SKINS = { route } as const;

export type SkinName = keyof typeof SKINS;

const wanted = (process.env.NEXT_PUBLIC_SKIN ?? "route") as SkinName;

export const skinName: SkinName = wanted in SKINS ? wanted : "route";
export const { Skin, ResultCard } = SKINS[skinName];
