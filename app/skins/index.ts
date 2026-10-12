// Скіни тесту. Рушій (app/useQuiz.ts) і контент (data/quiz.ts) спільні,
// скін визначає лише вигляд: розмітку екранів і свій CSS.
//
// Як додати скін (наприклад, з варіантів на концепт-полотні):
//   1. скопіювати app/skins/book → app/skins/<назва>, переписати розмітку і CSS;
//      кореневий клас — .<назва> (див. book.css, де все під .book);
//   2. зареєструвати його в SKINS нижче;
//   3. зібрати з NEXT_PUBLIC_SKIN=<назва> npm run build.
import * as book from "./book";

const SKINS = { book } as const;

export type SkinName = keyof typeof SKINS;

const wanted = (process.env.NEXT_PUBLIC_SKIN ?? "book") as SkinName;

export const skinName: SkinName = wanted in SKINS ? wanted : "book";
export const { Skin, Asterism, Cover, Logo, ShareLinks } = SKINS[skinName];
