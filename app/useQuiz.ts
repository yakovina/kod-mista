"use client";

import { useRef, useState } from "react";
import { type Level, type OptionKey, type Question, getLevel, questions } from "../data/quiz";
import { sendStats, type AnswerStat } from "./stats";

export type Screen = "intro" | "question" | "reveal" | "result";

/** Що скін отримує від рушія. Скін нічого не рахує сам — лише показує. */
export interface QuizApi {
  screen: Screen;
  /** Поточне питання (на екранах question/reveal). */
  q: Question;
  /** Індекс поточного питання, 0..7. */
  idx: number;
  total: number;
  /** Обрана відповідь на поточне питання (на reveal). */
  picked: OptionKey | null;
  /** Результат кожного вже пройденого питання: true — влучно. */
  history: boolean[];
  score: number;
  level: Level;
  isLast: boolean;
  start: () => void;
  answer: (key: OptionKey) => void;
  next: () => void;
  restart: () => void;
}

// Подвійний rAF: чекаємо, поки новий екран відрендериться, інакше скрол
// спрацює по старій розкладці.
const toTop = () =>
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "auto" }),
    ),
  );

export function useQuiz(): QuizApi {
  const [screen, setScreen] = useState<Screen>("intro");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [history, setHistory] = useState<boolean[]>([]);
  const answersRef = useRef<AnswerStat[]>([]);

  const total = questions.length;
  const q = questions[idx];
  const score = history.filter(Boolean).length;

  const start = () => {
    answersRef.current = [];
    setHistory([]);
    setIdx(0);
    setPicked(null);
    setScreen("question");
    toTop();
  };

  const answer = (key: OptionKey) => {
    if (screen !== "question") return;
    const ok = key === q.correct;
    setPicked(key);
    setHistory((h) => [...h, ok]);
    answersRef.current.push({ id: q.id, picked: key, ok });
    setScreen("reveal");
  };

  const next = () => {
    if (idx + 1 < total) {
      setIdx((i) => i + 1);
      setPicked(null);
      setScreen("question");
    } else {
      const finalScore = answersRef.current.filter((a) => a.ok).length;
      sendStats({ score: finalScore, level: getLevel(finalScore).title, answers: answersRef.current });
      setScreen("result");
    }
    toTop();
  };

  const restart = () => {
    setScreen("intro");
    setHistory([]);
    setIdx(0);
    setPicked(null);
    toTop();
  };

  return {
    screen,
    q,
    idx,
    total,
    picked,
    history,
    score,
    level: getLevel(score),
    isLast: idx + 1 >= total,
    start,
    answer,
    next,
    restart,
  };
}
