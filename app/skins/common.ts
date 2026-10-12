"use client";

// Спільне для всіх скінів: клавіатура, плавна прокрутка, обкладинка.

import { useEffect, useRef } from "react";
import type { QuizApi } from "../useQuiz";

export const COVER_ALT = "Ілюстрація: місто з аркою, що тріснула, космонавт і супутник";

/** Плавна прокрутка власним кроком: не залежить від scroll-behavior браузера. */
export function glide(to: number, ms: number) {
  const from = window.scrollY;
  const dist = to - from;
  if (Math.abs(dist) < 2) return;
  const t0 = performance.now();
  let expected = from;
  const step = (now: number) => {
    // хтось інший прокрутив сторінку (новий екран, користувач) — зупиняємось
    if (Math.abs(window.scrollY - expected) > 3) return;
    const p = Math.min(1, (now - t0) / ms);
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    expected = Math.round(from + dist * e);
    window.scrollTo(0, expected);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Клавіші: 1–4 або а/б/в/г — відповідь, Enter — далі. */
export function useKeys(quiz: QuizApi) {
  const ref = useRef(quiz);
  useEffect(() => {
    ref.current = quiz;
  });
  useEffect(() => {
    const letters = ["а", "б", "в", "г"];
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const z = ref.current;
      if (z.screen === "question") {
        const n = ["1", "2", "3", "4"].indexOf(e.key);
        const o = z.q.options[n >= 0 ? n : letters.indexOf(e.key.toLowerCase())];
        if (o) {
          e.preventDefault();
          z.answer(o.key);
        }
      } else if (z.screen === "reveal" && e.key === "Enter" && t?.tagName !== "BUTTON" && t?.tagName !== "A") {
        e.preventDefault();
        z.next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** Вібрація (Android). На iPhone сайтам недоступна — тихо пропускаємо. */
export function buzz(pattern: number | number[]) {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}
